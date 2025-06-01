"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameController_1 = require("../controllers/gameController");
const router = (0, express_1.Router)();
// GET /api/game/state - Get current game state
router.get('/state', gameController_1.getCurrentGameState);
// GET /api/game/decision - Get next decision
router.get('/decision', gameController_1.getNextDecision);
// POST /api/game/decision - Make a decision
router.post('/decision', gameController_1.makeDecision);
// POST /api/game/reset - Reset the game
router.post('/reset', gameController_1.resetGame);
exports.default = router;
