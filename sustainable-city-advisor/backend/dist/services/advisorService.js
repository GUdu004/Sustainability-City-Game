"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdvisorMessage = exports.generateAdvisorMessage = void 0;
const geminiService_1 = require("./geminiService");
const generateAdvisorMessage = async (gameState, context = 'current_state', currentDecision) => {
    const { environment, economy, happiness } = gameState.stats;
    // Get recommended personality based on game state
    const recommendedPersonality = (0, geminiService_1.getRecommendedPersonality)(gameState);
    // Determine priority area (lowest scoring stat)
    let priority;
    if (environment <= economy && environment <= happiness) {
        priority = 'environment';
    }
    else if (economy <= happiness) {
        priority = 'economy';
    }
    else {
        priority = 'happiness';
    }
    // Try to get AI-enhanced advice first
    try {
        const geminiContext = context === 'current_state' ? 'general' : context;
        const aiAdvice = await (0, geminiService_1.fetchGeminiAdvice)(gameState, recommendedPersonality, currentDecision, geminiContext);
        if (aiAdvice) {
            return {
                message: aiAdvice,
                personality: mapToLegacyPersonality(recommendedPersonality),
                priority,
                context
            };
        }
    }
    catch (error) {
        console.error('AI advisor failed, falling back to rule-based:', error);
    }
    // Fallback to enhanced rule-based advisor
    const ruleBasedPersonality = getRuleBasedPersonality(gameState);
    const message = generateRuleBasedMessage(gameState.stats, priority, ruleBasedPersonality, context);
    return {
        message,
        personality: ruleBasedPersonality,
        priority,
        context
    };
};
exports.generateAdvisorMessage = generateAdvisorMessage;
function mapToLegacyPersonality(modernPersonality) {
    switch (modernPersonality) {
        case 'analytical':
        case 'pragmatic':
            return 'concerned';
        case 'creative':
            return 'encouraging';
        case 'optimistic':
        default:
            return 'optimistic';
    }
}
function getRuleBasedPersonality(gameState) {
    const { environment, economy, happiness } = gameState.stats;
    const averageScore = (environment + economy + happiness) / 3;
    if (averageScore >= 70) {
        return 'optimistic';
    }
    else if (averageScore >= 50) {
        return 'encouraging';
    }
    else if (averageScore >= 30) {
        return 'concerned';
    }
    else {
        return 'sarcastic';
    }
}
function generateRuleBasedMessage(stats, priority, personality, context) {
    switch (personality) {
        case 'optimistic':
            return generateOptimisticMessage(stats, priority);
        case 'encouraging':
            return generateEncouragingMessage(stats, priority);
        case 'concerned':
            return generateConcernedMessage(stats, priority);
        case 'sarcastic':
            return generateSarcasticMessage(stats, priority);
        default:
            return generateEncouragingMessage(stats, priority);
    }
}
function generateOptimisticMessage(stats, priority) {
    const messages = [
        "Excellent work! Your city is thriving across all sectors!",
        "The citizens are lucky to have such a capable leader!",
        "Your balanced approach is creating a truly sustainable city!",
        "Outstanding progress! Keep up this exemplary leadership!"
    ];
    if (priority === 'environment' && stats.environment < 60) {
        return "Great job overall! A little more focus on environmental issues and your city will be perfect!";
    }
    else if (priority === 'economy' && stats.economy < 60) {
        return "Wonderful progress! Just a bit more economic development will complete your vision!";
    }
    else if (priority === 'happiness' && stats.happiness < 60) {
        return "Impressive leadership! Your citizens would love just a few more quality of life improvements!";
    }
    return messages[Math.floor(Math.random() * messages.length)];
}
function generateEncouragingMessage(stats, priority) {
    const specificAdvice = {
        environment: "You're making good progress! Consider investing in more green initiatives to boost environmental health.",
        economy: "Solid foundation! Some strategic economic investments could really accelerate growth.",
        happiness: "Good work so far! Your citizens would appreciate more community-focused improvements."
    };
    if (priority && specificAdvice[priority]) {
        return `You're on the right track! ${specificAdvice[priority]} Keep making thoughtful decisions!`;
    }
    return "You're doing well! Keep focusing on balanced development for the best results.";
}
function generateConcernedMessage(stats, priority) {
    const concerns = {
        environment: "I'm worried about the environmental impact of recent decisions. We need immediate action!",
        economy: "The economic situation is becoming precarious. We need to focus on sustainable growth.",
        happiness: "Citizen satisfaction is dropping. We must address their concerns before it's too late!"
    };
    if (priority && concerns[priority]) {
        return `${concerns[priority]} Time for decisive action.`;
    }
    return "Several areas need attention. We must act quickly to prevent further decline.";
}
function generateSarcasticMessage(stats, priority) {
    const sarcasticComments = [
        "Well, this is going swimmingly... said no one ever.",
        "I've seen better leadership from a magic 8-ball.",
        "Are we trying to set records for creative ways to run a city into the ground?",
        "I'd offer advice, but I'm not sure it would help at this point."
    ];
    if (priority === 'environment' && stats.environment < 20) {
        return "Congratulations! You've managed to create an environmental disaster. Maybe try the opposite of what you've been doing?";
    }
    else if (priority === 'economy' && stats.economy < 20) {
        return "The economy is in shambles. Perhaps we could try decisions that don't involve setting money on fire?";
    }
    else if (priority === 'happiness' && stats.happiness < 20) {
        return "The citizens are practically revolting. Have you considered actually listening to their needs?";
    }
    return sarcasticComments[Math.floor(Math.random() * sarcasticComments.length)];
}
// Export for compatibility with existing code
exports.getAdvisorMessage = exports.generateAdvisorMessage;
