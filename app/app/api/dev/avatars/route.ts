import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const predefinedAvatars = await prisma.avatar.findMany({
      select: { id: true, name: true, gender: true, video: true },
    });

    const userAvatars = await prisma.userAvatar.findMany({
      where: { email },
      select: { id: true, name: true, gender: true, email: true, video: true },
    });

    const predefinedFormatted = predefinedAvatars.map((avatar) => ({
      id: avatar.id,
      name: avatar.name,
      gender: avatar.gender,
      video: `data:video/mp4;base64,${Buffer.from(avatar.video).toString('base64')}`,
    }));

    const userDefinedFormatted = userAvatars.map((avatar) => ({
      id: avatar.id,
      name: avatar.name,
      gender: avatar.gender,
      email: avatar.email,
      video: `data:video/mp4;base64,${Buffer.from(avatar.video).toString('base64')}`,
    }));

    const data = {
      predefined: predefinedFormatted,
      userdefined: userDefinedFormatted,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return NextResponse.json({ message: 'Error fetching avatars' }, { status: 500 });
  }
}