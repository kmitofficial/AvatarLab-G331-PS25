import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formdata = await req.formData();
    const name = formdata.get('name') as string;
    const audio = formdata.get('audio') as File;
    const text = formdata.get('text') as string;
    const gender = formdata.get('gender') as string;
    const email = formdata.get('email') as string;
 
    if (!audio || !text || !gender || !email) {
      return NextResponse.json({ message: "Missing Fields" }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audio.arrayBuffer());

    const voice = await prisma.userVoice.create({
      data: { name, text, gender, audio: audioBuffer, language:"English", email },
    });

    return NextResponse.json({ message: "Voice Saved Successfully !" }, { status: 201 });
  } catch (error) {
    console.error("Voice Upload Error:", error);
    return NextResponse.json({ message: "Server Issue" }, { status: 500 });
  }
}