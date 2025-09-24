import { Request, Response } from 'express';
import { Mission } from '../models/Mission';

// Seed helper executed lazily
async function ensureSeed() {
	const count = await Mission.countDocuments();
	if (count === 0) {
		await Mission.insertMany([
			{
				title: 'Low Earth Orbit Deployment',
				code: 'LEO_DEPLOY',
				description: 'Deploy a small satellite into stable Low Earth Orbit.',
				difficulty: 'easy',
				estimatedDurationMinutes: 25,
				objectives: ['Launch vehicle ascent', 'Orbit circularization', 'Payload deployment'],
				requirements: ['Complete Zero-G training'],
				rewards: { xp: 150, badges: ['Orbit Specialist'] }
			},
			{
				title: 'Lunar Transfer Injection',
				code: 'LUNAR_TLI',
				description: 'Perform TLI burn to send spacecraft toward the Moon.',
				difficulty: 'hard',
				estimatedDurationMinutes: 55,
				objectives: ['Parking orbit insertion', 'TLI burn planning', 'Execute precise burn'],
				requirements: ['Navigation module', 'Fuel systems training'],
				rewards: { xp: 600, badges: ['Lunar Navigator'] }
			}
		]);
	}
}

export const MissionController = {
	list: async (req: Request, res: Response) => {
		try {
			await ensureSeed();
			const missions = await Mission.find({ status: 'active' }).sort({ difficulty: 1 });
			res.json({ success: true, data: missions });
		} catch (e: any) {
			res.status(500).json({ success: false, message: e.message });
		}
	},
	get: async (req: Request, res: Response) => {
		try {
			const mission = await Mission.findOne({ code: req.params.code });
			if (!mission) return res.status(404).json({ success: false, message: 'Mission not found' });
			res.json({ success: true, data: mission });
		} catch (e: any) {
			res.status(500).json({ success: false, message: e.message });
		}
	},
	create: async (req: Request, res: Response) => {
		try {
			const mission = await Mission.create(req.body);
			res.status(201).json({ success: true, data: mission });
		} catch (e: any) {
			res.status(400).json({ success: false, message: e.message });
		}
	},
	update: async (req: Request, res: Response) => {
		try {
			const mission = await Mission.findOneAndUpdate({ code: req.params.code }, req.body, { new: true });
			if (!mission) return res.status(404).json({ success: false, message: 'Mission not found' });
			res.json({ success: true, data: mission });
		} catch (e: any) {
			res.status(400).json({ success: false, message: e.message });
		}
	},
	remove: async (req: Request, res: Response) => {
		try {
			const mission = await Mission.findOneAndDelete({ code: req.params.code });
			if (!mission) return res.status(404).json({ success: false, message: 'Mission not found' });
			res.json({ success: true, message: 'Deleted' });
		} catch (e: any) {
			res.status(500).json({ success: false, message: e.message });
		}
	}
};

