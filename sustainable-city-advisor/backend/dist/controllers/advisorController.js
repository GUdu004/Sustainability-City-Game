"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdvisor = void 0;
const advisorService_1 = require("../services/advisorService");
const gameService_1 = __importDefault(require("../services/gameService"));
const getAdvisor = async (req, res) => {
    try {
        // Get current game state from the game service
        const gameState = gameService_1.default.getCurrentGameState();
        const context = req.query.context || 'current_state';
        const advisorMessage = await (0, advisorService_1.generateAdvisorMessage)(gameState, context);
        const response = {
            success: true,
            data: advisorMessage
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            data: {
                message: 'I seem to be having trouble right now. Please try again.',
                personality: 'concerned',
                context: 'current_state'
            },
            error: 'Failed to retrieve advisor message'
        };
        res.status(500).json(response);
    }
};
exports.getAdvisor = getAdvisor;
