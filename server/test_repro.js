const db = require('./database');

const testId = 'test_user_' + Date.now();
const score = 100;

console.log('Starting reproduction test...');

db.serialize(() => {
    // 1. Insert dummy participant
    db.run(`INSERT INTO participants (id, age, gender, ethnicity, education) VALUES (?, ?, ?, ?, ?)`,
        [testId, 25, 'Male', 'Test', 'Test'],
        function (err) {
            if (err) {
                console.error('Failed to insert participant:', err.message);
                return;
            }
            console.log('Participant inserted.');

            // 2. Try to update attention check
            const sql = `UPDATE participants SET attention_check = ? WHERE id = ?`;
            db.run(sql, [score, testId], function (err) {
                if (err) {
                    console.error('FAILED: Database error updating participant:', err.message);
                } else {
                    console.log(`SUCCESS: Updated participant. Changes: ${this.changes}`);
                }
            });
        }
    );
});
