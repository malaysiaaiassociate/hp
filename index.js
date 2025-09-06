
const { createServer } = require('http');
const { parse } = require('url');
const { join, extname } = require('path');
const fs = require('fs');

const port = process.env.PORT || 5000;
const demoPath = join(__dirname, 'demo', 'typescript');

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  let pathname = parsedUrl.pathname;

  console.log('Request:', pathname);

  // Set CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // Serve index.html for root request
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Determine file path
  let filePath;

  if (pathname.startsWith('/demo/')) {
    // Handle demo/* paths - serve from root directory
    filePath = join(__dirname, pathname.substring(1));
  } else if (pathname.startsWith('/../')) {
    // Handle relative paths like /../favicon.ico
    const relativePath = pathname.substring(3); // Remove /../
    filePath = join(__dirname, relativePath);
  } else if (pathname.startsWith('/dist/')) {
    // Handle dist/* paths - serve from root directory
    filePath = join(__dirname, pathname.substring(1));
  } else if (pathname.startsWith('/assets/')) {
    // Handle assets/* paths - serve from root directory
    filePath = join(__dirname, pathname.substring(1));
  } else if (pathname === '/favicon.ico') {
    // Handle favicon from root directory
    filePath = join(__dirname, 'favicon.ico');
  } else {
    // Default: serve from demo/typescript directory
    filePath = join(demoPath, pathname.substring(1));
  }

  console.log('Serving file:', filePath);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log('File not found:', filePath);
      res.writeHead(404, { ...corsHeaders, 'Content-Type': 'text/plain' });
      res.end('File not found: ' + pathname);
      return;
    }

    // Get file extension and set content type
    const ext = extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
      '.ttf': 'font/ttf',
      '.webmanifest': 'application/manifest+json',
      '.bin': 'application/octet-stream'
    };

    const contentType = contentTypes[ext] || 'text/plain';

    // Set response headers
    const headers = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    };

    res.writeHead(200, headers);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (streamErr) => {
      console.error('Stream error:', streamErr);
      if (!res.headersSent) {
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'text/plain' });
        res.end('Internal server error');
      }
    });

    fileStream.pipe(res);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`TypeScript Demo Server running at http://0.0.0.0:${port}`);
  console.log(`Visit: http://0.0.0.0:${port}`);
});

