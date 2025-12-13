const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
const ADMIN_PASSWORD = 'admin123'; // Matches .env

async function runTests() {
    console.log('Starting Security Verification...');

    // 1. Test Login
    let token;
    try {
        console.log('Testing Login...');
        const res = await axios.post(`${API_URL}/login`, { password: ADMIN_PASSWORD });
        token = res.data.accessToken;
        console.log('✅ Login successful. Token received.');
    } catch (err) {
        console.error('❌ Login failed:', err.response ? err.response.data : err.message);
        process.exit(1);
    }

    // 2. Test Protected Route (Participants) - Success
    try {
        console.log('Testing Protected Route (Participants) with Token...');
        await axios.get(`${API_URL}/participants`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Access granted to protected route.');
    } catch (err) {
        console.error('❌ Access denied with valid token:', err.response ? err.response.data : err.message);
    }

    // 3. Test Protected Route (Participants) - Failure (No Token)
    try {
        console.log('Testing Protected Route (Participants) without Token...');
        await axios.get(`${API_URL}/participants`);
        console.error('❌ Access granted without token! (SECURITY FAIL)');
    } catch (err) {
        if (err.response && err.response.status === 401) {
            console.log('✅ Access denied without token (401).');
        } else {
            console.error('❌ Unexpected error:', err.message);
        }
    }

    // 4. Test Protected Route (Ratings) - Failure (Bad Token)
    try {
        console.log('Testing Protected Route (Ratings) with Bad Token...');
        await axios.get(`${API_URL}/ratings`, {
            headers: { Authorization: `Bearer bad_token` }
        });
        console.error('❌ Access granted with bad token! (SECURITY FAIL)');
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.log('✅ Access denied with bad token (403).');
        } else {
            console.error('❌ Unexpected error:', err.message);
        }
    }
}

runTests();
