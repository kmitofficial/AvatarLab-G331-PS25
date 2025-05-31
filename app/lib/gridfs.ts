import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";
import connectMDB from "./mongodb";

interface UploadVideoResult {
  message: string;
  fileId: ObjectId;
  filename: string;
  metadata: {
    email: string;
    trashed: boolean;
    trashedAt: null | Date;
  };
}

export async function uploadVideo(email: string, file: File): Promise<UploadVideoResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { db } = await connectMDB();
  
  const bucket = new GridFSBucket(db, { bucketName: "videos" });

  const metadata = {email,trashed:false,trashedAt:null};

  const uploadStream = bucket.openUploadStream(file.name, {
    metadata,
  });

  const readable = Readable.from(buffer);

  return new Promise((resolve, reject) => {
    readable.pipe(uploadStream)
      .on("error", (err) => {
        console.error("Upload stream error:", err);
        reject(err);
      })
      .on("finish", () => {
        console.log("Upload completed with fileId:", uploadStream.id);
        resolve({
          message: "Video uploaded successfully",
          fileId: uploadStream.id as ObjectId,
          filename: file.name,
          metadata,
        });
      });
  });
}

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