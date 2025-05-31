import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const videoFile = formData.get('video') as File | null;
    const name = formData.get('name') as string;
    const gender = formData.get('gender') as string;

    if (!videoFile || !name) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());

    const saved = await prisma.avatar.create({
      data: { name, gender, video: videoBuffer,},
    });

    return NextResponse.json({ message: 'Video saved', id: saved.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}