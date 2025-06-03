import { Request, Response } from 'express';
import gameService from '../services/gameService';
import { GameStateResponse, DecisionResponse, DecisionMakeResponse, AchievementResponse } from '../types';

export const getCurrentGameState = (req: Request, res: Response): void => {
    try {
        const gameState = gameService.getCurrentGameState();
        const response: GameStateResponse = {
            success: true,
            data: gameState
        };
        res.status(200).json(response);
    } catch (error) {
        const response: GameStateResponse = {
            success: false,
            data: gameService.getCurrentGameState(),
            error: 'Error retrieving game state'
        };
        res.status(500).json(response);
    }
};

export const getNextDecision = (req: Request, res: Response): void => {
    try {
        const decision = gameService.getNextDecision();
        if (!decision) {
            const response: DecisionResponse = {
                success: false,
                data: {} as any,
                error: 'No more decisions available'
            };
            res.status(404).json(response);
            return;
        }
        
        const response: DecisionResponse = {
            success: true,
            data: decision
        };
        res.status(200).json(response);
    } catch (error) {
        const response: DecisionResponse = {
            success: false,
            data: {} as any,
            error: 'Error retrieving next decision'
        };
        res.status(500).json(response);
    }
};

export const makeDecision = (req: Request, res: Response): void => {
    const { decisionId, choiceId } = req.body;

    if (!decisionId || !choiceId) {
        const response: DecisionMakeResponse = {
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
        const result = gameService.makeDecision(decisionId, choiceId);
        const response: DecisionMakeResponse = {
            success: true,
            feedback: result.feedback,
            statChanges: result.statChanges,
            newStats: result.newStats,
            sceneChanges: result.sceneChanges,
            gameStatus: result.gameStatus,
            nextDecisionAvailable: result.nextDecisionAvailable,
            achievementsUnlocked: result.achievementsUnlocked
        };
        res.status(200).json(response);
    } catch (error) {
        const response: DecisionMakeResponse = {
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

export const resetGame = (req: Request, res: Response): void => {
    try {
        const gameState = gameService.resetGame();
        const response: GameStateResponse = {
            success: true,
            data: gameState
        };
        res.status(200).json(response);
    } catch (error) {
        const response: GameStateResponse = {
            success: false,
            data: gameService.getCurrentGameState(),
            error: 'Error resetting game'
        };
        res.status(500).json(response);
    }
};

export const getAchievements = (req: Request, res: Response): void => {
    try {
        const achievements = gameService.getAchievements();
        const response: AchievementResponse = {
            success: true,
            data: achievements
        };
        res.status(200).json(response);
    } catch (error) {
        const response: AchievementResponse = {
            success: false,
            data: { unlocked: [], progress: {} },
            error: 'Error retrieving achievements'
        };
        res.status(500).json(response);
    }
};