const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { initDatabase } = require('./database');
const apiRoutes = require('./routes/api');
const videoRoutes = require('./routes/videos');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rate Limiting
const rateLimit = require('express-rate-limit');

// Trust proxy is required for rate limiting to work correctly behind Render's load balancer
app.set('trust proxy', 1);

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

const submissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 submissions per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many submissions, please try again later.' }
});

// Apply general limiter to all API routes
app.use('/api', generalLimiter);

// Apply stricter limiter to submission endpoints
app.use('/api/participants', submissionLimiter);
app.use('/api/ratings', submissionLimiter);

// Serve video files from public directory
app.use('/videos', express.static(path.join(__dirname, 'public')));

// Serve built frontend (for production)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);
app.use('/api/videos', videoRoutes);

// Health Check Route
app.get('/api/health', async (req, res) => {
    try {
        const { query: dbQuery } = require('./database');
        await dbQuery('SELECT 1'); // Simple query to check DB connection
        res.json({ status: 'ok', timestamp: new Date() });
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Handle SPA routing - serve index.html for all non-API routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize DB and Start Server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});