"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.getLeaderboard = exports.awardBadge = exports.updateLearningProgress = exports.updateMissionProgress = exports.getUserProgress = exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const logger_1 = require("../utils/logger");
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: '7d' });
};
const sendResponse = (res, statusCode, success, message, data) => {
    return res.status(statusCode).json({
        success,
        message,
        ...(data && { data })
    });
};
const registerUser = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, 'Validation failed', { errors: errors.array() });
        }
        const { username, email, password, firstName, lastName } = req.body;
        const existingUser = await User_1.User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return sendResponse(res, 409, false, `User with this ${field} already exists`);
        }
        const user = new User_1.User({
            username,
            email,
            password,
            firstName,
            lastName
        });
        await user.save();
        const token = generateToken(user._id.toString());
        const userResponse = user.toObject();
        delete userResponse.password;
        logger_1.logger.info(`New user registered: ${username} (${email})`);
        return sendResponse(res, 201, true, 'User registered successfully', {
            user: userResponse,
            token
        });
    }
    catch (error) {
        logger_1.logger.error('Error in registerUser:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, 'Validation failed', { errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user) {
            return sendResponse(res, 401, false, 'Invalid credentials');
        }
        if (!user.isActive) {
            return sendResponse(res, 403, false, 'Account is deactivated');
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return sendResponse(res, 401, false, 'Invalid credentials');
        }
        user.lastLoginAt = new Date();
        await user.save();
        const token = generateToken(user._id.toString());
        const userResponse = user.toObject();
        delete userResponse.password;
        logger_1.logger.info(`User logged in: ${user.username} (${user.email})`);
        return sendResponse(res, 200, true, 'Login successful', {
            user: userResponse,
            token
        });
    }
    catch (error) {
        logger_1.logger.error('Error in loginUser:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.loginUser = loginUser;
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.user?.id;
        const user = await User_1.User.findById(userId)
            .populate('friends', 'username avatar firstName lastName')
            .select('-password');
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }
        return sendResponse(res, 200, true, 'User profile retrieved successfully', { user });
    }
    catch (error) {
        logger_1.logger.error('Error in getUserProfile:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { firstName, lastName, bio, location, preferences } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }
        if (firstName !== undefined)
            user.firstName = firstName;
        if (lastName !== undefined)
            user.lastName = lastName;
        if (bio !== undefined)
            user.bio = bio;
        if (location !== undefined)
            user.location = location;
        if (preferences) {
            user.preferences = { ...user.preferences, ...preferences };
        }
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        logger_1.logger.info(`User profile updated: ${user.username}`);
        return sendResponse(res, 200, true, 'Profile updated successfully', { user: userResponse });
    }
    catch (error) {
        logger_1.logger.error('Error in updateUserProfile:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.updateUserProfile = updateUserProfile;
const getUserProgress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User_1.User.findById(userId).select('stats badges missionsProgress learningProgress');
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }
        const progressSummary = {
            stats: user.stats,
            badges: {
                total: user.badges.length,
                byCategory: user.badges.reduce((acc, badge) => {
                    acc[badge.category] = (acc[badge.category] || 0) + 1;
                    return acc;
                }, {}),
                recent: user.badges.slice(-5)
            },
            missions: {
                total: user.missionsProgress.length,
                completed: user.missionsProgress.filter(m => m.status === 'completed').length,
                inProgress: user.missionsProgress.filter(m => m.status === 'in_progress').length,
                averageScore: user.missionsProgress
                    .filter(m => m.score !== undefined)
                    .reduce((acc, m) => acc + (m.score || 0), 0) /
                    Math.max(user.missionsProgress.filter(m => m.score !== undefined).length, 1)
            },
            learning: {
                total: user.learningProgress.length,
                completed: user.learningProgress.filter(l => l.completed).length,
                averageProgress: user.learningProgress.reduce((acc, l) => acc + l.progress, 0) /
                    Math.max(user.learningProgress.length, 1),
                totalQuizzesTaken: user.learningProgress.reduce((acc, l) => acc + l.quizResults.length, 0)
            }
        };
        return sendResponse(res, 200, true, 'User progress retrieved successfully', progressSummary);
    }
    catch (error) {
        logger_1.logger.error('Error in getUserProgress:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.getUserProgress = getUserProgress;
const updateMissionProgress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { missionId } = req.params;
        const progressData = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }
        user.updateMissionProgress(missionId, progressData);
        await user.save();
        logger_1.logger.info(`Mission progress updated for user ${user.username}: ${missionId}`);
        return sendResponse(res, 200, true, 'Mission progress updated successfully');
    }
    catch (error) {
        logger_1.logger.error('Error in updateMissionProgress:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.updateMissionProgress = updateMissionProgress;
const updateLearningProgress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { topicId } = req.params;
        const progressData = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }
        user.updateLearningProgress(topicId, progressData);
        await user.save();
        logger_1.logger.info(`Learning progress updated for user ${user.username}: ${topicId}`);
        return sendResponse(res, 200, true, 'Learning progress updated successfully');
    }
    catch (error) {
        logger_1.logger.error('Error in updateLearningProgress:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.updateLearningProgress = updateLearningProgress;
const awardBadge = async (req, res) => {
    try {
        const userId = req.user?.id;
        const badgeData = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }
        user.earnBadge(badgeData);
        await user.save();
        logger_1.logger.info(`Badge awarded to user ${user.username}: ${badgeData.name}`);
        return sendResponse(res, 200, true, 'Badge awarded successfully', { badge: badgeData });
    }
    catch (error) {
        logger_1.logger.error('Error in awardBadge:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.awardBadge = awardBadge;
const getLeaderboard = async (req, res) => {
    try {
        const { type = 'points', limit = 10 } = req.query;
        let sortField;
        switch (type) {
            case 'level':
                sortField = 'stats.level';
                break;
            case 'missions':
                sortField = 'stats.totalMissionsCompleted';
                break;
            case 'points':
            default:
                sortField = 'stats.totalPoints';
                break;
        }
        const users = await User_1.User.find({ isActive: true })
            .select('username firstName lastName avatar stats badges')
            .sort({ [sortField]: -1 })
            .limit(Number(limit));
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            stats: user.stats,
            badgeCount: user.badges.length
        }));
        return sendResponse(res, 200, true, 'Leaderboard retrieved successfully', { leaderboard });
    }
    catch (error) {
        logger_1.logger.error('Error in getLeaderboard:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.getLeaderboard = getLeaderboard;
const searchUsers = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        if (!q || typeof q !== 'string') {
            return sendResponse(res, 400, false, 'Search query is required');
        }
        const users = await User_1.User.find({
            isActive: true,
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } }
            ]
        })
            .select('username firstName lastName avatar stats')
            .limit(Number(limit));
        return sendResponse(res, 200, true, 'Users found successfully', { users });
    }
    catch (error) {
        logger_1.logger.error('Error in searchUsers:', error);
        return sendResponse(res, 500, false, 'Internal server error');
    }
};
exports.searchUsers = searchUsers;
//# sourceMappingURL=userController.js.map