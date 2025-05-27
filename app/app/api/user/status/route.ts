import { NextRequest, NextResponse } from "next/server";
import { videoQueue } from "@/lib/bullmq";
import { getVideoBufferById } from "@/lib/getVideoBufferById";
// import connectMDB from "@/lib/mongodb";
// import { GridFSBucket, ObjectId } from "mongodb";

// export async function getVideoBufferById(fileId: string | ObjectId): Promise<Buffer> {
//   const { db } = await connectMDB();
//   const bucket = new GridFSBucket(db, { bucketName: "videos" });

//   const id = typeof fileId === "string" ? new ObjectId(fileId) : fileId;

//   return new Promise((resolve, reject) => {
//     const chunks: Uint8Array[] = [];

//     const downloadStream = bucket.openDownloadStream(id);

//     downloadStream.on("data", (chunk:any) => {
//       chunks.push(chunk);
//     });

//     downloadStream.on("error", (err:any) => {
//       reject(err);
//     });
//     downloadStream.on("end", () => {
//       const buffer = Buffer.concat(chunks);
//       resolve(buffer);
//     });
//   });
// }

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ status: "invalid" }, { status: 400 });

  const job = await videoQueue.getJob(taskId);

  if (!job) {
    return NextResponse.json({ status: "not_found" });
  }

  const state = await job.getState();

  if (state === "completed") {
    const videoFileId = job.returnvalue;
    console.log("Job returned value: ",videoFileId);
    if (!videoFileId) {
      return NextResponse.json({ status: "no_video_found" });
    }
    const buffer = await getVideoBufferById(videoFileId)
    return NextResponse.json({ message: "done",video:`data:video/mp4;base64,${buffer.toString("base64")}`},{status:200});
  } else if (state === "failed") {
    return NextResponse.json({ message: "failed" });
  } else {
    return NextResponse.json({ status: "processing" });
  }
}
