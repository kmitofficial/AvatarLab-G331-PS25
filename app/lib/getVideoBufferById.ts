import connectMDB from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";



export async function getVideoBufferById(fileId: string | ObjectId): Promise<Buffer> {
  const { db } = await connectMDB();
  const bucket = new GridFSBucket(db, { bucketName: "videos" });

  const id = typeof fileId === "string" ? new ObjectId(fileId) : fileId;

  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    const downloadStream = bucket.openDownloadStream(id);

    downloadStream.on("data", (chunk:any) => {
      chunks.push(chunk);
    });

    downloadStream.on("error", (err:any) => {
      reject(err);
    });
    downloadStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
  });
}