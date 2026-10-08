const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const requested = clean === '/' ? '/index.html' : clean;
  const normalized = path.normalize(requested).replace(/^([.][.][/\\])+/, '');
  const full = path.join(PUBLIC_DIR, normalized);
  return full.startsWith(PUBLIC_DIR) ? full : null;
}

const server = http.createServer((req, res) => {
  let filePath = safePath(req.url || '/');
  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad request');
  }

  fs.stat(filePath, (statErr, stats) => {
    if (!statErr && stats.isDirectory()) filePath = path.join(filePath, 'index.html');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        const fallback = path.join(PUBLIC_DIR, '404.html');
        return fs.readFile(fallback, (fallbackErr, fallbackData) => {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(fallbackErr ? '<h1>Page not found</h1>' : fallbackData);
        });
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Free Flowing Financial Literacy is running at http://localhost:${PORT}`);
});
