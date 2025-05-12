import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";
import connectMDB from "./mongodb";

export async function uploadVideo(email: string, file: File) {
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
