import { Response } from 'express';
import { AuthenticatedRequest, CreateForumPostRequest, CreateForumReplyRequest, ShareMissionRequest, FollowUserRequest, ForumPostQuery, MissionShareQuery, LeaderboardQuery, SearchQuery } from '../types/community';
export declare const createForumPost: (req: CreateForumPostRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getForumPosts: (req: AuthenticatedRequest & {
    query: ForumPostQuery;
}, res: Response) => Promise<void>;
export declare const getForumPost: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const likeForumPost: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createForumReply: (req: CreateForumReplyRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const shareMission: (req: ShareMissionRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSharedMissions: (req: AuthenticatedRequest & {
    query: MissionShareQuery;
}, res: Response) => Promise<void>;
export declare const downloadMission: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const followUser: (req: FollowUserRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const unfollowUser: (req: FollowUserRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserCommunityStats: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCommunityLeaderboard: (req: AuthenticatedRequest & {
    query: LeaderboardQuery;
}, res: Response) => Promise<void>;
export declare const searchCommunity: (req: AuthenticatedRequest & {
    query: SearchQuery;
}, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=communityController.d.ts.map