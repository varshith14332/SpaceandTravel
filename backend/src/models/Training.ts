import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrainingModule extends Document {
	key: string; // e.g. zero-gravity
	title: string;
	description: string;
	category: 'navigation' | 'life-support' | 'emergency' | 'general';
	difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
	estimatedMinutes: number;
	objectives: string[];
	status: 'active' | 'retired';
	maxScore: number;
	xpReward: number;
	createdAt: Date;
	updatedAt: Date;
}

const trainingModuleSchema = new Schema<ITrainingModule>({
	key: { type: String, required: true, unique: true, index: true },
	title: { type: String, required: true },
	description: { type: String, required: true },
	category: { type: String, enum: ['navigation','life-support','emergency','general'], default: 'general', index: true },
	difficulty: { type: String, enum: ['Beginner','Intermediate','Advanced'], default: 'Beginner', index: true },
	estimatedMinutes: { type: Number, default: 15 },
	objectives: { type: [String], default: [] },
	status: { type: String, enum: ['active','retired'], default: 'active', index: true },
	maxScore: { type: Number, default: 100 },
	xpReward: { type: Number, default: 50 }
}, { timestamps: true });

export const TrainingModule: Model<ITrainingModule> = mongoose.models.TrainingModule || mongoose.model<ITrainingModule>('TrainingModule', trainingModuleSchema);

export interface ITrainingSession extends Document {
	userId: string; // placeholder until auth
	moduleKey: string;
	startedAt: Date;
	completedAt?: Date;
	score?: number;
	progress?: number; // 0-100
	completionTime?: number; // seconds taken to complete
	accuracy?: number; // percentage accuracy
	xpEarned?: number;
	badgesEarned?: string[];
	events: Array<{ t: Date; type: string; payload?: Record<string, unknown> }>;
	createdAt: Date;
	updatedAt: Date;
}

const trainingSessionSchema = new Schema<ITrainingSession>({
	userId: { type: String, required: true, index: true },
	moduleKey: { type: String, required: true, index: true },
	startedAt: { type: Date, default: Date.now },
	completedAt: { type: Date },
	score: { type: Number },
	progress: { type: Number, default: 0 },
	completionTime: { type: Number },
	accuracy: { type: Number },
	xpEarned: { type: Number, default: 0 },
	badgesEarned: { type: [String], default: [] },
	events: { type: [Object], default: [] }
}, { timestamps: true });

trainingSessionSchema.index({ userId: 1, moduleKey: 1, createdAt: -1 });

export const TrainingSession: Model<ITrainingSession> = mongoose.models.TrainingSession || mongoose.model<ITrainingSession>('TrainingSession', trainingSessionSchema);

// User Progress Model for tracking overall training progress
export interface IUserProgress extends Document {
	userId: string;
	totalXP: number;
	level: number;
	completedModules: string[];
	badges: Array<{
		name: string;
		description: string;
		earnedAt: Date;
		icon: string;
	}>;
	stats: {
		totalTrainingTime: number; // minutes
		averageAccuracy: number;
		completionRate: number;
		streakDays: number;
		lastTrainingDate: Date;
	};
	leaderboardStats: {
		bestScore: number;
		fastestCompletion: number; // seconds
		rank: number;
	};
	createdAt: Date;
	updatedAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>({
	userId: { type: String, required: true, unique: true, index: true },
	totalXP: { type: Number, default: 0 },
	level: { type: Number, default: 1 },
	completedModules: { type: [String], default: [] },
	badges: [{
		name: { type: String, required: true },
		description: { type: String, required: true },
		earnedAt: { type: Date, default: Date.now },
		icon: { type: String, required: true }
	}],
	stats: {
		totalTrainingTime: { type: Number, default: 0 },
		averageAccuracy: { type: Number, default: 0 },
		completionRate: { type: Number, default: 0 },
		streakDays: { type: Number, default: 0 },
		lastTrainingDate: { type: Date }
	},
	leaderboardStats: {
		bestScore: { type: Number, default: 0 },
		fastestCompletion: { type: Number, default: 0 },
		rank: { type: Number, default: 0 }
	}
}, { timestamps: true });

export const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', userProgressSchema);

