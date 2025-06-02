import React, { useState, useEffect } from 'react';
import { Achievement } from '../types';

interface AchievementNotificationProps {
  achievements: Achievement[];
  onClose: (achievementId: string) => void;
}

interface NotificationState {
  id: string;
  achievement: Achievement;
  isVisible: boolean;
  progress: number;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ achievements, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  useEffect(() => {
    // Add new notifications for each achievement
    achievements.forEach((achievement) => {
      setNotifications(prev => {
        // Check if this achievement is already shown
        if (prev.some(n => n.achievement.id === achievement.id)) return prev;
        
        const newNotification: NotificationState = {
          id: `${achievement.id}-${Date.now()}`,
          achievement,
          isVisible: false,
          progress: 0
        };

        return [...prev, newNotification];
      });
    });
  }, [achievements]);

  useEffect(() => {
    // Animate in new notifications
    const timer = setTimeout(() => {
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isVisible: true
        }))
      );
    }, 100);

    return () => clearTimeout(timer);
  }, [notifications.length]);

  const handleClose = (notificationId: string, achievementId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isVisible: false }
          : notification
      )
    );

    // Remove from DOM after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      onClose(achievementId);
    }, 300);
  };

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

  if (notifications.length === 0) return null;

  return (
    <div className="achievement-notifications">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`achievement-notification ${notification.isVisible ? 'visible' : ''}`}
          style={{ borderLeftColor: getDifficultyColor(notification.achievement.difficulty) }}
        >
          <div className="notification-header">
            <div className="notification-icon">
              <span className="achievement-glow">✨</span>
              <span className="category-icon">
                {getCategoryIcon(notification.achievement.category)}
              </span>
            </div>
            <div className="notification-content">
              <div className="notification-title">🎉 Achievement Unlocked!</div>
              <div className="achievement-name">{notification.achievement.title}</div>
              <div className="achievement-desc">{notification.achievement.description}</div>
              <div className="achievement-meta">
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(notification.achievement.difficulty) }}
                >
                  {notification.achievement.difficulty.toUpperCase()}
                </span>
                <span className="category-badge">{notification.achievement.category}</span>
              </div>
            </div>
            <button 
              className="notification-close"
              onClick={() => handleClose(notification.id, notification.achievement.id)}
            >
              ×
            </button>
          </div>
          
          {notification.achievement.reward?.visualEffect && (
            <div className="reward-preview">
              <span className="reward-icon">🎁</span>
              <span className="reward-text">
                Unlocked: {notification.achievement.reward.visualEffect.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AchievementNotification;
