// app/api/save-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, username, voiceAudioInput, responseVideoPath } = await req.json();

    if (!userId || !username || !voiceAudioInput || !responseVideoPath) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const video = await prisma.userResponseVideo.create({
      data: {
        userId,
        username,
        voiceAudioInput,
        responseVideoPath,
      },
    });

    return NextResponse.json({ id: video.id }, { status: 200 });
  } catch (error) {
    console.error("Error saving video to PostgreSQL:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}