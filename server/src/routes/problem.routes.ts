import { Router } from 'express';
import {
  listProblems,
  createProblem,
  updateProblem,
  deleteProblem,
} from '../controllers/problem.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';
import { getSubmission } from '../controllers/submission.controller';

const router = Router();

// Public: list problems (for admin bank view)
router.get('/', authMiddleware, roleGuard('ADMIN', 'TEACHER'), listProblems);

// Submission polling (auth required)
router.get('/submissions/:id', authMiddleware, getSubmission);

// Problem CRUD (admin/teacher only)
router.post('/', authMiddleware, roleGuard('ADMIN', 'TEACHER'), createProblem);
router.put('/:id', authMiddleware, roleGuard('ADMIN', 'TEACHER'), updateProblem);
router.delete('/:id', authMiddleware, roleGuard('ADMIN', 'TEACHER'), deleteProblem);

export default router;
