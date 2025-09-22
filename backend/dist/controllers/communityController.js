"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCommunity = exports.getCommunityLeaderboard = exports.getUserCommunityStats = exports.unfollowUser = exports.followUser = exports.downloadMission = exports.getSharedMissions = exports.shareMission = exports.createForumReply = exports.likeForumPost = exports.getForumPost = exports.getForumPosts = exports.createForumPost = void 0;
const Community_1 = require("../models/Community");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const createForumPost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const post = new Community_1.ForumPost({
            title: title.trim(),
            content: content.trim(),
            author: userId,
            category: category || 'general',
            tags: tags ? tags.map((tag) => tag.trim().toLowerCase()) : []
        });
        await post.save();
        await post.populate('author', 'username avatar');
        res.status(201).json({
            success: true,
            post: post
        });
    }
    catch (error) {
        console.error('Create forum post error:', error);
        res.status(500).json({ error: 'Failed to create forum post' });
    }
};
exports.createForumPost = createForumPost;
const getForumPosts = async (req, res) => {
    try {
        const { category, page = '1', limit = '20', sort = 'recent' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        let query = { isLocked: false };
        if (category && category !== 'all') {
            query.category = category;
        }
        let sortQuery = { createdAt: -1 };
        if (sort === 'popular') {
            sortQuery = { views: -1, likes: -1 };
        }
        else if (sort === 'trending') {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            sortQuery = { updatedAt: -1 };
            query.updatedAt = { $gte: oneDayAgo };
        }
        const posts = await Community_1.ForumPost.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit))
            .populate('author', 'username avatar')
            .populate({
            path: 'replies',
            populate: {
                path: 'author',
                select: 'username avatar'
            },
            options: { limit: 3, sort: { createdAt: -1 } }
        });
        const total = await Community_1.ForumPost.countDocuments(query);
        res.json({
            success: true,
            posts,
            pagination: {
                current: Number(page),
                pages: Math.ceil(total / Number(limit)),
                total
            }
        });
    }
    catch (error) {
        console.error('Get forum posts error:', error);
        res.status(500).json({ error: 'Failed to fetch forum posts' });
    }
};
exports.getForumPosts = getForumPosts;
const getForumPost = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }
        const post = await Community_1.ForumPost.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
            .populate('author', 'username avatar createdAt')
            .populate({
            path: 'replies',
            populate: {
                path: 'author',
                select: 'username avatar'
            },
            options: { sort: { createdAt: 1 } }
        });
        if (!post) {
            return res.status(404).json({ error: 'Forum post not found' });
        }
        res.json({
            success: true,
            post
        });
    }
    catch (error) {
        console.error('Get forum post error:', error);
        res.status(500).json({ error: 'Failed to fetch forum post' });
    }
};
exports.getForumPost = getForumPost;
const likeForumPost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }
        const post = await Community_1.ForumPost.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Forum post not found' });
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const isLiked = post.likes.includes(userObjectId);
        if (isLiked) {
            post.likes = post.likes.filter((like) => !like.equals(userObjectId));
        }
        else {
            post.likes.push(userObjectId);
            if (!post.author.equals(userObjectId)) {
                await Community_1.UserCommunityStats.findOneAndUpdate({ userId: post.author }, {
                    $inc: { 'stats.likesReceived': 1 },
                    $set: { lastActive: new Date() }
                }, { upsert: true });
            }
        }
        await post.save();
        res.json({
            success: true,
            liked: !isLiked,
            likesCount: post.likes.length
        });
    }
    catch (error) {
        console.error('Like forum post error:', error);
        res.status(500).json({ error: 'Failed to like forum post' });
    }
};
exports.likeForumPost = likeForumPost;
const createForumReply = async (req, res) => {
    try {
        const { postId, content, parentReplyId } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }
        const post = await Community_1.ForumPost.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Forum post not found' });
        }
        if (post.isLocked) {
            return res.status(403).json({ error: 'Cannot reply to locked post' });
        }
        const reply = new Community_1.ForumReply({
            content: content.trim(),
            author: userId,
            postId,
            parentReply: parentReplyId || null
        });
        await reply.save();
        await reply.populate('author', 'username avatar');
        post.replies.push(reply._id);
        post.updatedAt = new Date();
        await post.save();
        res.status(201).json({
            success: true,
            reply
        });
    }
    catch (error) {
        console.error('Create forum reply error:', error);
        res.status(500).json({ error: 'Failed to create forum reply' });
    }
};
exports.createForumReply = createForumReply;
const shareMission = async (req, res) => {
    try {
        const { title, description, missionData, difficulty, tags, isPublic } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const missionShare = new Community_1.MissionShare({
            title: title.trim(),
            description: description.trim(),
            author: userId,
            missionData,
            difficulty: difficulty || 'medium',
            tags: tags ? tags.map((tag) => tag.trim().toLowerCase()) : [],
            isPublic: isPublic !== false
        });
        await missionShare.save();
        await missionShare.populate('author', 'username avatar');
        res.status(201).json({
            success: true,
            mission: missionShare
        });
    }
    catch (error) {
        console.error('Share mission error:', error);
        res.status(500).json({ error: 'Failed to share mission' });
    }
};
exports.shareMission = shareMission;
const getSharedMissions = async (req, res) => {
    try {
        const { difficulty, page = 1, limit = 20, sort = 'recent', author } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        let query = { isPublic: true };
        if (difficulty && difficulty !== 'all') {
            query.difficulty = difficulty;
        }
        if (author) {
            query.author = author;
        }
        let sortQuery = { createdAt: -1 };
        if (sort === 'popular') {
            sortQuery = { likes: -1, downloads: -1 };
        }
        else if (sort === 'downloads') {
            sortQuery = { downloads: -1 };
        }
        const missions = await Community_1.MissionShare.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit))
            .populate('author', 'username avatar')
            .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'username avatar'
            },
            options: { limit: 3, sort: { createdAt: -1 } }
        });
        const total = await Community_1.MissionShare.countDocuments(query);
        res.json({
            success: true,
            missions,
            pagination: {
                current: Number(page),
                pages: Math.ceil(total / Number(limit)),
                total
            }
        });
    }
    catch (error) {
        console.error('Get shared missions error:', error);
        res.status(500).json({ error: 'Failed to fetch shared missions' });
    }
};
exports.getSharedMissions = getSharedMissions;
const downloadMission = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid mission ID' });
        }
        const mission = await Community_1.MissionShare.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true }).populate('author', 'username avatar');
        if (!mission || !mission.isPublic) {
            return res.status(404).json({ error: 'Mission not found or not public' });
        }
        res.json({
            success: true,
            mission: {
                title: mission.title,
                description: mission.description,
                missionData: mission.missionData,
                author: mission.author,
                difficulty: mission.difficulty,
                tags: mission.tags
            }
        });
    }
    catch (error) {
        console.error('Download mission error:', error);
        res.status(500).json({ error: 'Failed to download mission' });
    }
};
exports.downloadMission = downloadMission;
const followUser = async (req, res) => {
    try {
        const { userId: targetUserId } = req.body;
        const followerId = req.user?.id;
        if (!followerId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (followerId === targetUserId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const targetUser = await User_1.User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const existingFollow = await Community_1.UserFollow.findOne({
            follower: followerId,
            following: targetUserId
        });
        if (existingFollow) {
            return res.status(400).json({ error: 'Already following this user' });
        }
        const follow = new Community_1.UserFollow({
            follower: followerId,
            following: targetUserId
        });
        await follow.save();
        await Community_1.UserCommunityStats.findOneAndUpdate({ userId: followerId }, {
            $inc: { 'stats.followingCount': 1 },
            $set: { lastActive: new Date() }
        }, { upsert: true });
        await Community_1.UserCommunityStats.findOneAndUpdate({ userId: targetUserId }, {
            $inc: { 'stats.followersCount': 1 },
            $set: { lastActive: new Date() }
        }, { upsert: true });
        res.json({
            success: true,
            message: 'User followed successfully'
        });
    }
    catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ error: 'Failed to follow user' });
    }
};
exports.followUser = followUser;
const unfollowUser = async (req, res) => {
    try {
        const { userId: targetUserId } = req.body;
        const followerId = req.user?.id;
        if (!followerId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const follow = await Community_1.UserFollow.findOneAndDelete({
            follower: followerId,
            following: targetUserId
        });
        if (!follow) {
            return res.status(404).json({ error: 'Follow relationship not found' });
        }
        await Community_1.UserCommunityStats.findOneAndUpdate({ userId: followerId }, {
            $inc: { 'stats.followingCount': -1 },
            $set: { lastActive: new Date() }
        });
        await Community_1.UserCommunityStats.findOneAndUpdate({ userId: targetUserId }, {
            $inc: { 'stats.followersCount': -1 }
        });
        res.json({
            success: true,
            message: 'User unfollowed successfully'
        });
    }
    catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
};
exports.unfollowUser = unfollowUser;
const getUserCommunityStats = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const stats = await Community_1.UserCommunityStats.findOne({ userId })
            .populate('achievements', 'name description icon rarity points')
            .populate('userId', 'username avatar createdAt');
        if (!stats) {
            const newStats = new Community_1.UserCommunityStats({ userId });
            await newStats.save();
            await newStats.populate('userId', 'username avatar createdAt');
            return res.json({
                success: true,
                stats: newStats
            });
        }
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        console.error('Get user community stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user community stats' });
    }
};
exports.getUserCommunityStats = getUserCommunityStats;
const getCommunityLeaderboard = async (req, res) => {
    try {
        const { type = 'reputation', limit = 50 } = req.query;
        let sortField = 'stats.reputation';
        switch (type) {
            case 'posts':
                sortField = 'stats.postsCount';
                break;
            case 'likes':
                sortField = 'stats.likesReceived';
                break;
            case 'missions':
                sortField = 'stats.missionsShared';
                break;
            case 'followers':
                sortField = 'stats.followersCount';
                break;
        }
        const leaderboard = await Community_1.UserCommunityStats.find()
            .sort({ [sortField]: -1 })
            .limit(Number(limit))
            .populate('userId', 'username avatar')
            .populate('achievements', 'name icon rarity');
        res.json({
            success: true,
            leaderboard,
            type
        });
    }
    catch (error) {
        console.error('Get community leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch community leaderboard' });
    }
};
exports.getCommunityLeaderboard = getCommunityLeaderboard;
const searchCommunity = async (req, res) => {
    try {
        const { q, type = 'all', page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        if (!q || typeof q !== 'string' || q.trim().length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }
        const searchQuery = q.trim();
        const searchRegex = new RegExp(searchQuery, 'i');
        let results = {};
        if (type === 'all' || type === 'posts') {
            const posts = await Community_1.ForumPost.find({
                $or: [
                    { title: searchRegex },
                    { content: searchRegex },
                    { tags: { $in: [searchRegex] } }
                ],
                isLocked: false
            })
                .sort({ createdAt: -1 })
                .skip(type === 'posts' ? skip : 0)
                .limit(type === 'posts' ? Number(limit) : 10)
                .populate('author', 'username avatar');
            results.posts = posts;
        }
        if (type === 'all' || type === 'missions') {
            const missions = await Community_1.MissionShare.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { tags: { $in: [searchRegex] } }
                ],
                isPublic: true
            })
                .sort({ likes: -1 })
                .skip(type === 'missions' ? skip : 0)
                .limit(type === 'missions' ? Number(limit) : 10)
                .populate('author', 'username avatar');
            results.missions = missions;
        }
        if (type === 'all' || type === 'users') {
            const users = await User_1.User.find({
                username: searchRegex
            })
                .select('username avatar')
                .sort({ username: 1 })
                .skip(type === 'users' ? skip : 0)
                .limit(type === 'users' ? Number(limit) : 10);
            results.users = users;
        }
        res.json({
            success: true,
            results,
            query: searchQuery
        });
    }
    catch (error) {
        console.error('Search community error:', error);
        res.status(500).json({ error: 'Failed to search community' });
    }
};
exports.searchCommunity = searchCommunity;
//# sourceMappingURL=communityController.js.map