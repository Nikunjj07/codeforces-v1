import { Response } from 'express';
import { Submission } from '../models/Submission';
import { Problem } from '../models/Problem';
import { Contest } from '../models/Contest';
import { Leaderboard } from '../models/Leaderboard';
import { asyncWrapper } from '../utils/asyncWrapper';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/authMiddleware';

const LANGUAGE_MAP: Record<string, number> = {
  'c++': 54,
  'cpp': 54,
  'python': 71,
  'java': 62,
  'javascript': 63,
};

export const submitSolution = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { contestId, problemId } = req.params;
  const { language, code } = req.body;

  const [contest, problem] = await Promise.all([
    Contest.findById(contestId),
    Problem.findById(problemId),
  ]);

  if (!contest) throw ApiError.notFound('Contest not found');
  if (!problem) throw ApiError.notFound('Problem not found');
  if (contest.status !== 'LIVE') throw ApiError.badRequest('Contest is not currently running');

  const userId = req.user!.userId;
  const isParticipant = contest.participants.map(String).includes(userId);
  if (!isParticipant) throw ApiError.forbidden('You are not registered for this contest');

  const submission = new Submission({
    userId,
    contestId,
    problemId,
    language,
    code,
    status: 'PENDING',
  });
  await submission.save();

  // Fire-and-forget: run judge in background
  judgeSubmission(submission._id.toString(), problem, language, code).catch(console.error);

  res.status(201).json({
    success: true,
    data: { submissionId: submission._id, status: 'PENDING' },
  });
});

export const getSubmission = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const submission = await Submission.findById(req.params.id)
    .select('-code') // Don't expose code in polling response
    .lean();
  if (!submission) throw ApiError.notFound('Submission not found');

  // Only owner or admin can view
  if (
    submission.userId.toString() !== req.user!.userId &&
    !['ADMIN', 'TEACHER'].includes(req.user!.role)
  ) {
    throw ApiError.forbidden('Access denied');
  }

  res.json({ success: true, data: { submission } });
});

export const getMySubmissions = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { contestId, problemId } = req.query;
  const query: any = { userId: req.user!.userId };
  if (contestId) query.contestId = contestId;
  if (problemId) query.problemId = problemId;

  const submissions = await Submission.find(query)
    .select('-code')
    .sort({ submittedAt: -1 })
    .limit(50)
    .lean();

  res.json({ success: true, data: { submissions } });
});

// Background judging function
async function judgeSubmission(
  submissionId: string,
  problem: any,
  language: string,
  code: string
): Promise<void> {
  const { JudgeService } = await import('../services/JudgeService');

  try {
    const results = await JudgeService.runCode(code, language, problem);
    const allPassed = results.every((r: any) => r.passed);
    const status = allPassed ? 'ACCEPTED' :
      results.some((r: any) => r.timedOut) ? 'TIME_LIMIT_EXCEEDED' :
      results.some((r: any) => r.compileError) ? 'COMPILATION_ERROR' : 'WRONG_ANSWER';

    const totalScore = allPassed ? problem.points : 0;

    await Submission.findByIdAndUpdate(submissionId, {
      status,
      score: totalScore,
      testResults: results,
      executionTime: Math.max(...results.map((r: any) => r.time || 0)),
    });

    if (status === 'ACCEPTED') {
      await updateLeaderboard(submissionId, totalScore);
    }
  } catch (err) {
    await Submission.findByIdAndUpdate(submissionId, { status: 'RUNTIME_ERROR' });
  }
}

async function updateLeaderboard(submissionId: string, score: number): Promise<void> {
  const submission = await Submission.findById(submissionId);
  if (!submission) return;

  const { userId, contestId, problemId } = submission;

  await Leaderboard.updateOne(
    { contestId, 'rankings.userId': userId },
    {
      $set: {
        'rankings.$.lastSubmission': submission.submittedAt,
      },
      $inc: { 'rankings.$.totalScore': score },
    }
  );
}
