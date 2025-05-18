import { Queue } from "bullmq";

export const connection = {
  host: "127.0.0.1",
  port: 6379,
};

export const videoQueue = new Queue("video-generation", { connection });