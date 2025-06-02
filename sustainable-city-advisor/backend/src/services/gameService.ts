import { GameState, GameStats, Decision, Choice, SceneElement, SceneChange, Achievement } from '../types';
import { achievementTracker } from './achievementService';
import decisionsData from '../data/decisions.json';

class GameService {
    private gameState!: GameState;
    private decisions: Decision[] = [];
    private usedDecisionIds: Set<string> = new Set();
    private lastBuildingPosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

    constructor() {
        this.initializeDecisions();
        this.gameState = this.initializeGameState();
    }

    private initializeDecisions(): void {
        this.decisions = (decisionsData as any).decisions.map((decision: any, index: number) => {
            const decisionId = `decision_${index + 1}`;
            return {
                id: decisionId,
                title: decision.question,
                description: decision.question,
                category: this.categorizeDecision(decision.question),
                choices: decision.choices.map((choice: any, choiceIndex: number) => {
                    const choiceId = `choice_${index + 1}_${choiceIndex + 1}`;
                    const impact = {
                        environment: choice.impact.environment || 0,
                        economy: choice.impact.economy || 0,
                        happiness: choice.impact.happiness || 0
                    };
                    return {
                        id: choiceId,
                        text: choice.text,
                        impact,
                        feedback: this.generateFeedback(choice.text, impact)
                    };
                })
            };
        });
    }

    private categorizeDecision(question: string): 'infrastructure' | 'economic' | 'environmental' | 'social' {
        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes('park') || lowerQuestion.includes('recycling') || lowerQuestion.includes('green')) {
            return 'environmental';
        } else if (lowerQuestion.includes('factory') || lowerQuestion.includes('economic')) {
            return 'economic';
        } else if (lowerQuestion.includes('transport') || lowerQuestion.includes('infrastructure')) {
            return 'infrastructure';
        } else {
            return 'social';
        }
    }

    private generateFeedback(choiceText: string, impact: { environment: number; economy: number; happiness: number }): string {
        const effects: string[] = [];
        if (impact.environment > 0) effects.push("improved environmental health");
        if (impact.environment < 0) effects.push("environmental concerns");
        if (impact.economy > 0) effects.push("economic growth");
        if (impact.economy < 0) effects.push("economic strain");
        if (impact.happiness > 0) effects.push("increased citizen satisfaction");
        if (impact.happiness < 0) effects.push("decreased citizen satisfaction");
        
        return effects.length > 0 ? `This choice resulted in ${effects.join(", ")}.` : "This choice had minimal impact.";
    }    private initializeGameState(): GameState {
        const initialSceneElements: SceneElement[] = [
            {
                id: 'city_hall',
                type: 'building',
                modelPath: '/models/buildings/city-hall.glb',
                position: { x: 0, y: 0, z: 0 }
            }
        ];

        return {
            stats: {
                environment: 50,
                economy: 50,
                happiness: 50
            },
            turn: 1,
            maxTurns: 15,
            gameStatus: 'active',
            sceneElements: initialSceneElements
        };
    }

    public getCurrentGameState(): GameState {
        return { ...this.gameState };
    }    public getNextDecision(): Decision | null {
        console.log('Getting next decision. Used decisions:', Array.from(this.usedDecisionIds));
        console.log('Current game status:', this.gameState.gameStatus);
        console.log('Current turn:', this.gameState.turn, 'Max turns:', this.gameState.maxTurns);
        
        // If we're at the game end, don't provide more decisions
        if (this.gameState.gameStatus === 'ended') {
            console.log('Game has ended. No more decisions available.');
            return null;
        }
        
        // Filter out used decisions
        const availableDecisions = this.decisions.filter((d) => !this.usedDecisionIds.has(d.id));
        console.log(`Available decisions: ${availableDecisions.length}, Total decisions: ${this.decisions.length}`);
        
        // If we've used all decisions, reset the used decisions set
        if (availableDecisions.length === 0) {
            console.log('No more unused decisions. Resetting used decisions tracking.');
            this.usedDecisionIds.clear();
            // Now all decisions are available again
            return this.getNextDecision();
        }

        // Select a random decision from available ones
        const randomIndex = Math.floor(Math.random() * availableDecisions.length);
        const selectedDecision = availableDecisions[randomIndex];
        
        // Validate that we have a valid decision
        if (!selectedDecision?.id || !selectedDecision?.choices?.length) {
            console.error('Invalid decision selected:', selectedDecision);
            return null;
        }
        
        console.log('Selected decision:', selectedDecision.id, selectedDecision.title);
        return selectedDecision;
    }public makeDecision(decisionId: string, choiceId: string): {
        feedback: string;
        statChanges: GameStats;
        newStats: GameStats;
        sceneChanges: SceneChange[];
        gameStatus: 'active' | 'ended';
        nextDecisionAvailable: boolean;
        achievementsUnlocked: Achievement[];
    } {
        const decision = this.decisions.find((d: Decision) => d.id === decisionId);
        if (!decision) {
            throw new Error('Decision not found');
        }

        const choice = decision.choices.find((c: Choice) => c.id === choiceId);
        if (!choice) {
            throw new Error('Choice not found');
        }

        this.usedDecisionIds.add(decisionId);

        const statChanges: GameStats = {
            environment: choice.impact.environment || 0,
            economy: choice.impact.economy || 0,
            happiness: choice.impact.happiness || 0
        };

        const previousStats = { ...this.gameState.stats };
        this.gameState.stats.environment = Math.max(0, Math.min(100, this.gameState.stats.environment + statChanges.environment));
        this.gameState.stats.economy = Math.max(0, Math.min(100, this.gameState.stats.economy + statChanges.economy));
        this.gameState.stats.happiness = Math.max(0, Math.min(100, this.gameState.stats.happiness + statChanges.happiness));

        this.gameState.turn++;        // Track achievement progress after stats update
        const achievementsUnlocked = achievementTracker.updateProgress(
            this.gameState,
            { type: decision.category, choice: choice }
        );

        const sceneChanges = this.generateSceneChanges(choice);
        
        // Add achievement visual effects to scene changes
        achievementsUnlocked.forEach(achievement => {
            if (achievement.reward?.visualEffect) {
                sceneChanges.push({
                    action: 'add',
                    element: {
                        id: `achievement_effect_${achievement.id}_${Date.now()}`,
                        type: 'effect',
                        modelPath: `/models/effects/${achievement.reward.visualEffect}.glb`,
                        position: this.getAvailableBuildingPosition('effect'),
                        scale: { x: 1.5, y: 1.5, z: 1.5 }
                    }
                });
            }
            
            if (achievement.reward?.cityElement) {
                sceneChanges.push({
                    action: 'add',
                    element: {
                        id: `achievement_building_${achievement.id}_${Date.now()}`,
                        type: 'building',
                        modelPath: `/models/buildings/${achievement.reward.cityElement}.glb`,
                        position: this.getAvailableBuildingPosition('building'),
                        scale: { x: 1.2, y: 1.2, z: 1.2 }
                    }
                });
            }
        });
        
        sceneChanges.forEach((change: SceneChange) => {
            if (change.action === 'add') {
                this.gameState.sceneElements.push(change.element);
            } else if (change.action === 'remove') {
                this.gameState.sceneElements = this.gameState.sceneElements.filter(el => el.id !== change.element.id);
            } else if (change.action === 'modify') {
                const index = this.gameState.sceneElements.findIndex(el => el.id === change.element.id);
                if (index !== -1) {
                    this.gameState.sceneElements[index] = change.element;
                }
            }
        });

        this.checkEndConditions();

        const nextDecisionAvailable = this.gameState.gameStatus === 'active' && 
                                     this.gameState.turn <= this.gameState.maxTurns && 
                                     this.usedDecisionIds.size < this.decisions.length;

        return {
            feedback: choice.feedback || 'Decision processed successfully.',
            statChanges,
            newStats: { ...this.gameState.stats },
            sceneChanges,
            gameStatus: this.gameState.gameStatus,
            nextDecisionAvailable,
            achievementsUnlocked
        };
    }
    
    public getDecisionById(decisionId: string): Decision | undefined {
        return this.decisions.find((d: Decision) => d.id === decisionId);
    }

    private generateSceneChanges(choice: Choice): SceneChange[] {
        const changes: SceneChange[] = [];
        const choiceText = choice.text.toLowerCase();
        const currentTurn = this.gameState.turn;
        const { environment, economy, happiness } = this.gameState.stats;

        // Enhanced scene generation based on choice content and game state
        if (choiceText.includes('park') || choiceText.includes('green') || choiceText.includes('garden')) {
            const parkTypes = ['community_park', 'botanical_garden', 'playground', 'dog_park'];
            const parkType = parkTypes[Math.floor(Math.random() * parkTypes.length)];
            
            // Add main park feature
            changes.push({
                action: 'add',
                element: {
                    id: `park_${parkType}_${Date.now()}`,
                    type: 'vegetation',
                    modelPath: `/models/vegetation/${parkType}.glb`,
                    position: this.getAvailableBuildingPosition('vegetation'),
                    scale: { x: 1.5, y: 1.5, z: 1.5 }
                }
            });

            // Add additional trees around parks
            for (let i = 0; i < 3; i++) {
                changes.push({
                    action: 'add',
                    element: {
                        id: `tree_${Date.now()}_${i}`,
                        type: 'vegetation',
                        modelPath: '/models/vegetation/tree.glb',
                        position: this.getAvailableBuildingPosition('vegetation'),
                        scale: { x: 0.8, y: 1.2, z: 0.8 }
                    }
                });
            }
            
            // Add decorative elements for high-scoring environment
            if (environment > 70) {
                changes.push({
                    action: 'add',
                    element: {
                        id: `fountain_${Date.now()}`,
                        type: 'infrastructure',
                        modelPath: '/models/infrastructure/fountain.glb',
                        position: this.getAvailableBuildingPosition('infrastructure'),
                        scale: { x: 1.0, y: 1.0, z: 1.0 }
                    }
                });
                
                // Add sparkle effect for high happiness and environment
                if (happiness > 70) {
                    changes.push({
                        action: 'add',
                        element: {
                            id: `sparkle_${Date.now()}`,
                            type: 'effect',
                            modelPath: '/models/effects/sparkle.glb',
                            position: this.getLastBuildingPosition(),
                            scale: { x: 1.0, y: 1.0, z: 1.0 }
                        }
                    });
                }
            }
        }

        if (choiceText.includes('factory') || choiceText.includes('industrial') || choiceText.includes('manufacturing')) {
            const factoryTypes = ['manufacturing_plant', 'chemical_factory', 'steel_mill', 'textile_factory'];
            const factoryType = factoryTypes[Math.floor(Math.random() * factoryTypes.length)];
            
            // Add main factory building
            changes.push({
                action: 'add',
                element: {
                    id: `factory_${factoryType}_${Date.now()}`,
                    type: 'building',
                    modelPath: `/models/buildings/${factoryType}.glb`,
                    position: this.getAvailableBuildingPosition('industrial'),
                    scale: { x: 2, y: 1.5, z: 2 }
                }
            });

            // Add smoke effects for factories based on environmental score
            if (environment < 70) {
                changes.push({
                    action: 'add',
                    element: {
                        id: `smoke_${Date.now()}`,
                        type: 'effect',
                        modelPath: '/models/effects/smoke_effect.glb',
                        position: this.getLastBuildingPosition(),
                        scale: { x: 1, y: 2, z: 1 }
                    }
                });
                
                // Add more intense smoke for very low environment scores
                if (environment < 40) {
                    changes.push({
                        action: 'add',
                        element: {
                            id: `heavy_smoke_${Date.now()}`,
                            type: 'effect',
                            modelPath: '/models/effects/heavy_smoke.glb',
                            position: {
                                x: this.getLastBuildingPosition().x + 5,
                                y: 0,
                                z: this.getLastBuildingPosition().z
                            },
                            scale: { x: 1.5, y: 2.5, z: 1.5 }
                        }
                    });
                }
            }
            
            // Add supporting industrial infrastructure
            changes.push({
                action: 'add',
                element: {
                    id: `storage_${Date.now()}`,
                    type: 'building',
                    modelPath: '/models/buildings/warehouse.glb',
                    position: {
                        x: this.getLastBuildingPosition().x + 10,
                        y: 0,
                        z: this.getLastBuildingPosition().z
                    },
                    scale: { x: 1.2, y: 1.0, z: 1.2 }
                }
            });
        }

        if (choiceText.includes('transport') || choiceText.includes('bus') || choiceText.includes('train') || choiceText.includes('subway')) {
            // Add main transportation hub
            changes.push({
                action: 'add',
                element: {
                    id: `transport_hub_${Date.now()}`,
                    type: 'infrastructure',
                    modelPath: '/models/infrastructure/transport_hub.glb',
                    position: this.getAvailableBuildingPosition('infrastructure'),
                    scale: { x: 1.5, y: 1, z: 2 }
                }
            });

            // Add bus/train stops around the city
            for (let i = 0; i < 3; i++) {
                const stopType = choiceText.includes('bus') ? 'bus_stop' : 'train_station';
                const position = this.getAvailableBuildingPosition('infrastructure');
                changes.push({
                    action: 'add',
                    element: {
                        id: `${stopType}_${Date.now()}_${i}`,
                        type: 'infrastructure',
                        modelPath: `/models/infrastructure/${stopType}.glb`,
                        position: position,
                        scale: { x: 0.8, y: 1, z: 0.8 }
                    }
                });
            }
            
            // Add road improvements for high economic score
            if (economy > 60) {
                changes.push({
                    action: 'add',
                    element: {
                        id: `road_improvement_${Date.now()}`,
                        type: 'infrastructure',
                        modelPath: '/models/infrastructure/improved_road.glb',
                        position: this.getAvailableBuildingPosition('infrastructure'),
                        scale: { x: 3.0, y: 0.2, z: 3.0 }
                    }
                });
            }
        }

        if (choiceText.includes('recycle') || choiceText.includes('waste') || choiceText.includes('garbage')) {
            // Add recycling center
            changes.push({
                action: 'add',
                element: {
                    id: `recycling_center_${Date.now()}`,
                    type: 'infrastructure',
                    modelPath: '/models/infrastructure/recycling_center.glb',
                    position: this.getAvailableBuildingPosition('infrastructure'),
                    scale: { x: 1.2, y: 1, z: 1.2 }
                }
            });
            
            // Add recycling bins around the city
            for (let i = 0; i < 4; i++) {
                changes.push({
                    action: 'add',
                    element: {
                        id: `recycle_bin_${Date.now()}_${i}`,
                        type: 'infrastructure',
                        modelPath: '/models/infrastructure/recycle_bin.glb',
                        position: this.getAvailableBuildingPosition('infrastructure'),
                        scale: { x: 0.5, y: 0.5, z: 0.5 }
                    }
                });
            }
            
            // Add environmental improvement effect for high scores
            if (environment > 60) {
                changes.push({
                    action: 'add',
                    element: {
                        id: `clean_effect_${Date.now()}`,
                        type: 'effect',
                        modelPath: '/models/effects/clean_air.glb',
                        position: this.getAvailableBuildingPosition('effect'),
                        scale: { x: 2.0, y: 2.0, z: 2.0 }
                    }
                });
            }
        }

        if (choiceText.includes('solar') || choiceText.includes('renewable') || choiceText.includes('wind') || choiceText.includes('energy')) {
            const renewableTypes = ['solar_farm', 'wind_turbine', 'solar_panels'];
            const renewableType = choiceText.includes('wind') ? 'wind_turbine' : 
                                 (choiceText.includes('solar') ? 'solar_panels' : 
                                 renewableTypes[Math.floor(Math.random() * renewableTypes.length)]);
            
            // Add main renewable energy source
            changes.push({
                action: 'add',
                element: {
                    id: `renewable_${renewableType}_${Date.now()}`,
                    type: 'infrastructure',
                    modelPath: `/models/infrastructure/${renewableType}.glb`,
                    position: this.getAvailableBuildingPosition('infrastructure'),
                    scale: renewableType === 'wind_turbine' 
                        ? { x: 1, y: 3, z: 1 } 
                        : { x: 2, y: 0.2, z: 2 }
                }
            });
            
            // Add multiple wind turbines for wind farms
            if (renewableType === 'wind_turbine') {
                for (let i = 0; i < 2; i++) {
                    changes.push({
                        action: 'add',
                        element: {
                            id: `wind_turbine_${Date.now()}_${i}`,
                            type: 'infrastructure',
                            modelPath: '/models/infrastructure/wind_turbine.glb',
                            position: {
                                x: this.getLastBuildingPosition().x + (i * 10),
                                y: 0,
                                z: this.getLastBuildingPosition().z + (i * 5)
                            },
                            scale: { x: 1, y: 3, z: 1 }
                        }
                    });
                }
            }
            
            // Add energy glow effect for renewable energy
            changes.push({
                action: 'add',
                element: {
                    id: `energy_glow_${Date.now()}`,
                    type: 'effect',
                    modelPath: '/models/effects/energy_glow.glb',
                    position: this.getLastBuildingPosition(),
                    scale: { x: 1.0, y: 1.0, z: 1.0 }
                }
            });
        }

        if (choiceText.includes('housing') || choiceText.includes('residential') || choiceText.includes('apartment')) {
            const housingTypes = ['apartment_complex', 'suburban_homes', 'townhouses', 'high_rise'];
            const housingType = choiceText.includes('apartment') || choiceText.includes('high') 
                ? 'high_rise'
                : housingTypes[Math.floor(Math.random() * housingTypes.length)];
            
            // Add main residential building
            changes.push({
                action: 'add',
                element: {
                    id: `housing_${housingType}_${Date.now()}`,
                    type: 'building',
                    modelPath: `/models/buildings/${housingType}.glb`,
                    position: this.getAvailableBuildingPosition('residential'),
                    scale: housingType === 'high_rise'
                        ? { x: 1, y: 4, z: 1 }
                        : { x: 1.5, y: 1, z: 1.5 }
                }
            });
            
            // Add community amenities for high happiness
            if (happiness > 60) {
                changes.push({
                    action: 'add',
                    element: {
                        id: `community_center_${Date.now()}`,
                        type: 'building',
                        modelPath: '/models/buildings/community_center.glb',
                        position: {
                            x: this.getLastBuildingPosition().x + 8,
                            y: 0,
                            z: this.getLastBuildingPosition().z
                        },
                        scale: { x: 1.2, y: 1, z: 1.2 }
                    }
                });
                
                // Add small park for residential areas
                changes.push({
                    action: 'add',
                    element: {
                        id: `residential_park_${Date.now()}`,
                        type: 'vegetation',
                        modelPath: '/models/vegetation/small_park.glb',
                        position: {
                            x: this.getLastBuildingPosition().x,
                            y: 0,
                            z: this.getLastBuildingPosition().z + 8
                        },
                        scale: { x: 1.0, y: 1.0, z: 1.0 }
                    }
                });
            }
        }

        if (choiceText.includes('school') || choiceText.includes('education') || choiceText.includes('university')) {
            const educationType = choiceText.includes('university') ? 'university' : 'school';
            
            // Add main education building
            changes.push({
                action: 'add',
                element: {
                    id: `${educationType}_${Date.now()}`,
                    type: 'building',
                    modelPath: `/models/buildings/${educationType}.glb`,
                    position: this.getAvailableBuildingPosition('building'),
                    scale: educationType === 'university'
                        ? { x: 2.5, y: 1.5, z: 2.5 }
                        : { x: 1.8, y: 1, z: 1.8 }
                }
            });
            
            // Add sports field for schools
            changes.push({
                action: 'add',
                element: {
                    id: `sports_field_${Date.now()}`,
                    type: 'infrastructure',
                    modelPath: '/models/infrastructure/sports_field.glb',
                    position: {
                        x: this.getLastBuildingPosition().x + 10,
                        y: 0,
                        z: this.getLastBuildingPosition().z
                    },
                    scale: { x: 1.5, y: 0.1, z: 1.5 }
                }
            });
            
            // Add happiness effect for education
            if (happiness > 50) {
                changes.push({
                    action: 'add',
                    element: {
                        id: `knowledge_effect_${Date.now()}`,
                        type: 'effect',
                        modelPath: '/models/effects/knowledge.glb',
                        position: this.getLastBuildingPosition(),
                        scale: { x: 1.0, y: 1.0, z: 1.0 }
                    }
                });
            }
        }

        if (choiceText.includes('hospital') || choiceText.includes('healthcare') || choiceText.includes('clinic')) {
            const facilityType = choiceText.includes('hospital') ? 'hospital' : 'clinic';
            
            // Add healthcare facility
            changes.push({
                action: 'add',
                element: {
                    id: `${facilityType}_${Date.now()}`,
                    type: 'building',
                    modelPath: `/models/buildings/${facilityType}.glb`,
                    position: this.getAvailableBuildingPosition('building'),
                    scale: facilityType === 'hospital'
                        ? { x: 2.0, y: 2.0, z: 2.0 }
                        : { x: 1.2, y: 1.0, z: 1.2 }
                }
            });
            
            // Add parking lot for healthcare facility
            changes.push({
                action: 'add',
                element: {
                    id: `parking_${Date.now()}`,
                    type: 'infrastructure',
                    modelPath: '/models/infrastructure/parking_lot.glb',
                    position: {
                        x: this.getLastBuildingPosition().x + 7,
                        y: 0,
                        z: this.getLastBuildingPosition().z
                    },
                    scale: { x: 1.5, y: 0.1, z: 1.5 }
                }
            });
            
            // Add health improvement effect
            if (happiness > 60) {
                changes.push({
                    action: 'add',
                    element: {
                        id: `health_effect_${Date.now()}`,
                        type: 'effect',
                        modelPath: '/models/effects/health.glb',
                        position: this.getLastBuildingPosition(),
                        scale: { x: 1.0, y: 1.0, z: 1.0 }
                    }
                });
            }
        }

        // Auto-generate city growth based on overall progress
        if (currentTurn % 3 === 0 && economy > 50) {
            const buildingTypes = ['office_building', 'retail_store', 'restaurant', 'cafe'];
            const buildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
            
            changes.push({
                action: 'add',
                element: {
                    id: `commercial_${buildingType}_${Date.now()}`,
                    type: 'building',
                    modelPath: `/models/buildings/${buildingType}.glb`,
                    position: this.getAvailableBuildingPosition('commercial'),
                    scale: { x: 1, y: Math.random() * 2 + 1, z: 1 }
                }
            });
        }
        
        return changes;
    }

    private getAvailableBuildingPosition(type: 'building' | 'vegetation' | 'infrastructure' | 'industrial' | 'residential' | 'commercial' | 'civic' | 'effect'): { x: number; y: number; z: number } {
        const existingElements = this.gameState.sceneElements;
        const cityRadius = 60;
        let position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }; // Initialize with default
        
        // Try to place objects in appropriate zones based on type
        let minRadius = 0;
        let maxRadius = cityRadius;
        let sectorStart = 0;
        let sectorEnd = 2 * Math.PI;
        
        switch(type) {
            case 'vegetation':
                // Place vegetation more towards the outside
                minRadius = cityRadius * 0.6;
                maxRadius = cityRadius * 0.9;
                break;
            case 'industrial':
                // Place industrial buildings in one sector
                minRadius = cityRadius * 0.4;
                maxRadius = cityRadius * 0.7;
                sectorStart = Math.PI / 4;
                sectorEnd = Math.PI * 3 / 4;
                break;
            case 'residential':
                // Place residential in another sector
                minRadius = cityRadius * 0.3;
                maxRadius = cityRadius * 0.8;
                sectorStart = Math.PI * 5 / 4;
                sectorEnd = Math.PI * 7 / 4;
                break;
            case 'commercial':
                // Commercial zones near the center
                minRadius = cityRadius * 0.2;
                maxRadius = cityRadius * 0.5;
                sectorStart = Math.PI * 3 / 4;
                sectorEnd = Math.PI * 5 / 4;
                break;
            case 'civic':
                // Civic buildings near the center
                minRadius = cityRadius * 0.1;
                maxRadius = cityRadius * 0.3;
                break;
            case 'infrastructure':
                // Infrastructure can go anywhere but with some distance from center
                minRadius = cityRadius * 0.2;
                maxRadius = cityRadius * 0.9;
                break;
            case 'building':
                // General buildings in remaining areas
                minRadius = cityRadius * 0.2;
                maxRadius = cityRadius * 0.7;
                break;
            case 'effect':
                // Effects can be placed anywhere
                minRadius = 0;
                maxRadius = cityRadius;
                break;
        }
        
        // Try to find a non-overlapping position with 10 attempts
        let attempts = 0;
        let foundPosition = false;
        
        while (!foundPosition && attempts < 10) {
            // Generate random angle and radius within the allowed zone
            const angle = sectorStart + Math.random() * (sectorEnd - sectorStart);
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            
            // Convert to cartesian coordinates
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Check for overlap with existing buildings
            const overlap = existingElements.some(el => {
                const dx = el.position.x - x;
                const dz = el.position.z - z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                // Different types need different spacing
                let minDistance = 5;
                if (type === 'vegetation' && el.type === 'vegetation') {
                    minDistance = 3;
                } else if (type === 'industrial') {
                    minDistance = 8;
                }
                
                return distance < minDistance;
            });
            
            if (!overlap) {
                position = { x, y: 0, z };
                foundPosition = true;
                this.lastBuildingPosition = position; // Update last position
            }
            
            attempts++;
        }
        
        // If no non-overlapping position found, use the last attempted position
        if (!foundPosition) {
            const angle = sectorStart + Math.random() * (sectorEnd - sectorStart);
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            position = {
                x: Math.cos(angle) * radius,
                y: 0,
                z: Math.sin(angle) * radius
            };
            this.lastBuildingPosition = position;
        }
        
        return position;
    }
    
    private getLastBuildingPosition(): { x: number; y: number; z: number } {
        return { ...this.lastBuildingPosition, y: 4 };
    }    private checkEndConditions(): void {
        const stats = this.gameState.stats;
        const { environment, economy, happiness } = stats;

        if (environment <= 10 && economy <= 10) {
            this.gameState.gameStatus = 'ended';
            this.gameState.endingType = 'failure';
            this.gameState.endingTitle = 'Economic and Environmental Collapse';
            this.gameState.endingDescription = 'Your city has fallen into complete disarray. Both the economy and environment have collapsed, leaving citizens desperate and the city uninhabitable.';        } else if (happiness <= 10) {
            this.gameState.gameStatus = 'ended';
            this.gameState.endingType = 'failure';
            this.gameState.endingTitle = 'Citizen Revolt';
            this.gameState.endingDescription = 'The people have risen up against your leadership. Despite your efforts, citizen satisfaction has plummeted to dangerous levels.';
        } else if (this.gameState.turn >= this.gameState.maxTurns) {
            const averageScore = (environment + economy + happiness) / 3;
            const unlockedAchievements = achievementTracker.getUnlockedAchievements();
            const achievementCount = unlockedAchievements.length;
            
            if (averageScore >= 80 && achievementCount >= 5) {
                this.gameState.gameStatus = 'ended';
                this.gameState.endingType = 'victory';
                this.gameState.endingTitle = 'Legendary City Leader';
                this.gameState.endingDescription = `Exceptional! You've created a truly sustainable city with an average score of ${averageScore.toFixed(1)} and unlocked ${achievementCount} achievements. Your legacy will inspire generations of city planners.`;
            } else if (averageScore >= 80) {
                this.gameState.gameStatus = 'ended';
                this.gameState.endingType = 'victory';
                this.gameState.endingTitle = 'Sustainable City Achievement';
                this.gameState.endingDescription = `Excellent work! Your city achieved sustainability with an average score of ${averageScore.toFixed(1)}. The citizens live in harmony with nature and prosperity.`;
            } else if (averageScore >= 60 && achievementCount >= 3) {
                this.gameState.gameStatus = 'ended';
                this.gameState.endingType = 'victory';
                this.gameState.endingTitle = 'Accomplished Leader';
                this.gameState.endingDescription = `Good progress! With an average score of ${averageScore.toFixed(1)} and ${achievementCount} achievements, you've shown real leadership potential.`;
            } else if (averageScore >= 60) {
                this.gameState.gameStatus = 'ended';
                this.gameState.endingType = 'victory';
                this.gameState.endingTitle = 'Decent Progress';
                this.gameState.endingDescription = `Your city shows promise with an average score of ${averageScore.toFixed(1)}. With more experience, you could become a great leader.`;
            } else {
                this.gameState.gameStatus = 'ended';
                this.gameState.endingType = 'failure';
                this.gameState.endingTitle = 'Mediocre Leadership';
                this.gameState.endingDescription = `Your leadership resulted in an average score of ${averageScore.toFixed(1)}. The city survived, but citizens expected more from their leader.`;
            }
        }
    }

    public getAchievements(): { unlocked: Achievement[]; progress: Record<string, number> } {
        return {
            unlocked: achievementTracker.getUnlockedAchievements(),
            progress: achievementTracker.getProgress()
        };
    }

    public resetGame(): GameState {
        this.usedDecisionIds.clear();
        achievementTracker.reset();
        this.gameState = this.initializeGameState();
        return this.getCurrentGameState();
    }
}

// Create a singleton instance
const gameServiceInstance = new GameService();

// Export the singleton
export default gameServiceInstance;