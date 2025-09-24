import { Router } from 'express';
import { MissionController } from '../controllers/missionController';

const router = Router();

router.get('/', MissionController.list);
router.get('/:code', MissionController.get);
router.post('/', MissionController.create); // In production protect with auth
router.put('/:code', MissionController.update);
router.delete('/:code', MissionController.remove);

export default router;

