import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';

const router = Router();

// Simple auth middleware placeholder
const authMiddleware = (req: any, res: any, next: any) => {
  // For demo purposes, we'll skip auth validation
  req.user = {
    _id: 'demo-user',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'admin'
  };
  next();
};

// Get analytics dashboard data
router.get('/', authMiddleware, AnalyticsController.getAnalytics);

// Get real-time analytics
router.get('/realtime', authMiddleware, AnalyticsController.getRealTimeAnalytics);

// Track user activity
router.post('/track', AnalyticsController.trackActivity);

// Generate analytics report
router.post('/report', authMiddleware, AnalyticsController.generateReport);

export default router;