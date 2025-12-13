const db = require('./database');

console.log('Verifying SQL queries...');

db.serialize(() => {
    // Test Participants Query
    const participantsSql = "SELECT * FROM participants ORDER BY timestamp DESC";
    db.all(participantsSql, [], (err, rows) => {
        if (err) {
            console.error('Participants Query FAILED:', err.message);
        } else {
            console.log(`Participants Query SUCCESS. Found ${rows.length} rows.`);
            if (rows.length > 0) {
                console.log('Sample Participant:', rows[0]);
            }
        }
    });

    // Test Ratings Query
    const ratingsSql = `
        SELECT r.*, v.title as video_title, v.filename
        FROM ratings r 
        JOIN videos v ON r.video_id = v.id 
        ORDER BY r.timestamp DESC
    `;
    db.all(ratingsSql, [], (err, rows) => {
        if (err) {
            console.error('Ratings Query FAILED:', err.message);
        } else {
            console.log(`Ratings Query SUCCESS. Found ${rows.length} rows.`);
            if (rows.length > 0) {
                console.log('Sample Rating:', rows[0]);
            }
        }
    });
});
