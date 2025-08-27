const http = require('http');

console.log('🧪 Testing Cloudflare Worker locally...');

const options = {
    hostname: '127.0.0.1',
    port: 8787,
    path: '/',
    method: 'GET',
    headers: {
        'User-Agent': 'Test-Script'
    }
};

const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`📄 Response (first 500 chars):`, data.substring(0, 500));
        if (data.length > 500) {
            console.log(`... (truncated, total length: ${data.length})`);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.end();
