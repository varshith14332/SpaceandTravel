import { Request, Response } from 'express';
import { LeaderboardEntry } from '../models/Leaderboard';

export const LeaderboardController = {
	top: async (req: Request, res: Response) => {
		try {
			const { category, reference, limit = '10' } = req.query as Record<string, string>;
			const filter: any = {};
			if (category) filter.category = category;
			if (reference) filter.reference = reference;
			const entries = await LeaderboardEntry.find(filter).sort({ score: -1 }).limit(parseInt(limit, 10));
			res.json({ success: true, data: entries });
		} catch (e: any) {
			res.status(500).json({ success: false, message: e.message });
		}
	},
	submit: async (req: Request, res: Response) => {
		try {
			const { category, reference, score, username } = req.body;
			if (!category || !reference || typeof score !== 'number') {
				return res.status(400).json({ success: false, message: 'category, reference, score required' });
			}
			const entry = await LeaderboardEntry.create({ category, reference, score, userId: 'demo-user', username: username || 'Demo User' });
			res.status(201).json({ success: true, data: entry });
		} catch (e: any) {
			res.status(400).json({ success: false, message: e.message });
		}
	}
};

