import React, { useState, useEffect } from 'react';
import { Achievement } from '../types';
import { fetchAchievements } from '../utils/api';
import './AchievementPanel.css';

interface AchievementPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

interface AchievementData {
  unlocked: Achievement[];
  progress: Record<string, number>;
}

type TabType = 'all' | 'unlocked' | 'in-progress';

const AchievementPanel: React.FC<AchievementPanelProps> = ({ isVisible, onClose }) => {
  const [achievements, setAchievements] = useState<AchievementData>({ unlocked: [], progress: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');

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
  // Fetch achievements data when panel becomes visible
  useEffect(() => {
    if (isVisible) {
      fetchAchievementData();
      // Reset to default tab when panel opens
      setActiveTab('all');
    }
  }, [isVisible]);
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      case 'legendary': return '#9b59b6';
      default: return '#7f8c8d';
    }
  };
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
  const formatProgress = (progress: number): string => {
    // Ensure we display a properly formatted percentage with no decimal places
    return `${Math.min(100, Math.max(0, Math.round(progress)))}%`;
  };
  if (!isVisible) return null;

  // Calculate total achievements count
  const totalAchievements = achievements.unlocked.length + 
    Object.keys(achievements.progress).filter(
      id => !achievements.unlocked.some(a => a.id === id)
    ).length;

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
                <span className="summary-value">{achievements.unlocked.length}</span>
                <span className="summary-label">Unlocked</span>
              </div>
              <div className="summary-stat">
                <span className="summary-value">
                  {totalAchievements > 0 ? Math.round((achievements.unlocked.length / totalAchievements) * 100) : 0}%
                </span>
                <span className="summary-label">Completion</span>
              </div>
              <div className="summary-stat">
                <span className="summary-value">
                  {Object.keys(achievements.progress).length > 0
                    ? formatProgress(
                        Object.values(achievements.progress).reduce((a, b) => a + b, 0) /
                        Object.values(achievements.progress).length
                      )
                    : '0%'
                  }
                </span>
                <span className="summary-label">Progress</span>
              </div>
            </div>            <div className="achievement-tabs">
              <div 
                className={`tab ${activeTab === 'all' ? 'active' : ''}`} 
                onClick={() => setActiveTab('all')}
              >
                All Achievements
              </div>
              <div 
                className={`tab ${activeTab === 'unlocked' ? 'active' : ''}`} 
                onClick={() => setActiveTab('unlocked')}
              >
                Unlocked ({achievements.unlocked.length})
              </div>
              <div 
                className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`} 
                onClick={() => setActiveTab('in-progress')}
              >
                In Progress ({Object.keys(achievements.progress).filter(id => !achievements.unlocked.some(a => a.id === id)).length})
              </div>
            </div>

            <div className="achievement-list">
              {/* Show unlocked achievements if on "all" or "unlocked" tab */}
              {(activeTab === 'all' || activeTab === 'unlocked') && achievements.unlocked.length > 0 && (
                <div className="achievement-section">
                  <h3>✨ Unlocked Achievements</h3>
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

              {/* Show in progress achievements if on "all" or "in-progress" tab */}
              {(activeTab === 'all' || activeTab === 'in-progress') && (
                <div className="achievement-section">
                  <h3>🎯 In Progress</h3>
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
                        <div className="achievement-status in-progress">
                          {formatProgress(progress)}
                        </div>
                      </div>
                    ))}
                  
                  {activeTab === 'in-progress' && 
                   Object.entries(achievements.progress).filter(([id]) => !achievements.unlocked.some(a => a.id === id)).length === 0 && (
                    <div className="achievement-item" style={{textAlign: "center", justifyContent: "center"}}>
                      <p>Keep playing to discover more achievements!</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Show message if no achievements in selected category */}
              {activeTab === 'unlocked' && achievements.unlocked.length === 0 && (
                <div className="achievement-section">
                  <div className="achievement-item" style={{textAlign: "center", justifyContent: "center"}}>
                    <p>No achievements unlocked yet. Keep playing!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementPanel;
