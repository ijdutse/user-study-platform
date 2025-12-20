const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { query: dbQuery } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Configure Multer for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Upload new video (Admin) - PROTECTED
router.post('/', authenticateToken, upload.single('video'), async (req, res) => {
    const { title, context, url } = req.body;
    let filename = req.file ? req.file.filename : null;

    if (!filename && !url) {
        return res.status(400).json({ error: 'Either a video file or a URL must be provided' });
    }

    const sql = `INSERT INTO videos (filename, title, context, url) VALUES ($1, $2, $3, $4) RETURNING id`;
    const params = [filename, title, context, url];

    try {
        const result = await dbQuery(sql, params);
        res.json({
            "message": "success",
            "data": {
                id: result.rows[0].id,
                filename,
                title,
                context,
                url
            }
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Update video metadata (Admin) - PROTECTED
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, context, url } = req.body;

    const sql = `UPDATE videos SET title = $1, context = $2, url = $3 WHERE id = $4 RETURNING *`;
    const params = [title, context, url, id];

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

module.exports = router;
