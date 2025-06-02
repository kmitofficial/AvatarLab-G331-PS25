import { Queue } from "bullmq";

// Debug logging to see what values are being used
console.log("Redis connection values:", {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD ? "***" : "undefined"
});

export const connection = {
  host: process.env.REDIS_HOST || "living-starling-44812.upstash.io",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: process.env.REDIS_PASSWORD || "Aa8MAAIjcDE2Zjc3ZjRjYmY3Yzk0ZWU0YTc4OWRkZGRmMWE0YzYzMXAxMA",
  tls: {}, // required for `rediss://` (secure connection)
};

// Debug the final connection object
console.log("Final connection config:", {
  host: connection.host,
  port: connection.port,
  hasPassword: !!connection.password
});

export const videoQueue = new Queue("video-generation", { connection });