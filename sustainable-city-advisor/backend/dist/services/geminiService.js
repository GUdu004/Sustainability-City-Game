"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGeminiAdvice = void 0;
const axios_1 = __importDefault(require("axios"));
const GEMINI_API_URL = 'https://api.gemini.com/v1/advice'; // Replace with the actual Gemini API endpoint
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure to set your API key in environment variables
const fetchGeminiAdvice = async (gameState) => {
    try {
        // For now, return null to disable Gemini API calls until properly configured
        // This prevents errors when the API key is not set up
        if (!GEMINI_API_KEY) {
            return null;
        }
        const response = await axios_1.default.post(GEMINI_API_URL, {
            gameState: gameState,
            // Add any other necessary parameters for the API call
        }, {
            headers: {
                'Authorization': `Bearer ${GEMINI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data?.advice || null; // Adjust based on the actual response structure
    }
    catch (error) {
        console.error('Error fetching advice from Gemini API:', error);
        return null; // Return null instead of throwing to allow graceful fallback
    }
};
exports.fetchGeminiAdvice = fetchGeminiAdvice;
