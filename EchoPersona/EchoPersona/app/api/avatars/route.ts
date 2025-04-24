import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct

export async function GET() {
  try {
    const avatars = await prisma.avatar.findMany({});

    const formatted = avatars.map((avatar) => ({
      id: avatar.id,
      name: avatar.name,
      gender: avatar.gender,
      video: avatar.video_data 
        ? `data:video/mp4;base64,${Buffer.from(avatar.video_data).toString('base64')}` 
        : null
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatars' },
      { status: 500 }
    );
  }
}