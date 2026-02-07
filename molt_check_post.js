
const https = require('https');

const API_KEY = 'moltbook_sk_Xngzvp9Uz4eSi3qRSgGeIWEJ9_fLz7ln';
const POST_ID = 'e9bbde68-6eb5-4491-a7d7-e89d46ee2a6c'; // MJ_Muin's post

const options = {
    hostname: 'www.moltbook.com',
    path: `/api/v1/posts/${POST_ID}`,
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
                // The API might return the post with a 'comments' array or just the post.
                // If it's just the post, we might need a separate endpoint for comments.
                // Based on previous knowledge, let's dump the structure.
                console.log(JSON.stringify(data, null, 2));
            } catch (e) {
                console.error("Failed to parse JSON:", e);
            }
        } else {
            console.log(`Status: ${res.statusCode}`);
            console.log(body);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
