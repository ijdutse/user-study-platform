const db = require('./database');

console.log('Migrating schema...');

const columnsToAdd = [
    { name: 'language_fluency', type: 'TEXT' },
    { name: 'media_familiarity', type: 'TEXT' },
    { name: 'consent', type: 'INTEGER' },
    { name: 'contact_email', type: 'TEXT' },
    { name: 'qualitative_feedback', type: 'TEXT' },
    { name: 'compensation_id', type: 'TEXT' }
];

db.serialize(() => {
    columnsToAdd.forEach(col => {
        const sql = `ALTER TABLE participants ADD COLUMN ${col.name} ${col.type}`;
        db.run(sql, (err) => {
            if (err) {
                // Ignore error if column likely exists (SQLite doesn't support IF NOT EXISTS for ADD COLUMN in older versions, but we can check error message or just ignore)
                if (err.message.includes('duplicate column name')) {
                    console.log(`Column ${col.name} already exists.`);
                } else {
                    console.error(`Error adding column ${col.name}:`, err.message);
                }
            } else {
                console.log(`Added column ${col.name}.`);
            }
        });
    });
});
