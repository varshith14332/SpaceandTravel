import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import analyticsRoutes from './routes/analyticsRoutes';
import missionRoutes from './routes/missionRoutes';
import trainingRoutes from './routes/trainingRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import communityRoutes from './routes/communityRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/community', communityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Space Mission Platform API is running' });
});

// Basic error handling
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
