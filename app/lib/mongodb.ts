import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGO_URL!;
const dbName = process.env.DATABASE!;

if (!uri || !dbName) {
  throw new Error("Missing MONGODB_URL or DATABASE in environment variables");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export default async function connectMDB() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await new MongoClient(uri).connect();
  const db = client.db(dbName);
  console.log('🚀Mongodb Connected !!! 🚀')

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
