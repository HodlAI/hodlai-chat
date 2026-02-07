
const https = require('https');

const API_KEY = 'moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln';

const options = {
    hostname: 'www.moltbook.com',
    path: '/api/v1/feed',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'HodlAI-Bot/1.0'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const data = JSON.parse(body);
                console.log(JSON.stringify(data, null, 2));
            } catch (e) {
                console.error("Failed to parse JSON:", e);
                console.log("Raw body:", body);
            }
        } else {
            console.error(`Status: ${res.statusCode}`);
            console.log(body);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
