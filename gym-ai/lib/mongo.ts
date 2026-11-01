import mongoose from "mongoose";

type Cache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & {
  mongooseCache?: Cache;
};

const cached: Cache = (globalCache.mongooseCache ??= {
  connection: null,
  promise: null,
});

export async function connectToDatabase() {
  if (cached.connection) return cached.connection;

  const uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Add it to .env.local and restart the server.",
    );
  }

  cached.promise ??= mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    cached.connection = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.connection;
}
