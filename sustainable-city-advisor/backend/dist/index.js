"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
const advisorRoutes_1 = __importDefault(require("./routes/advisorRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// API routes
app.use('/api/game', gameRoutes_1.default);
app.use('/api/advisor', advisorRoutes_1.default);
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
