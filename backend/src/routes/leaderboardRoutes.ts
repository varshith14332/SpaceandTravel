import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboardController';

const router = Router();

router.get('/', LeaderboardController.top);
router.post('/', LeaderboardController.submit);

export default router;

