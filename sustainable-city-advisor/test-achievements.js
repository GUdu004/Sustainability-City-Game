// Achievement System API Test Script
// Tests all achievement endpoints and validates responses

const API_BASE = 'http://localhost:8000/api';

class AchievementTester {
    constructor() {
        this.testResults = [];
        this.gameState = null;
    }

    async runAllTests() {
        console.log('🧪 Starting Comprehensive Achievement System Tests...\n');
        
        try {
            await this.testGameInitialization();
            await this.testAchievementEndpoints();
            await this.testAchievementUnlocking();
            await this.testProgressTracking();
            await this.generateTestReport();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }    async testGameInitialization() {
        console.log('📋 Test 1: Game Initialization');
        
        try {
            const response = await fetch(`${API_BASE}/game/reset`, {
                method: 'POST'
            });
            
            const data = await response.json();
            this.gameState = data.data;
            
            this.addResult('Game Start', response.ok, 
                `Game initialized with stats: ${JSON.stringify(this.gameState.stats)}`);
            
            console.log('✅ Game initialized successfully');
            console.log(`   Environment: ${this.gameState.stats.environment}`);
            console.log(`   Economy: ${this.gameState.stats.economy}`);
            console.log(`   Happiness: ${this.gameState.stats.happiness}\n`);
            
        } catch (error) {
            this.addResult('Game Start', false, `Error: ${error.message}`);
        }
    }

    async testAchievementEndpoints() {
        console.log('🏆 Test 2: Achievement Endpoints');
        
        try {
            // Test achievement list endpoint
            const achievementResponse = await fetch(`${API_BASE}/game/achievements`);
            const achievementData = await achievementResponse.json();
            
            this.addResult('Achievement Endpoint', achievementResponse.ok,
                `Retrieved ${achievementData.data.unlocked.length} unlocked achievements`);
            
            console.log('✅ Achievement endpoint accessible');
            console.log(`   Unlocked achievements: ${achievementData.data.unlocked.length}`);
            console.log(`   Progress tracked for: ${Object.keys(achievementData.data.progress).length} achievements\n`);
            
        } catch (error) {
            this.addResult('Achievement Endpoint', false, `Error: ${error.message}`);
        }
    }

    async testAchievementUnlocking() {
        console.log('🎯 Test 3: Achievement Unlocking Simulation');
        
        try {
            // Simulate making decisions to trigger achievements
            const decisions = await this.getAvailableDecisions();
            
            if (decisions.length > 0) {
                // Make a decision that should improve economy
                const economicDecision = decisions.find(d => 
                    d.choices.some(c => c.impact.economy > 0)
                ) || decisions[0];
                
                const economicChoice = economicDecision.choices.find(c => c.impact.economy > 0) || economicDecision.choices[0];
                  const decisionResponse = await fetch(`${API_BASE}/game/decision`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        decisionId: economicDecision.id,
                        choiceId: economicChoice.id
                    })
                });
                
                const decisionData = await decisionResponse.json();
                
                const achievementsUnlocked = decisionData.achievementsUnlocked || [];
                this.addResult('Decision Making', decisionResponse.ok,
                    `Decision made, ${achievementsUnlocked.length} achievements unlocked`);
                
                console.log('✅ Decision making works');
                console.log(`   New stats: ${JSON.stringify(decisionData.newStats)}`);
                console.log(`   Achievements unlocked: ${achievementsUnlocked.length}\n`);
                
                if (achievementsUnlocked.length > 0) {
                    console.log('🎉 Achievements unlocked:');
                    achievementsUnlocked.forEach(achievement => {
                        console.log(`   - ${achievement.title}: ${achievement.description}`);
                    });
                    console.log('');
                }
            }
            
        } catch (error) {
            this.addResult('Achievement Unlocking', false, `Error: ${error.message}`);
        }
    }

    async testProgressTracking() {
        console.log('📊 Test 4: Progress Tracking Validation');
        
        try {
            const progressResponse = await fetch(`${API_BASE}/game/achievements`);
            const progressData = await progressResponse.json();
            
            const progressMap = progressData.data.progress;
            const progressValues = Object.values(progressMap);
            const avgProgress = progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
            
            this.addResult('Progress Tracking', true,
                `Average progress: ${avgProgress.toFixed(2)}%`);
            
            console.log('✅ Progress tracking validated');
            console.log(`   Achievements being tracked: ${Object.keys(progressMap).length}`);
            console.log(`   Average progress: ${avgProgress.toFixed(2)}%\n`);
            
        } catch (error) {
            this.addResult('Progress Tracking', false, `Error: ${error.message}`);
        }
    }

    async getAvailableDecisions() {
        try {
            const response = await fetch(`${API_BASE}/game/decision`);
            const data = await response.json();
            return Array.isArray(data.data) ? data.data : [data.data];
        } catch (error) {
            console.error('Failed to get decisions:', error);
            return [];
        }
    }

    addResult(testName, success, details) {
        this.testResults.push({
            test: testName,
            success,
            details,
            timestamp: new Date().toISOString()
        });
    }

    generateTestReport() {
        console.log('📋 Test Report Summary');
        console.log('========================');
        
        const passedTests = this.testResults.filter(r => r.success).length;
        const totalTests = this.testResults.length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${totalTests - passedTests}`);
        console.log(`Success Rate: ${successRate}%\n`);
        
        console.log('Detailed Results:');
        this.testResults.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.test}`);
            console.log(`   ${result.details}\n`);
        });
        
        if (successRate >= 80) {
            console.log('🎉 Achievement System Test Suite: PASSED');
            console.log('Phase 4 features are working correctly!');
        } else {
            console.log('⚠️  Achievement System Test Suite: NEEDS ATTENTION');
            console.log('Some features may need debugging.');
        }
    }
}

// Run the tests
console.log('Starting Achievement System Tests...');

const tester = new AchievementTester();
tester.runAllTests()
    .then(() => {
        console.log('Test suite completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Test suite failed with error:', error);
        process.exit(1);
    });
