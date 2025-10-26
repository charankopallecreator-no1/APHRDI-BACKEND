const http = require('http');

const URL = process.env.HEALTH_URL || 'http://localhost:5000/health';
const TIMEOUT = 10000; // 10s

function run() {
  const req = http.get(URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(data);
        process.exit(0);
      }
      console.error('Health check failed:', res.statusCode, data);
      process.exit(1);
    });
  });

  req.on('error', (err) => {
    console.error('Health check error:', err.message);
    process.exit(1);
  });

  req.setTimeout(TIMEOUT, () => {
    console.error('Health check timeout');
    req.abort();
    process.exit(1);
  });
}

run();
