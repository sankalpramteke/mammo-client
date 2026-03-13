// lib/mongoose.ts — singleton Mongoose connection (survives Next.js hot-reload)
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

// Module-level cache so we don't reconnect on every API call
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Attach cache to globalThis to persist across hot-reloads
const globalWithMongoose = global as typeof globalThis & { mongooseCache?: MongooseCache };

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = { conn: null, promise: null };
}

const cache = globalWithMongoose.mongooseCache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
