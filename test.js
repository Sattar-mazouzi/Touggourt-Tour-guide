const http = require('http');

const options = {
  hostname: 'overpass-api.de',
  port: 80,
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log("Status:", res.statusCode, body.substring(0, 300)));
});

req.on('error', e => console.error(e));
req.write('data=[out:json];node(33.02,5.92,33.18,6.08)["amenity"="restaurant"];out center;');
req.end();
