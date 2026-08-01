import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initDatabase, getDatabaseStatus, setDatabaseUrl } from './src/config/database.js';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import rideRoutes from './src/routes/rideRoutes.js';
import requestRoutes from './src/routes/requestRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  await initDatabase();

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/rides', rideRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/db-status', (req, res) => {
    res.json({ success: true, ...getDatabaseStatus() });
  });

  app.post('/api/db-config', async (req, res) => {
    try {
      const { databaseUrl } = req.body;
      if (!databaseUrl) {
        return res.status(400).json({ success: false, message: 'Database connection URL is required.' });
      }

      const status = await setDatabaseUrl(databaseUrl);
      return res.status(200).json({
        success: true,
        message: 'Successfully connected and synchronized with Supabase PostgreSQL Database!',
        status
      });
    } catch (err) {
      console.error('Database connection setup error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to Supabase: ' + (err.message || 'Check database credentials.')
      });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

  // Vite Middleware for Development / Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
