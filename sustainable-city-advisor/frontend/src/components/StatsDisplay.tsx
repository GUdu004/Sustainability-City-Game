import React from 'react';
import { GameStats } from '../types';

interface StatsDisplayProps {
  stats?: GameStats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="stats-display loading">
        <h2>City Stats</h2>
        <div className="loading-stats">Loading...</div>
      </div>
    );
  }

  const getStatColor = (value: number): string => {
    if (value >= 70) return '#4CAF50'; // Green
    if (value >= 40) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const getStatDescription = (stat: string, value: number): string => {
    if (value >= 80) return `Excellent ${stat.toLowerCase()}`;
    if (value >= 60) return `Good ${stat.toLowerCase()}`;
    if (value >= 40) return `Fair ${stat.toLowerCase()}`;
    if (value >= 20) return `Poor ${stat.toLowerCase()}`;
    return `Critical ${stat.toLowerCase()}`;
  };

  return (
    <div className="stats-display">
      <h2>City Stats</h2>
      
      <div className="stat-item">
        <div className="stat-header">
          <span className="stat-icon">🌱</span>
          <span className="stat-label">Environment</span>
          <span className="stat-value" style={{ color: getStatColor(stats.environment) }}>
            {stats.environment}
          </span>
        </div>
        <div className="stat-bar">
          <div 
            className="stat-fill environment"
            style={{ 
              width: `${stats.environment}%`,
              backgroundColor: getStatColor(stats.environment)
            }}
          />
        </div>
        <div className="stat-description">
          {getStatDescription('Environment', stats.environment)}
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-header">
          <span className="stat-icon">💰</span>
          <span className="stat-label">Economy</span>
          <span className="stat-value" style={{ color: getStatColor(stats.economy) }}>
            {stats.economy}
          </span>
        </div>
        <div className="stat-bar">
          <div 
            className="stat-fill economy"
            style={{ 
              width: `${stats.economy}%`,
              backgroundColor: getStatColor(stats.economy)
            }}
          />
        </div>
        <div className="stat-description">
          {getStatDescription('Economy', stats.economy)}
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-header">
          <span className="stat-icon">😊</span>
          <span className="stat-label">Happiness</span>
          <span className="stat-value" style={{ color: getStatColor(stats.happiness) }}>
            {stats.happiness}
          </span>
        </div>
        <div className="stat-bar">
          <div 
            className="stat-fill happiness"
            style={{ 
              width: `${stats.happiness}%`,
              backgroundColor: getStatColor(stats.happiness)
            }}
          />
        </div>
        <div className="stat-description">
          {getStatDescription('Happiness', stats.happiness)}
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;