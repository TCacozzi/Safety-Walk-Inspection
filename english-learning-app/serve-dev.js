// Servidor simples para desenvolvimento - sem cache!
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5174; // porta diferente para não conflitar
const SRC_DIR = path.join(__dirname, 'src');

const server = http.createServer((req, res) => {
  // Headers anti-cache agressivos
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');

  console.log(`📨 Requisição: ${req.url}`);

  if (req.url === '/' || req.url === '/index.html') {
    const indexPath = path.join(__dirname, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Servir arquivos estáticos
  let filePath = path.join(__dirname, req.url);

  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const ext = path.extname(filePath);
      const contentTypes = {
        '.js': 'application/javascript',
        '.jsx': 'application/javascript',
        '.ts': 'application/javascript',
        '.tsx': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.html': 'text/html',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Arquivo não encontrado: ' + req.url);
});

server.listen(PORT, () => {
  console.log(`\n✅ Servidor de desenvolvimento rodando!`);
  console.log(`📍 Abra no navegador: http://localhost:${PORT}/`);
  console.log(`\n⚠️  PRESSIONE Ctrl+Shift+R para recarregar sem cache!\n`);
});
