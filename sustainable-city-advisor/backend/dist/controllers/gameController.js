"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetGame = exports.makeDecision = exports.getNextDecision = exports.getCurrentGameState = void 0;
const gameService_1 = __importDefault(require("../services/gameService"));
const getCurrentGameState = (req, res) => {
    try {
        const gameState = gameService_1.default.getCurrentGameState();
        const response = {
            success: true,
            data: gameState
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            data: gameService_1.default.getCurrentGameState(),
            error: 'Error retrieving game state'
        };
        res.status(500).json(response);
    }
};
exports.getCurrentGameState = getCurrentGameState;
const getNextDecision = (req, res) => {
    try {
        const decision = gameService_1.default.getNextDecision();
        if (!decision) {
            const response = {
                success: false,
                data: {},
                error: 'No more decisions available'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            data: decision
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            data: {},
            error: 'Error retrieving next decision'
        };
        res.status(500).json(response);
    }
};
exports.getNextDecision = getNextDecision;
const makeDecision = (req, res) => {
    const { decisionId, choiceId } = req.body;
    if (!decisionId || !choiceId) {
        const response = {
            success: false,
            feedback: 'Missing decisionId or choiceId',
            statChanges: { environment: 0, economy: 0, happiness: 0 },
            newStats: { environment: 0, economy: 0, happiness: 0 },
            sceneChanges: [],
            gameStatus: 'active',
            nextDecisionAvailable: false,
            error: 'Missing required parameters'
        };
        res.status(400).json(response);
        return;
    }
    try {
        const result = gameService_1.default.makeDecision(decisionId, choiceId);
        const response = {
            success: true,
            feedback: result.feedback,
            statChanges: result.statChanges,
            newStats: result.newStats,
            sceneChanges: result.sceneChanges,
            gameStatus: result.gameStatus,
            nextDecisionAvailable: result.nextDecisionAvailable
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            feedback: 'Error processing decision',
            statChanges: { environment: 0, economy: 0, happiness: 0 },
            newStats: { environment: 0, economy: 0, happiness: 0 },
            sceneChanges: [],
            gameStatus: 'active',
            nextDecisionAvailable: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.makeDecision = makeDecision;
const resetGame = (req, res) => {
    try {
        const gameState = gameService_1.default.resetGame();
        const response = {
            success: true,
            data: gameState
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            data: gameService_1.default.getCurrentGameState(),
            error: 'Error resetting game'
        };
        res.status(500).json(response);
    }
};
exports.resetGame = resetGame;
