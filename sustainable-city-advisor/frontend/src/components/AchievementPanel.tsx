import React, { useState, useEffect } from 'react';
import { Achievement } from '../types';
import { fetchAchievements } from '../utils/api';

interface AchievementPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

interface AchievementData {
  unlocked: Achievement[];
  progress: Record<string, number>;
}

const AchievementPanel: React.FC<AchievementPanelProps> = ({ isVisible, onClose }) => {
  const [achievements, setAchievements] = useState<AchievementData>({ unlocked: [], progress: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievementData = async () => {
    try {
      setLoading(true);
      const response = await fetchAchievements();
      
      if (response.success) {
        setAchievements(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch achievements');
      }
    } catch (err) {
      setError('Network error while fetching achievements');
      console.error('Achievement fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchAchievementData();
    }
  }, [isVisible]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      case 'legendary': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'environmental': return '🌱';
      case 'economic': return '💰';
      case 'social': return '❤️';
      case 'leadership': return '⭐';
      default: return '🏆';
    }
  };

  const formatProgress = (progress: number): string => {
    return `${Math.round(progress)}%`;
  };

  if (!isVisible) return null;

  return (
    <div className="achievement-panel-overlay">
      <div className="achievement-panel">
        <div className="achievement-header">
          <h2>🏆 Achievements</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {loading && (
          <div className="achievement-loading">
            <div className="loading-spinner"></div>
            <p>Loading achievements...</p>
          </div>
        )}

        {error && (
          <div className="achievement-error">
            <p>❌ {error}</p>
            <button onClick={fetchAchievementData}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="achievement-content">
            <div className="achievement-summary">
              <div className="summary-stat">
                <span className="summary-label">Unlocked:</span>
                <span className="summary-value">{achievements.unlocked.length}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Total Progress:</span>
                <span className="summary-value">
                  {Object.keys(achievements.progress).length > 0
                    ? formatProgress(
                        Object.values(achievements.progress).reduce((a, b) => a + b, 0) /
                        Object.values(achievements.progress).length
                      )
                    : '0%'
                  }
                </span>
              </div>
            </div>

            <div className="achievement-tabs">
              <div className="tab active">All Achievements</div>
            </div>

            <div className="achievement-list">
              {achievements.unlocked.length > 0 && (
                <div className="achievement-section">
                  <h3>🎉 Unlocked Achievements</h3>
                  {achievements.unlocked.map((achievement) => (
                    <div key={achievement.id} className="achievement-item unlocked">
                      <div className="achievement-icon">
                        {getCategoryIcon(achievement.category)}
                      </div>
                      <div className="achievement-details">
                        <div className="achievement-title">{achievement.title}</div>
                        <div className="achievement-description">{achievement.description}</div>
                        <div className="achievement-meta">
                          <span 
                            className="achievement-difficulty"
                            style={{ color: getDifficultyColor(achievement.difficulty) }}
                          >
                            {achievement.difficulty.toUpperCase()}
                          </span>
                          {achievement.unlockedAt && (
                            <span className="achievement-unlock-time">
                              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="achievement-status unlocked">✅</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="achievement-section">
                <h3>🎯 In Progress</h3>
                {Object.entries(achievements.progress)
                  .filter(([id]) => !achievements.unlocked.some(a => a.id === id))
                  .map(([id, progress]) => (
                    <div key={id} className="achievement-item in-progress">
                      <div className="achievement-icon">🔓</div>
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
                      <div className="achievement-status in-progress">
                        {formatProgress(progress)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementPanel;
