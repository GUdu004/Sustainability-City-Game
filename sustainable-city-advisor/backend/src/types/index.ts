// This file exports TypeScript interfaces for the backend, including types for game data and decisions.

// Game State Types
export interface GameStats {
    environment: number; // 0-100
    economy: number;     // 0-100
    happiness: number;   // 0-100
}

export interface GameState {
  stats: GameStats;
  turn: number;
  maxTurns: number;
  gameStatus: 'active' | 'ended';
  endingType?: 'victory' | 'failure';
  endingTitle?: string;
  sceneElements: SceneElement[];
}

// Decision Types
export interface Decision {
    id: string;
    title: string;
    description: string;
    category: 'infrastructure' | 'economic' | 'environmental' | 'social';
    choices: Choice[];
}

export interface Choice {
    id: string;
    text: string;
    impact: {
        environment: number;
        economy: number;
        happiness: number;
    };
    sceneChanges?: SceneChange[];
    feedback?: string;
}

// Legacy interfaces for backward compatibility
export interface StatImpact {
    environment?: number;
    economy?: number;
    happiness?: number;
}

// 3D Scene Types
export interface SceneElement {
  id: string;
  type: 'building' | 'vegetation' | 'infrastructure' | 'effect';
  modelPath: string;
  position: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export interface SceneChange {
  action: 'add' | 'remove' | 'modify';
  element: SceneElement;
}

// AI Advisor Types
export interface AdvisorMessage {
    message: string;
    personality: 'optimistic' | 'concerned' | 'sarcastic' | 'encouraging';
    priority?: 'environment' | 'economy' | 'happiness';
    context: 'current_state' | 'decision_specific';
}

// API Response Types
export interface GameStateResponse {
  success: boolean;
  data: GameState;
  error?: string;
}

export interface DecisionResponse {
  success: boolean;
  data: Decision;
  error?: string;
}

export interface DecisionMakeResponse {
  success: boolean;
  feedback: string;
  statChanges: GameStats;
  newStats: GameStats;
  sceneChanges: SceneChange[];
  gameStatus: 'active' | 'ended';
  nextDecisionAvailable: boolean;
  error?: string;
}

export interface AdvisorResponse {
  success: boolean;
  data: AdvisorMessage;
  error?: string;
}