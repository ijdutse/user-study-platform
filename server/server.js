const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { query: dbQuery, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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

// Configure Multer for video uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public'));
    },
    filename: (req, file, cb) => {
        // Use original filename but sanitize it slightly if needed
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Serve video files from public directory
app.use('/videos', express.static(path.join(__dirname, 'public')));

// Serve built frontend (for production)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Health Check Route
app.get('/api/health', async (req, res) => {
    try {
        await dbQuery('SELECT NOW()');
        res.json({ status: 'ok', timestamp: new Date() });
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// API Routes

// Login Route
app.post('/api/login', async (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        const user = { name: 'admin', role: 'admin' };
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
        res.json({ accessToken });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Get all videos
app.get('/api/videos', async (req, res) => {
    try {
        const result = await dbQuery("SELECT * FROM videos");
        res.json({
            "message": "success",
            "data": result.rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Upload new video (Admin) - PROTECTED
app.post('/api/videos', authenticateToken, upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { title, context } = req.body;
    const filename = req.file.filename;

    const sql = `INSERT INTO videos (filename, title, context) VALUES ($1, $2, $3) RETURNING id`;
    const params = [filename, title, context];

    try {
        const result = await dbQuery(sql, params);
        res.json({
            "message": "success",
            "data": {
                id: result.rows[0].id,
                filename,
                title,
                context
            }
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Update video metadata (Admin) - PROTECTED
app.put('/api/videos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, context } = req.body;

    const sql = `UPDATE videos SET title = $1, context = $2 WHERE id = $3 RETURNING *`;
    const params = [title, context, id];

    try {
        const result = await dbQuery(sql, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Video not found" });
        }
        res.json({
            "message": "success",
            "data": result.rows[0]
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get Admin Stats - PROTECTED
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        // 1. Age Distribution
        const ageSql = `
            SELECT 
                CASE 
                    WHEN age < 18 THEN 'Under 18'
                    WHEN age BETWEEN 18 AND 24 THEN '18-24'
                    WHEN age BETWEEN 25 AND 34 THEN '25-34'
                    WHEN age BETWEEN 35 AND 44 THEN '35-44'
                    WHEN age BETWEEN 45 AND 54 THEN '45-54'
                    WHEN age BETWEEN 55 AND 64 THEN '55-64'
                    ELSE '65+'
                END as age_group,
                COUNT(*) as count
            FROM participants
            WHERE age IS NOT NULL
            GROUP BY age_group
            ORDER BY age_group
        `;
        const ageResult = await dbQuery(ageSql);

        // 2. Average Ratings per Video
        const ratingsSql = `
            SELECT 
                v.title,
                AVG(r.accuracy) as avg_accuracy,
                AVG(r.bias) as avg_bias,
                AVG(r.representativeness) as avg_representativeness,
                AVG(r.stereotypes) as avg_stereotypes,
                COUNT(r.id) as rating_count
            FROM ratings r
            JOIN videos v ON r.video_id = v.id
            GROUP BY v.id, v.title
            ORDER BY v.title
        `;
        const ratingsResult = await dbQuery(ratingsSql);

        res.json({
            ageDistribution: ageResult.rows,
            videoRatings: ratingsResult.rows
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ error: err.message });
    }
});

// Participants submission
app.post('/api/participants', async (req, res) => {
    const { id, age, gender, ethnicity, education, language_fluency, media_familiarity, consent, contact_email } = req.body;

    const sql = `INSERT INTO participants (id, age, gender, ethnicity, education, language_fluency, media_familiarity, consent, contact_email) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    const params = [id, age, gender, ethnicity, education, language_fluency, media_familiarity, consent ? 1 : 0, contact_email];

    try {
        await dbQuery(sql, params);
        res.json({ "message": "success", "id": id });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Attention Check submission
app.post('/api/attention-check', async (req, res) => {
    const { participant_id, score } = req.body;
    const sql = `UPDATE participants SET attention_check = $1 WHERE id = $2`;
    try {
        await dbQuery(sql, [score, participant_id]);
        res.json({ "message": "success" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Rating submission
app.post('/api/ratings', async (req, res) => {
    const { video_id, participant_id, accuracy, bias, representativeness, stereotypes, comments } = req.body;
    const sql = `INSERT INTO ratings (video_id, participant_id, accuracy, bias, representativeness, stereotypes, comments) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    const params = [video_id, participant_id, accuracy, bias, representativeness, stereotypes, comments];

    try {
        await dbQuery(sql, params);
        res.json({ "message": "success" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Debrief submission
app.post('/api/debrief', async (req, res) => {
    const { participant_id, feedback, compensation_id } = req.body;
    const sql = `UPDATE participants SET qualitative_feedback = $1, compensation_id = $2 WHERE id = $3`;
    try {
        await dbQuery(sql, [feedback, compensation_id, participant_id]);
        res.json({ "message": "success" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
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