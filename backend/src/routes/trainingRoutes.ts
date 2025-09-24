import { Router } from 'express';
import { TrainingController } from '../controllers/trainingController';

const router = Router();

router.get('/modules', TrainingController.listModules);
router.post('/sessions', TrainingController.startSession);
router.get('/sessions/:id', TrainingController.getSession);
router.post('/sessions/:id/events', TrainingController.recordEvent);
router.post('/sessions/:id/complete', TrainingController.completeSession);
router.get('/users/:userId/progress', TrainingController.getUserProgress);
router.get('/leaderboard', TrainingController.getLeaderboard);

export default router;

