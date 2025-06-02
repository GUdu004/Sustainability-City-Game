import React, { useState, useEffect } from 'react';
import { fetchCurrentDecision, sendPlayerDecision } from '../utils/api';
import { Decision, Choice } from '../types';

interface DecisionAreaProps {
    onDecisionMade: (choice: Choice) => void;
    gameState: { turn: number; gameStatus: string };
}

const DecisionArea: React.FC<DecisionAreaProps> = ({ onDecisionMade, gameState }) => {
    const [decision, setDecision] = useState<Decision | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [showChoiceDetails, setShowChoiceDetails] = useState<string | null>(null);

    useEffect(() => {
        if (gameState.gameStatus === 'active') {
            console.log('DecisionArea: Game state changed - fetching new decision');
            console.log('Current turn:', gameState.turn, 'Game status:', gameState.gameStatus);
            fetchDecision();
        } else {
            console.log('DecisionArea: Game is not active, not fetching new decision');
        }
    }, [gameState.turn, gameState.gameStatus]);

    const fetchDecision = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching new decision...');
            const response = await fetchCurrentDecision();
            if (response.success && response.data) {
                console.log('New decision received:', response.data);
                setDecision(response.data);
            } else {
                console.error('Failed to get decision data:', response);
                setError('Failed to fetch current decision. Please try again.');
            }
            setSelectedChoice(null);
        } catch (err) {
            console.error('Error fetching decision:', err);
            setError('Failed to fetch current decision. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecisionChoice = async (choice: Choice) => {
        if (!decision) return;
        
        setSelectedChoice(choice.id);
        setIsLoading(true);
        
        try {
            await sendPlayerDecision(decision.id, choice.id);
            onDecisionMade(choice);
            
            // Small delay for better UX
            setTimeout(() => {
                fetchDecision();
            }, 1000);
        } catch (err) {
            setError('Failed to submit decision. Please try again.');
            console.error('Error sending decision:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryIcon = (category: string): string => {
        switch (category) {
            case 'infrastructure': return '🏗️';
            case 'economic': return '💼';
            case 'environmental': return '🌿';
            case 'social': return '👥';
            default: return '⚡';
        }
    };

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'infrastructure': return '#8B5CF6';
            case 'economic': return '#F59E0B';
            case 'environmental': return '#10B981';
            case 'social': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    const getImpactColor = (impact: number): string => {
        if (impact > 0) return '#10B981'; // Green for positive
        if (impact < 0) return '#EF4444'; // Red for negative
        return '#6B7280'; // Gray for neutral
    };

    const formatImpact = (impact: number): string => {
        if (impact > 0) return `+${impact}`;
        return impact.toString();
    };

    if (gameState.gameStatus !== 'active') {
        return (
            <div className="decision-area game-ended">
                <div className="no-decisions">
                    <h3>Game Complete</h3>
                    <p>No more decisions to make. Check your final results!</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="decision-area error-state">
                <div className="error-message">
                    <h3>⚠️ Error</h3>
                    <p>{error}</p>
                    <button 
                        className="retry-btn"
                        onClick={fetchDecision}
                        disabled={isLoading}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading && !decision) {
        return (
            <div className="decision-area loading-state">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p>Loading next decision...</p>
                </div>
            </div>
        );
    }

    if (!decision) {
        return (
            <div className="decision-area no-decision">
                <div className="no-decisions">
                    <h3>No Current Decision</h3>
                    <p>Waiting for the next challenge...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="decision-area">
            <div className="decision-header">
                <div className="decision-category" style={{ backgroundColor: getCategoryColor(decision.category) }}>
                    <span className="category-icon">{getCategoryIcon(decision.category)}</span>
                    <span className="category-name">{decision.category.charAt(0).toUpperCase() + decision.category.slice(1)}</span>
                </div>
                <div className="decision-title">
                    <h2>{decision.title}</h2>
                </div>
            </div>

            <div className="decision-content">
                <p className="decision-description">{decision.description}</p>
            </div>

            <div className="decision-choices">
                <h3>Your Options:</h3>
                <div className="choices-grid">
                    {decision.choices.map((choice) => (
                        <div 
                            key={choice.id} 
                            className={`choice-card ${selectedChoice === choice.id ? 'selected' : ''} ${isLoading ? 'disabled' : ''}`}
                            onMouseEnter={() => setShowChoiceDetails(choice.id)}
                            onMouseLeave={() => setShowChoiceDetails(null)}
                        >
                            <button 
                                className="choice-button"
                                onClick={() => handleDecisionChoice(choice)}
                                disabled={isLoading}
                            >
                                <div className="choice-text">
                                    {choice.text}
                                </div>
                                
                                {showChoiceDetails === choice.id && (
                                    <div className="choice-details">
                                        <div className="impacts">
                                            <span 
                                                className="impact-item"
                                                style={{ color: getImpactColor(choice.impact.environment) }}
                                            >
                                                🌱 {formatImpact(choice.impact.environment)}
                                            </span>
                                            <span 
                                                className="impact-item"
                                                style={{ color: getImpactColor(choice.impact.economy) }}
                                            >
                                                💰 {formatImpact(choice.impact.economy)}
                                            </span>
                                            <span 
                                                className="impact-item"
                                                style={{ color: getImpactColor(choice.impact.happiness) }}
                                            >
                                                😊 {formatImpact(choice.impact.happiness)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {isLoading && selectedChoice === choice.id && (
                                    <div className="choice-loading">
                                        <div className="small-spinner"></div>
                                    </div>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="decision-help">
                <p>💡 <strong>Tip:</strong> Hover over choices to see their potential impacts on your city stats.</p>
            </div>
        </div>
    );
};

export default DecisionArea;