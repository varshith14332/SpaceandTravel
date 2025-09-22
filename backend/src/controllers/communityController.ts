import { Request, Response } from 'express';
import { 
  ForumPost, 
  ForumReply, 
  MissionShare, 
  UserFollow, 
  UserCommunityStats,
  CommunityAchievement 
} from '../models/Community';
import { User } from '../models/User';
import mongoose from 'mongoose';
import {
  AuthenticatedRequest,
  CreateForumPostRequest,
  CreateForumReplyRequest,
  ShareMissionRequest,
  FollowUserRequest,
  ForumPostQuery,
  MissionShareQuery,
  LeaderboardQuery,
  SearchQuery
} from '../types/community';

// Forum Post Controllers
export const createForumPost = async (req: CreateForumPostRequest, res: Response) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const post = new ForumPost({
      title: title.trim(),
      content: content.trim(),
      author: userId,
      category: category || 'general',
      tags: tags ? tags.map((tag: string) => tag.trim().toLowerCase()) : []
    });

    await post.save();
    await post.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      post: post
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({ error: 'Failed to create forum post' });
  }
};

export const getForumPosts = async (req: AuthenticatedRequest & { query: ForumPostQuery }, res: Response) => {
  try {
    const { category, page = '1', limit = '20', sort = 'recent' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = { isLocked: false };
    if (category && category !== 'all') {
      query.category = category;
    }

    let sortQuery: any = { createdAt: -1 }; // Default: recent
    if (sort === 'popular') {
      sortQuery = { views: -1, likes: -1 };
    } else if (sort === 'trending') {
      // Posts with recent activity
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      sortQuery = { updatedAt: -1 };
      query.updatedAt = { $gte: oneDayAgo };
    }

    const posts = await ForumPost.find(query)
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

    const total = await ForumPost.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: 'Failed to fetch forum posts' });
  }
};

export const getForumPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await ForumPost.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, // Increment view count
      { new: true }
    )
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
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ error: 'Failed to fetch forum post' });
  }
};

export const likeForumPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Forum post not found' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isLiked = post.likes.includes(userObjectId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter((like: mongoose.Types.ObjectId) => !like.equals(userObjectId));
    } else {
      // Like
      post.likes.push(userObjectId);
      
      // Update author's community stats
      if (!post.author.equals(userObjectId)) {
        await UserCommunityStats.findOneAndUpdate(
          { userId: post.author },
          { 
            $inc: { 'stats.likesReceived': 1 },
            $set: { lastActive: new Date() }
          },
          { upsert: true }
        );
      }
    }

    await post.save();

    res.json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('Like forum post error:', error);
    res.status(500).json({ error: 'Failed to like forum post' });
  }
};

export const createForumReply = async (req: CreateForumReplyRequest, res: Response) => {
  try {
    const { postId, content, parentReplyId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Forum post not found' });
    }

    if (post.isLocked) {
      return res.status(403).json({ error: 'Cannot reply to locked post' });
    }

    const reply = new ForumReply({
      content: content.trim(),
      author: userId,
      postId,
      parentReply: parentReplyId || null
    });

    await reply.save();
    await reply.populate('author', 'username avatar');

    // Add reply to post
    post.replies.push(reply._id);
    post.updatedAt = new Date();
    await post.save();

    res.status(201).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('Create forum reply error:', error);
    res.status(500).json({ error: 'Failed to create forum reply' });
  }
};

// Mission Sharing Controllers
export const shareMission = async (req: ShareMissionRequest, res: Response) => {
  try {
    const { 
      title, 
      description, 
      missionData, 
      difficulty, 
      tags, 
      isPublic 
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const missionShare = new MissionShare({
      title: title.trim(),
      description: description.trim(),
      author: userId,
      missionData,
      difficulty: difficulty || 'medium',
      tags: tags ? tags.map((tag: string) => tag.trim().toLowerCase()) : [],
      isPublic: isPublic !== false
    });

    await missionShare.save();
    await missionShare.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      mission: missionShare
    });
  } catch (error) {
    console.error('Share mission error:', error);
    res.status(500).json({ error: 'Failed to share mission' });
  }
};

export const getSharedMissions = async (req: AuthenticatedRequest & { query: MissionShareQuery }, res: Response) => {
  try {
    const { difficulty, page = 1, limit = 20, sort = 'recent', author } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = { isPublic: true };
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    if (author) {
      query.author = author;
    }

    let sortQuery: any = { createdAt: -1 }; // Default: recent
    if (sort === 'popular') {
      sortQuery = { likes: -1, downloads: -1 };
    } else if (sort === 'downloads') {
      sortQuery = { downloads: -1 };
    }

    const missions = await MissionShare.find(query)
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

    const total = await MissionShare.countDocuments(query);

    res.json({
      success: true,
      missions,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get shared missions error:', error);
    res.status(500).json({ error: 'Failed to fetch shared missions' });
  }
};

export const downloadMission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }

    const mission = await MissionShare.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    ).populate('author', 'username avatar');

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
  } catch (error) {
    console.error('Download mission error:', error);
    res.status(500).json({ error: 'Failed to download mission' });
  }
};

// Social Features Controllers
export const followUser = async (req: FollowUserRequest, res: Response) => {
  try {
    const { userId: targetUserId } = req.body;
    const followerId = req.user?.id;

    if (!followerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (followerId === targetUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await UserFollow.findOne({
      follower: followerId,
      following: targetUserId
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    const follow = new UserFollow({
      follower: followerId,
      following: targetUserId
    });

    await follow.save();

    // Update community stats
    await UserCommunityStats.findOneAndUpdate(
      { userId: followerId },
      { 
        $inc: { 'stats.followingCount': 1 },
        $set: { lastActive: new Date() }
      },
      { upsert: true }
    );

    await UserCommunityStats.findOneAndUpdate(
      { userId: targetUserId },
      { 
        $inc: { 'stats.followersCount': 1 },
        $set: { lastActive: new Date() }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

export const unfollowUser = async (req: FollowUserRequest, res: Response) => {
  try {
    const { userId: targetUserId } = req.body;
    const followerId = req.user?.id;

    if (!followerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const follow = await UserFollow.findOneAndDelete({
      follower: followerId,
      following: targetUserId
    });

    if (!follow) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }

    // Update community stats
    await UserCommunityStats.findOneAndUpdate(
      { userId: followerId },
      { 
        $inc: { 'stats.followingCount': -1 },
        $set: { lastActive: new Date() }
      }
    );

    await UserCommunityStats.findOneAndUpdate(
      { userId: targetUserId },
      { 
        $inc: { 'stats.followersCount': -1 }
      }
    );

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

export const getUserCommunityStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const stats = await UserCommunityStats.findOne({ userId })
      .populate('achievements', 'name description icon rarity points')
      .populate('userId', 'username avatar createdAt');

    if (!stats) {
      // Create default stats if none exist
      const newStats = new UserCommunityStats({ userId });
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
  } catch (error) {
    console.error('Get user community stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user community stats' });
  }
};

export const getCommunityLeaderboard = async (req: AuthenticatedRequest & { query: LeaderboardQuery }, res: Response) => {
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

    const leaderboard = await UserCommunityStats.find()
      .sort({ [sortField]: -1 })
      .limit(Number(limit))
      .populate('userId', 'username avatar')
      .populate('achievements', 'name icon rarity');

    res.json({
      success: true,
      leaderboard,
      type
    });
  } catch (error) {
    console.error('Get community leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch community leaderboard' });
  }
};

// Search functionality
export const searchCommunity = async (req: AuthenticatedRequest & { query: SearchQuery }, res: Response) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchQuery = q.trim();
    const searchRegex = new RegExp(searchQuery, 'i');

    let results: any = {};

    if (type === 'all' || type === 'posts') {
      const posts = await ForumPost.find({
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
      const missions = await MissionShare.find({
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
      const users = await User.find({
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
  } catch (error) {
    console.error('Search community error:', error);
    res.status(500).json({ error: 'Failed to search community' });
  }
};