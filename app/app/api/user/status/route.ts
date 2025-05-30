import { NextRequest, NextResponse } from "next/server";
import { videoQueue } from "@/lib/bullmq";
import { getVideoBufferById } from "@/lib/gridfs";

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
