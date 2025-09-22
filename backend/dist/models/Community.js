"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCommunityStats = exports.CommunityAchievement = exports.UserFollow = exports.MissionShare = exports.ForumReply = exports.ForumPost = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const forumPostSchema = new mongoose_1.Schema({
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 10000 },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
        type: String,
        enum: ['general', 'missions', 'technical', 'achievements', 'help'],
        default: 'general'
    },
    tags: [{ type: String, maxlength: 30 }],
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    replies: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ForumReply' }],
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const forumReplySchema = new mongoose_1.Schema({
    content: { type: String, required: true, maxlength: 5000 },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ForumPost', required: true },
    parentReply: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ForumReply' },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const missionShareSchema = new mongoose_1.Schema({
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    missionData: {
        missionType: { type: String, required: true },
        targetOrbit: {
            altitude: { type: Number, required: true },
            inclination: { type: Number, required: true },
            eccentricity: { type: Number, required: true }
        },
        payload: { type: Number, required: true },
        fuel: { type: Number, required: true },
        launchSite: { type: String, required: true },
        engine: { type: String, required: true },
        results: {
            success: Boolean,
            score: Number,
            deltaV: Number,
            fuelConsumption: Number,
            orbitAccuracy: Number
        }
    },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    downloads: { type: Number, default: 0 },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'medium'
    },
    tags: [{ type: String, maxlength: 30 }],
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ForumReply' }],
    isPublic: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const userFollowSchema = new mongoose_1.Schema({
    follower: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});
const communityAchievementSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    type: {
        type: String,
        enum: ['forum', 'mission', 'social', 'special'],
        required: true
    },
    requirements: {
        postsCount: Number,
        likesReceived: Number,
        missionsShared: Number,
        followersCount: Number,
        helpfulReplies: Number
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    points: { type: Number, default: 10 }
}, {
    timestamps: true
});
const userCommunityStatsSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    stats: {
        postsCount: { type: Number, default: 0 },
        repliesCount: { type: Number, default: 0 },
        likesGiven: { type: Number, default: 0 },
        likesReceived: { type: Number, default: 0 },
        missionsShared: { type: Number, default: 0 },
        followersCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        helpfulReplies: { type: Number, default: 0 },
        reputation: { type: Number, default: 0 }
    },
    achievements: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'CommunityAchievement' }],
    badges: [String],
    lastActive: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ likes: 1 });
forumPostSchema.index({ views: -1 });
forumReplySchema.index({ postId: 1, createdAt: 1 });
forumReplySchema.index({ author: 1, createdAt: -1 });
forumReplySchema.index({ parentReply: 1 });
missionShareSchema.index({ author: 1, createdAt: -1 });
missionShareSchema.index({ difficulty: 1, likes: -1 });
missionShareSchema.index({ tags: 1 });
missionShareSchema.index({ downloads: -1 });
missionShareSchema.index({ isPublic: 1, isVerified: 1 });
userFollowSchema.index({ follower: 1, following: 1 }, { unique: true });
userFollowSchema.index({ follower: 1 });
userFollowSchema.index({ following: 1 });
userCommunityStatsSchema.index({ userId: 1 }, { unique: true });
userCommunityStatsSchema.index({ 'stats.reputation': -1 });
forumPostSchema.virtual('likesCount').get(function () {
    return this.likes?.length || 0;
});
forumPostSchema.virtual('repliesCount').get(function () {
    return this.replies?.length || 0;
});
forumReplySchema.virtual('likesCount').get(function () {
    return this.likes?.length || 0;
});
missionShareSchema.virtual('likesCount').get(function () {
    return this.likes?.length || 0;
});
missionShareSchema.virtual('commentsCount').get(function () {
    return this.comments?.length || 0;
});
forumPostSchema.post('save', async function () {
    if (this.isNew) {
        await mongoose_1.default.model('UserCommunityStats').findOneAndUpdate({ userId: this.author }, {
            $inc: { 'stats.postsCount': 1 },
            $set: { lastActive: new Date() }
        }, { upsert: true });
    }
});
forumReplySchema.post('save', async function () {
    if (this.isNew) {
        await mongoose_1.default.model('UserCommunityStats').findOneAndUpdate({ userId: this.author }, {
            $inc: { 'stats.repliesCount': 1 },
            $set: { lastActive: new Date() }
        }, { upsert: true });
    }
});
missionShareSchema.post('save', async function () {
    if (this.isNew) {
        await mongoose_1.default.model('UserCommunityStats').findOneAndUpdate({ userId: this.author }, {
            $inc: { 'stats.missionsShared': 1 },
            $set: { lastActive: new Date() }
        }, { upsert: true });
    }
});
forumPostSchema.statics.getPopularPosts = function (limit = 10) {
    return this.find({ isLocked: false })
        .sort({ views: -1, likes: -1 })
        .limit(limit)
        .populate('author', 'username avatar')
        .populate('replies', 'content author createdAt');
};
forumPostSchema.statics.getRecentPosts = function (category, limit = 20) {
    const query = category ? { category, isLocked: false } : { isLocked: false };
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author', 'username avatar')
        .populate('replies', 'content author createdAt');
};
missionShareSchema.statics.getPopularMissions = function (limit = 10) {
    return this.find({ isPublic: true })
        .sort({ likes: -1, downloads: -1 })
        .limit(limit)
        .populate('author', 'username avatar');
};
missionShareSchema.statics.getMissionsByDifficulty = function (difficulty, limit = 20) {
    return this.find({ difficulty, isPublic: true })
        .sort({ likes: -1 })
        .limit(limit)
        .populate('author', 'username avatar');
};
exports.ForumPost = mongoose_1.default.models.ForumPost || mongoose_1.default.model('ForumPost', forumPostSchema);
exports.ForumReply = mongoose_1.default.models.ForumReply || mongoose_1.default.model('ForumReply', forumReplySchema);
exports.MissionShare = mongoose_1.default.models.MissionShare || mongoose_1.default.model('MissionShare', missionShareSchema);
exports.UserFollow = mongoose_1.default.models.UserFollow || mongoose_1.default.model('UserFollow', userFollowSchema);
exports.CommunityAchievement = mongoose_1.default.models.CommunityAchievement || mongoose_1.default.model('CommunityAchievement', communityAchievementSchema);
exports.UserCommunityStats = mongoose_1.default.models.UserCommunityStats || mongoose_1.default.model('UserCommunityStats', userCommunityStatsSchema);
//# sourceMappingURL=Community.js.map