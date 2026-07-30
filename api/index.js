import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase, getDatabaseStatus, setDatabaseUrl } from '../src/config/database.js';

import authRoutes from '../src/routes/authRoutes.js';
import userRoutes from '../src/routes/userRoutes.js';
import rideRoutes from '../src/routes/rideRoutes.js';
import requestRoutes from '../src/routes/requestRoutes.js';
import adminRoutes from '../src/routes/adminRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy Database Initialization
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      console.log('[Serverless] Initializing database...');
      await initDatabase();
      dbInitialized = true;
      console.log('[Serverless] Database initialized successfully.');
    } catch (err) {
      console.error('[Serverless] Database initialization failed:', err);
    }
  }
  next();
});

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

export default app;
