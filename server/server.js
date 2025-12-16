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

// Register participant (Demographics & Consent)
app.post('/api/participants', async (req, res) => {
    const { id, age, gender, ethnicity, education, language_fluency, media_familiarity, consent, contact_email } = req.body;
    const sql = `INSERT INTO participants (id, age, gender, ethnicity, education, language_fluency, media_familiarity, consent, contact_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    const params = [id, age, gender, ethnicity, education, language_fluency, media_familiarity, consent ? 1 : 0, contact_email];

    try {
        await dbQuery(sql, params);
        res.json({ "message": "success", "data": id });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get all participants (Demographics) - PROTECTED
app.get('/api/participants', authenticateToken, async (req, res) => {
    try {
        const result = await dbQuery("SELECT * FROM participants ORDER BY timestamp DESC");
        res.json({
            "message": "success",
            "data": result.rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Update participant (Attention Check & Debrief)
app.put('/api/participants/:id', async (req, res) => {
    const { attention_check, qualitative_feedback, compensation_id } = req.body;
    console.log(`Received update for ${req.params.id}:`, req.body);

    let sql = `UPDATE participants SET `;
    const params = [];
    const updates = [];
    let paramIndex = 1;

    if (attention_check !== undefined) {
        updates.push(`attention_check = $${paramIndex++}`);
        params.push(attention_check);
    }
    if (qualitative_feedback !== undefined) {
        updates.push(`qualitative_feedback = $${paramIndex++}`);
        params.push(qualitative_feedback);
    }
    if (compensation_id !== undefined) {
        updates.push(`compensation_id = $${paramIndex++}`);
        params.push(compensation_id);
    }

    if (updates.length === 0) {
        return res.status(400).json({ "error": "No fields to update" });
    }

    sql += updates.join(', ') + ` WHERE id = $${paramIndex}`;
    params.push(req.params.id);

    try {
        const result = await dbQuery(sql, params);
        res.json({ "message": "success", "changes": result.rowCount });
    } catch (err) {
        console.error("Database error updating participant:", err.message);
        res.status(400).json({ "error": err.message });
    }
});

// Submit a rating
app.post('/api/ratings', async (req, res) => {
    const { video_id, participant_id, accuracy, bias, representativeness, stereotypes, comments } = req.body;

    const sql = `INSERT INTO ratings (video_id, participant_id, accuracy, bias, representativeness, stereotypes, comments) 
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
    const params = [video_id, participant_id, accuracy, bias, representativeness, stereotypes, comments];

    try {
        const result = await dbQuery(sql, params);
        res.json({
            "message": "success",
            "data": result.rows[0].id
        });
    } catch (err) {
        console.error('Error saving rating:', err);
        res.status(400).json({ "error": err.message });
    }
});

// Get all ratings (Admin) - PROTECTED
app.get('/api/ratings', authenticateToken, async (req, res) => {
    const sql = `
        SELECT r.*, v.title as video_title, v.filename
        FROM ratings r 
        JOIN videos v ON r.video_id = v.id 
        ORDER BY r.timestamp DESC
    `;
    try {
        const result = await dbQuery(sql);
        res.json({
            "message": "success",
            "data": result.rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Initialize database and start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
});
