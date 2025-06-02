import React, { useState, useEffect } from 'react';
import AdvisorArea from './components/AdvisorArea';
import CityView from './components/CityView';
import DecisionArea from './components/DecisionArea';
import EndGameScreen from './components/EndGameScreen';
import StatsDisplay from './components/StatsDisplay';
import AchievementPanel from './components/AchievementPanel';
import AchievementNotification from './components/AchievementNotification';
import { 
  fetchGameState, 
  fetchCurrentDecision, 
  fetchAdvisorMessage,
  sendPlayerDecision,
  mockGameState,
  mockDecision
} from './utils/api';
import { GameState, Decision, AdvisorMessage, Choice, Achievement } from './types';
import './index.css';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [advisorMessage, setAdvisorMessage] = useState<AdvisorMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  // Load initial game state
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from backend, fall back to mock data if unavailable
        let gameStateResponse, decisionResponse, advisorResponse;
        
        try {
          [gameStateResponse, decisionResponse, advisorResponse] = await Promise.all([
            fetchGameState(),
            fetchCurrentDecision(),
            fetchAdvisorMessage()
          ]);
        } catch (apiError) {
          console.warn('Backend unavailable, using mock data:', apiError);
          // Use mock data for development
          gameStateResponse = mockGameState;
          decisionResponse = mockDecision;
          advisorResponse = {
            success: true,
            data: {
              message: "Welcome, Mayor! Your city awaits your leadership. Consider the environmental impact of your decisions.",
              personality: 'encouraging' as const,
              context: 'current_state' as const
            }
          };
        }

        if (gameStateResponse.success) {
          setGameState(gameStateResponse.data);
        }
        if (decisionResponse.success) {
          setCurrentDecision(decisionResponse.data);
        }
        if (advisorResponse.success) {
          setAdvisorMessage(advisorResponse.data);
        }
      } catch (err) {
        setError('Failed to load game data');
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleDecisionMade = async (choice: Choice) => {
    if (!gameState || !currentDecision) {
      console.error('Cannot make decision: gameState or currentDecision is null');
      return;
    }

    try {
      setIsLoading(true);
      
      // Send decision to backend
      console.log('Sending decision to backend:', 
        {decision: currentDecision.id, choice: choice.id, impact: choice.impact});
      const response = await sendPlayerDecision(currentDecision.id, choice.id);
      
      if (response.success) {
        // Update game state with backend response
        const updatedGameState: GameState = {
          ...gameState,
          stats: response.newStats,
          turn: gameState.turn + 1,
          gameStatus: response.gameStatus,
          sceneElements: [...gameState.sceneElements, ...response.sceneChanges.map(change => change.element)]
        };

        // Ensure UI is updated with the latest stats
        console.log('Updating game state with new stats:', response.newStats);
        console.log('Current game turn after update:', updatedGameState.turn);
        console.log('Current game status:', updatedGameState.gameStatus);
        
        // Force a state update by creating a new state object
        setGameState({...updatedGameState});

        // Handle achievements if any were unlocked
        if (response.achievementsUnlocked && response.achievementsUnlocked.length > 0) {
          setRecentAchievements(response.achievementsUnlocked);
        }

        // Fetch new decision and advisor message if game continues
        if (response.gameStatus === 'active' && response.nextDecisionAvailable) {
          console.log('Game continues - fetching new decision and advisor message...');
          try {
            const [decisionResponse, advisorResponse] = await Promise.all([
              fetchCurrentDecision(),
              fetchAdvisorMessage()
            ]);

            console.log('New decision fetched:', decisionResponse);
            console.log('New advisor message fetched:', advisorResponse);

            if (decisionResponse.success && decisionResponse.data) {
              setCurrentDecision(decisionResponse.data);
            } else {
              console.error('Failed to fetch decision:', decisionResponse);
            }
            
            if (advisorResponse.success && advisorResponse.data) {
              setAdvisorMessage(advisorResponse.data);
            } else {
              console.error('Failed to fetch advisor message:', advisorResponse);
            }
          } catch (fetchError) {
            console.error('Error fetching new game data:', fetchError);
          }
        } else {
          console.log('Game over or no more decisions available');
          setCurrentDecision(null);
        }
      } else {
        throw new Error(response.error || 'Failed to process decision');
      }
    } catch (err) {
      setError('Failed to process decision');
      console.error('Error handling decision:', err);
      
      // Fallback to local processing if backend fails
      const newStats = {
        environment: Math.max(0, Math.min(100, gameState.stats.environment + choice.impact.environment)),
        economy: Math.max(0, Math.min(100, gameState.stats.economy + choice.impact.economy)),
        happiness: Math.max(0, Math.min(100, gameState.stats.happiness + choice.impact.happiness))
      };

      const hasFailure = newStats.environment <= 0 || newStats.economy <= 0 || newStats.happiness <= 0;
      const hasVictory = gameState.turn >= gameState.maxTurns && 
                        newStats.environment >= 70 && newStats.economy >= 70 && newStats.happiness >= 70;
      
      const newTurn = gameState.turn + 1;
      
      const updatedGameState: GameState = {
        ...gameState,
        stats: newStats,
        turn: newTurn,
        gameStatus: (hasFailure || hasVictory || newTurn >= gameState.maxTurns) ? 'ended' : 'active',
        endingType: hasFailure ? 'failure' : hasVictory ? 'victory' : undefined,
        endingTitle: hasFailure ? 'City in Crisis' : hasVictory ? 'Sustainable Success!' : 'Time\'s Up!'
      };

      setGameState(updatedGameState);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAdvice = async () => {
    try {
      const advisorResponse = await fetchAdvisorMessage();
      if (advisorResponse.success) {
        setAdvisorMessage(advisorResponse.data);
      }
    } catch (err) {
      console.error('Error refreshing advice:', err);
    }
  };

  const handleAchievementClose = (achievementId: string) => {
    setRecentAchievements(prev => prev.filter(a => a.id !== achievementId));
  };

  const handleRestartGame = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/game/reset', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setGameState(data.data);
        setRecentAchievements([]);
        setError(null);
        
        // Fetch new decision and advisor message
        const [decisionResponse, advisorResponse] = await Promise.all([
          fetchCurrentDecision(),
          fetchAdvisorMessage()
        ]);

        if (decisionResponse.success) {
          setCurrentDecision(decisionResponse.data);
        }
        if (advisorResponse.success) {
          setAdvisorMessage(advisorResponse.data);
        }
      }
    } catch (err) {
      console.error('Error restarting game:', err);
      // Fallback to window reload
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && !gameState) {
    return (
      <div className="app loading">
        <div className="loading-screen">
          <h2>Loading Sustainable City Advisor...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !gameState) {
    return (
      <div className="app error">
        <div className="error-screen">
          <h2>Error Loading Game</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // End game state
  if (gameState?.gameStatus === 'ended') {
    return (
      <div className="app">
        <EndGameScreen 
          gameState={gameState}
          onRestart={handleRestartGame}
        />
      </div>
    );
  }

  // Main game state
  return (
    <div className="app">
      <header className="app-header">
        <h1>Sustainable City Advisor</h1>
        <div className="header-controls">
          <div className="turn-info">
            Turn {gameState?.turn || 1} of {gameState?.maxTurns || 52}
          </div>
          <button 
            className="achievements-button"
            onClick={() => setShowAchievements(true)}
            title="View Achievements"
          >
            🏆 Achievements
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="left-panel">
          <StatsDisplay stats={gameState?.stats} />
          {gameState && advisorMessage && (
            <AdvisorArea 
              gameState={gameState}
              onRefreshAdvice={handleRefreshAdvice}
            />
          )}
        </div>

        <div className="center-panel">
          <CityView 
            environmentScore={gameState?.stats.environment || 60}
            economyScore={gameState?.stats.economy || 55}
            happinessScore={gameState?.stats.happiness || 65}
            sceneElements={gameState?.sceneElements || []}
            recentAchievements={recentAchievements}
          />
        </div>

        <div className="right-panel">
          {gameState && (
            <DecisionArea
              onDecisionMade={handleDecisionMade}
              gameState={gameState}
            />
          )}
        </div>
      </main>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {error && gameState && (
        <div className="error-toast">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Achievement Panel */}
      {showAchievements && (
        <AchievementPanel 
          isVisible={showAchievements}
          onClose={() => setShowAchievements(false)} 
        />
      )}

      {/* Achievement Notifications */}
      {recentAchievements.length > 0 && (
        <AchievementNotification
          achievements={recentAchievements}
          onClose={handleAchievementClose}
        />
      )}
    </div>
  );
};

export default App;