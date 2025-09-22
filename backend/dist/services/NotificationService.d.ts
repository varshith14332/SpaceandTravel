import { Server as HTTPServer } from 'http';
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
export declare class NotificationService {
    private io;
    private connectedUsers;
    private userSockets;
    constructor(httpServer: HTTPServer);
    private setupAuthentication;
    private setupEventHandlers;
    private handleConnection;
    private handleDisconnection;
    private markNotificationAsRead;
    private getNotifications;
    private sendNotificationCount;
    private subscribeToISSAlerts;
    private unsubscribeFromISSAlerts;
    sendToUser(userId: string, event: string, data: any): Promise<void>;
    sendToAllUsers(event: string, data: any): Promise<void>;
    sendISSPassAlert(passData: ISS_Pass, userLocation?: {
        lat: number;
        lon: number;
    }): Promise<void>;
    sendMissionUpdate(userId: string, missionId: string, title: string, message: string): Promise<void>;
    sendAchievementNotification(userId: string, achievementId: string, achievementName: string): Promise<void>;
    sendSpaceWeatherAlert(alert: SpaceWeatherAlert): Promise<void>;
    sendTrainingReminder(userId: string, trainingName: string): Promise<void>;
    private startScheduledTasks;
    private processScheduledNotifications;
    private cleanupOldNotifications;
    private fetchISSPredictions;
    getConnectedUsersCount(): number;
    getUserStatus(userId: string): boolean;
}
export {};
//# sourceMappingURL=NotificationService.d.ts.map