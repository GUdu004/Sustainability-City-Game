import { Router } from 'express';
import { getAdvisor } from '../controllers/advisorController';

const router = Router();

// GET /api/advisor - Get advisor message based on current game state
router.get('/', getAdvisor);

export default router;
