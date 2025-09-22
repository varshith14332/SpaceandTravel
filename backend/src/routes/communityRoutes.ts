import express from 'express';
import { 
  createForumPost,
  getForumPosts,
  getForumPost,
  likeForumPost,
  createForumReply,
  shareMission,
  getSharedMissions,
  downloadMission,
  followUser,
  unfollowUser,
  getUserCommunityStats,
  getCommunityLeaderboard,
  searchCommunity
} from '../controllers/communityController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

// Forum routes
router.get('/forum/posts', getForumPosts);
router.get('/forum/posts/:id', getForumPost);
router.post('/forum/posts', authenticateToken, createForumPost);
router.post('/forum/posts/:id/like', authenticateToken, likeForumPost);
router.post('/forum/replies', authenticateToken, createForumReply);

// Mission sharing routes
router.get('/missions', getSharedMissions);
router.post('/missions', authenticateToken, shareMission);
router.get('/missions/:id/download', downloadMission);

// Social features routes
router.post('/follow', authenticateToken, followUser);
router.delete('/follow', authenticateToken, unfollowUser);

// Community stats and leaderboard
router.get('/stats/:userId', getUserCommunityStats);
router.get('/leaderboard', getCommunityLeaderboard);

// Search
router.get('/search', searchCommunity);

export default router;