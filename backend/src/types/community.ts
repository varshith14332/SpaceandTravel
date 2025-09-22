import { Request } from 'express';
import mongoose from 'mongoose';

// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Community related interfaces
export interface CreateForumPostRequest extends AuthenticatedRequest {
  body: {
    title: string;
    content: string;
    category?: 'general' | 'missions' | 'technical' | 'achievements' | 'help';
    tags?: string[];
  };
}

export interface CreateForumReplyRequest extends AuthenticatedRequest {
  body: {
    postId: string;
    content: string;
    parentReplyId?: string;
  };
}

export interface ShareMissionRequest extends AuthenticatedRequest {
  body: {
    title: string;
    description: string;
    missionData: {
      missionType: string;
      targetOrbit: {
        altitude: number;
        inclination: number;
        eccentricity: number;
      };
      payload: number;
      fuel: number;
      launchSite: string;
      engine: string;
      results?: {
        success: boolean;
        score: number;
        deltaV: number;
        fuelConsumption: number;
        orbitAccuracy: number;
      };
    };
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    tags?: string[];
    isPublic?: boolean;
  };
}

export interface FollowUserRequest extends AuthenticatedRequest {
  body: {
    userId: string;
  };
}

export interface ForumPostQuery {
  category?: string;
  page?: string;
  limit?: string;
  sort?: 'recent' | 'popular' | 'trending';
}

export interface MissionShareQuery {
  difficulty?: string;
  page?: string;
  limit?: string;
  sort?: 'recent' | 'popular' | 'downloads';
  author?: string;
}

export interface LeaderboardQuery {
  type?: 'reputation' | 'posts' | 'likes' | 'missions' | 'followers';
  limit?: string;
}

export interface SearchQuery {
  q?: string;
  type?: 'all' | 'posts' | 'missions' | 'users';
  page?: string;
  limit?: string;
}