const http = require('http');

const postData = JSON.stringify({
    id: 'test_user_' + Date.now(),
    age: 25,
    gender: 'Test',
    ethnicity: 'Test',
    education: 'Test'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/participants',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log("Creating participant...");
const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(`BODY: ${data}`);
        const participantId = JSON.parse(data).data;

        if (participantId) {
            updateAttentionCheck(participantId);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();

function updateAttentionCheck(id) {
    console.log(`Updating attention check for ${id}...`);
    const putData = JSON.stringify({
        attention_check: 4
    });

    const putOptions = {
        hostname: 'localhost',
        port: 3001,
        path: `/api/participants/${id}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(putData)
        }
    };

    const putReq = http.request(putOptions, (res) => {
        console.log(`PUT STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`PUT BODY: ${data}`);
        });
    });

    putReq.on('error', (e) => {
        console.error(`problem with PUT request: ${e.message}`);
    });

    putReq.write(putData);
    putReq.end();
}
