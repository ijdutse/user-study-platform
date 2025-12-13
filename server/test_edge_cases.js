const db = require('./database');

const testId = 'test_user_' + Date.now();

console.log('Starting edge case tests...');

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

            // Test 1: Update with null
            db.run(`UPDATE participants SET attention_check = ? WHERE id = ?`, [null, testId], function (err) {
                if (err) console.error('Test 1 (null) FAILED:', err.message);
                else console.log('Test 1 (null) SUCCESS');
            });

            // Test 2: Update with undefined (might cause issues if not handled by driver)
            // SQLite3 driver usually expects values. Passing undefined might result in binding error.
            try {
                db.run(`UPDATE participants SET attention_check = ? WHERE id = ?`, [undefined, testId], function (err) {
                    if (err) console.error('Test 2 (undefined) FAILED (as expected?):', err.message);
                    else console.log('Test 2 (undefined) SUCCESS');
                });
            } catch (e) {
                console.error('Test 2 (undefined) THREW:', e.message);
            }

            // Test 3: Update with string
            db.run(`UPDATE participants SET attention_check = ? WHERE id = ?`, ["invalid", testId], function (err) {
                if (err) console.error('Test 3 (string) FAILED:', err.message);
                else console.log('Test 3 (string) SUCCESS (SQLite is loosely typed)');
            });
        }
    );
});
