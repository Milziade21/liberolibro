// Server statico minimo per Railway. Nessuna dipendenza: solo moduli nativi di Node.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8642;
const TIPI = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(__dirname, path.normalize(p));
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end('403'); } // no path traversal

  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'content-type': TIPI[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`LiberoLibro in ascolto su :${PORT}`));
