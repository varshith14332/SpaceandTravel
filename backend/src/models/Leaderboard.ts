import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaderboardEntry extends Document {
	userId: string; // placeholder
	username: string;
	category: string; // mission, training
	reference: string; // mission code or module key
	score: number;
	metadata?: Record<string, unknown>;
	createdAt: Date;
}

const leaderboardSchema = new Schema<ILeaderboardEntry>({
	userId: { type: String, required: true, index: true },
	username: { type: String, required: true },
	category: { type: String, required: true, index: true },
	reference: { type: String, required: true, index: true },
	score: { type: Number, required: true, index: true },
	metadata: { type: Object }
}, { timestamps: { createdAt: true, updatedAt: false } });

leaderboardSchema.index({ category: 1, reference: 1, score: -1 });

export const LeaderboardEntry: Model<ILeaderboardEntry> = mongoose.models.LeaderboardEntry || mongoose.model<ILeaderboardEntry>('LeaderboardEntry', leaderboardSchema);

