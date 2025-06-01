import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import gameRoutes from './routes/gameRoutes';
import advisorRoutes from './routes/advisorRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow frontend dev servers
    credentials: true
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
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Sustainable City Advisor API is running on http://localhost:${PORT}`);
    console.log(`📱 Frontend should connect to: http://localhost:${PORT}/api`);
});