import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { logger } from '../utils/logger';

interface ConnectionOptions {
  retryAttempts?: number;
  retryDelay?: number;
}

let mongod: MongoMemoryServer | null = null;

const connectDB = async (options: ConnectionOptions = {}) => {
  const { retryAttempts = 5, retryDelay = 5000 } = options;
  
  let attempts = 0;
  
  while (attempts < retryAttempts) {
    try {
      let mongoURI: string;
      
      if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
        mongoURI = process.env.MONGODB_URI;
      } else {
        // Use MongoDB Memory Server for development
        if (!mongod) {
          mongod = await MongoMemoryServer.create({
            instance: {
              port: 27017, // Use default MongoDB port
            },
          });
        }
        mongoURI = mongod.getUri();
      }
      
      const conn = await mongoose.connect(mongoURI, {
        // Connection options
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      });

      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
      
    } catch (error) {
      attempts++;
      logger.error(`MongoDB connection attempt ${attempts} failed:`, error);
      
      if (attempts >= retryAttempts) {
        logger.error('Max MongoDB connection attempts reached. Exiting...');
        process.exit(1);
      }
      
      logger.info(`Retrying MongoDB connection in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
  logger.info('Mongoose connection closed through app termination');
  process.exit(0);
});

export default connectDB;
