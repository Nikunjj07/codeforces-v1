import { Router } from 'express';
import { User } from '../models/User';
import { Contest } from '../models/Contest';
import { Submission } from '../models/Submission';
import { Leaderboard } from '../models/Leaderboard';
import { asyncWrapper } from '../utils/asyncWrapper';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiError } from '../utils/ApiError';
import { Response } from 'express';

const router = Router();

// All admin routes require auth + ADMIN role
router.use(authMiddleware, roleGuard('ADMIN', 'TEACHER'));

// Stats
router.get('/stats', asyncWrapper(async (_req: AuthRequest, res: Response) => {
  const [totalUsers, activeContests, submissionsToday, totalContests] = await Promise.all([
    User.countDocuments(),
    Contest.countDocuments({ status: 'LIVE' }),
    Submission.countDocuments({ submittedAt: { $gte: new Date(Date.now() - 86400000) } }),
    Contest.countDocuments(),
  ]);

  res.json({ success: true, data: { totalUsers, activeContests, submissionsToday, totalContests } });
}));

// Users management
router.get('/users', asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, search, role } = req.query as any;
  const query: any = {};
  if (search) query.$or = [
    { username: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (role) query.role = role;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(query),
  ]);
  res.json({ success: true, data: { users, total } });
}));

router.put('/users/:id/role', asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) throw ApiError.badRequest('Invalid role');
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: { user } });
}));

router.put('/users/:id/ban', asyncWrapper(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false, refreshTokens: [] },
    { new: true }
  );
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, message: 'User banned' });
}));

// All submissions
router.get('/submissions', asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, contestId, problemId, status, language } = req.query as any;
  const query: any = {};
  if (contestId) query.contestId = contestId;
  if (problemId) query.problemId = problemId;
  if (status) query.status = status;
  if (language) query.language = language;

  const skip = (Number(page) - 1) * Number(limit);
  const [submissions, total] = await Promise.all([
    Submission.find(query)
      .select('-code')
      .populate('userId', 'username')
      .populate('problemId', 'title')
      .skip(skip)
      .limit(Number(limit))
      .sort({ submittedAt: -1 })
      .lean(),
    Submission.countDocuments(query),
  ]);
  res.json({ success: true, data: { submissions, total } });
}));

export default router;
