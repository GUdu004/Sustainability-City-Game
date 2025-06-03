// Simple integration test script to verify all API endpoints are working

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
    console.log('🧪 Testing Sustainable City Advisor API Integration...\n');

    // Test 1: Get initial game state
    console.log('1. Testing GET /api/game/state...');
    try {
        const response = await fetch(`${BASE_URL}/game/state`);
        const gameState = await response.json();
        console.log('✅ Game state retrieved successfully');
        console.log(`   Stats: Environment ${gameState.data.stats.environment}, Economy ${gameState.data.stats.economy}, Happiness ${gameState.data.stats.happiness}`);
        console.log(`   Turn: ${gameState.data.turn}/${gameState.data.maxTurns}`);
    } catch (error) {
        console.log('❌ Game state test failed:', error.message);
        return;
    }

    // Test 2: Get next decision
    console.log('\n2. Testing GET /api/game/decision...');
    let decisionId, choiceId;
    try {
        const response = await fetch(`${BASE_URL}/game/decision`);
        const decisionData = await response.json();
        console.log('✅ Decision retrieved successfully');
        console.log(`   Decision: ${decisionData.data.title}`);
        console.log(`   Category: ${decisionData.data.category}`);
        console.log(`   Choices: ${decisionData.data.choices.length}`);
        
        // Store for next test
        decisionId = decisionData.data.id;
        choiceId = decisionData.data.choices[0].id;
    } catch (error) {
        console.log('❌ Decision test failed:', error.message);
        return;
    }

    // Test 3: Get advisor message
    console.log('\n3. Testing GET /api/advisor...');
    try {
        const response = await fetch(`${BASE_URL}/advisor`);
        const advisorData = await response.json();
        console.log('✅ Advisor message retrieved successfully');
        console.log(`   Message: ${advisorData.data.message.substring(0, 50)}...`);
        console.log(`   Personality: ${advisorData.data.personality}`);
        console.log(`   Priority: ${advisorData.data.priority || 'none'}`);
    } catch (error) {
        console.log('❌ Advisor test failed:', error.message);
        return;
    }

    // Test 4: Make a decision
    console.log('\n4. Testing POST /api/game/decision...');
    try {
        const response = await fetch(`${BASE_URL}/game/decision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                decisionId: decisionId,
                choiceId: choiceId
            })
        });
        const result = await response.json();
        console.log('✅ Decision processed successfully');
        console.log(`   Feedback: ${result.feedback}`);
        console.log(`   Stat Changes: Environment ${result.statChanges.environment > 0 ? '+' : ''}${result.statChanges.environment}, Economy ${result.statChanges.economy > 0 ? '+' : ''}${result.statChanges.economy}, Happiness ${result.statChanges.happiness > 0 ? '+' : ''}${result.statChanges.happiness}`);
        console.log(`   New Stats: Environment ${result.newStats.environment}, Economy ${result.newStats.economy}, Happiness ${result.newStats.happiness}`);
        console.log(`   Game Status: ${result.gameStatus}`);
        console.log(`   Next Decision Available: ${result.nextDecisionAvailable}`);
    } catch (error) {
        console.log('❌ Make decision test failed:', error.message);
        return;
    }

    // Test 5: Reset game
    console.log('\n5. Testing POST /api/game/reset...');
    try {
        const response = await fetch(`${BASE_URL}/game/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const gameState = await response.json();
        console.log('✅ Game reset successfully');
        console.log(`   Reset Stats: Environment ${gameState.data.stats.environment}, Economy ${gameState.data.stats.economy}, Happiness ${gameState.data.stats.happiness}`);
        console.log(`   Reset Turn: ${gameState.data.turn}/${gameState.data.maxTurns}`);
    } catch (error) {
        console.log('❌ Reset game test failed:', error.message);
        return;
    }

    console.log('\n🎉 All API tests passed! The backend is fully functional and ready for integration with the frontend.');
}

// Run the tests
testAPI().catch(error => {
    console.error('Test runner failed:', error);
});
