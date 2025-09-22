"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const communityController_1 = require("../controllers/communityController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.get('/forum/posts', communityController_1.getForumPosts);
router.get('/forum/posts/:id', communityController_1.getForumPost);
router.post('/forum/posts', auth_1.authenticateToken, communityController_1.createForumPost);
router.post('/forum/posts/:id/like', auth_1.authenticateToken, communityController_1.likeForumPost);
router.post('/forum/replies', auth_1.authenticateToken, communityController_1.createForumReply);
router.get('/missions', communityController_1.getSharedMissions);
router.post('/missions', auth_1.authenticateToken, communityController_1.shareMission);
router.get('/missions/:id/download', communityController_1.downloadMission);
router.post('/follow', auth_1.authenticateToken, communityController_1.followUser);
router.delete('/follow', auth_1.authenticateToken, communityController_1.unfollowUser);
router.get('/stats/:userId', communityController_1.getUserCommunityStats);
router.get('/leaderboard', communityController_1.getCommunityLeaderboard);
router.get('/search', communityController_1.searchCommunity);
exports.default = router;
//# sourceMappingURL=communityRoutes.js.map