const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'assessment.db');
const db = new sqlite3.Database(dbPath);

console.log("Attempting to add attention_check column to ratings table...");

db.serialize(() => {
    db.run("ALTER TABLE ratings ADD COLUMN attention_check INTEGER", (err) => {
        if (err) {
            console.log("Result:", err.message);
        } else {
            console.log("Success: Column 'attention_check' added.");
        }
    });
});

db.close();
