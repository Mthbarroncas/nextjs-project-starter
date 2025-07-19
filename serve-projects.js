const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Security: prevent directory traversal
  if (pathname.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Default to index.html if directory is requested
  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }
  
  // Build file path
  const filePath = path.join(__dirname, pathname);
  
  console.log(`Request: ${req.method} ${pathname}`);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 - Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #e74c3c; }
            .back-link { color: #3498db; text-decoration: none; }
          </style>
        </head>
        <body>
          <h1>404 - File Not Found</h1>
          <p>The requested file <code>${pathname}</code> was not found.</p>
          <a href="/" class="back-link">← Back to Home</a>
          <hr>
          <h3>Available Projects:</h3>
          <ul style="text-align: left; display: inline-block;">
            <li><a href="/projects/html/interactive-resume-builder/index.html">HTML: Interactive Resume Builder</a></li>
            <li><a href="/projects/css/advanced-animation-library/index.html">CSS: Advanced Animation Library</a></li>
            <li><a href="/projects/javascript/real-time-collaborative-editor/index.html">JavaScript: Collaborative Editor</a></li>
          </ul>
        </body>
        </html>
      `);
      return;
    }
    
    // Get file extension and MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      
      res.writeHead(200, { 
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Projects Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`\n📋 Available Projects:`);
  console.log(`   🌐 HTML: http://localhost:${PORT}/projects/html/interactive-resume-builder/index.html`);
  console.log(`   🎨 CSS:  http://localhost:${PORT}/projects/css/advanced-animation-library/index.html`);
  console.log(`   ⚡ JS:   http://localhost:${PORT}/projects/javascript/real-time-collaborative-editor/index.html`);
  console.log(`\n💡 Tip: Use Ctrl+C to stop the server`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
