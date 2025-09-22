"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const connectDB = async (options = {}) => {
    const { retryAttempts = 5, retryDelay = 5000 } = options;
    let attempts = 0;
    while (attempts < retryAttempts) {
        try {
            const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/space_mission_platform';
            const conn = await mongoose_1.default.connect(mongoURI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
            });
            logger_1.logger.info(`MongoDB Connected: ${conn.connection.host}`);
            return conn;
        }
        catch (error) {
            attempts++;
            logger_1.logger.error(`MongoDB connection attempt ${attempts} failed:`, error);
            if (attempts >= retryAttempts) {
                logger_1.logger.error('Max MongoDB connection attempts reached. Exiting...');
                process.exit(1);
            }
            logger_1.logger.info(`Retrying MongoDB connection in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};
mongoose_1.default.connection.on('connected', () => {
    logger_1.logger.info('Mongoose connected to MongoDB');
});
mongoose_1.default.connection.on('error', (err) => {
    logger_1.logger.error('Mongoose connection error:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.logger.warn('Mongoose disconnected from MongoDB');
});
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    logger_1.logger.info('Mongoose connection closed through app termination');
    process.exit(0);
});
exports.default = connectDB;
//# sourceMappingURL=db.js.map