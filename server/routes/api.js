const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');
const { query: dbQuery } = require('../database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Login Route
router.post('/login', async (req, res) => {
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
router.get('/videos', async (req, res) => {
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

// Get Admin Stats - PROTECTED
router.get('/admin/stats', authenticateToken, async (req, res) => {
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

// Export Ratings - PROTECTED
router.get('/admin/export/ratings', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.id, v.title as video_title, r.participant_id, 
                r.accuracy, r.bias, r.representativeness, r.stereotypes, 
                r.comments, r.timestamp 
            FROM ratings r
            JOIN videos v ON r.video_id = v.id
            ORDER BY r.timestamp DESC
        `;
        const result = await dbQuery(sql);

        const fields = ['id', 'video_title', 'participant_id', 'accuracy', 'bias', 'representativeness', 'stereotypes', 'comments', 'timestamp'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(result.rows);

        res.header('Content-Type', 'text/csv');
        res.attachment('ratings_export.csv');
        return res.send(csv);
    } catch (err) {
        console.error("Export error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Export Participants - PROTECTED
router.get('/admin/export/participants', authenticateToken, async (req, res) => {
    try {
        const sql = `SELECT * FROM participants ORDER BY timestamp DESC`;
        const result = await dbQuery(sql);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No participants found" });
        }

        const fields = Object.keys(result.rows[0]);
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(result.rows);

        res.header('Content-Type', 'text/csv');
        res.attachment('participants_export.csv');
        return res.send(csv);
    } catch (err) {
        console.error("Export error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get Raw Participants - PROTECTED
router.get('/admin/raw/participants', authenticateToken, async (req, res) => {
    try {
        const result = await dbQuery(`SELECT * FROM participants ORDER BY timestamp DESC`);
        res.json({ message: "success", data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Raw Ratings - PROTECTED
router.get('/admin/raw/ratings', authenticateToken, async (req, res) => {
    try {
        const result = await dbQuery(`
            SELECT r.*, v.title as video_title 
            FROM ratings r 
            JOIN videos v ON r.video_id = v.id 
            ORDER BY r.timestamp DESC
        `);
        res.json({ message: "success", data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Participants submission
router.post('/participants', async (req, res) => {
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
router.post('/attention-check', async (req, res) => {
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
router.post('/ratings', async (req, res) => {
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
router.post('/debrief', async (req, res) => {
    const { participant_id, feedback, compensation_id } = req.body;
    const sql = `UPDATE participants SET qualitative_feedback = $1, compensation_id = $2 WHERE id = $3`;
    try {
        await dbQuery(sql, [feedback, compensation_id, participant_id]);
        res.json({ "message": "success" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

module.exports = router;
