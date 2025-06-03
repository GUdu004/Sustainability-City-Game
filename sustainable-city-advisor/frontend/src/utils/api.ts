import { 
  GameStateResponse, 
  DecisionResponse, 
  DecisionMakeResponse, 
  AdvisorResponse,
  GameStats
} from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.run.app/api' 
  : 'http://localhost:8000/api';

interface ApiError {
  status: number;
  message: string;
}

// API client with enhanced error handling
const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.error || `Server responded with status ${response.status}`
        };
      }

      if (!data.success) {
        throw {
          status: response.status,
          message: data.error || 'Operation failed'
        };
      }

      return data;
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      throw {
        status: (error as ApiError)?.status || 500,
        message: (error as ApiError)?.message || 'Failed to connect to the server. Please try again.'
      };
    }
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData.error || `Server responded with status ${response.status}`
        };
      }

      if (!responseData.success) {
        throw {
          status: response.status,
          message: responseData.error || 'Operation failed'
        };
      }

      return responseData;
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      throw {
        status: (error as ApiError)?.status || 500,
        message: (error as ApiError)?.message || 'Failed to connect to the server. Please try again.'
      };
    }
  }
};

// Fetch the current game state with retries
export const fetchGameState = async (retries = 3): Promise<GameStateResponse> => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await apiClient.get<GameStateResponse>('/game/state');
    } catch (error) {
      console.warn(`Attempt ${i + 1}/${retries} failed:`, error);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using mock data after all retries failed');
    return mockGameState;
  }
  throw lastError;
};

// Fetch the current decision with error handling
export const fetchCurrentDecision = async (): Promise<DecisionResponse> => {
  try {
    console.log('API: Fetching current decision');
    const response = await apiClient.get<DecisionResponse>('/game/decision');
    console.log('API: Decision fetch response:', response);
    return response;
  } catch (error) {
    console.error('API: Error fetching decision:', error);
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock decision data after API error');
      return mockDecision;
    }
    throw error;
  }
};

// Send the player's decision to the backend
export const sendPlayerDecision = async (
  decisionId: string, 
  choiceId: string
): Promise<DecisionMakeResponse> => {
  try {
    console.log('Sending decision to backend:', { decisionId, choiceId });
    return await apiClient.post<DecisionMakeResponse>('/game/decision', {
      decisionId,
      choiceId
    });
  } catch (error) {
    console.error('Decision submission error:', error);
    // If in development, provide a fallback response to continue the game
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock decision response after API error');
      return {
        success: true,
        feedback: "Decision processed successfully (mock response).",
        statChanges: { environment: 5, economy: 5, happiness: 5 },
        newStats: { environment: 50, economy: 50, happiness: 50 },
        sceneChanges: [],
        gameStatus: 'active',
        nextDecisionAvailable: true,
        achievementsUnlocked: []
      };
    }
    throw error;
  }
};

// Fetch the AI advisor's message with retries
export const fetchAdvisorMessage = async (decisionId?: string, retries = 2): Promise<AdvisorResponse> => {
  const endpoint = decisionId 
    ? `/advisor?decisionId=${decisionId}`
    : '/advisor';
  
  console.log('API: Fetching advisor message from endpoint:', endpoint);
    
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await apiClient.get<AdvisorResponse>(endpoint);
      console.log('API: Advisor message response:', response);

      if (!response || !response.data) {
        throw new Error('Invalid or empty response from the advisor API');
      }

      return response;
    } catch (error) {
      console.warn(`Advisor API attempt ${i + 1}/${retries} failed:`, error);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  // In development mode, return mock data if all retries fail
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using mock advisor data after all retries failed');
    return {
      success: true,
      data: {
        message: "I'm having trouble connecting to the server right now. As your advisor, I suggest focusing on maintaining a balance between economy, environment, and citizen happiness.",
        personality: 'concerned',
        context: 'current_state'
      }
    };
  }
  
  // In production, provide a user-friendly error response
  return {
    success: true,
    data: {
      message: "As your city's advisor, I'm currently experiencing technical difficulties. In the meantime, remember that sustainable cities require balancing environmental protection, economic growth, and citizen satisfaction.",
      personality: 'encouraging',
      context: 'current_state'
    }
  };
};

// Reset the game to initial state
export const resetGame = async (): Promise<GameStateResponse> => {
  return await apiClient.post<GameStateResponse>('/game/reset', {});
};

// Fetch achievements with retry logic and mock data fallback
export const fetchAchievements = async (retries = 2) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await apiClient.get('/game/achievements');
    } catch (error) {
      console.warn(`Achievements API attempt ${i + 1}/${retries} failed:`, error);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  // In development mode, return mock data if all retries fail
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using mock achievement data after API error');
    return {
      success: true,
      data: {
        unlocked: [
          {
            id: 'green_city_starter',
            title: 'Green City Starter',
            description: 'Reach an environment score of 70 or higher',
            category: 'environmental',
            difficulty: 'easy',
            unlockedAt: new Date()
          },
          {
            id: 'economic_growth',
            title: 'Economic Growth',
            description: 'Reach an economy score of 70 or higher',
            category: 'economic',
            difficulty: 'medium',
            unlockedAt: new Date()
          }
        ],
        progress: {
          'balanced_approach': 65,
          'sustainability_champion': 40,
          'citizen_happiness': 80
        }
      }
    };
  }
  
  throw lastError;
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
        modelPath: '/models/buildings/city-hall.glb',
        position: { x: 0, y: 0, z: 0 }
      },
      {
        id: 'park-1',
        type: 'vegetation' as const,
        modelPath: '/models/vegetation/tree.glb',
        position: { x: 10, y: 0, z: 10 }
      },
      {
        id: 'solar-panel-1',
        type: 'infrastructure' as const,
        modelPath: '/models/infrastructure/solar_panels.glb',
        position: { x: -10, y: 0, z: -10 }
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