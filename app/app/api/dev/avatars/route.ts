import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Fetch predefined avatars
    const predefinedAvatars = await prisma.avatar.findMany({
      select: { id: true, name: true, gender: true, video: true },
    });

    // Fetch all user-defined avatars
    const userDefinedAvatars = await prisma.userAvatar.findMany({
      select: { id: true, name: true, gender: true, email: true, video: true },
    });

    // Fetch user-specific avatars for the provided email
    const userAvatars = await prisma.userAvatar.findMany({
      where: { email },
      select: { id: true, name: true, gender: true, email: true, video: true },
    });

    // Format predefined avatars
    const predefinedFormatted = predefinedAvatars.map((avatar) => ({
      id: avatar.id,
      name: avatar.name,
      gender: avatar.gender,
      video: `data:video/mp4;base64,${Buffer.from(avatar.video).toString('base64')}`,
    }));

    // Format user-defined avatars
    const userDefinedFormatted = userDefinedAvatars.map((avatar) => ({
      id: avatar.id,
      name: avatar.name,
      gender: avatar.gender,
      email: avatar.email,
      video: `data:video/mp4;base64,${Buffer.from(avatar.video).toString('base64')}`,
    }));

    // Format user-specific avatars
    const userFormatted = userAvatars.length > 0
      ? userAvatars.map((avatar) => ({
          id: avatar.id,
          name: avatar.name,
          gender: avatar.gender,
          email: avatar.email,
          video: `data:video/mp4;base64,${Buffer.from(avatar.video).toString('base64')}`,
        }))
      : null;

    const data = {
      predefined: predefinedFormatted,
      userdefined: userDefinedFormatted,
      user: userFormatted,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return NextResponse.json({ message: 'Error fetching avatars' }, { status: 500 });
  }
}