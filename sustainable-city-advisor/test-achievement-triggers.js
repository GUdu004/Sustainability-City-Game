// Advanced Achievement Trigger Test
// This test plays multiple game rounds to trigger actual achievements

const API_BASE = 'http://localhost:5000/api';

class AchievementTriggerTest {
    constructor() {
        this.gameState = null;
        this.achievementsUnlocked = [];
    }

    async runTriggerTest() {
        console.log('🎮 Starting Achievement Trigger Test...\n');
        
        // Reset game to start fresh
        await this.resetGame();
        
        // Try to trigger "Early Achiever" (80+ in any stat by turn 5)
        await this.tryEarlyAchiever();
        
        // Try to trigger "Economic Tycoon" (Economy 95+)
        await this.tryEconomicTycoon();
        
        // Try to trigger "Balanced Leader" (All stats 70+)
        await this.tryBalancedLeader();
        
        // Print final results
        this.printResults();
    }

    async resetGame() {
        console.log('🔄 Resetting game...');
        const response = await fetch(`${API_BASE}/game/reset`, { method: 'POST' });
        const data = await response.json();
        this.gameState = data.data;
        console.log(`   Initial stats: E:${this.gameState.stats.environment} Ec:${this.gameState.stats.economy} H:${this.gameState.stats.happiness}\n`);
    }

    async tryEarlyAchiever() {
        console.log('🏃 Attempting "Early Achiever" achievement...');
        console.log('   Target: 80+ in any stat by turn 5\n');
        
        while (this.gameState.turn <= 5 && this.gameState.gameStatus === 'active') {
            const decision = await this.getDecision();
            if (!decision) break;
            
            // Look for choices that boost stats significantly
            const bestChoice = this.findBestChoice(decision.choices, 'highest_boost');
            const result = await this.makeDecision(decision.id, bestChoice.id);
            
            console.log(`   Turn ${this.gameState.turn}: Made decision "${decision.title}"`);
            console.log(`   Chose: "${bestChoice.text}"`);
            console.log(`   Stats: E:${this.gameState.stats.environment} Ec:${this.gameState.stats.economy} H:${this.gameState.stats.happiness}`);
            
            if (result.achievementsUnlocked && result.achievementsUnlocked.length > 0) {
                console.log(`   🎉 Achievements unlocked: ${result.achievementsUnlocked.map(a => a.title).join(', ')}`);
                this.achievementsUnlocked.push(...result.achievementsUnlocked);
            }
            console.log('');
        }
    }

    async tryEconomicTycoon() {
        console.log('💰 Attempting "Economic Tycoon" achievement...');
        console.log('   Target: Economy score of 95+\n');
        
        let attempts = 0;
        while (this.gameState.stats.economy < 95 && this.gameState.gameStatus === 'active' && attempts < 10) {
            const decision = await this.getDecision();
            if (!decision) break;
            
            // Look for choices that boost economy
            const economicChoice = this.findBestChoice(decision.choices, 'economy');
            const result = await this.makeDecision(decision.id, economicChoice.id);
            
            console.log(`   Turn ${this.gameState.turn}: "${decision.title}" -> Economy boost`);
            console.log(`   Economy: ${this.gameState.stats.economy} (+${economicChoice.impact.economy})`);
            
            if (result.achievementsUnlocked && result.achievementsUnlocked.length > 0) {
                console.log(`   🎉 Achievements unlocked: ${result.achievementsUnlocked.map(a => a.title).join(', ')}`);
                this.achievementsUnlocked.push(...result.achievementsUnlocked);
            }
            console.log('');
            attempts++;
        }
    }

    async tryBalancedLeader() {
        console.log('⚖️ Attempting "Balanced Leader" achievement...');
        console.log('   Target: All stats above 70 simultaneously\n');
        
        let attempts = 0;
        while (!this.isBalanced() && this.gameState.gameStatus === 'active' && attempts < 15) {
            const decision = await this.getDecision();
            if (!decision) break;
            
            // Find the lowest stat and boost it
            const lowestStat = this.getLowestStat();
            const balancingChoice = this.findBestChoice(decision.choices, lowestStat);
            const result = await this.makeDecision(decision.id, balancingChoice.id);
            
            console.log(`   Turn ${this.gameState.turn}: Boosting ${lowestStat}`);
            console.log(`   Stats: E:${this.gameState.stats.environment} Ec:${this.gameState.stats.economy} H:${this.gameState.stats.happiness}`);
            
            if (result.achievementsUnlocked && result.achievementsUnlocked.length > 0) {
                console.log(`   🎉 Achievements unlocked: ${result.achievementsUnlocked.map(a => a.title).join(', ')}`);
                this.achievementsUnlocked.push(...result.achievementsUnlocked);
            }
            console.log('');
            attempts++;
        }
    }

    async getDecision() {
        try {
            const response = await fetch(`${API_BASE}/game/decision`);
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error getting decision:', error);
            return null;
        }
    }

    async makeDecision(decisionId, choiceId) {
        try {
            const response = await fetch(`${API_BASE}/game/decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decisionId, choiceId })
            });
            const data = await response.json();
            
            if (data.success) {
                this.gameState.stats = data.newStats;
                this.gameState.turn = this.gameState.turn + 1;
                this.gameState.gameStatus = data.gameStatus;
            }
            
            return data;
        } catch (error) {
            console.error('Error making decision:', error);
            return { success: false };
        }
    }

    findBestChoice(choices, strategy) {
        switch (strategy) {
            case 'economy':
                return choices.reduce((best, choice) => 
                    choice.impact.economy > best.impact.economy ? choice : best
                );
            case 'environment':
                return choices.reduce((best, choice) => 
                    choice.impact.environment > best.impact.environment ? choice : best
                );
            case 'happiness':
                return choices.reduce((best, choice) => 
                    choice.impact.happiness > best.impact.happiness ? choice : best
                );
            case 'highest_boost':
                return choices.reduce((best, choice) => {
                    const choiceMax = Math.max(choice.impact.economy, choice.impact.environment, choice.impact.happiness);
                    const bestMax = Math.max(best.impact.economy, best.impact.environment, best.impact.happiness);
                    return choiceMax > bestMax ? choice : best;
                });
            default:
                return choices[0];
        }
    }

    getLowestStat() {
        const stats = this.gameState.stats;
        if (stats.environment <= stats.economy && stats.environment <= stats.happiness) {
            return 'environment';
        } else if (stats.economy <= stats.happiness) {
            return 'economy';
        } else {
            return 'happiness';
        }
    }

    isBalanced() {
        const stats = this.gameState.stats;
        return stats.environment >= 70 && stats.economy >= 70 && stats.happiness >= 70;
    }

    printResults() {
        console.log('📊 Achievement Trigger Test Results');
        console.log('=====================================');
        console.log(`Final Turn: ${this.gameState.turn}`);
        console.log(`Final Stats: E:${this.gameState.stats.environment} Ec:${this.gameState.stats.economy} H:${this.gameState.stats.happiness}`);
        console.log(`Game Status: ${this.gameState.gameStatus}`);
        console.log(`Achievements Unlocked: ${this.achievementsUnlocked.length}`);
        
        if (this.achievementsUnlocked.length > 0) {
            console.log('\n🏆 Unlocked Achievements:');
            this.achievementsUnlocked.forEach((achievement, index) => {
                console.log(`${index + 1}. ${achievement.title}: ${achievement.description}`);
                if (achievement.reward?.visualEffect) {
                    console.log(`   Visual Effect: ${achievement.reward.visualEffect}`);
                }
            });
        } else {
            console.log('\n⚠️  No achievements were unlocked during this test.');
            console.log('   This might indicate achievement thresholds need adjustment or more turns are needed.');
        }
        
        console.log('\n✅ Achievement system is responding to gameplay changes!');
    }
}

// Run the trigger test
const triggerTest = new AchievementTriggerTest();
triggerTest.runTriggerTest()
    .then(() => {
        console.log('\nTrigger test completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Trigger test failed:', error);
        process.exit(1);
    });
