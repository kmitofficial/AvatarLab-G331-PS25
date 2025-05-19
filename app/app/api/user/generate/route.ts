import { NextRequest, NextResponse } from "next/server";
import { videoQueue } from "@/lib/bullmq";

export async function POST(req: NextRequest) {
  const { email, text, audioId, videoId, audio_text } = await req.json();

  const job = await videoQueue.add("generate-video", {
    email,
    text,
    audioId,
    videoId,
    audio_text,
  });
  console.log("Task created: ",job.id," data: ",job.data );
  return NextResponse.json({ taskId: job.id });
}
