import { GameState, AdvisorMessage } from '../types';
import { fetchGeminiAdvice, getRecommendedPersonality, ADVISOR_PERSONALITIES } from './geminiService';

export const generateAdvisorMessage = async (
    gameState: GameState, 
    context: 'current_state' | 'decision_specific' = 'current_state',
    currentDecision?: any
): Promise<AdvisorMessage> => {
    const { environment, economy, happiness } = gameState.stats;
    
    // Get recommended personality based on game state
    const recommendedPersonality = getRecommendedPersonality(gameState);
    
    // Determine priority area (lowest scoring stat)
    let priority: 'environment' | 'economy' | 'happiness' | undefined;
    if (environment <= economy && environment <= happiness) {
        priority = 'environment';
    } else if (economy <= happiness) {
        priority = 'economy';
    } else {
        priority = 'happiness';
    }

    // Determine if we're in a crisis state
    const isCrisis = environment < 30 || economy < 30 || happiness < 30;
    const isNearEnd = gameState.turn >= gameState.maxTurns - 5;
    
    // Get the appropriate Gemini context
    const geminiContext = isCrisis ? 'crisis' : 
                         isNearEnd ? 'endgame' : 
                         context === 'current_state' ? 'general' : 'decision_specific';
    
    try {
        // Try to get AI-enhanced advice
        const aiAdvice = await fetchGeminiAdvice(
            gameState, 
            recommendedPersonality,
            currentDecision,
            geminiContext
        );
        
        if (aiAdvice) {
            return {
                message: aiAdvice,
                personality: mapLegacyPersonality(recommendedPersonality),
                priority,
                context
            };
        }
    } catch (error) {
        console.error('AI advisor failed, falling back to rule-based:', error);
    }
    
    console.log('Using rule-based advisor fallback');
    // Fallback to rule-based advisor if AI fails
    return generateRuleBasedAdvice(gameState, priority, context);
};

// Helper function to generate rule-based advice as fallback
function generateRuleBasedAdvice(
    gameState: GameState,
    priority?: 'environment' | 'economy' | 'happiness',
    context: 'current_state' | 'decision_specific' = 'current_state'
): AdvisorMessage {
    const { environment, economy, happiness } = gameState.stats;
    const averageScore = (environment + economy + happiness) / 3;

    let message = '';
    let personality: 'optimistic' | 'concerned' | 'sarcastic' | 'encouraging' = 'concerned';

    if (averageScore >= 80) {
        personality = 'optimistic';
        message = "Excellent work! Your city is thriving in all areas. Keep maintaining this delicate balance.";
    } else if (averageScore >= 60) {
        personality = 'encouraging';
        message = "Good progress! There's still room for improvement, but we're on the right track.";
    } else if (averageScore >= 40) {
        personality = 'concerned';
        message = "We need to be careful. Some areas of the city require attention.";
    } else {
        personality = 'sarcastic';
        message = "Well, this is quite a challenge we've got ourselves into. Time for some bold moves!";
    }

    if (priority) {
        message += ` Focus on improving our ${priority} score, as it's our weakest point.`;
    }

    return {
        message,
        personality,
        priority,
        context
    };
}

// Map new personality types to legacy types
function mapLegacyPersonality(personality: string): 'optimistic' | 'concerned' | 'sarcastic' | 'encouraging' {
    switch (personality) {
        case 'optimistic':
            return 'optimistic';
        case 'pragmatic':
            return 'concerned';
        case 'analytical':
            return 'concerned';
        case 'creative':
            return 'encouraging';
        default:
            return 'concerned';
    }
}

// Export for compatibility with existing code
export const getAdvisorMessage = generateAdvisorMessage;