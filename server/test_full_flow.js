const axios = require('axios');
const db = require('./database');

const API_URL = 'http://localhost:3001/api';
const participantId = 'test_user_' + Date.now();

async function runTest() {
    try {
        console.log('Starting Full Flow Test...');

        // Step 1 & 2: Consent & Demographics
        console.log('1. Submitting Demographics & Consent...');
        await axios.post(`${API_URL}/participants`, {
            id: participantId,
            age: 25,
            gender: 'Non-binary',
            ethnicity: 'Mixed',
            education: "Bachelor's Degree",
            language_fluency: 'Native',
            media_familiarity: 'Very Familiar',
            consent: true,
            contact_email: 'test@example.com'
        });
        console.log('   Success.');

        // Step 3: Attention Check
        console.log('2. Submitting Attention Check...');
        await axios.put(`${API_URL}/participants/${participantId}`, {
            attention_check: 10
        });
        console.log('   Success.');

        // Step 4: Ratings (Simulate 1 rating)
        console.log('3. Submitting Rating...');
        await axios.post(`${API_URL}/ratings`, {
            video_id: 1,
            participant_id: participantId,
            accuracy: 4,
            bias: 2,
            representativeness: 5,
            stereotypes: 1,
            comments: 'Test comment'
        });
        console.log('   Success.');

        // Step 5: Debrief
        console.log('4. Submitting Debrief...');
        await axios.put(`${API_URL}/participants/${participantId}`, {
            qualitative_feedback: 'Great study!',
            compensation_id: 'PROLIFIC_123'
        });
        console.log('   Success.');

        // Verify Database
        console.log('5. Verifying Database Content...');
        db.get('SELECT * FROM participants WHERE id = ?', [participantId], (err, row) => {
            if (err) {
                console.error('DB Error:', err);
            } else {
                console.log('   Participant Data:', row);
                if (
                    row.consent === 1 &&
                    row.contact_email === 'test@example.com' &&
                    row.language_fluency === 'Native' &&
                    row.media_familiarity === 'Very Familiar' &&
                    row.attention_check === 10 &&
                    row.qualitative_feedback === 'Great study!' &&
                    row.compensation_id === 'PROLIFIC_123'
                ) {
                    console.log('   VERIFICATION PASSED: All fields match.');
                } else {
                    console.error('   VERIFICATION FAILED: Data mismatch.');
                }
            }
        });

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

runTest();
