import React, { useEffect, useState } from 'react';
import { fetchAdvisorMessage } from '../utils/api';
import { GameState } from '../types';

interface AdvisorAreaProps {
    gameState: GameState;
    onRefreshAdvice: () => void;
}

const AdvisorArea: React.FC<AdvisorAreaProps> = ({ gameState, onRefreshAdvice }) => {
    const [advisorMessage, setAdvisorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [advisorMood, setAdvisorMood] = useState<'positive' | 'neutral' | 'concerned' | 'alarmed'>('neutral');

    // Determine advisor mood based on overall city health
    const getAdvisorMood = (state: GameState): 'positive' | 'neutral' | 'concerned' | 'alarmed' => {
        const averageScore = (state.stats.environment + state.stats.economy + state.stats.happiness) / 3;
        if (averageScore >= 80) return 'positive';
        if (averageScore >= 60) return 'neutral';
        if (averageScore >= 40) return 'concerned';
        return 'alarmed';
    };

    const getAdvisorAvatar = (mood: string): string => {
        switch (mood) {
            case 'positive': return '😊';
            case 'neutral': return '🤔';
            case 'concerned': return '😟';
            case 'alarmed': return '😨';
            default: return '🤖';
        }
    };

    useEffect(() => {
        const mood = getAdvisorMood(gameState);
        setAdvisorMood(mood);
        
        // Fetch new advisor message when game state changes
        const getAdvisorMessage = async () => {
            setIsLoading(true);
            try {
                console.log('Fetching advisor message for game state:', 
                    {turn: gameState.turn, 
                     stats: gameState.stats, 
                     gameStatus: gameState.gameStatus});
                     
                const response = await fetchAdvisorMessage();
                if (response.success && response.data) {
                    console.log('New advisor message received:', response.data.message);
                    setAdvisorMessage(response.data.message);
                } else {
                    console.warn('Failed to get advisor message, using fallback');
                    setAdvisorMessage("I'm here to help guide your city towards sustainability. Check your stats and make wise decisions!");
                }
            } catch (error) {
                console.error('Error fetching advisor message:', error);
                setAdvisorMessage("I'm here to help guide your city towards sustainability. Check your stats and make wise decisions!");
            } finally {
                setIsLoading(false);
            }
        };

        getAdvisorMessage();
    }, [gameState]); // Adding gameState as a dependency to ensure this runs on any gameState change

    const handleRefreshAdvice = () => {
        onRefreshAdvice();
        // Re-fetch advisor message when manually refreshed
        const getAdvisorMessage = async () => {
            setIsLoading(true);
            try {
                const response = await fetchAdvisorMessage();
                if (response.success && response.data) {
                    setAdvisorMessage(response.data.message);
                } else {
                    setAdvisorMessage("I'm here to help guide your city towards sustainability. Check your stats and make wise decisions!");
                }
            } catch (error) {
                setAdvisorMessage("I'm here to help guide your city towards sustainability. Check your stats and make wise decisions!");
            } finally {
                setIsLoading(false);
            }
        };
        getAdvisorMessage();
    };

    return (
        <div className={`advisor-area advisor-${advisorMood}`}>
            <div className="advisor-header">
                <div className="advisor-avatar">
                    <span className="advisor-emoji">{getAdvisorAvatar(advisorMood)}</span>
                </div>
                <div className="advisor-title">
                    <h3>AI Sustainability Advisor</h3>
                    <p className="advisor-mood">Status: {advisorMood.charAt(0).toUpperCase() + advisorMood.slice(1)}</p>
                </div>
                <button 
                    className="refresh-advice-btn"
                    onClick={handleRefreshAdvice}
                    disabled={isLoading}
                    title="Get fresh advice"
                >
                    🔄
                </button>
            </div>
            
            <div className="advisor-message">
                {isLoading ? (
                    <div className="advisor-loading">
                        <div className="loading-dots">Thinking...</div>
                    </div>
                ) : (
                    <p>{advisorMessage}</p>
                )}
            </div>

            <div className="advisor-stats-summary">
                <h4>Quick Stats Overview:</h4>
                <div className="stats-mini">
                    <span className={`stat-mini ${gameState.stats.environment < 40 ? 'critical' : gameState.stats.environment < 70 ? 'warning' : 'good'}`}>
                        🌱 Environment: {gameState.stats.environment}%
                    </span>
                    <span className={`stat-mini ${gameState.stats.economy < 40 ? 'critical' : gameState.stats.economy < 70 ? 'warning' : 'good'}`}>
                        💰 Economy: {gameState.stats.economy}%
                    </span>
                    <span className={`stat-mini ${gameState.stats.happiness < 40 ? 'critical' : gameState.stats.happiness < 70 ? 'warning' : 'good'}`}>
                        😊 Happiness: {gameState.stats.happiness}%
                    </span>
                </div>
                <p className="turn-info">Turn {gameState.turn} of {gameState.maxTurns}</p>
            </div>
        </div>
    );
};

export default AdvisorArea;