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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const badgeSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: {
        type: String,
        enum: ['mission', 'learning', 'community', 'achievement'],
        required: true
    },
    earnedAt: { type: Date, default: Date.now },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    }
});
const missionProgressSchema = new mongoose_1.Schema({
    missionId: { type: String, required: true },
    missionName: { type: String, required: true },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'failed'],
        default: 'not_started'
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    score: { type: Number },
    attempts: { type: Number, default: 0 },
    bestScore: { type: Number },
    timeSpent: { type: Number, default: 0 }
});
const learningProgressSchema = new mongoose_1.Schema({
    topicId: { type: String, required: true },
    topicName: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    score: { type: Number },
    timeSpent: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
    quizResults: [{
            quizId: { type: String, required: true },
            score: { type: Number, required: true },
            completedAt: { type: Date, default: Date.now },
            timeSpent: { type: Number, required: true }
        }]
});
const userStatsSchema = new mongoose_1.Schema({
    totalMissionsCompleted: { type: Number, default: 0 },
    totalLearningHoursSpent: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    joinedAt: { type: Date, default: Date.now },
    level: { type: Number, default: 1 },
    experiencePoints: { type: Number, default: 0 },
    nextLevelXP: { type: Number, default: 100 }
});
const userPreferencesSchema = new mongoose_1.Schema({
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    notifications: {
        missionUpdates: { type: Boolean, default: true },
        learningReminders: { type: Boolean, default: true },
        achievementAlerts: { type: Boolean, default: true },
        communityActivity: { type: Boolean, default: false },
        weeklyDigest: { type: Boolean, default: true }
    },
    privacy: {
        profileVisible: { type: Boolean, default: true },
        shareProgress: { type: Boolean, default: true },
        allowFriendRequests: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
});
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: { type: String, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50 },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 100 },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    badges: [badgeSchema],
    missionsProgress: [missionProgressSchema],
    learningProgress: [learningProgressSchema],
    stats: { type: userStatsSchema, default: () => ({}) },
    preferences: { type: userPreferencesSchema, default: () => ({}) },
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: {
        sent: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
        received: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }]
    },
    lastLoginAt: { type: Date },
}, {
    timestamps: true
});
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'stats.level': 1 });
userSchema.index({ 'stats.totalPoints': -1 });
userSchema.index({ createdAt: -1 });
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password)
        return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.calculateLevel = function () {
    const xp = this.stats.experiencePoints;
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};
userSchema.methods.addExperience = function (points) {
    this.stats.experiencePoints += points;
    this.stats.totalPoints += points;
    const newLevel = this.calculateLevel();
    const leveledUp = newLevel > this.stats.level;
    this.stats.level = newLevel;
    this.stats.nextLevelXP = Math.pow(newLevel, 2) * 100;
    if (leveledUp) {
        this.earnBadge({
            id: `level_${newLevel}`,
            name: `Level ${newLevel}`,
            description: `Reached level ${newLevel}`,
            icon: 'star',
            category: 'achievement',
            rarity: newLevel >= 10 ? 'epic' : newLevel >= 5 ? 'rare' : 'common'
        });
    }
};
userSchema.methods.earnBadge = function (badge) {
    const existingBadge = this.badges.find((b) => b.id === badge.id);
    if (!existingBadge) {
        this.badges.push({
            ...badge,
            earnedAt: new Date()
        });
    }
};
userSchema.methods.updateMissionProgress = function (missionId, progress) {
    const existingProgress = this.missionsProgress.find((m) => m.missionId === missionId);
    if (existingProgress) {
        Object.assign(existingProgress, progress);
    }
    else {
        this.missionsProgress.push({
            missionId,
            missionName: progress.missionName || 'Unknown Mission',
            status: 'not_started',
            progress: 0,
            attempts: 0,
            timeSpent: 0,
            ...progress
        });
    }
    if (progress.status === 'completed') {
        this.stats.totalMissionsCompleted += 1;
        this.addExperience(50);
    }
};
userSchema.methods.updateLearningProgress = function (topicId, progress) {
    const existingProgress = this.learningProgress.find((l) => l.topicId === topicId);
    if (existingProgress) {
        Object.assign(existingProgress, progress);
        existingProgress.lastAccessed = new Date();
    }
    else {
        this.learningProgress.push({
            topicId,
            topicName: progress.topicName || 'Unknown Topic',
            category: progress.category || 'general',
            difficulty: progress.difficulty || 'beginner',
            progress: 0,
            completed: false,
            timeSpent: 0,
            lastAccessed: new Date(),
            quizResults: [],
            ...progress
        });
    }
    if (progress.completed && !existingProgress?.completed) {
        this.addExperience(25);
    }
    if (progress.timeSpent) {
        this.stats.totalLearningHoursSpent += progress.timeSpent / 60;
    }
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map