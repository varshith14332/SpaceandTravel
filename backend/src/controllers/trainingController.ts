import { Request, Response } from 'express';
import { TrainingModule, TrainingSession, UserProgress } from '../models/Training';

async function ensureTrainingSeed() {
	const count = await TrainingModule.countDocuments();
	if (count === 0) {
		await TrainingModule.insertMany([
			{
				key: 'zero-gravity',
				title: 'Zero Gravity Navigation',
				description: 'Practice controlled movement & momentum management in microgravity.',
				category: 'navigation',
				difficulty: 'Beginner',
				estimatedMinutes: 15,
				objectives: ['Thrust control', 'Momentum cancellation', 'Dock target'],
				maxScore: 100,
				xpReward: 50
			},
			{
				key: 'oxygen-management',
				title: 'Oxygen Management',
				description: 'Monitor partial pressures, detect leaks, optimize consumption.',
				category: 'life-support',
				difficulty: 'Intermediate',
				estimatedMinutes: 20,
				objectives: ['Detect leak', 'Stabilize pressure', 'Optimize reserves'],
				maxScore: 100,
				xpReward: 75
			},
			{
				key: 'emergency-response',
				title: 'Emergency Response',
				description: 'Handle fires, system failures and medical events under pressure.',
				category: 'emergency',
				difficulty: 'Advanced',
				estimatedMinutes: 25,
				objectives: ['Fire triage', 'Life support reroute', 'Crew stabilization'],
				maxScore: 100,
				xpReward: 100
			}
		]);
	}
}

const calculateBadges = (moduleKey: string, score: number, completionTime: number) => {
	const badges: string[] = [];
	
	// Module-specific badges
	if (moduleKey === 'zero-gravity') {
		if (score >= 90) badges.push('Zero-G Navigator');
		if (completionTime <= 600) badges.push('Speed Demon'); // Under 10 minutes
	} else if (moduleKey === 'oxygen-management') {
		if (score >= 85) badges.push('Life Support Specialist');
		if (completionTime <= 900) badges.push('Quick Responder'); // Under 15 minutes
	} else if (moduleKey === 'emergency-response') {
		if (score >= 80) badges.push('Emergency Expert');
		if (completionTime <= 1200) badges.push('Crisis Manager'); // Under 20 minutes
	}
	
	// Universal badges
	if (score === 100) badges.push('Perfect Score');
	if (score >= 95) badges.push('Excellence');
	
	return badges;
};

const calculateLevel = (totalXP: number) => {
	if (totalXP < 100) return 1;
	if (totalXP < 300) return 2;
	if (totalXP < 600) return 3;
	if (totalXP < 1000) return 4;
	return 5;
};

export const TrainingController = {
	listModules: async (req: Request, res: Response) => {
		try {
			await ensureTrainingSeed();
			const modules = await TrainingModule.find({ status: 'active' }).sort({ difficulty: 1 });
			res.json({ success: true, data: modules });
		} catch (e: any) {
			res.status(500).json({ success: false, message: e.message });
		}
	},
	
	startSession: async (req: Request, res: Response) => {
		try {
			const { moduleKey } = req.body;
			if (!moduleKey) return res.status(400).json({ success: false, message: 'moduleKey required' });
			const session = await TrainingSession.create({ 
				userId: 'demo-user', 
				moduleKey, 
				events: [], 
				progress: 0,
				startedAt: new Date()
			});
			res.status(201).json({ success: true, data: session });
		} catch (e: any) {
			res.status(400).json({ success: false, message: e.message });
		}
	},
	
	recordEvent: async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const { type, payload, progress } = req.body;
			const session = await TrainingSession.findById(id);
			if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
			session.events.push({ t: new Date(), type, payload });
			if (typeof progress === 'number') session.progress = progress;
			await session.save();
			res.json({ success: true, data: session });
		} catch (e: any) {
			res.status(400).json({ success: false, message: e.message });
		}
	},
	
	completeSession: async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const { score } = req.body;
			const session = await TrainingSession.findById(id);
			if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
			
			const completionTime = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
			const finalScore = score ?? session.score ?? 0;
			
			// Calculate badges and XP
			const badges = calculateBadges(session.moduleKey, finalScore, completionTime);
			const module = await TrainingModule.findOne({ key: session.moduleKey });
			const baseXP = module?.xpReward || 50;
			const xpMultiplier = Math.max(0.5, finalScore / 100); // XP based on performance
			const xpEarned = Math.floor(baseXP * xpMultiplier);
			
			// Update session
			session.completedAt = new Date();
			session.score = finalScore;
			session.progress = 100;
			session.completionTime = completionTime;
			session.accuracy = Math.min(100, Math.max(0, finalScore));
			session.xpEarned = xpEarned;
			session.badgesEarned = badges;
			session.events.push({ 
				t: new Date(), 
				type: 'completed', 
				payload: { 
					score: finalScore, 
					completionTime,
					xpEarned,
					badges
				} 
			});
			await session.save();
			
			// Update user progress
			let userProgress = await UserProgress.findOne({ userId: session.userId });
			if (!userProgress) {
				userProgress = await UserProgress.create({
					userId: session.userId,
					totalXP: 0,
					level: 1,
					completedModules: [],
					badges: [],
					stats: {
						totalTrainingTime: 0,
						averageAccuracy: 0,
						completionRate: 0,
						streakDays: 0
					},
					leaderboardStats: {
						bestScore: 0,
						fastestCompletion: 0,
						rank: 0
					}
				});
			}
			
			// Update XP and level
			userProgress.totalXP += xpEarned;
			userProgress.level = calculateLevel(userProgress.totalXP);
			
			// Update completed modules
			if (!userProgress.completedModules.includes(session.moduleKey)) {
				userProgress.completedModules.push(session.moduleKey);
			}
			
			// Add new badges
			badges.forEach(badgeName => {
				const existingBadge = userProgress.badges.find(b => b.name === badgeName);
				if (!existingBadge) {
					userProgress.badges.push({
						name: badgeName,
						description: `Earned for excellent performance in ${session.moduleKey}`,
						earnedAt: new Date(),
						icon: '🏆'
					});
				}
			});
			
			// Update stats
			userProgress.stats.totalTrainingTime += Math.ceil(completionTime / 60);
			const completedSessions = await TrainingSession.countDocuments({
				userId: session.userId,
				completedAt: { $exists: true }
			});
			
			if (completedSessions > 0) {
				const avgAccuracy = await TrainingSession.aggregate([
					{ $match: { userId: session.userId, accuracy: { $exists: true } } },
					{ $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } }
				]);
				userProgress.stats.averageAccuracy = avgAccuracy[0]?.avgAccuracy || 0;
			}
			
			// Update leaderboard stats
			if (finalScore > userProgress.leaderboardStats.bestScore) {
				userProgress.leaderboardStats.bestScore = finalScore;
			}
			
			if (userProgress.leaderboardStats.fastestCompletion === 0 || 
			    completionTime < userProgress.leaderboardStats.fastestCompletion) {
				userProgress.leaderboardStats.fastestCompletion = completionTime;
			}
			
			userProgress.stats.lastTrainingDate = new Date();
			await userProgress.save();
			
			res.json({ success: true, data: session, userProgress });
		} catch (e: any) {
			res.status(400).json({ success: false, message: e.message });
		}
	},
	
	getSession: async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const session = await TrainingSession.findById(id);
			if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
			res.json({ success: true, data: session });
		} catch (e: any) {
			res.status(500).json({ success: false, message: e.message });
		}
	},
	
	getUserProgress: async (req: Request, res: Response) => {
		try {
			const { userId } = req.params;
			let userProgress = await UserProgress.findOne({ userId });
			
			if (!userProgress) {
				userProgress = await UserProgress.create({
					userId,
					totalXP: 0,
					level: 1,
					completedModules: [],
					badges: [],
					stats: {
						totalTrainingTime: 0,
						averageAccuracy: 0,
						completionRate: 0,
						streakDays: 0
					},
					leaderboardStats: {
						bestScore: 0,
						fastestCompletion: 0,
						rank: 0
					}
				});
			}
			
			res.json({ success: true, data: userProgress });
		} catch (e: any) {
			res.status(500).json({ success: false, message: e.message });
		}
	},
	
	getLeaderboard: async (req: Request, res: Response) => {
		try {
			const { moduleKey } = req.query;
			
			let matchQuery: any = { completedAt: { $exists: true } };
			if (moduleKey) {
				matchQuery.moduleKey = moduleKey;
			}
			
			const leaderboard = await TrainingSession.aggregate([
				{ $match: matchQuery },
				{
					$group: {
						_id: '$userId',
						bestScore: { $max: '$score' },
						fastestCompletion: { $min: '$completionTime' },
						totalSessions: { $sum: 1 },
						avgAccuracy: { $avg: '$accuracy' },
						lastCompletion: { $max: '$completedAt' }
					}
				},
				{ $sort: { bestScore: -1, fastestCompletion: 1 } },
				{ $limit: 50 }
			]);
			
			// Add mock user data for demo
			const mockLeaderboard = leaderboard.map((entry, index) => ({
				...entry,
				rank: index + 1,
				name: entry._id === 'demo-user' ? 'You' : `Player ${index + 1}`,
				avatar: entry._id === 'demo-user' ? '🧑‍🚀' : ['👩‍🚀', '👨‍🚀'][Math.floor(Math.random() * 2)]
			}));
			
			res.json({ success: true, data: mockLeaderboard });
		} catch (e: any) {
			res.status(500).json({ success: false, message: e.message });
		}
	}
};

