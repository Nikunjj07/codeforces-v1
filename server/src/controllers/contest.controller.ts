import { Request, Response } from 'express';
import { Contest } from '../models/Contest';
import { Leaderboard } from '../models/Leaderboard';
import { asyncWrapper } from '../utils/asyncWrapper';
import { ApiError } from '../utils/ApiError';
import { paginate } from '../utils/paginate';
import { AuthRequest } from '../middleware/authMiddleware';
import slugify from 'slugify';

// Helper to generate unique slug
const generateSlug = async (title: string): Promise<string> => {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let count = 1;
  while (await Contest.findOne({ slug })) {
    slug = `${base}-${count++}`;
  }
  return slug;
};

export const listContests = asyncWrapper(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', status, difficulty, search } = req.query as any;

  const query: any = {};
  if (status) query.status = status;
  if (difficulty) query.difficulty = difficulty;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { tags: { $in: [new RegExp(search, 'i')] } },
  ];

  const result = await paginate(Contest, query, {
    page: parseInt(page),
    limit: parseInt(limit),
  }, 'createdBy');

  res.json({ success: true, data: result });
});

export const getContest = asyncWrapper(async (req: Request, res: Response) => {
  const contest = await Contest.findById(req.params.id)
    .populate('createdBy', 'username profile.avatar')
    .populate('problems', 'title slug difficulty points');

  if (!contest) throw ApiError.notFound('Contest not found');
  res.json({ success: true, data: { contest } });
});

export const registerForContest = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) throw ApiError.notFound('Contest not found');

  if (contest.status === 'ENDED') throw ApiError.badRequest('Contest has ended');
  if (contest.status === 'DRAFT') throw ApiError.forbidden('Contest is not yet published');

  const userId = req.user!.userId;
  if (contest.participants.map(String).includes(userId)) {
    throw ApiError.conflict('Already registered for this contest');
  }

  if (contest.maxParticipants && contest.participants.length >= contest.maxParticipants) {
    throw ApiError.badRequest('Contest is full');
  }

  if (contest.visibility === 'PRIVATE') {
    const { inviteCode } = req.body;
    if (inviteCode !== contest.inviteCode) throw ApiError.forbidden('Invalid invite code');
  }

  contest.participants.push(userId as any);
  await contest.save();

  res.json({ success: true, message: 'Successfully registered for contest' });
});

export const getContestLeaderboard = asyncWrapper(async (req: Request, res: Response) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) throw ApiError.notFound('Contest not found');

  const leaderboard = await Leaderboard.findOne({ contestId: req.params.id });
  res.json({ success: true, data: { leaderboard: leaderboard?.rankings || [] } });
});

// --- ADMIN CRUD ---
export const createContest = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const slug = await generateSlug(req.body.title);
  const contest = await Contest.create({
    ...req.body,
    slug,
    createdBy: req.user!.userId,
  });
  res.status(201).json({ success: true, data: { contest } });
});

export const updateContest = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!contest) throw ApiError.notFound('Contest not found');
  res.json({ success: true, data: { contest } });
});

export const deleteContest = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const contest = await Contest.findByIdAndDelete(req.params.id);
  if (!contest) throw ApiError.notFound('Contest not found');
  res.json({ success: true, message: 'Contest deleted' });
});
