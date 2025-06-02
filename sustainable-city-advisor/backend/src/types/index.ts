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
  endingDescription?: string;
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
  type: 'building' | 'vegetation' | 'infrastructure' | 'industrial' | 'residential' | 'commercial' | 'civic' | 'effect';
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
  achievementsUnlocked?: Achievement[];
  error?: string;
}

export interface AdvisorResponse {
  success: boolean;
  data: AdvisorMessage;
  error?: string;
}

export interface AchievementResponse {
  success: boolean;
  data: {
    unlocked: Achievement[];
    progress: Record<string, number>;
  };
  error?: string;
}

// Achievement System Types
export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: 'environmental' | 'economic' | 'social' | 'leadership';
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    unlockedAt?: Date;
    reward?: {
        visualEffect?: string;
        cityElement?: string;
    };
}

export interface AchievementCriteria {
    id: string;
    title: string;
    description: string;
    category: 'environmental' | 'economic' | 'social' | 'leadership';
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    criteria: {
        type: 'stat_threshold' | 'consecutive_stat_threshold' | 'all_stats_threshold' | 
              'recovery' | 'decision_count' | 'early_achievement' | 'final_balance' | 'final_stat';
        stat?: keyof GameStats;
        threshold?: number;
        duration?: number;
        fromThreshold?: number;
        toThreshold?: number;
        count?: number;
        decisionTypes?: string[];
        maxTurn?: number;
        minThreshold?: number;
        maxThreshold?: number;
    };
    reward?: {
        visualEffect?: string;
        cityElement?: string;
    };
}