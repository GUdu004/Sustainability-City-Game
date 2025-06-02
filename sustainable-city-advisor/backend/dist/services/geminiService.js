"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedPersonality = exports.fetchGeminiAdvice = exports.ADVISOR_PERSONALITIES = void 0;
const axios_1 = __importDefault(require("axios"));
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
exports.ADVISOR_PERSONALITIES = {
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
// Retry mechanism with exponential backoff
const retryWithBackoff = async (operation, maxRetries = 3, baseDelay = 1000) => {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                throw lastError;
            }
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            console.log(`Gemini API retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        }
    }
    throw lastError;
};
// Enhanced Gemini API integration with dynamic personality and contextual prompts
const fetchGeminiAdvice = async (gameState, personalityType = 'optimistic', currentDecision, context = 'general') => {
    try {
        if (!GEMINI_API_KEY) {
            console.log('Gemini API key not configured, using fallback advisor');
            return null;
        }
        const personality = exports.ADVISOR_PERSONALITIES[personalityType] || exports.ADVISOR_PERSONALITIES.optimistic;
        const { environment, economy, happiness } = gameState.stats;
        // Construct detailed contextual prompt
        const prompt = constructAdvicePrompt(gameState, personality, currentDecision, context);
        // Make API call with retry mechanism
        const response = await retryWithBackoff(async () => {
            return await axios_1.default.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 200,
                    stopSequences: []
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10 second timeout
            });
        });
        const advice = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!advice) {
            console.log('No advice returned from Gemini API');
            return null;
        }
        // Log successful API call for monitoring
        console.log(`Gemini API success: ${personalityType} advisor, context: ${context}`);
        return advice.trim();
    }
    catch (error) {
        console.error('Error fetching advice from Gemini API:', error);
        // Enhanced error logging for monitoring
        if (axios_1.default.isAxiosError(error)) {
            console.error('Gemini API Error Details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        }
        return null; // Graceful fallback to rule-based advisor
    }
};
exports.fetchGeminiAdvice = fetchGeminiAdvice;
// Construct contextual prompts based on game state and personality
function constructAdvicePrompt(gameState, personality, currentDecision, context = 'general') {
    const { environment, economy, happiness } = gameState.stats;
    const turn = gameState.turn;
    const maxTurns = gameState.maxTurns;
    let basePrompt = `You are ${personality.name}, a city advisor with a ${personality.tone} personality. `;
    basePrompt += `Your specialization is ${personality.specialization}. ${personality.promptStyle}.\n\n`;
    basePrompt += `Current City Status (Turn ${turn}/${maxTurns}):\n`;
    basePrompt += `- Environment: ${environment}/100 ${getStatEmoji(environment)}\n`;
    basePrompt += `- Economy: ${economy}/100 ${getStatEmoji(economy)}\n`;
    basePrompt += `- Happiness: ${happiness}/100 ${getStatEmoji(happiness)}\n\n`;
    // Add context-specific information
    switch (context) {
        case 'decision_specific':
            if (currentDecision) {
                basePrompt += `Current Decision: "${currentDecision.title}"\n`;
                basePrompt += `Description: ${currentDecision.description}\n`;
                basePrompt += `Available choices:\n`;
                currentDecision.choices.forEach((choice, index) => {
                    basePrompt += `${index + 1}. ${choice.text}\n`;
                });
                basePrompt += `\nProvide advice on which choice might be best for the city's future.\n`;
            }
            break;
        case 'crisis':
            const crisisStats = [environment, economy, happiness].filter(stat => stat < 30);
            if (crisisStats.length > 0) {
                basePrompt += `URGENT: The city is in crisis mode with critically low stats. `;
                basePrompt += `Immediate action is needed to prevent collapse.\n`;
            }
            break;
        case 'endgame':
            basePrompt += `This is near the end of your term as mayor. `;
            basePrompt += `Reflect on the city's current state and what legacy you're leaving.\n`;
            break;
        default:
            basePrompt += `Provide general advice about the city's current situation and what to focus on next.\n`;
    }
    basePrompt += `\nKeep your response to 2-3 sentences, staying in character as ${personality.name}. `;
    basePrompt += `Be specific and actionable while maintaining your ${personality.tone} tone.`;
    return basePrompt;
}
function getStatEmoji(value) {
    if (value >= 80)
        return '🟢';
    if (value >= 60)
        return '🟡';
    if (value >= 40)
        return '🟠';
    return '🔴';
}
// Get appropriate personality based on game state
function getRecommendedPersonality(gameState) {
    const { environment, economy, happiness } = gameState.stats;
    const averageScore = (environment + economy + happiness) / 3;
    const turn = gameState.turn;
    const isLateGame = turn > gameState.maxTurns * 0.7;
    // Crisis mode - use pragmatic advisor
    if (averageScore < 40 || Math.min(environment, economy, happiness) < 25) {
        return 'pragmatic';
    }
    // Late game - use analytical advisor
    if (isLateGame) {
        return 'analytical';
    }
    // High performance - use optimistic advisor
    if (averageScore >= 70) {
        return 'optimistic';
    }
    // Moderate performance - use creative advisor for fresh ideas
    return 'creative';
}
exports.getRecommendedPersonality = getRecommendedPersonality;
