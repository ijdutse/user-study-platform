const db = require('./database');

// Wait for DB initialization
setTimeout(() => {
    db.all("SELECT * FROM videos", [], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("Videos in DB:");
        rows.forEach(row => {
            console.log(`- ${row.filename}:`);
            console.log(`  Title: ${row.title}`);
            console.log(`  Context: ${row.context}`);
        });
    });
}, 1000);
