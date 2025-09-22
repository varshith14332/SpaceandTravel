import mongoose from 'mongoose';
interface ConnectionOptions {
    retryAttempts?: number;
    retryDelay?: number;
}
declare const connectDB: (options?: ConnectionOptions) => Promise<typeof mongoose | undefined>;
export default connectDB;
//# sourceMappingURL=db.d.ts.map