import { Router } from 'express';
import { getCurrentGameState, getNextDecision, makeDecision, resetGame } from '../controllers/gameController';

const router = Router();

// GET /api/game/state - Get current game state
router.get('/state', getCurrentGameState);

// GET /api/game/decision - Get next decision
router.get('/decision', getNextDecision);

// POST /api/game/decision - Make a decision
router.post('/decision', makeDecision);

// POST /api/game/reset - Reset the game
router.post('/reset', resetGame);

export default router;
