import { Request, Response } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        email: string;
        name: string;
        role: string;
    };
    sessionID?: string;
}
export declare class AnalyticsController {
    static getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getRealTimeAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
    static trackActivity(req: AuthenticatedRequest, res: Response): Promise<void>;
    static generateReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    private static getCurrentActiveUsers;
    private static generateMockAnalytics;
    private static getDailyTrends;
    private static getTopPerformers;
    private static getContentPopularity;
    private static getUserBehaviorPatterns;
    private static convertToCSV;
}
//# sourceMappingURL=analyticsController.d.ts.map