import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMission extends Document {
	title: string;
	code: string; // short identifier
	description: string;
	difficulty: 'easy' | 'medium' | 'hard' | 'expert';
	estimatedDurationMinutes: number;
	objectives: string[];
	requirements: string[];
	rewards: { xp: number; badges: string[] };
	status: 'active' | 'disabled';
	createdAt: Date;
	updatedAt: Date;
}

const missionSchema = new Schema<IMission>({
	title: { type: String, required: true },
	code: { type: String, required: true, unique: true, index: true },
	description: { type: String, required: true },
	difficulty: { type: String, enum: ['easy','medium','hard','expert'], default: 'medium', index: true },
	estimatedDurationMinutes: { type: Number, default: 30 },
	objectives: { type: [String], default: [] },
	requirements: { type: [String], default: [] },
	rewards: {
		xp: { type: Number, default: 0 },
		badges: { type: [String], default: [] }
	},
	status: { type: String, enum: ['active','disabled'], default: 'active', index: true }
}, { timestamps: true });

missionSchema.index({ difficulty: 1, status: 1 });

export const Mission: Model<IMission> = mongoose.models.Mission || mongoose.model<IMission>('Mission', missionSchema);

