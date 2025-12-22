const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Determine mode
const isProduction = process.env.NODE_ENV === 'production';
const dbUrl = process.env.DATABASE_URL;
console.log('-------------------------------------------');
console.log(`Database Mode: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Storage Type: ${isProduction && dbUrl ? 'PostgreSQL' : 'SQLite'}`);
if (!isProduction && !dbUrl) {
    console.log(`SQLite Path: ${path.join(__dirname, 'assessment.db')}`);
}
console.log('-------------------------------------------');

let db;
let query;
let initDatabase;

if (isProduction && process.env.DATABASE_URL) {
    // --- PostgreSQL Implementation ---
    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Render requires SSL
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    pool.on('connect', () => {
        console.log('Connected to the PostgreSQL database.');
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });

    query = (text, params) => pool.query(text, params);

    initDatabase = async () => {
        try {
            // Videos table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS videos (
                    id SERIAL PRIMARY KEY,
                    filename TEXT UNIQUE,
                    url TEXT,
                    title TEXT UNIQUE,
                    context TEXT
                )
            `);

            // Migration: Add url column if it doesn't exist
            console.log('Checking for url column...');
            await pool.query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='url') THEN
                        ALTER TABLE videos ADD COLUMN url TEXT;
                    END IF;
                END $$;
            `);

            // Migration: Ensure title is unique
            console.log('Ensuring title is unique...');
            await pool.query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='videos' AND constraint_name='videos_title_key') THEN
                        ALTER TABLE videos ADD CONSTRAINT videos_title_key UNIQUE (title);
                    END IF;
                END $$;
            `);

            // Migration: Remove NOT NULL from filename
            console.log('Removing NOT NULL from filename...');
            await pool.query(`
                ALTER TABLE videos ALTER COLUMN filename DROP NOT NULL;
            `);
            console.log('Migrations completed.');

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

            // Migration: Add timestamp to participants if missing
            await pool.query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='participants' AND column_name='timestamp') THEN
                        ALTER TABLE participants ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                    END IF;
                END $$;
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

            // Migration: Add timestamp to ratings if missing
            await pool.query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ratings' AND column_name='timestamp') THEN
                        ALTER TABLE ratings ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                    END IF;
                END $$;
            `);

            await syncMetadata(query);
            console.log('Database initialized successfully (PostgreSQL).');

        } catch (err) {
            console.error('Error initializing database:', err);
            throw err;
        }
    };

} else {
    // --- SQLite Implementation ---
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'assessment.db');
    const sqliteDb = new sqlite3.Database(dbPath);

    query = (text, params = []) => {
        return new Promise((resolve, reject) => {
            const sqliteText = text.replace(/\$\d+/g, '?');
            const isSelect = text.trim().toUpperCase().startsWith('SELECT');

            if (isSelect || text.trim().toUpperCase().includes('RETURNING')) {
                if (text.trim().toUpperCase().startsWith('INSERT') && text.includes('RETURNING')) {
                    const insertText = sqliteText.split('RETURNING')[0];
                    sqliteDb.run(insertText, params, function (err) {
                        if (err) return reject(err);
                        resolve({ rows: [{ id: this.lastID }] });
                    });
                } else if (text.trim().toUpperCase().startsWith('UPDATE') && text.includes('RETURNING')) {
                    const updateText = sqliteText.split('RETURNING')[0];
                    sqliteDb.run(updateText, params, function (err) {
                        if (err) return reject(err);
                        resolve({ rows: [{ status: 'updated' }] });
                    });
                } else {
                    sqliteDb.all(sqliteText, params, (err, rows) => {
                        if (err) return reject(err);
                        resolve({ rows });
                    });
                }
            } else {
                sqliteDb.run(sqliteText, params, function (err) {
                    if (err) return reject(err);
                    resolve({ rows: [], rowCount: this.changes });
                });
            }
        });
    };

    initDatabase = async () => {
        return new Promise((resolve, reject) => {
            sqliteDb.serialize(async () => {
                try {
                    sqliteDb.run(`
                        CREATE TABLE IF NOT EXISTS videos (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            filename TEXT UNIQUE,
                            url TEXT,
                            title TEXT UNIQUE,
                            context TEXT
                        )
                    `);

                    sqliteDb.run(`
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
                            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `);

                    sqliteDb.run(`
                        CREATE TABLE IF NOT EXISTS ratings (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            video_id INTEGER,
                            participant_id TEXT,
                            accuracy INTEGER,
                            bias INTEGER,
                            representativeness INTEGER,
                            stereotypes INTEGER,
                            attention_check INTEGER,
                            comments TEXT,
                            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY(video_id) REFERENCES videos(id),
                            FOREIGN KEY(participant_id) REFERENCES participants(id)
                        )
                    `);

                    // SQLite Migrations for timestamp
                    sqliteDb.run(`PRAGMA table_info(participants)`, (err, rows) => {
                        if (err) return;
                        const hasTimestamp = rows.some(r => r.name === 'timestamp');
                        if (!hasTimestamp) {
                            sqliteDb.run(`ALTER TABLE participants ADD COLUMN timestamp DATETIME DEFAULT CURRENT_TIMESTAMP`);
                        }
                    });

                    sqliteDb.run(`PRAGMA table_info(ratings)`, (err, rows) => {
                        if (err) return;
                        const hasTimestamp = rows.some(r => r.name === 'timestamp');
                        if (!hasTimestamp) {
                            sqliteDb.run(`ALTER TABLE ratings ADD COLUMN timestamp DATETIME DEFAULT CURRENT_TIMESTAMP`);
                        }
                    });

                    await syncMetadata(query);
                    console.log('Database initialized successfully (SQLite).');
                    resolve();

                } catch (err) {
                    console.error('Error initializing database:', err);
                    reject(err);
                }
            });
        });
    };
}

// Shared Metadata Sync Logic
async function syncMetadata(queryFn) {
    const publicDir = path.join(__dirname, 'public');
    const metadataPath = path.join(__dirname, 'video_metadata.json');

    let metadata = [];
    if (fs.existsSync(metadataPath)) {
        try {
            const data = fs.readFileSync(metadataPath, 'utf8');
            metadata = JSON.parse(data);
            console.log(`Loaded metadata for ${metadata.length} videos.`);
        } catch (e) {
            console.error("Failed to parse metadata", e);
        }
    }

    if (fs.existsSync(publicDir)) {
        const files = fs.readdirSync(publicDir);
        const videoFiles = files.filter(f => f.endsWith('.mp4'));
        console.log(`Found ${videoFiles.length} videos in public folder.`);

        for (const file of videoFiles) {
            const meta = metadata.find(m => m.filename === file);
            const title = meta ? meta.title : file.replace('.mp4', '').replace(/_/g, ' ');
            const context = meta ? meta.context : "Generated video content.";
            const url = meta && meta.url ? meta.url : null;

            await queryFn(`
                INSERT INTO videos (filename, title, context, url) 
                VALUES ($1, $2, $3, $4)
                ON CONFLICT(filename) DO UPDATE SET
                title = EXCLUDED.title,
                context = EXCLUDED.context,
                url = EXCLUDED.url
            `, [file, title, context, url]);
        }
    }

    for (const meta of metadata) {
        if (meta.url && meta.url.trim() !== "" && !meta.filename) {
            await queryFn(`
                INSERT INTO videos (url, title, context) 
                VALUES ($1, $2, $3)
                ON CONFLICT(title) DO UPDATE SET
                url = EXCLUDED.url,
                context = EXCLUDED.context,
                filename = NULL
            `, [meta.url, meta.title, meta.context]);
        }
    }
}

module.exports = {
    query,
    initDatabase
};
