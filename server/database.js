const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database.');
});

async function initDatabase() {
    try {
        // Videos table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS videos (
                id SERIAL PRIMARY KEY,
                filename TEXT NOT NULL UNIQUE,
                title TEXT,
                context TEXT
            )
        `);

        // Participants table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS participants (
                id TEXT PRIMARY KEY,
                age INTEGER,
                gender TEXT,
                ethnicity TEXT,
                education TEXT,
                language_fluency TEXT,
                media_familiarity TEXT,
                consent INTEGER,
                contact_email TEXT,
                qualitative_feedback TEXT,
                compensation_id TEXT,
                attention_check INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Ratings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ratings (
                id SERIAL PRIMARY KEY,
                video_id INTEGER REFERENCES videos(id),
                participant_id TEXT REFERENCES participants(id),
                accuracy INTEGER,
                bias INTEGER,
                representativeness INTEGER,
                stereotypes INTEGER,
                attention_check INTEGER,
                comments TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Sync with public folder
        const publicDir = path.join(__dirname, 'public');
        const metadataPath = path.join(__dirname, 'video_metadata.json');

        let metadata = [];
        try {
            if (fs.existsSync(metadataPath)) {
                const data = fs.readFileSync(metadataPath, 'utf8');
                metadata = JSON.parse(data);
                console.log(`Loaded metadata for ${metadata.length} videos.`);
            }
        } catch (err) {
            console.error("Error reading video_metadata.json:", err);
        }

        fs.readdir(publicDir, async (err, files) => {
            if (err) {
                console.error("Could not list public directory", err);
                return;
            }

            const videoFiles = files.filter(f => f.endsWith('.mp4'));
            console.log(`Found ${videoFiles.length} videos in public folder.`);

            for (const file of videoFiles) {
                const meta = metadata.find(m => m.filename === file);
                const title = meta ? meta.title : file.replace('.mp4', '').replace(/_/g, ' ');
                const context = meta ? meta.context : "Generated video content.";

                await pool.query(`
                    INSERT INTO videos (filename, title, context) 
                    VALUES ($1, $2, $3)
                    ON CONFLICT (filename) DO UPDATE SET
                    title = EXCLUDED.title,
                    context = EXCLUDED.context
                `, [file, title, context]);
            }
        });

    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

// Initialize on require (or call explicitly in server.js)
initDatabase();

module.exports = pool;
