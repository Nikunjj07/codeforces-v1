import { Request, Response } from 'express';
import { Problem } from '../models/Problem';
import { Contest } from '../models/Contest';
import { asyncWrapper } from '../utils/asyncWrapper';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/authMiddleware';
import slugify from 'slugify';

const generateSlug = async (title: string): Promise<string> => {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let count = 1;
  while (await Problem.findOne({ slug })) {
    slug = `${base}-${count++}`;
  }
  return slug;
};

export const getProblem = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const problem = await Problem.findById(req.params.id)
    .select('-hiddenTestCases') // Never expose hidden test cases
    .lean();
  if (!problem) throw ApiError.notFound('Problem not found');
  res.json({ success: true, data: { problem } });
});

export const getContestProblems = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const contest = await Contest.findById(req.params.contestId);
  if (!contest) throw ApiError.notFound('Contest not found');

  // Problems visible only after registration and contest start
  if (contest.status === 'DRAFT' || contest.status === 'PUBLISHED') {
    const isAdmin = ['ADMIN', 'TEACHER'].includes(req.user?.role || '');
    if (!isAdmin) throw ApiError.forbidden('Contest has not started yet');
  }

  const isParticipant = req.user
    ? contest.participants.map(String).includes(req.user.userId)
    : false;

  const isAdmin = ['ADMIN', 'TEACHER'].includes(req.user?.role || '');

  if (!isParticipant && !isAdmin) {
    throw ApiError.forbidden('You must register for this contest to view its problems');
  }

  const problems = await Problem.find({ _id: { $in: contest.problems } })
    .select('-hiddenTestCases -editorial')
    .lean();

  res.json({ success: true, data: { problems } });
});

// Admin: list all problems in bank
export const listProblems = asyncWrapper(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, difficulty, tag, search } = req.query as any;
  const query: any = {};
  if (difficulty) query.difficulty = difficulty;
  if (tag) query.tags = tag;
  if (search) query.title = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [problems, total] = await Promise.all([
    Problem.find(query).select('-hiddenTestCases').skip(skip).limit(Number(limit)).lean(),
    Problem.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: { problems, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
  });
});

export const createProblem = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const slug = await generateSlug(req.body.title);
  const problem = await Problem.create({ ...req.body, slug, createdBy: req.user!.userId });
  res.status(201).json({ success: true, data: { problem } });
});

export const updateProblem = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!problem) throw ApiError.notFound('Problem not found');
  res.json({ success: true, data: { problem } });
});

export const deleteProblem = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const problem = await Problem.findByIdAndDelete(req.params.id);
  if (!problem) throw ApiError.notFound('Problem not found');
  res.json({ success: true, message: 'Problem deleted' });
});
