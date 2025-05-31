import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const gender = formData.get('gender') as string;
    const video = formData.get('video') as File;
    const email = formData.get('email') as string;

    if (!name || !gender || !video || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Convert video File to Buffer
    const videoBuffer = Buffer.from(await video.arrayBuffer());

    // Save to UserAvatar table
    const avatar = await prisma.userAvatar.create({
      data: {
        name,
        gender,
        email,
        video: videoBuffer,
      },
    });

    return NextResponse.json({ message: 'Avatar created successfully', avatar }, { status: 200 });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ message: 'Error uploading avatar' }, { status: 500 });
  }
}