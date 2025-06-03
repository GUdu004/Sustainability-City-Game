import React, { useState, useEffect } from 'react';
import { GameState, Achievement, AchievementResponse } from '../types';
import AchievementPanel from './AchievementPanel';
import { fetchAchievements as fetchAchievementsApi } from '../utils/api';
import './EndGameScreen.css';

interface EndGameScreenProps {
    gameState: GameState;
    onRestart: () => void;
}

interface AchievementData {
    unlocked: Achievement[];
    progress: Record<string, number>;
}

type TabType = 'stats' | 'achievements' | 'tips';

const EndGameScreen: React.FC<EndGameScreenProps> = ({ gameState, onRestart }) => {
    const { stats, endingType, endingTitle, endingDescription } = gameState;
    const [achievements, setAchievements] = useState<AchievementData>({ unlocked: [], progress: {} });
    const [showAchievements, setShowAchievements] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('stats');

    useEffect(() => {
        fetchAchievementsData();
    }, []);
    
    const fetchAchievementsData = async () => {
        try {
            const response = await fetchAchievementsApi() as AchievementResponse;
            if (response.success) {
                setAchievements(response.data);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        }
    };
    
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

    // Get category icon for achievements
    const getCategoryIcon = (category: string): string => {
        switch (category.toLowerCase()) {
            case 'environmental': return '🌳';
            case 'economic': return '💰';
            case 'social': return '👥';
            case 'leadership': return '⭐';
            case 'innovation': return '💡';
            case 'energy': return '⚡';
            case 'sustainability': return '♻️';
            case 'community': return '🏙️';
            case 'milestone': return '🏁';
            default: return '🏆';
        }
    };

    // Calculate total achievements count
    const totalAchievements = achievements.unlocked.length + 
        Object.keys(achievements.progress).filter(
            id => !achievements.unlocked.some(a => a.id === id)
        ).length;
        
    // Format progress percentage
    const formatProgress = (progress: number): string => {
        return `${Math.min(100, Math.max(0, Math.round(progress)))}%`;
    };

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

            {/* Tabs Navigation */}
            <div className="end-game-tabs">
                <div 
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('stats')}
                >
                    📊 City Report
                </div>
                <div 
                    className={`tab ${activeTab === 'achievements' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('achievements')}
                >
                    🏆 Achievements
                </div>
                <div 
                    className={`tab ${activeTab === 'tips' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('tips')}
                >
                    💡 Tips
                </div>
            </div>

            {/* Stats Tab Content */}
            {activeTab === 'stats' && (
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
                        <p className="overall-message">
                            {endingDescription || getOverallMessage()}
                        </p>
                    </div>
                </div>
            )}

            {/* Achievements Tab Content */}
            {activeTab === 'achievements' && (
                <div className="achievement-summary">
                    <h2>🏆 Achievement Summary</h2>
                    
                    <div className="achievement-stats">
                        <div className="achievement-stat">
                            <span className="achievement-count">{achievements.unlocked.length}</span>
                            <span className="achievement-label">Unlocked</span>
                        </div>
                        <div className="achievement-stat">
                            <span className="achievement-count">
                                {totalAchievements > 0 ? Math.round((achievements.unlocked.length / totalAchievements) * 100) : 0}%
                            </span>
                            <span className="achievement-label">Completion</span>
                        </div>
                        <div className="achievement-stat">
                            <span className="achievement-count">
                                {Object.keys(achievements.progress).length}
                            </span>
                            <span className="achievement-label">In Progress</span>
                        </div>
                    </div>

                    {/* Unlocked Achievements */}
                    {achievements.unlocked.length > 0 ? (
                        <div className="unlocked-achievements">
                            <h3>✨ Unlocked Achievements</h3>
                            <div className="achievement-list">
                                {achievements.unlocked.map((achievement) => (
                                    <div key={achievement.id} className="achievement-item unlocked">
                                        <div className="achievement-icon">
                                            {getCategoryIcon(achievement.category)}
                                        </div>
                                        <div className="achievement-details">
                                            <div className="achievement-title">{achievement.title}</div>
                                            <div className="achievement-description">{achievement.description}</div>
                                            <div className="achievement-meta">
                                                <span className="achievement-category">{achievement.category}</span>
                                                {achievement.unlockedAt && (
                                                    <span className="achievement-unlock-time">
                                                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="no-achievements">
                            <p>No achievements unlocked yet. Keep playing to earn achievements!</p>
                        </div>
                    )}

                    {/* In Progress Achievements */}
                    {Object.entries(achievements.progress).filter(([id]) => 
                        !achievements.unlocked.some(a => a.id === id)).length > 0 && (
                        <div className="in-progress-achievements">
                            <h3>🎯 In Progress</h3>
                            <div className="achievement-list">
                                {Object.entries(achievements.progress)
                                    .filter(([id]) => !achievements.unlocked.some(a => a.id === id))
                                    .map(([id, progress]) => (
                                        <div key={id} className="achievement-item in-progress">
                                            <div className="achievement-icon">🔒</div>
                                            <div className="achievement-details">
                                                <div className="achievement-title">{id.replace(/_/g, ' ').toUpperCase()}</div>
                                                <div className="achievement-description">Achievement in progress...</div>
                                                <div className="achievement-progress-bar">
                                                    <div 
                                                        className="progress-fill"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="achievement-progress-text">
                                                    Progress: {formatProgress(progress)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                    
                    <button 
                        className="view-all-achievements secondary-btn"
                        onClick={() => setShowAchievements(true)}
                    >
                        View Detailed Achievements
                    </button>
                </div>
            )}

            {/* Tips Tab Content */}
            {activeTab === 'tips' && (
                <div className="game-tips">
                    <h2>💡 Tips for Next Time</h2>
                    
                    <div className="tips-section">
                        <h3>General Strategy</h3>
                        <ul>
                            <li>Aim for a balanced approach - neglecting any one area can lead to cascading problems</li>
                            <li>Monitor citizen happiness closely as it can affect your other stats</li>
                            <li>Early investments in infrastructure often pay off in the long run</li>
                            <li>Sustainable technologies might cost more initially but provide better long-term returns</li>
                        </ul>
                    </div>
                    
                    <div className="tips-section">
                        <h3>Your Improvement Areas</h3>
                        <ul>
                            {stats.environment < 60 && (
                                <li>
                                    <strong>Environment ({stats.environment}%):</strong> Focus more on environmental decisions to build a greener city. Consider renewable energy and public transportation options.
                                </li>
                            )}
                            {stats.economy < 60 && (
                                <li>
                                    <strong>Economy ({stats.economy}%):</strong> Balance economic growth with sustainability goals. Invest in innovation and green technology sectors.
                                </li>
                            )}
                            {stats.happiness < 60 && (
                                <li>
                                    <strong>Happiness ({stats.happiness}%):</strong> Consider how decisions affect citizen wellbeing and satisfaction. Prioritize community spaces and citizen services.
                                </li>
                            )}
                            {calculateOverallScore() >= 70 && (
                                <li>
                                    <strong>Challenge Yourself:</strong> Try different strategies or higher difficulty settings to test your skills as a city manager.
                                </li>
                            )}
                        </ul>
                    </div>
                    
                    <div className="tips-section">
                        <h3>Achievement Hunting</h3>
                        <ul>
                            <li>Some achievements require maintaining specific stats for multiple turns</li>
                            <li>Try to unlock "Balanced Leader" by keeping all stats above 70 simultaneously</li>
                            <li>Special achievements can be earned through specific sequences of decisions</li>
                            <li>Achievements can unlock special buildings and visual effects for your city</li>
                        </ul>
                    </div>
                </div>
            )}

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

            {/* Achievement Panel */}
            <AchievementPanel 
                isVisible={showAchievements}
                onClose={() => setShowAchievements(false)}
            />
        </div>
    );
};

export default EndGameScreen;
