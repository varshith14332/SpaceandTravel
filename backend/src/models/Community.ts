import mongoose, { Document, Schema } from 'mongoose';

// Forum Post Interface
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

// Forum Reply Interface
export interface IForumReply extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  parentReply?: mongoose.Types.ObjectId; // For nested replies
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Mission Share Interface
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
  isVerified: boolean; // Verified by moderators
  createdAt: Date;
  updatedAt: Date;
}

// User Follow System Interface
export interface IUserFollow extends Document {
  _id: mongoose.Types.ObjectId;
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Community Achievement Interface
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

// User Community Stats Interface
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

// Forum Post Schema
const forumPostSchema = new Schema<IForumPost>({
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 10000 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['general', 'missions', 'technical', 'achievements', 'help'],
    default: 'general'
  },
  tags: [{ type: String, maxlength: 30 }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  replies: [{ type: Schema.Types.ObjectId, ref: 'ForumReply' }],
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Forum Reply Schema
const forumReplySchema = new Schema<IForumReply>({
  content: { type: String, required: true, maxlength: 5000 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'ForumPost', required: true },
  parentReply: { type: Schema.Types.ObjectId, ref: 'ForumReply' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Mission Share Schema
const missionShareSchema = new Schema<IMissionShare>({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downloads: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  tags: [{ type: String, maxlength: 30 }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'ForumReply' }],
  isPublic: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// User Follow Schema
const userFollowSchema = new Schema<IUserFollow>({
  follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Community Achievement Schema
const communityAchievementSchema = new Schema<ICommunityAchievement>({
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

// User Community Stats Schema
const userCommunityStatsSchema = new Schema<IUserCommunityStats>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
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
  achievements: [{ type: Schema.Types.ObjectId, ref: 'CommunityAchievement' }],
  badges: [String],
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
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

// Virtual fields
forumPostSchema.virtual('likesCount').get(function() {
  return this.likes?.length || 0;
});

forumPostSchema.virtual('repliesCount').get(function() {
  return this.replies?.length || 0;
});

forumReplySchema.virtual('likesCount').get(function() {
  return this.likes?.length || 0;
});

missionShareSchema.virtual('likesCount').get(function() {
  return this.likes?.length || 0;
});

missionShareSchema.virtual('commentsCount').get(function() {
  return this.comments?.length || 0;
});

// Pre-save middleware to update user stats
forumPostSchema.post('save', async function() {
  if (this.isNew) {
    await mongoose.model('UserCommunityStats').findOneAndUpdate(
      { userId: this.author },
      { 
        $inc: { 'stats.postsCount': 1 },
        $set: { lastActive: new Date() }
      },
      { upsert: true }
    );
  }
});

forumReplySchema.post('save', async function() {
  if (this.isNew) {
    await mongoose.model('UserCommunityStats').findOneAndUpdate(
      { userId: this.author },
      { 
        $inc: { 'stats.repliesCount': 1 },
        $set: { lastActive: new Date() }
      },
      { upsert: true }
    );
  }
});

missionShareSchema.post('save', async function() {
  if (this.isNew) {
    await mongoose.model('UserCommunityStats').findOneAndUpdate(
      { userId: this.author },
      { 
        $inc: { 'stats.missionsShared': 1 },
        $set: { lastActive: new Date() }
      },
      { upsert: true }
    );
  }
});

// Static methods for forum posts
forumPostSchema.statics.getPopularPosts = function(limit = 10) {
  return this.find({ isLocked: false })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .populate('author', 'username avatar')
    .populate('replies', 'content author createdAt');
};

forumPostSchema.statics.getRecentPosts = function(category?: string, limit = 20) {
  const query = category ? { category, isLocked: false } : { isLocked: false };
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'username avatar')
    .populate('replies', 'content author createdAt');
};

// Static methods for mission shares
missionShareSchema.statics.getPopularMissions = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ likes: -1, downloads: -1 })
    .limit(limit)
    .populate('author', 'username avatar');
};

missionShareSchema.statics.getMissionsByDifficulty = function(difficulty: string, limit = 20) {
  return this.find({ difficulty, isPublic: true })
    .sort({ likes: -1 })
    .limit(limit)
    .populate('author', 'username avatar');
};

// Export models
export const ForumPost = mongoose.models.ForumPost || mongoose.model<IForumPost>('ForumPost', forumPostSchema);
export const ForumReply = mongoose.models.ForumReply || mongoose.model<IForumReply>('ForumReply', forumReplySchema);
export const MissionShare = mongoose.models.MissionShare || mongoose.model<IMissionShare>('MissionShare', missionShareSchema);
export const UserFollow = mongoose.models.UserFollow || mongoose.model<IUserFollow>('UserFollow', userFollowSchema);
export const CommunityAchievement = mongoose.models.CommunityAchievement || mongoose.model<ICommunityAchievement>('CommunityAchievement', communityAchievementSchema);
export const UserCommunityStats = mongoose.models.UserCommunityStats || mongoose.model<IUserCommunityStats>('UserCommunityStats', userCommunityStatsSchema);