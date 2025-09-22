import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { logger } from '../utils/logger';
import cron from 'node-cron';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

interface SocketData {
  userId: string;
  username: string;
}

interface ISS_Pass {
  startTime: Date;
  endTime: Date;
  duration: number;
  maxElevation: number;
  direction: string;
}

interface SpaceWeatherAlert {
  severity: 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme';
  region: string;
  details: string;
  startTime: Date;
  endTime?: Date;
}

export class NotificationService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userSockets: Map<string, AuthenticatedSocket> = new Map(); // socketId -> socket
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
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
    
    logger.info('Notification Service initialized with WebSocket support');
  }

  private setupAuthentication(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        const user = await User.findById(decoded.userId).select('username email isActive');
        
        if (!user || !user.isActive) {
          return next(new Error('Invalid user or inactive account'));
        }

        socket.userId = (user._id as mongoose.Types.ObjectId).toString();
        socket.username = user.username;
        
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
      
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });

      socket.on('mark_notification_read', (notificationId: string) => {
        this.markNotificationAsRead(socket.userId!, notificationId);
      });

      socket.on('get_notifications', (options: { limit?: number; offset?: number; unreadOnly?: boolean }) => {
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

  private handleConnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    this.connectedUsers.set(socket.userId, socket.id);
    this.userSockets.set(socket.id, socket);

    // Join user-specific room
    socket.join(`user_${socket.userId}`);
    
    // Send welcome notification
    this.sendToUser(socket.userId, 'connection_established', {
      message: 'Real-time notifications connected',
      timestamp: new Date()
    });

    // Send unread notification count
    this.sendNotificationCount(socket);

    logger.info(`User ${socket.username} connected to notifications (${socket.id})`);
  }

  private handleDisconnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    this.connectedUsers.delete(socket.userId);
    this.userSockets.delete(socket.id);

    logger.info(`User ${socket.username} disconnected from notifications (${socket.id})`);
  }

  private async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true },
        { new: true }
      );

      this.sendToUser(userId, 'notification_marked_read', { notificationId });
      this.sendNotificationCount(this.userSockets.get(this.connectedUsers.get(userId)!));
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  }

  private async getNotifications(socket: AuthenticatedSocket, options: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<void> {
    try {
      const { limit = 20, offset = 0, unreadOnly = false } = options;
      
      const query: any = { userId: socket.userId };
      if (unreadOnly) {
        query.read = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

      socket.emit('notifications_list', {
        notifications,
        hasMore: notifications.length === limit
      });
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      socket.emit('error', { message: 'Failed to fetch notifications' });
    }
  }

  private async sendNotificationCount(socket?: AuthenticatedSocket): Promise<void> {
    if (!socket?.userId) return;

    try {
      const unreadCount = await Notification.countDocuments({
        userId: socket.userId,
        read: false
      });

      socket.emit('notification_count', { unreadCount });
    } catch (error) {
      logger.error('Error sending notification count:', error);
    }
  }

  private subscribeToISSAlerts(socket: AuthenticatedSocket): void {
    socket.join('iss_alerts');
    socket.emit('iss_alerts_subscribed', { status: 'subscribed' });
    logger.info(`User ${socket.username} subscribed to ISS alerts`);
  }

  private unsubscribeFromISSAlerts(socket: AuthenticatedSocket): void {
    socket.leave('iss_alerts');
    socket.emit('iss_alerts_unsubscribed', { status: 'unsubscribed' });
    logger.info(`User ${socket.username} unsubscribed from ISS alerts`);
  }

  // Public methods for sending notifications
  public async sendToUser(userId: string, event: string, data: any): Promise<void> {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  public async sendToAllUsers(event: string, data: any): Promise<void> {
    this.io.emit(event, data);
  }

  public async sendISSPassAlert(passData: ISS_Pass, userLocation?: { lat: number; lon: number }): Promise<void> {
    // Send to all users subscribed to ISS alerts
    this.io.to('iss_alerts').emit('iss_pass_alert', {
      ...passData,
      message: `ISS will be visible starting ${passData.startTime.toLocaleTimeString()}`,
      type: 'iss_pass'
    });

    // Create notifications for subscribed users
    const subscribedUsers = await User.find({
      'preferences.notifications.missionUpdates': true,
      isActive: true
    });

    for (const user of subscribedUsers) {
      await Notification.createISSPassNotification(
        (user._id as mongoose.Types.ObjectId).toString(),
        passData.startTime,
        passData.duration,
        passData.maxElevation
      );
    }
  }

  public async sendMissionUpdate(userId: string, missionId: string, title: string, message: string): Promise<void> {
    // Send real-time update
    this.sendToUser(userId, 'mission_update', {
      missionId,
      title,
      message,
      timestamp: new Date(),
      type: 'mission_update'
    });

    // Create persistent notification
    await Notification.createMissionUpdateNotification(userId, missionId, title, message);
  }

  public async sendAchievementNotification(userId: string, achievementId: string, achievementName: string): Promise<void> {
    // Send real-time update
    this.sendToUser(userId, 'achievement_unlocked', {
      achievementId,
      achievementName,
      message: `Achievement unlocked: ${achievementName}`,
      timestamp: new Date(),
      type: 'achievement'
    });

    // Create persistent notification
    await Notification.createAchievementNotification(userId, achievementId, achievementName);
  }

  public async sendSpaceWeatherAlert(alert: SpaceWeatherAlert): Promise<void> {
    // Send to all users
    this.sendToAllUsers('space_weather_alert', {
      ...alert,
      timestamp: new Date(),
      type: 'space_weather'
    });

    // Create notifications for users who want space weather alerts
    const interestedUsers = await User.find({
      'preferences.notifications.missionUpdates': true,
      isActive: true
    });

    for (const user of interestedUsers) {
      await Notification.createSpaceWeatherNotification(
        (user._id as mongoose.Types.ObjectId).toString(),
        alert.severity,
        alert.region,
        alert.details
      );
    }
  }

  public async sendTrainingReminder(userId: string, trainingName: string): Promise<void> {
    this.sendToUser(userId, 'training_reminder', {
      trainingName,
      message: `Time to continue your ${trainingName} training!`,
      timestamp: new Date(),
      type: 'training_reminder'
    });

    await Notification.createTrainingReminderNotification(userId, trainingName);
  }

  private startScheduledTasks(): void {
    // Check for scheduled notifications every minute
    cron.schedule('* * * * *', async () => {
      await this.processScheduledNotifications();
    });

    // Clean up old notifications daily
    cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    });

    // Fetch ISS pass predictions every hour
    cron.schedule('0 * * * *', async () => {
      await this.fetchISSPredictions();
    });

    logger.info('Scheduled notification tasks started');
  }

  private async processScheduledNotifications(): Promise<void> {
    try {
      const scheduledNotifications = await Notification.find({
        scheduledFor: { $lte: new Date() },
        sentAt: { $exists: false }
      });

      for (const notification of scheduledNotifications) {
        // Send real-time notification
        this.sendToUser(notification.userId.toString(), 'scheduled_notification', {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          actions: notification.actions,
          timestamp: new Date()
        });

        // Mark as sent
        notification.sentAt = new Date();
        await notification.save();
      }
    } catch (error) {
      logger.error('Error processing scheduled notifications:', error);
    }
  }

  private async cleanupOldNotifications(): Promise<void> {
    try {
      // Remove read notifications older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await Notification.deleteMany({
        read: true,
        createdAt: { $lt: thirtyDaysAgo }
      });

      logger.info(`Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
      logger.error('Error cleaning up notifications:', error);
    }
  }

  private async fetchISSPredictions(): Promise<void> {
    try {
      // This would integrate with a real ISS tracking API
      // For now, we'll simulate ISS pass predictions
      const now = new Date();
      const nextPass = new Date(now.getTime() + Math.random() * 4 * 60 * 60 * 1000); // Random time in next 4 hours
      
      const passData: ISS_Pass = {
        startTime: nextPass,
        endTime: new Date(nextPass.getTime() + 6 * 60 * 1000), // 6 minute pass
        duration: 6,
        maxElevation: Math.floor(Math.random() * 70) + 10, // 10-80 degrees
        direction: 'SW to NE'
      };

      // Only send if pass is significant (high elevation)
      if (passData.maxElevation > 30) {
        await this.sendISSPassAlert(passData);
      }
    } catch (error) {
      logger.error('Error fetching ISS predictions:', error);
    }
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getUserStatus(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}