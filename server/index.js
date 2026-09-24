import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { api } from './routes/api.js';
import { initStore } from './services/store.js';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, '../.env') });
dotenv.config({ path: path.join(here, '.env') });

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', api);

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(here, '../client/dist');
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong. Please try again.' : error.message });
});

const port = Number(process.env.PORT || 4000);

initStore()
  .then(() => {
    app.listen(port, () => {
      console.log(`STOP&GO API on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('STOP&GO failed to start', error);
    process.exit(1);
  });
