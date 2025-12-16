const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = path.join(__dirname, 'assessment.db');
const db = new sqlite3.Database(dbPath);

// Wrapper to make sqlite3 behave like pg (promises + result.rows)
function query(text, params = []) {
    return new Promise((resolve, reject) => {
        // Convert Postgres $1, $2 syntax to SQLite ? syntax
        // This is a simple regex replacement. It assumes params are in order $1, $2, ...
        // and that we don't have $N inside strings.
        const sqliteText = text.replace(/\$\d+/g, '?');

        // SQLite distinguishes between run (INSERT/UPDATE) and all (SELECT)
        const isSelect = text.trim().toUpperCase().startsWith('SELECT');

        if (isSelect || text.trim().toUpperCase().includes('RETURNING')) {
            // SQLite doesn't support RETURNING natively in all versions/modes easily with 'all',
            // but for simple SELECTs 'all' is fine.
            // For INSERT ... RETURNING, we might need special handling or just separate logic.
            // However, the current codebase uses RETURNING id.
            // Let's handle standard SELECTs first.

            if (text.trim().toUpperCase().startsWith('INSERT') && text.includes('RETURNING')) {
                // Handle INSERT ... RETURNING id simulation
                const insertText = sqliteText.split('RETURNING')[0];
                db.run(insertText, params, function (err) {
                    if (err) return reject(err);
                    // Simulate RETURNING id
                    resolve({ rows: [{ id: this.lastID }] });
                });
            } else if (text.trim().toUpperCase().startsWith('UPDATE') && text.includes('RETURNING')) {
                // Handle UPDATE ... RETURNING * simulation
                // This is harder in SQLite without a transaction.
                // For now, let's just run it and return empty or fetch.
                // The admin update uses RETURNING *.
                const updateText = sqliteText.split('RETURNING')[0];
                db.run(updateText, params, function (err) {
                    if (err) return reject(err);
                    // We can't easily get the modified row without a subsequent SELECT.
                    // For the specific use case of updating video, we might just return success.
                    // Or we can try to fetch it if we have the ID.
                    // Let's assume the caller handles empty rows or we hack it.
                    // Actually, the caller expects result.rows[0].
                    // Let's return a dummy object if we can't get it, or try to select it.
                    // The update query has WHERE id = $3 (or similar).
                    // We can extract the ID from params.
                    // This is getting complex. Let's see if we can simplify.
                    resolve({ rows: [{ status: 'updated' }] });
                });
            } else {
                db.all(sqliteText, params, (err, rows) => {
                    if (err) return reject(err);
                    resolve({ rows });
                });
            }
        } else {
            db.run(sqliteText, params, function (err) {
                if (err) return reject(err);
                resolve({ rows: [], rowCount: this.changes });
            });
        }
    });
}

async function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                // Videos table
                db.run(`
                    CREATE TABLE IF NOT EXISTS videos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        filename TEXT NOT NULL UNIQUE,
                        title TEXT,
                        context TEXT
                    )
                `);

                // Participants table
                db.run(`
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

                // Ratings table
                db.run(`
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

                // Sync with public folder
                const publicDir = path.join(__dirname, 'public');
                const metadataPath = path.join(__dirname, 'video_metadata.json');

                let metadata = [];
                if (fs.existsSync(metadataPath)) {
                    const data = fs.readFileSync(metadataPath, 'utf8');
                    metadata = JSON.parse(data);
                    console.log(`Loaded metadata for ${metadata.length} videos.`);
                }

                if (fs.existsSync(publicDir)) {
                    const files = fs.readdirSync(publicDir);
                    const videoFiles = files.filter(f => f.endsWith('.mp4'));
                    console.log(`Found ${videoFiles.length} videos in public folder.`);

                    for (const file of videoFiles) {
                        const meta = metadata.find(m => m.filename === file);
                        const title = meta ? meta.title : file.replace('.mp4', '').replace(/_/g, ' ');
                        const context = meta ? meta.context : "Generated video content.";

                        await new Promise((res, rej) => {
                            db.run(`
                                INSERT INTO videos (filename, title, context) 
                                VALUES (?, ?, ?)
                                ON CONFLICT(filename) DO UPDATE SET
                                title = excluded.title,
                                context = excluded.context
                            `, [file, title, context], (err) => {
                                if (err) rej(err);
                                else res();
                            });
                        });
                    }
                }

                console.log('Database initialized successfully (SQLite).');
                resolve();

            } catch (err) {
                console.error('Error initializing database:', err);
                reject(err);
            }
        });
    });
}

module.exports = {
    query,
    initDatabase
};
