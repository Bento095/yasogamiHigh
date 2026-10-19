// Servidor sem dependências: só Node.js puro. Rode com: node server.js
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const PUB = path.join(__dirname, 'public');
const DB = path.join(__dirname, 'data', 'fichas.json');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
let visitas = 1337; // contador de visitantes (reinicia com o servidor)

fs.mkdirSync(path.dirname(DB), { recursive: true });
const load = () => { try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch { return []; } };
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj, null, 2)); };

http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (req.method === 'POST' && url === '/api/fichas') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try {
        const ficha = JSON.parse(body);
        ficha.id = Date.now().toString(36);
        ficha.enviadaEm = new Date().toISOString();
        const todas = load(); todas.push(ficha);
        fs.writeFileSync(DB, JSON.stringify(todas, null, 2));
        json(res, 201, { id: ficha.id });
      } catch { json(res, 400, { erro: 'Ficha inválida' }); }
    });
    return;
  }
  if (url === '/api/fichas') return json(res, 200, load());          // lista para o Narrador
  if (url === '/api/visitas') return json(res, 200, { visitas: ++visitas });
  const file = path.join(PUB, path.normalize(url === '/' ? '/index.html' : url));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 - Página em construção'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Yasogami High no ar: http://localhost:${PORT}`));
