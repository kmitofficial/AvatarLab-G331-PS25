import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, username, voiceAudioInput, audioData } = await req.json();

    if (!userId || !username || !voiceAudioInput || !audioData) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Decode base64 audio data
    const base64Data = audioData.replace(/^data:audio\/wav;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Save .wav file to public/audio directory
    const fileName = `${userId}_${Date.now()}.wav`;
    const filePath = path.join(process.cwd(), "public", "audio", fileName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    // Generate public URL
    const audioFilePath = `/audio/${fileName}`;

    // Save to user_response_videos
    const video = await prisma.userResponseVideo.create({
      data: {
        userId,
        username,
        voiceAudioInput,
        audioFilePath,
        responseVideoPath: null, // Now nullable in the database
      },
    });

    return NextResponse.json({ id: video.id, audioFilePath }, { status: 200 });
  } catch (error) {
    console.error("Error saving audio to PostgreSQL:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}