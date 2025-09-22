import { Request, Response } from 'express';
export declare const registerUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const loginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateUserProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserProgress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateMissionProgress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateLearningProgress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const awardBadge: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLeaderboard: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const searchUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=userController.d.ts.map