import { Request, Response } from 'express';
import { generateAdvisorMessage } from '../services/advisorService';
import { AdvisorResponse } from '../types';
import gameService from '../services/gameService';

export const getAdvisor = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get current game state from the game service
        const gameState = gameService.getCurrentGameState();
        const context = req.query.context as 'current_state' | 'decision_specific' || 'current_state';
        
        const advisorMessage = await generateAdvisorMessage(gameState, context);
        
        const response: AdvisorResponse = {
            success: true,
            data: advisorMessage
        };
        
        res.status(200).json(response);
    } catch (error) {
        const response: AdvisorResponse = {
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