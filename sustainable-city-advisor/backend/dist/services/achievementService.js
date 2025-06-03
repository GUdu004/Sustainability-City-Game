"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.achievementTracker = exports.AchievementTracker = exports.ACHIEVEMENT_DEFINITIONS = void 0;
// Define achievement criteria and titles
exports.ACHIEVEMENT_DEFINITIONS = {
    eco_warrior: {
        id: 'eco_warrior',
        title: '🌱 Eco Warrior',
        description: 'Maintain Environment score above 80 for 5 consecutive turns',
        category: 'environmental',
        difficulty: 'hard',
        criteria: {
            type: 'consecutive_stat_threshold',
            stat: 'environment',
            threshold: 80,
            duration: 5
        },
        reward: {
            visualEffect: 'green_glow',
            cityElement: 'pristine_park'
        }
    },
    economic_tycoon: {
        id: 'economic_tycoon',
        title: '💰 Economic Tycoon',
        description: 'Achieve Economy score of 95 or higher',
        category: 'economic',
        difficulty: 'hard',
        criteria: {
            type: 'stat_threshold',
            stat: 'economy',
            threshold: 95
        },
        reward: {
            visualEffect: 'golden_sparkle',
            cityElement: 'luxury_district'
        }
    },
    peoples_champion: {
        id: 'peoples_champion',
        title: '❤️ People\'s Champion',
        description: 'Keep Happiness above 85 for 3 turns',
        category: 'social',
        difficulty: 'medium',
        criteria: {
            type: 'consecutive_stat_threshold',
            stat: 'happiness',
            threshold: 85,
            duration: 3
        },
        reward: {
            visualEffect: 'celebration_fireworks',
            cityElement: 'festival_grounds'
        }
    },
    balanced_leader: {
        id: 'balanced_leader',
        title: '⚖️ Balanced Leader',
        description: 'Maintain all stats above 70 simultaneously',
        category: 'leadership',
        difficulty: 'hard',
        criteria: {
            type: 'all_stats_threshold',
            threshold: 70
        },
        reward: {
            visualEffect: 'harmony_aura',
            cityElement: 'unity_monument'
        }
    },
    crisis_manager: {
        id: 'crisis_manager',
        title: '🚨 Crisis Manager',
        description: 'Recover from a stat below 20 to above 60 in 3 turns',
        category: 'leadership',
        difficulty: 'hard',
        criteria: {
            type: 'recovery',
            fromThreshold: 20,
            toThreshold: 60,
            duration: 3
        },
        reward: {
            visualEffect: 'phoenix_rise',
            cityElement: 'emergency_center'
        }
    },
    green_innovator: {
        id: 'green_innovator',
        title: '🔬 Green Innovator',
        description: 'Build 3 renewable energy projects',
        category: 'environmental',
        difficulty: 'medium',
        criteria: {
            type: 'decision_count',
            decisionTypes: ['solar_farm', 'wind_turbines', 'geothermal_plant'],
            count: 3
        },
        reward: {
            visualEffect: 'energy_pulse',
            cityElement: 'innovation_hub'
        }
    },
    early_achiever: {
        id: 'early_achiever',
        title: '🏃 Early Achiever',
        description: 'Reach 80+ in any stat by turn 5',
        category: 'leadership',
        difficulty: 'medium',
        criteria: {
            type: 'early_achievement',
            threshold: 80,
            maxTurn: 5
        },
        reward: {
            visualEffect: 'speed_lines',
            cityElement: 'time_capsule'
        }
    },
    perfect_balance: {
        id: 'perfect_balance',
        title: '🎯 Perfect Balance',
        description: 'End the game with all stats between 80-90',
        category: 'leadership',
        difficulty: 'legendary',
        criteria: {
            type: 'final_balance',
            minThreshold: 80,
            maxThreshold: 90
        },
        reward: {
            visualEffect: 'perfect_harmony',
            cityElement: 'golden_city_hall'
        }
    },
    sustainability_master: {
        id: 'sustainability_master',
        title: '🌍 Sustainability Master',
        description: 'Complete the game with Environment above 90',
        category: 'environmental',
        difficulty: 'legendary',
        criteria: {
            type: 'final_stat',
            stat: 'environment',
            threshold: 90
        },
        reward: {
            visualEffect: 'earth_blessing',
            cityElement: 'world_tree'
        }
    }
};
// Track player progress and achievements
class AchievementTracker {
    constructor() {
        this.playerProgress = new Map();
        this.unlockedAchievements = new Set();
        this.statHistory = [];
        this.decisionHistory = [];
        this.initializeProgress();
    }
    initializeProgress() {
        Object.keys(exports.ACHIEVEMENT_DEFINITIONS).forEach(achievementId => {
            const criteria = exports.ACHIEVEMENT_DEFINITIONS[achievementId].criteria;
            switch (criteria.type) {
                case 'consecutive_stat_threshold':
                    this.playerProgress.set(achievementId, { consecutiveCount: 0, maxConsecutive: 0 });
                    break;
                case 'recovery':
                    this.playerProgress.set(achievementId, {
                        inCrisis: false,
                        crisisStartTurn: -1,
                        hasRecovered: false
                    });
                    break;
                case 'decision_count':
                    this.playerProgress.set(achievementId, { count: 0, decisions: [] });
                    break;
                default:
                    this.playerProgress.set(achievementId, { progress: 0 });
            }
        });
    }
    updateProgress(gameState, lastDecision) {
        const newAchievements = [];
        // Record current state
        this.statHistory.push({
            turn: gameState.turn,
            stats: { ...gameState.stats }
        });
        if (lastDecision) {
            this.decisionHistory.push({
                turn: gameState.turn,
                decisionType: lastDecision.type || 'unknown'
            });
        }
        // Check each achievement
        Object.entries(exports.ACHIEVEMENT_DEFINITIONS).forEach(([achievementId, achievement]) => {
            if (this.unlockedAchievements.has(achievementId)) {
                return; // Already unlocked
            }
            const unlocked = this.checkAchievementCriteria(achievementId, achievement, gameState, lastDecision);
            if (unlocked) {
                this.unlockedAchievements.add(achievementId);
                newAchievements.push({
                    id: achievementId,
                    title: achievement.title,
                    description: achievement.description,
                    category: achievement.category,
                    difficulty: achievement.difficulty,
                    unlockedAt: new Date(),
                    reward: achievement.reward
                });
            }
        });
        return newAchievements;
    }
    checkAchievementCriteria(achievementId, achievement, gameState, lastDecision) {
        const { criteria } = achievement;
        const progress = this.playerProgress.get(achievementId);
        switch (criteria.type) {
            case 'stat_threshold':
                return criteria.threshold !== undefined &&
                    gameState.stats[criteria.stat] >= criteria.threshold;
            case 'consecutive_stat_threshold':
                if (criteria.threshold !== undefined &&
                    gameState.stats[criteria.stat] >= criteria.threshold) {
                    progress.consecutiveCount++;
                    progress.maxConsecutive = Math.max(progress.maxConsecutive, progress.consecutiveCount);
                }
                else {
                    progress.consecutiveCount = 0;
                }
                return progress.consecutiveCount >= (criteria.duration || 1);
            case 'all_stats_threshold':
                return criteria.threshold !== undefined &&
                    Object.values(gameState.stats).every(stat => stat >= criteria.threshold);
            case 'recovery':
                const currentLowestStat = Math.min(...Object.values(gameState.stats));
                if (criteria.fromThreshold !== undefined &&
                    !progress.inCrisis && currentLowestStat <= criteria.fromThreshold) {
                    progress.inCrisis = true;
                    progress.crisisStartTurn = gameState.turn;
                }
                if (progress.inCrisis && !progress.hasRecovered) {
                    const recoveryTime = gameState.turn - progress.crisisStartTurn;
                    if (criteria.toThreshold !== undefined && criteria.duration !== undefined &&
                        currentLowestStat >= criteria.toThreshold && recoveryTime <= criteria.duration) {
                        progress.hasRecovered = true;
                        return true;
                    }
                }
                return false;
            case 'decision_count':
                if (lastDecision && criteria.decisionTypes?.includes(lastDecision.type)) {
                    progress.count++;
                    progress.decisions.push(lastDecision.type);
                }
                return progress.count >= (criteria.count || 1);
            case 'early_achievement':
                return criteria.maxTurn !== undefined && criteria.threshold !== undefined &&
                    gameState.turn <= criteria.maxTurn &&
                    Object.values(gameState.stats).some(stat => stat >= criteria.threshold);
            case 'final_balance':
                if (gameState.gameStatus === 'ended') {
                    return criteria.minThreshold !== undefined && criteria.maxThreshold !== undefined &&
                        Object.values(gameState.stats).every(stat => stat >= criteria.minThreshold && stat <= criteria.maxThreshold);
                }
                return false;
            case 'final_stat':
                if (gameState.gameStatus === 'ended') {
                    return criteria.threshold !== undefined &&
                        gameState.stats[criteria.stat] >= criteria.threshold;
                }
                return false;
            default:
                return false;
        }
    }
    getUnlockedAchievements() {
        const unlockedList = [];
        this.unlockedAchievements.forEach(achievementId => {
            const definition = exports.ACHIEVEMENT_DEFINITIONS[achievementId];
            if (definition) {
                unlockedList.push({
                    id: achievementId,
                    title: definition.title,
                    description: definition.description,
                    category: definition.category,
                    difficulty: definition.difficulty,
                    unlockedAt: new Date(),
                    reward: definition.reward
                });
            }
        });
        return unlockedList;
    }
    getProgressSummary() {
        const summary = {};
        Object.entries(exports.ACHIEVEMENT_DEFINITIONS).forEach(([achievementId, achievement]) => {
            const progress = this.playerProgress.get(achievementId);
            const isUnlocked = this.unlockedAchievements.has(achievementId);
            summary[achievementId] = {
                ...achievement,
                isUnlocked,
                progress: this.getReadableProgress(achievementId, achievement, progress, isUnlocked)
            };
        });
        return summary;
    }
    getReadableProgress(achievementId, achievement, progress, isUnlocked) {
        if (isUnlocked)
            return "✅ Unlocked!";
        const { criteria } = achievement;
        switch (criteria.type) {
            case 'consecutive_stat_threshold':
                return `${progress.consecutiveCount}/${criteria.duration || 1} consecutive turns`;
            case 'decision_count':
                return `${progress.count}/${criteria.count || 1} decisions made`;
            case 'recovery':
                return progress.inCrisis ? "In crisis - work on recovery!" : "Waiting for crisis...";
            default:
                return "In progress...";
        }
    }
    getProgress() {
        const progressMap = {};
        this.playerProgress.forEach((progress, achievementId) => {
            const achievement = exports.ACHIEVEMENT_DEFINITIONS[achievementId];
            if (achievement) {
                // Calculate progress percentage based on criteria type
                switch (achievement.criteria.type) {
                    case 'consecutive_stat_threshold':
                        progressMap[achievementId] = Math.min(100, (progress.consecutiveCount / (achievement.criteria.duration || 1)) * 100);
                        break;
                    case 'decision_count':
                        progressMap[achievementId] = Math.min(100, (progress.count / (achievement.criteria.count || 1)) * 100);
                        break;
                    case 'stat_threshold':
                        progressMap[achievementId] = this.unlockedAchievements.has(achievementId) ? 100 : 0;
                        break;
                    default:
                        progressMap[achievementId] = progress.progress || 0;
                }
            }
        });
        return progressMap;
    }
    reset() {
        this.unlockedAchievements.clear();
        this.statHistory = [];
        this.decisionHistory = [];
        this.initializeProgress();
    }
}
exports.AchievementTracker = AchievementTracker;
// Global achievement tracker instance
exports.achievementTracker = new AchievementTracker();
