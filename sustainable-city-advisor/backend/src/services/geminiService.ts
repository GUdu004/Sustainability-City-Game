import { GoogleGenerativeAI } from '@google/generative-ai';
import { GameState, Decision } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Only initialize the API client if we have a valid key
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;

// Advanced AI Advisor Personalities
export interface AdvisorPersonality {
    name: string;
    tone: string;
    specialization: string;
    promptStyle: string;
}

export const ADVISOR_PERSONALITIES: Record<string, AdvisorPersonality> = {
    optimistic: {
        name: 'Dr. Green Hope',
        tone: 'upbeat, encouraging, and solution-focused',
        specialization: 'sustainable innovation and positive change',
        promptStyle: 'Frame advice positively, emphasize opportunities, and celebrate progress'
    },
    analytical: {
        name: 'Prof. Data Quinn',
        tone: 'analytical, data-driven, and methodical',
        specialization: 'urban planning and statistical analysis',
        promptStyle: 'Provide specific numbers, trade-offs, and evidence-based recommendations'
    },
    creative: {
        name: 'Maya Visionary',
        tone: 'creative, innovative, and inspiring',
        specialization: 'creative solutions and out-of-the-box thinking',
        promptStyle: 'Suggest creative alternatives, think outside conventional solutions'
    },
    pragmatic: {
        name: 'Chief Realist',
        tone: 'practical, direct, and no-nonsense',
        specialization: 'practical implementation and budget constraints',
        promptStyle: 'Focus on feasible solutions, budget implications, and realistic timelines'
    }
};

const constructAdvicePrompt = (
    gameState: GameState,
    personality: AdvisorPersonality,
    currentDecision?: Decision,
    context: 'general' | 'decision_specific' | 'crisis' | 'endgame' = 'general'
): string => {
    const { environment, economy, happiness } = gameState.stats;
    
    let prompt = `You are ${personality.name}, an AI city planning advisor with expertise in ${personality.specialization}. 
Your communication style is ${personality.tone}.

Current City Stats:
- Environment: ${environment}/100 ${environment < 40 ? '(Critical!)' : environment < 60 ? '(Concerning)' : '(Good)'}
- Economy: ${economy}/100 ${economy < 40 ? '(Critical!)' : economy < 60 ? '(Concerning)' : '(Good)'}
- Happiness: ${happiness}/100 ${happiness < 40 ? '(Critical!)' : happiness < 60 ? '(Concerning)' : '(Good)'}

Turn: ${gameState.turn}/${gameState.maxTurns}

${personality.promptStyle}`;

    if (context === 'decision_specific' && currentDecision) {
        prompt += `\n\nRegarding the current decision: "${currentDecision.title}"\n${currentDecision.description}\n\nAnalyze this situation and provide strategic advice, considering our current stats and long-term sustainability goals.`;
    } else if (context === 'crisis') {
        prompt += '\n\nThis is a critical situation! Provide urgent advice to address our most pressing issues while maintaining long-term sustainability.';
    } else if (context === 'endgame') {
        prompt += '\n\nAs we approach the end of our term, provide strategic advice to secure our legacy and ensure lasting prosperity for the city.';
    } else {
        prompt += '\n\nProvide strategic advice about our current situation, focusing on the most critical areas while maintaining a balanced approach to sustainability.';
    }

    return prompt;
};

// Enhanced Gemini API integration with contextual prompts
export const fetchGeminiAdvice = async (
    gameState: GameState,
    personalityType: string = 'optimistic',
    currentDecision?: Decision,
    context: 'general' | 'decision_specific' | 'crisis' | 'endgame' = 'general'
): Promise<string | null> => {
    try {
        // If no API key or model, return null to use fallback
        if (!GEMINI_API_KEY || !model) {
            console.log('Gemini API key not configured or model initialization failed, using fallback advisor');
            return null;
        }

        const personality = ADVISOR_PERSONALITIES[personalityType] || ADVISOR_PERSONALITIES.optimistic;
        const prompt = constructAdvicePrompt(gameState, personality, currentDecision, context);
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating Gemini advice:', error);
        return getDefaultAdvice(gameState, personalityType);
    }
};

// Personality mapping based on game state
export const getRecommendedPersonality = (gameState: GameState): string => {
    const { environment, economy, happiness } = gameState.stats;
    const averageScore = (environment + economy + happiness) / 3;
    
    if (averageScore < 40) return 'pragmatic';
    if (environment < 50) return 'analytical';
    if (economy < 50) return 'pragmatic';
    if (happiness < 50) return 'creative';
    return 'optimistic';
};

// Default advice based on game state if AI fails
const getDefaultAdvice = (gameState: GameState, personalityType: string): string => {
    const { environment, economy, happiness } = gameState.stats;
    const personality = ADVISOR_PERSONALITIES[personalityType];
    const lowestStat = Math.min(environment, economy, happiness);
    
    const prefix = `[${personality?.name || 'AI Advisor'}] `;
    
    if (lowestStat === environment) {
        return prefix + "Your environmental situation needs immediate attention. Consider implementing green policies and sustainable infrastructure.";
    } else if (lowestStat === economy) {
        return prefix + "The economy requires focus. Look for opportunities to boost economic growth while maintaining environmental balance.";
    } else {
        return prefix + "Citizen happiness could be improved. Consider investing in public amenities and quality of life improvements.";
    }
};