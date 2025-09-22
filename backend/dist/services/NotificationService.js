"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Notification_1 = require("../models/Notification");
const logger_1 = require("../utils/logger");
const node_cron_1 = __importDefault(require("node-cron"));
class NotificationService {
    constructor(httpServer) {
        this.connectedUsers = new Map();
        this.userSockets = new Map();
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });
        this.setupAuthentication();
        this.setupEventHandlers();
        this.startScheduledTasks();
        logger_1.logger.info('Notification Service initialized with WebSocket support');
    }
    setupAuthentication() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
                const user = await User_1.User.findById(decoded.userId).select('username email isActive');
                if (!user || !user.isActive) {
                    return next(new Error('Invalid user or inactive account'));
                }
                socket.userId = user._id.toString();
                socket.username = user.username;
                next();
            }
            catch (error) {
                logger_1.logger.error('Socket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
            socket.on('disconnect', () => {
                this.handleDisconnection(socket);
            });
            socket.on('mark_notification_read', (notificationId) => {
                this.markNotificationAsRead(socket.userId, notificationId);
            });
            socket.on('get_notifications', (options) => {
                this.getNotifications(socket, options);
            });
            socket.on('subscribe_iss_alerts', () => {
                this.subscribeToISSAlerts(socket);
            });
            socket.on('unsubscribe_iss_alerts', () => {
                this.unsubscribeFromISSAlerts(socket);
            });
            socket.on('request_notification_count', () => {
                this.sendNotificationCount(socket);
            });
        });
    }
    handleConnection(socket) {
        if (!socket.userId)
            return;
        this.connectedUsers.set(socket.userId, socket.id);
        this.userSockets.set(socket.id, socket);
        socket.join(`user_${socket.userId}`);
        this.sendToUser(socket.userId, 'connection_established', {
            message: 'Real-time notifications connected',
            timestamp: new Date()
        });
        this.sendNotificationCount(socket);
        logger_1.logger.info(`User ${socket.username} connected to notifications (${socket.id})`);
    }
    handleDisconnection(socket) {
        if (!socket.userId)
            return;
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);
        logger_1.logger.info(`User ${socket.username} disconnected from notifications (${socket.id})`);
    }
    async markNotificationAsRead(userId, notificationId) {
        try {
            await Notification_1.Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true }, { new: true });
            this.sendToUser(userId, 'notification_marked_read', { notificationId });
            this.sendNotificationCount(this.userSockets.get(this.connectedUsers.get(userId)));
        }
        catch (error) {
            logger_1.logger.error('Error marking notification as read:', error);
        }
    }
    async getNotifications(socket, options) {
        try {
            const { limit = 20, offset = 0, unreadOnly = false } = options;
            const query = { userId: socket.userId };
            if (unreadOnly) {
                query.read = false;
            }
            const notifications = await Notification_1.Notification.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(offset)
                .lean();
            socket.emit('notifications_list', {
                notifications,
                hasMore: notifications.length === limit
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching notifications:', error);
            socket.emit('error', { message: 'Failed to fetch notifications' });
        }
    }
    async sendNotificationCount(socket) {
        if (!socket?.userId)
            return;
        try {
            const unreadCount = await Notification_1.Notification.countDocuments({
                userId: socket.userId,
                read: false
            });
            socket.emit('notification_count', { unreadCount });
        }
        catch (error) {
            logger_1.logger.error('Error sending notification count:', error);
        }
    }
    subscribeToISSAlerts(socket) {
        socket.join('iss_alerts');
        socket.emit('iss_alerts_subscribed', { status: 'subscribed' });
        logger_1.logger.info(`User ${socket.username} subscribed to ISS alerts`);
    }
    unsubscribeFromISSAlerts(socket) {
        socket.leave('iss_alerts');
        socket.emit('iss_alerts_unsubscribed', { status: 'unsubscribed' });
        logger_1.logger.info(`User ${socket.username} unsubscribed from ISS alerts`);
    }
    async sendToUser(userId, event, data) {
        this.io.to(`user_${userId}`).emit(event, data);
    }
    async sendToAllUsers(event, data) {
        this.io.emit(event, data);
    }
    async sendISSPassAlert(passData, userLocation) {
        this.io.to('iss_alerts').emit('iss_pass_alert', {
            ...passData,
            message: `ISS will be visible starting ${passData.startTime.toLocaleTimeString()}`,
            type: 'iss_pass'
        });
        const subscribedUsers = await User_1.User.find({
            'preferences.notifications.missionUpdates': true,
            isActive: true
        });
        for (const user of subscribedUsers) {
            await Notification_1.Notification.createISSPassNotification(user._id.toString(), passData.startTime, passData.duration, passData.maxElevation);
        }
    }
    async sendMissionUpdate(userId, missionId, title, message) {
        this.sendToUser(userId, 'mission_update', {
            missionId,
            title,
            message,
            timestamp: new Date(),
            type: 'mission_update'
        });
        await Notification_1.Notification.createMissionUpdateNotification(userId, missionId, title, message);
    }
    async sendAchievementNotification(userId, achievementId, achievementName) {
        this.sendToUser(userId, 'achievement_unlocked', {
            achievementId,
            achievementName,
            message: `Achievement unlocked: ${achievementName}`,
            timestamp: new Date(),
            type: 'achievement'
        });
        await Notification_1.Notification.createAchievementNotification(userId, achievementId, achievementName);
    }
    async sendSpaceWeatherAlert(alert) {
        this.sendToAllUsers('space_weather_alert', {
            ...alert,
            timestamp: new Date(),
            type: 'space_weather'
        });
        const interestedUsers = await User_1.User.find({
            'preferences.notifications.missionUpdates': true,
            isActive: true
        });
        for (const user of interestedUsers) {
            await Notification_1.Notification.createSpaceWeatherNotification(user._id.toString(), alert.severity, alert.region, alert.details);
        }
    }
    async sendTrainingReminder(userId, trainingName) {
        this.sendToUser(userId, 'training_reminder', {
            trainingName,
            message: `Time to continue your ${trainingName} training!`,
            timestamp: new Date(),
            type: 'training_reminder'
        });
        await Notification_1.Notification.createTrainingReminderNotification(userId, trainingName);
    }
    startScheduledTasks() {
        node_cron_1.default.schedule('* * * * *', async () => {
            await this.processScheduledNotifications();
        });
        node_cron_1.default.schedule('0 2 * * *', async () => {
            await this.cleanupOldNotifications();
        });
        node_cron_1.default.schedule('0 * * * *', async () => {
            await this.fetchISSPredictions();
        });
        logger_1.logger.info('Scheduled notification tasks started');
    }
    async processScheduledNotifications() {
        try {
            const scheduledNotifications = await Notification_1.Notification.find({
                scheduledFor: { $lte: new Date() },
                sentAt: { $exists: false }
            });
            for (const notification of scheduledNotifications) {
                this.sendToUser(notification.userId.toString(), 'scheduled_notification', {
                    id: notification._id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    priority: notification.priority,
                    actions: notification.actions,
                    timestamp: new Date()
                });
                notification.sentAt = new Date();
                await notification.save();
            }
        }
        catch (error) {
            logger_1.logger.error('Error processing scheduled notifications:', error);
        }
    }
    async cleanupOldNotifications() {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const result = await Notification_1.Notification.deleteMany({
                read: true,
                createdAt: { $lt: thirtyDaysAgo }
            });
            logger_1.logger.info(`Cleaned up ${result.deletedCount} old notifications`);
        }
        catch (error) {
            logger_1.logger.error('Error cleaning up notifications:', error);
        }
    }
    async fetchISSPredictions() {
        try {
            const now = new Date();
            const nextPass = new Date(now.getTime() + Math.random() * 4 * 60 * 60 * 1000);
            const passData = {
                startTime: nextPass,
                endTime: new Date(nextPass.getTime() + 6 * 60 * 1000),
                duration: 6,
                maxElevation: Math.floor(Math.random() * 70) + 10,
                direction: 'SW to NE'
            };
            if (passData.maxElevation > 30) {
                await this.sendISSPassAlert(passData);
            }
        }
        catch (error) {
            logger_1.logger.error('Error fetching ISS predictions:', error);
        }
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    getUserStatus(userId) {
        return this.connectedUsers.has(userId);
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map