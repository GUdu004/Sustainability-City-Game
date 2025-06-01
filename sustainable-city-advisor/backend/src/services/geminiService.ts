import axios from 'axios';
import { GameState } from '../types';

const GEMINI_API_URL = 'https://api.gemini.com/v1/advice'; // Replace with the actual Gemini API endpoint
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure to set your API key in environment variables

export const fetchGeminiAdvice = async (gameState: GameState): Promise<string | null> => {
    try {
        // For now, return null to disable Gemini API calls until properly configured
        // This prevents errors when the API key is not set up
        if (!GEMINI_API_KEY) {
            return null;
        }

        const response = await axios.post(GEMINI_API_URL, {
            gameState: gameState,
            // Add any other necessary parameters for the API call
        }, {
            headers: {
                'Authorization': `Bearer ${GEMINI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data?.advice || null; // Adjust based on the actual response structure
    } catch (error) {
        console.error('Error fetching advice from Gemini API:', error);
        return null; // Return null instead of throwing to allow graceful fallback
    }
};