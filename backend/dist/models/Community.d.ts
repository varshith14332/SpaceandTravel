import mongoose, { Document } from 'mongoose';
export interface IForumPost extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    category: 'general' | 'missions' | 'technical' | 'achievements' | 'help';
    tags: string[];
    likes: mongoose.Types.ObjectId[];
    views: number;
    replies: mongoose.Types.ObjectId[];
    isPinned: boolean;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IForumReply extends Document {
    _id: mongoose.Types.ObjectId;
    content: string;
    author: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    parentReply?: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export interface IMissionShare extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    author: mongoose.Types.ObjectId;
    missionData: {
        missionType: string;
        targetOrbit: {
            altitude: number;
            inclination: number;
            eccentricity: number;
        };
        payload: number;
        fuel: number;
        launchSite: string;
        engine: string;
        results?: {
            success: boolean;
            score: number;
            deltaV: number;
            fuelConsumption: number;
            orbitAccuracy: number;
        };
    };
    likes: mongoose.Types.ObjectId[];
    downloads: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    tags: string[];
    comments: mongoose.Types.ObjectId[];
    isPublic: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserFollow extends Document {
    _id: mongoose.Types.ObjectId;
    follower: mongoose.Types.ObjectId;
    following: mongoose.Types.ObjectId;
    createdAt: Date;
}
export interface ICommunityAchievement extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    icon: string;
    type: 'forum' | 'mission' | 'social' | 'special';
    requirements: {
        postsCount?: number;
        likesReceived?: number;
        missionsShared?: number;
        followersCount?: number;
        helpfulReplies?: number;
    };
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
    createdAt: Date;
}
export interface IUserCommunityStats extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    stats: {
        postsCount: number;
        repliesCount: number;
        likesGiven: number;
        likesReceived: number;
        missionsShared: number;
        followersCount: number;
        followingCount: number;
        helpfulReplies: number;
        reputation: number;
    };
    achievements: mongoose.Types.ObjectId[];
    badges: string[];
    lastActive: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ForumPost: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const ForumReply: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const MissionShare: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const UserFollow: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const CommunityAchievement: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const UserCommunityStats: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=Community.d.ts.map