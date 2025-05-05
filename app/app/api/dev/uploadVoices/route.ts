import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/authenticate";
export async function POST(req: NextRequest) {
  try {
    const userIdentifier = await getUserId(req);
    if (!userIdentifier) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const text_normalized = formData.get("text_normalized") as string;
    const gender = formData.get("gender") as string;
    const audio = formData.get("audio") as File;
    const language = formData.get("language") as string;

    if (!audio || !text_normalized || !gender) {
      return NextResponse.json({ message: "Missing Fields" }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audio.arrayBuffer());

      const voices = await prisma.userVoice.create({
        data: {
          name,
          text_normalized,
          gender,
          audio: audioBuffer,
          language,
          userIdentifier,
        },
      });


    return NextResponse.json({ success: true,message: "Voice saved", voices }, { status: 201 });
  } catch (error) {
    console.error("Voice Upload Error:", error);
    return NextResponse.json({ message: "Server Issue" }, { status: 500 });
  }
}