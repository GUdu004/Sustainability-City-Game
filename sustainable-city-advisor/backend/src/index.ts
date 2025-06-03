import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import gameRoutes from './routes/gameRoutes';
import advisorRoutes from './routes/advisorRoutes';

const app = express();
const PORT = 8000;

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from the frontend
    credentials: true // Allow cookies and other credentials
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use('/api/game', gameRoutes);
app.use('/api/advisor', advisorRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to the Sustainable City Advisor API!',
        version: '1.0.0',
        endpoints: {
            gameState: 'GET /api/game/state',
            nextDecision: 'GET /api/game/decision',
            makeDecision: 'POST /api/game/decision',
            resetGame: 'POST /api/game/reset',
            getAdvisor: 'GET /api/advisor'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        geminiEnabled: Boolean(process.env.GEMINI_API_KEY)
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Sustainable City Advisor API is running on http://localhost:${PORT}`);
    console.log(`📱 Frontend should connect to: http://localhost:${PORT}/api`);
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ Warning: GEMINI_API_KEY is not set. AI advisor will use fallback mode.');
    }
});