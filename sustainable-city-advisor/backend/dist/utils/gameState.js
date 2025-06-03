"use strict";
// This file contains utility functions for managing the game state, including initializing stats and processing decisions.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomDecision = exports.getCurrentGameState = exports.processDecision = exports.initializeGameState = void 0;
const decisions_json_1 = __importDefault(require("../data/decisions.json"));
let gameStats = {
    environment: 100,
    economy: 100,
    happiness: 100,
};
const initializeGameState = () => {
    gameStats = {
        environment: 100,
        economy: 100,
        happiness: 100,
    };
    return gameStats;
};
exports.initializeGameState = initializeGameState;
const processDecision = (decision) => {
    gameStats.environment += decision.environmentImpact;
    gameStats.economy += decision.economyImpact;
    gameStats.happiness += decision.happinessImpact;
    return gameStats;
};
exports.processDecision = processDecision;
const getCurrentGameState = () => {
    return gameStats;
};
exports.getCurrentGameState = getCurrentGameState;
const getRandomDecision = () => {
    const randomIndex = Math.floor(Math.random() * decisions_json_1.default.length);
    return decisions_json_1.default[randomIndex];
};
exports.getRandomDecision = getRandomDecision;
