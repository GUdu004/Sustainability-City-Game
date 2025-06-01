import { GameState, AdvisorMessage } from '../types';
import { fetchGeminiAdvice } from './geminiService';

export const generateAdvisorMessage = async (gameState: GameState, context: 'current_state' | 'decision_specific' = 'current_state'): Promise<AdvisorMessage> => {
    const { environment, economy, happiness } = gameState.stats;
    
    // Determine the advisor's personality based on overall performance
    const averageScore = (environment + economy + happiness) / 3;
    let personality: 'optimistic' | 'concerned' | 'sarcastic' | 'encouraging';
    let priority: 'environment' | 'economy' | 'happiness' | undefined;
    
    // Determine personality
    if (averageScore >= 70) {
        personality = 'optimistic';
    } else if (averageScore >= 50) {
        personality = 'encouraging';
    } else if (averageScore >= 30) {
        personality = 'concerned';
    } else {
        personality = 'sarcastic';
    }
    
    // Determine priority area (lowest scoring stat)
    if (environment <= economy && environment <= happiness) {
        priority = 'environment';
    } else if (economy <= happiness) {
        priority = 'economy';
    } else {
        priority = 'happiness';
    }
    
    // Generate message based on game state
    let message = '';
    
    switch (personality) {
        case 'optimistic':
            message = generateOptimisticMessage(gameState.stats, priority);
            break;
        case 'encouraging':
            message = generateEncouragingMessage(gameState.stats, priority);
            break;
        case 'concerned':
            message = generateConcernedMessage(gameState.stats, priority);
            break;
        case 'sarcastic':
            message = generateSarcasticMessage(gameState.stats, priority);
            break;
    }
    
    // Try to get AI-enhanced advice (fallback to rule-based if AI fails)
    try {
        const geminiAdvice = await fetchGeminiAdvice(gameState);
        if (geminiAdvice) {
            message += `\n\n${geminiAdvice}`;
        }
    } catch (error) {
        console.warn('Failed to get Gemini advice, using rule-based message only');
    }
    
    return {
        message,
        personality,
        priority,
        context
    };
};

function generateOptimisticMessage(stats: { environment: number; economy: number; happiness: number }, priority: string): string {
    const messages = [
        "Excellent work! Your city is thriving across all sectors!",
        "The citizens are lucky to have such a capable leader!",
        "Your balanced approach is creating a truly sustainable city!",
        "Outstanding progress! Keep up this exemplary leadership!"
    ];
    
    if (priority === 'environment' && stats.environment < 60) {
        return "Great job overall! A little more focus on environmental issues and your city will be perfect!";
    } else if (priority === 'economy' && stats.economy < 60) {
        return "Wonderful progress! Just a bit more economic development will complete your vision!";
    } else if (priority === 'happiness' && stats.happiness < 60) {
        return "Impressive leadership! Your citizens would love just a few more quality of life improvements!";
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
}

function generateEncouragingMessage(stats: { environment: number; economy: number; happiness: number }, priority: string): string {
    const specificAdvice = {
        environment: "You're making good progress! Consider investing in more green initiatives to boost environmental health.",
        economy: "Solid foundation! Some strategic economic investments could really accelerate growth.",
        happiness: "Good work so far! Your citizens would appreciate more community-focused improvements."
    };
    
    return `You're on the right track! ${specificAdvice[priority as keyof typeof specificAdvice]} Keep making thoughtful decisions!`;
}

function generateConcernedMessage(stats: { environment: number; economy: number; happiness: number }, priority: string): string {
    const concerns = {
        environment: "I'm worried about the environmental impact of recent decisions. We need immediate action!",
        economy: "The economic situation is becoming precarious. We need to focus on sustainable growth.",
        happiness: "Citizen satisfaction is dropping. We must address their concerns before it's too late!"
    };
    
    return `${concerns[priority as keyof typeof concerns]} Time for decisive action.`;
}

function generateSarcasticMessage(stats: { environment: number; economy: number; happiness: number }, priority: string): string {
    const sarcasticComments = [
        "Well, this is going swimmingly... said no one ever.",
        "I've seen better leadership from a magic 8-ball.",
        "Are we trying to set records for creative ways to run a city into the ground?",
        "I'd offer advice, but I'm not sure it would help at this point."
    ];
    
    if (priority === 'environment' && stats.environment < 20) {
        return "Congratulations! You've managed to create an environmental disaster. Maybe try the opposite of what you've been doing?";
    } else if (priority === 'economy' && stats.economy < 20) {
        return "The economy is in shambles. Perhaps we could try decisions that don't involve setting money on fire?";
    } else if (priority === 'happiness' && stats.happiness < 20) {
        return "The citizens are practically revolting. Have you considered actually listening to their needs?";
    }
    
    return sarcasticComments[Math.floor(Math.random() * sarcasticComments.length)];
}

// Export for compatibility with existing code
export const getAdvisorMessage = generateAdvisorMessage;