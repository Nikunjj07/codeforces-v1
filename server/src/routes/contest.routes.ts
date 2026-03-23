import { Router } from 'express';
import {
  listContests,
  getContest,
  registerForContest,
  getContestLeaderboard,
  createContest,
  updateContest,
  deleteContest,
} from '../controllers/contest.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';
import { getContestProblems } from '../controllers/problem.controller';
import { submitSolution, getMySubmissions } from '../controllers/submission.controller';
import { submissionRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', listContests);
router.get('/:id', getContest);
router.get('/:id/leaderboard', getContestLeaderboard);

// Protected
router.post('/:id/register', authMiddleware, registerForContest);
router.get('/:contestId/problems', authMiddleware, getContestProblems);
router.post(
  '/:contestId/problems/:problemId/submit',
  authMiddleware,
  submissionRateLimiter,
  submitSolution
);
router.get('/:contestId/my-submissions', authMiddleware, getMySubmissions);

// Admin
router.post('/', authMiddleware, roleGuard('ADMIN', 'TEACHER'), createContest);
router.put('/:id', authMiddleware, roleGuard('ADMIN', 'TEACHER'), updateContest);
router.delete('/:id', authMiddleware, roleGuard('ADMIN'), deleteContest);

export default router;
