"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['iss_pass', 'mission_update', 'training_reminder', 'achievement', 'space_weather', 'community'],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    category: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'system'
    },
    scheduledFor: {
        type: Date,
        index: true
    },
    sentAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        index: true
    },
    actions: [{
            label: { type: String, required: true },
            action: { type: String, required: true },
            url: { type: String }
        }],
    metadata: {
        issPassTime: { type: Date },
        missionId: { type: String },
        achievementId: { type: String },
        weatherAlert: {
            severity: { type: String },
            region: { type: String }
        }
    }
}, {
    timestamps: true
});
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, sentAt: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.statics.createISSPassNotification = function (userId, passTime, duration, maxElevation) {
    return this.create({
        userId,
        type: 'iss_pass',
        title: 'ISS Pass Alert',
        message: `The International Space Station will be visible in ${Math.round((passTime.getTime() - Date.now()) / 60000)} minutes!`,
        priority: 'high',
        category: 'space_tracking',
        scheduledFor: new Date(passTime.getTime() - 10 * 60 * 1000),
        expiresAt: new Date(passTime.getTime() + duration * 60 * 1000),
        metadata: {
            issPassTime: passTime
        },
        actions: [
            {
                label: 'View Tracking',
                action: 'navigate',
                url: '/dashboard'
            }
        ]
    });
};
notificationSchema.statics.createMissionUpdateNotification = function (userId, missionId, title, message) {
    return this.create({
        userId,
        type: 'mission_update',
        title,
        message,
        priority: 'medium',
        category: 'missions',
        metadata: {
            missionId
        },
        actions: [
            {
                label: 'View Mission',
                action: 'navigate',
                url: `/missions/${missionId}`
            }
        ]
    });
};
notificationSchema.statics.createAchievementNotification = function (userId, achievementId, achievementName) {
    return this.create({
        userId,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `Congratulations! You've earned the "${achievementName}" achievement.`,
        priority: 'high',
        category: 'achievements',
        metadata: {
            achievementId
        },
        actions: [
            {
                label: 'View Profile',
                action: 'navigate',
                url: '/profile'
            }
        ]
    });
};
notificationSchema.statics.createTrainingReminderNotification = function (userId, trainingName) {
    return this.create({
        userId,
        type: 'training_reminder',
        title: 'Training Reminder',
        message: `Don't forget to continue your "${trainingName}" training session.`,
        priority: 'low',
        category: 'learning',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        actions: [
            {
                label: 'Continue Training',
                action: 'navigate',
                url: '/training'
            }
        ]
    });
};
notificationSchema.statics.createSpaceWeatherNotification = function (userId, severity, region, details) {
    return this.create({
        userId,
        type: 'space_weather',
        title: 'Space Weather Alert',
        message: details,
        priority: severity === 'extreme' ? 'urgent' : severity === 'severe' ? 'high' : 'medium',
        category: 'space_weather',
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        metadata: {
            weatherAlert: {
                severity,
                region
            }
        },
        actions: [
            {
                label: 'View Details',
                action: 'navigate',
                url: '/dashboard?tab=space-weather'
            }
        ]
    });
};
exports.Notification = mongoose_1.default.model('Notification', notificationSchema);
//# sourceMappingURL=Notification.js.map