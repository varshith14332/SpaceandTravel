"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const router = (0, express_1.Router)();
const authMiddleware = (req, res, next) => {
    req.user = {
        _id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'admin'
    };
    next();
};
router.get('/', authMiddleware, analyticsController_1.AnalyticsController.getAnalytics);
router.get('/realtime', authMiddleware, analyticsController_1.AnalyticsController.getRealTimeAnalytics);
router.post('/track', analyticsController_1.AnalyticsController.trackActivity);
router.post('/report', authMiddleware, analyticsController_1.AnalyticsController.generateReport);
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map