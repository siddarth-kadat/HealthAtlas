import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Routes
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import alertsRoutes from './routes/alertsRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { ensureHealthStatQueryFields } from './utils/healthStatMaintenance.js';

console.log('Environment variables loaded.');
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);


async function startServer() {
  const app = express();
  const PORT = 5000;

  // Body parser
  app.use(express.json());
  app.use(cors());

  // MongoDB Connection
  const connectDB = async () => {
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
        return;
      }
      await mongoose.connect(uri);
      console.log('Successfully connected to MongoDB.');
      
      // Cleanup problematic indexes
      try {
        const db = mongoose.connection.db;
        const collection = db.collection('stories');
        
        // Drop problematic indexes
        try {
          await collection.dropIndex('publicSlug_1');
          console.log('✓ Dropped publicSlug_1 index');
        } catch (e) {
          // Index doesn't exist, that's fine
        }
      } catch (e) {
        console.log('Index cleanup skipped');
      }

      await ensureHealthStatQueryFields();
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err.message);
    }
  };
  await connectDB();

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/alerts', alertsRoutes);
  app.use('/api/stories', storyRoutes);
  app.use('/api/chat', chatRoutes);

  // API Routes
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

  // TODO: Add other API routes (auth, admin, dashboard, etc.)
  // app.use('/api/auth', authRoutes);
  // app.use('/api/admin', adminRoutes);

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../frontend/dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
