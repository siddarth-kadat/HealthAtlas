import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import alertsRoutes from './routes/alertsRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { ensureHealthStatQueryFields } from './utils/healthStatMaintenance.js';

dotenv.config();

console.log('Environment variables loaded.');
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined.');
    }

    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB.');

    // Cleanup problematic indexes
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('stories');

      try {
        await collection.dropIndex('publicSlug_1');
        console.log('✓ Dropped publicSlug_1 index');
      } catch (e) {
        console.log('Index cleanup skipped');
      }
    } catch (e) {
      console.log('Index cleanup skipped');
    }

    await ensureHealthStatQueryFields();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/chat', chatRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;

  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: 'ok',
    database: dbStatusMap[dbStatus] || 'unknown',
    mongodb_uri_set: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'HealthAtlas Backend Running'
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();