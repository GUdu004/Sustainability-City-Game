"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decisions_json_1 = __importDefault(require("../data/decisions.json"));
class GameService {
    constructor() {
        this.decisions = [];
        this.usedDecisionIds = new Set();
        this.initializeDecisions();
        this.gameState = this.initializeGameState();
    }
    initializeDecisions() {
        // Convert the JSON structure to match our Decision interface
        this.decisions = decisions_json_1.default.decisions.map((decision, index) => ({
            id: `decision_${index + 1}`,
            title: decision.question,
            description: decision.question,
            category: this.categorizeDecision(decision.question),
            choices: decision.choices.map((choice, choiceIndex) => ({
                id: `choice_${index + 1}_${choiceIndex + 1}`,
                text: choice.text,
                impact: choice.impact,
                feedback: this.generateFeedback(choice.text, choice.impact)
            }))
        }));
    }
    categorizeDecision(question) {
        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes('park') || lowerQuestion.includes('recycling') || lowerQuestion.includes('green')) {
            return 'environmental';
        }
        else if (lowerQuestion.includes('factory') || lowerQuestion.includes('economic')) {
            return 'economic';
        }
        else if (lowerQuestion.includes('transport') || lowerQuestion.includes('infrastructure')) {
            return 'infrastructure';
        }
        else {
            return 'social';
        }
    }
    generateFeedback(choiceText, impact) {
        const effects = [];
        if (impact.environment > 0)
            effects.push("improved environmental health");
        if (impact.environment < 0)
            effects.push("environmental concerns");
        if (impact.economy > 0)
            effects.push("economic growth");
        if (impact.economy < 0)
            effects.push("economic strain");
        if (impact.happiness > 0)
            effects.push("increased citizen satisfaction");
        if (impact.happiness < 0)
            effects.push("decreased citizen satisfaction");
        return effects.length > 0 ? `This choice resulted in ${effects.join(", ")}.` : "This choice had minimal impact.";
    }
    initializeGameState() {
        const initialSceneElements = [
            {
                id: 'base_terrain',
                type: 'infrastructure',
                modelPath: '/models/city-assets/terrain.glb',
                position: { x: 0, y: 0, z: 0 }
            },
            {
                id: 'city_hall',
                type: 'building',
                modelPath: '/models/city-assets/city-hall.glb',
                position: { x: 0, y: 0, z: 0 }
            }
        ];
        return {
            stats: {
                environment: 50,
                economy: 50,
                happiness: 50
            },
            turn: 1,
            maxTurns: 10,
            gameStatus: 'active',
            sceneElements: initialSceneElements
        };
    }
    getCurrentGameState() {
        return { ...this.gameState };
    }
    getNextDecision() {
        // Find a decision that hasn't been used yet
        const availableDecisions = this.decisions.filter(d => !this.usedDecisionIds.has(d.id));
        if (availableDecisions.length === 0) {
            return null; // No more decisions available
        }
        // Return a random available decision
        const randomIndex = Math.floor(Math.random() * availableDecisions.length);
        const selectedDecision = availableDecisions[randomIndex];
        return selectedDecision;
    }
    makeDecision(decisionId, choiceId) {
        // Find the decision and choice
        const decision = this.decisions.find(d => d.id === decisionId);
        if (!decision) {
            throw new Error('Decision not found');
        }
        const choice = decision.choices.find(c => c.id === choiceId);
        if (!choice) {
            throw new Error('Choice not found');
        }
        // Mark this decision as used
        this.usedDecisionIds.add(decisionId);
        // Calculate stat changes
        const statChanges = {
            environment: choice.impact.environment || 0,
            economy: choice.impact.economy || 0,
            happiness: choice.impact.happiness || 0
        };
        // Apply changes to game state
        const previousStats = { ...this.gameState.stats };
        this.gameState.stats.environment = Math.max(0, Math.min(100, this.gameState.stats.environment + statChanges.environment));
        this.gameState.stats.economy = Math.max(0, Math.min(100, this.gameState.stats.economy + statChanges.economy));
        this.gameState.stats.happiness = Math.max(0, Math.min(100, this.gameState.stats.happiness + statChanges.happiness));
        // Advance turn
        this.gameState.turn++;
        // Generate scene changes based on the choice
        const sceneChanges = this.generateSceneChanges(choice);
        // Apply scene changes to game state
        sceneChanges.forEach(change => {
            if (change.action === 'add') {
                this.gameState.sceneElements.push(change.element);
            }
            else if (change.action === 'remove') {
                this.gameState.sceneElements = this.gameState.sceneElements.filter(el => el.id !== change.element.id);
            }
            else if (change.action === 'modify') {
                const index = this.gameState.sceneElements.findIndex(el => el.id === change.element.id);
                if (index !== -1) {
                    this.gameState.sceneElements[index] = change.element;
                }
            }
        });
        // Check end conditions
        this.checkEndConditions();
        // Check if more decisions are available
        const nextDecisionAvailable = this.gameState.gameStatus === 'active' &&
            this.gameState.turn <= this.gameState.maxTurns &&
            this.usedDecisionIds.size < this.decisions.length;
        return {
            feedback: choice.feedback || 'Decision processed successfully.',
            statChanges,
            newStats: { ...this.gameState.stats },
            sceneChanges,
            gameStatus: this.gameState.gameStatus,
            nextDecisionAvailable
        };
    }
    generateSceneChanges(choice) {
        const changes = [];
        const choiceText = choice.text.toLowerCase();
        // Generate scene changes based on choice content
        if (choiceText.includes('park')) {
            changes.push({
                action: 'add',
                element: {
                    id: `park_${Date.now()}`,
                    type: 'vegetation',
                    modelPath: '/models/city-assets/park.glb',
                    position: {
                        x: (Math.random() - 0.5) * 20,
                        y: 0,
                        z: (Math.random() - 0.5) * 20
                    }
                }
            });
        }
        else if (choiceText.includes('factory')) {
            changes.push({
                action: 'add',
                element: {
                    id: `factory_${Date.now()}`,
                    type: 'building',
                    modelPath: '/models/city-assets/factory.glb',
                    position: {
                        x: (Math.random() - 0.5) * 20,
                        y: 0,
                        z: (Math.random() - 0.5) * 20
                    }
                }
            });
        }
        return changes;
    }
    checkEndConditions() {
        const { environment, economy, happiness } = this.gameState.stats;
        // Check for failure conditions
        if (environment <= 10 && economy <= 10) {
            this.gameState.gameStatus = 'ended';
            this.gameState.endingType = 'failure';
            this.gameState.endingTitle = 'Economic and Environmental Collapse';
        }
        else if (happiness <= 10) {
            this.gameState.gameStatus = 'ended';
            this.gameState.endingType = 'failure';
            this.gameState.endingTitle = 'Citizen Revolt';
        }
        else if (this.gameState.turn > this.gameState.maxTurns) {
            // Check for victory conditions at end of game
            const averageScore = (environment + economy + happiness) / 3;
            if (averageScore >= 80) {
                this.gameState.gameStatus = 'ended';
                this.gameState.endingType = 'victory';
                this.gameState.endingTitle = 'Sustainable City Achievement';
            }
            else if (averageScore >= 60) {
                this.gameState.gameStatus = 'ended';
                this.gameState.endingType = 'victory';
                this.gameState.endingTitle = 'Decent Progress';
            }
            else {
                this.gameState.gameStatus = 'ended';
                this.gameState.endingType = 'failure';
                this.gameState.endingTitle = 'Mediocre Leadership';
            }
        }
    }
    resetGame() {
        this.usedDecisionIds.clear();
        this.gameState = this.initializeGameState();
        return this.getCurrentGameState();
    }
}
exports.default = new GameService();
