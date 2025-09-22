import { Request, Response } from 'express';
import { User, IUser, MissionProgress, LearningProgress } from '../models/User';
import jwt, { SignOptions } from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// JWT token generation
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// Response helper
const sendResponse = (res: Response, statusCode: number, success: boolean, message: string, data?: any) => {
  return res.status(statusCode).json({
    success,
    message,
    ...(data && { data })
  });
};

// Register new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', { errors: errors.array() });
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return sendResponse(res, 409, false, `User with this ${field} already exists`);
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generate token
    const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    logger.info(`New user registered: ${username} (${email})`);

    return sendResponse(res, 201, true, 'User registered successfully', {
      user: userResponse,
      token
    });

  } catch (error) {
    logger.error('Error in registerUser:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', { errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      return sendResponse(res, 403, false, 'Account is deactivated');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    logger.info(`User logged in: ${user.username} (${user.email})`);

    return sendResponse(res, 200, true, 'Login successful', {
      user: userResponse,
      token
    });

  } catch (error) {
    logger.error('Error in loginUser:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || (req as any).user?.id;

    const user = await User.findById(userId)
      .populate('friends', 'username avatar firstName lastName')
      .select('-password');

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'User profile retrieved successfully', { user });

  } catch (error) {
    logger.error('Error in getUserProfile:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { firstName, lastName, bio, location, preferences } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    const userResponse = user.toObject();
    delete (userResponse as any).password;

    logger.info(`User profile updated: ${user.username}`);

    return sendResponse(res, 200, true, 'Profile updated successfully', { user: userResponse });

  } catch (error) {
    logger.error('Error in updateUserProfile:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Get user progress summary
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const user = await User.findById(userId).select('stats badges missionsProgress learningProgress');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Calculate additional statistics
    const progressSummary = {
      stats: user.stats,
      badges: {
        total: user.badges.length,
        byCategory: user.badges.reduce((acc, badge) => {
          acc[badge.category] = (acc[badge.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
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

  } catch (error) {
    logger.error('Error in getUserProgress:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Update mission progress
export const updateMissionProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { missionId } = req.params;
    const progressData = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.updateMissionProgress(missionId, progressData);
    await user.save();

    logger.info(`Mission progress updated for user ${user.username}: ${missionId}`);

    return sendResponse(res, 200, true, 'Mission progress updated successfully');

  } catch (error) {
    logger.error('Error in updateMissionProgress:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Update learning progress
export const updateLearningProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { topicId } = req.params;
    const progressData = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.updateLearningProgress(topicId, progressData);
    await user.save();

    logger.info(`Learning progress updated for user ${user.username}: ${topicId}`);

    return sendResponse(res, 200, true, 'Learning progress updated successfully');

  } catch (error) {
    logger.error('Error in updateLearningProgress:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Award badge to user
export const awardBadge = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const badgeData = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.earnBadge(badgeData);
    await user.save();

    logger.info(`Badge awarded to user ${user.username}: ${badgeData.name}`);

    return sendResponse(res, 200, true, 'Badge awarded successfully', { badge: badgeData });

  } catch (error) {
    logger.error('Error in awardBadge:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Get leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { type = 'points', limit = 10 } = req.query;

    let sortField: string;
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

    const users = await User.find({ isActive: true })
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

  } catch (error) {
    logger.error('Error in getLeaderboard:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Search users
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      return sendResponse(res, 400, false, 'Search query is required');
    }

    const users = await User.find({
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

  } catch (error) {
    logger.error('Error in searchUsers:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};
