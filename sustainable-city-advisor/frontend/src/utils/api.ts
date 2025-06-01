import { 
  GameStateResponse, 
  DecisionResponse, 
  DecisionMakeResponse, 
  AdvisorResponse,
  GameStats
} from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.run.app/api' 
  : 'http://localhost:5000/api';

// API client with error handling
const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      throw error;
    }
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      throw error;
    }
  }
};

// Fetch the current game state
export const fetchGameState = async (): Promise<GameStateResponse> => {
  return await apiClient.get<GameStateResponse>('/game/state');
};

// Fetch the current decision
export const fetchCurrentDecision = async (): Promise<DecisionResponse> => {
  return await apiClient.get<DecisionResponse>('/game/decision/current');
};

// Send the player's decision to the backend
export const sendPlayerDecision = async (
  decisionId: string, 
  choiceId: string
): Promise<DecisionMakeResponse> => {
  return await apiClient.post<DecisionMakeResponse>('/game/decision/make', {
    decisionId,
    choiceId
  });
};

// Fetch the AI advisor's message for the current turn
export const fetchAdvisorMessage = async (decisionId?: string): Promise<AdvisorResponse> => {
  const endpoint = decisionId 
    ? `/game/advisor?decisionId=${decisionId}`
    : '/game/advisor';
  return await apiClient.get<AdvisorResponse>(endpoint);
};

// Reset the game to initial state
export const resetGame = async (): Promise<GameStateResponse> => {
  return await apiClient.post<GameStateResponse>('/game/reset', {});
};

// Mock data for development when backend is not available
export const mockGameState = {
  success: true,
  data: {
    stats: {
      environment: 60,
      economy: 55,
      happiness: 65
    },
    turn: 1,
    maxTurns: 52,
    gameStatus: 'active' as const,
    sceneElements: [
      {
        id: 'city-hall',
        type: 'building' as const,
        modelPath: '/models/city-hall.glb',
        position: { x: 0, y: 0, z: 0 }
      }
    ]
  }
};

export const mockDecision = {
  success: true,
  data: {
    id: 'sample-decision',
    title: 'Tech Company Data Center',
    description: 'A major tech company wants to build a data center in your city.',
    category: 'economic' as const,
    choices: [
      {
        id: 'accept-incentives',
        text: 'Welcome them with tax breaks',
        impact: { environment: -5, economy: 15, happiness: 5 }
      },
      {
        id: 'accept-green',
        text: 'Accept but require renewable energy',
        impact: { environment: 3, economy: 8, happiness: 8 }
      },
      {
        id: 'reject',
        text: 'Reject to preserve nature',
        impact: { environment: 10, economy: -3, happiness: 2 }
      }
    ]
  }
};