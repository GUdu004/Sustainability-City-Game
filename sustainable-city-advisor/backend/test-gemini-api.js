require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in the environment variables.');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

(async () => {
    try {
        const result = await model.generateContent('Test prompt for Gemini API');
        console.log('Gemini API Response:', result.response.text());
    } catch (error) {
        console.error('Error connecting to Gemini API:', error);
    }
})();
