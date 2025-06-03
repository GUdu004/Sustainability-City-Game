import { Router } from 'express';
import { getCurrentGameState, getNextDecision, makeDecision, resetGame, getAchievements } from '../controllers/gameController';

const router = Router();

// GET /api/game/state - Get current game state
router.get('/state', getCurrentGameState);

// GET /api/game/decision - Get next decision
router.get('/decision', getNextDecision);

// POST /api/game/decision - Make a decision
router.post('/decision', makeDecision);

// POST /api/game/reset - Reset the game
router.post('/reset', resetGame);

// GET /api/game/achievements - Get achievements
router.get('/achievements', getAchievements);

export default router;
