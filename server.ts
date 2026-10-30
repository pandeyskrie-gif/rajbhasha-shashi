import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';
const distPath = path.resolve(__dirname, 'dist');

// Health check endpoint for Cloud Run container lifecycle checks
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from Vite dist build
app.use(
  express.static(distPath, {
    maxAge: '1h',
    etag: true,
  })
);

// SPA fallback: route all other GET requests to index.html
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Application is compiling. Please refresh in a moment.');
  }
});

app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
