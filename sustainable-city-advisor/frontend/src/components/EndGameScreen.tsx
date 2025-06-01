import React from 'react';
import { GameState } from '../types';

interface EndGameScreenProps {
    gameState: GameState;
    onRestart: () => void;
}

const EndGameScreen: React.FC<EndGameScreenProps> = ({ gameState, onRestart }) => {
    const { stats, endingType, endingTitle } = gameState;
    
    const getEndingEmoji = (type?: string): string => {
        switch (type) {
            case 'victory': return '🎉';
            case 'failure': return '💔';
            default: return '🏁';
        }
    };

    const getEndingColor = (type?: string): string => {
        switch (type) {
            case 'victory': return '#10B981';
            case 'failure': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getGradeForStat = (value: number): { grade: string; color: string } => {
        if (value >= 90) return { grade: 'A+', color: '#10B981' };
        if (value >= 80) return { grade: 'A', color: '#22C55E' };
        if (value >= 70) return { grade: 'B', color: '#84CC16' };
        if (value >= 60) return { grade: 'C', color: '#EAB308' };
        if (value >= 50) return { grade: 'D', color: '#F97316' };
        return { grade: 'F', color: '#EF4444' };
    };

    const calculateOverallScore = (): number => {
        return Math.round((stats.environment + stats.economy + stats.happiness) / 3);
    };

    const getOverallMessage = (): string => {
        const score = calculateOverallScore();
        if (score >= 80) return "Outstanding leadership! Your city thrives as a beacon of sustainability.";
        if (score >= 60) return "Good work! Your city is on the right path towards sustainability.";
        if (score >= 40) return "Mixed results. Your city faces challenges but has potential.";
        return "Your city struggled with major challenges. Consider different strategies next time.";
    };

    const shareMessage = `I just completed the Sustainable City Advisor game! My city scored ${calculateOverallScore()}% overall. Can you do better? 🏙️🌱`;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Sustainable City Advisor',
                text: shareMessage,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(shareMessage);
            alert('Results copied to clipboard!');
        }
    };

    return (
        <div className="end-game-screen" style={{ borderColor: getEndingColor(endingType) }}>
            <div className="end-game-header">
                <div className="ending-icon" style={{ color: getEndingColor(endingType) }}>
                    {getEndingEmoji(endingType)}
                </div>
                <h1 className="ending-title" style={{ color: getEndingColor(endingType) }}>
                    {endingTitle || 'Game Complete'}
                </h1>
                <p className="ending-subtitle">
                    You managed your city for {gameState.turn} turns
                </p>
            </div>

            <div className="final-stats">
                <h2>Final City Report</h2>
                <div className="stats-breakdown">
                    <div className="stat-result">
                        <div className="stat-info">
                            <span className="stat-icon">🌱</span>
                            <span className="stat-name">Environment</span>
                        </div>
                        <div className="stat-score">
                            <span className="stat-value">{stats.environment}%</span>
                            <span 
                                className="stat-grade"
                                style={{ color: getGradeForStat(stats.environment).color }}
                            >
                                {getGradeForStat(stats.environment).grade}
                            </span>
                        </div>
                    </div>

                    <div className="stat-result">
                        <div className="stat-info">
                            <span className="stat-icon">💰</span>
                            <span className="stat-name">Economy</span>
                        </div>
                        <div className="stat-score">
                            <span className="stat-value">{stats.economy}%</span>
                            <span 
                                className="stat-grade"
                                style={{ color: getGradeForStat(stats.economy).color }}
                            >
                                {getGradeForStat(stats.economy).grade}
                            </span>
                        </div>
                    </div>

                    <div className="stat-result">
                        <div className="stat-info">
                            <span className="stat-icon">😊</span>
                            <span className="stat-name">Happiness</span>
                        </div>
                        <div className="stat-score">
                            <span className="stat-value">{stats.happiness}%</span>
                            <span 
                                className="stat-grade"
                                style={{ color: getGradeForStat(stats.happiness).color }}
                            >
                                {getGradeForStat(stats.happiness).grade}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="overall-score">
                    <h3>Overall Performance</h3>
                    <div className="overall-grade">
                        <span className="overall-value">{calculateOverallScore()}%</span>
                        <span 
                            className="overall-letter"
                            style={{ color: getGradeForStat(calculateOverallScore()).color }}
                        >
                            {getGradeForStat(calculateOverallScore()).grade}
                        </span>
                    </div>
                    <p className="overall-message">{getOverallMessage()}</p>
                </div>
            </div>

            <div className="end-game-actions">
                <button 
                    className="restart-btn primary-btn"
                    onClick={onRestart}
                >
                    🔄 Play Again
                </button>
                
                <button 
                    className="share-btn secondary-btn"
                    onClick={handleShare}
                >
                    📤 Share Results
                </button>
            </div>

            <div className="game-tips">
                <h4>💡 Tips for Next Time:</h4>
                <ul>
                    {stats.environment < 60 && (
                        <li>Focus more on environmental decisions to build a greener city</li>
                    )}
                    {stats.economy < 60 && (
                        <li>Balance economic growth with sustainability goals</li>
                    )}
                    {stats.happiness < 60 && (
                        <li>Consider how decisions affect citizen wellbeing and satisfaction</li>
                    )}
                    {calculateOverallScore() >= 70 && (
                        <li>Try different strategies to see how they affect your city's development</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default EndGameScreen;