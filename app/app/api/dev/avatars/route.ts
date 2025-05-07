// app/api/dev/avatars/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const avatars = await prisma.avatar.findMany({});
    const userAvatar = await prisma.userAvatar.findMany({where:{email}})

    const predefinedFormatted = avatars.map((avatar) => ({
      id: avatar.id,
      name: avatar.name,
      gender:avatar.gender,
      video: `data:video/mp4;base64,${Buffer.from(avatar.video).toString('base64')}`,
    }));

    const userAvatarFormatted = userAvatar.map((avatar) => ({
      id: avatar.id,
      name: avatar.name,
      gender: avatar.gender,
      video: `data:video/mp4;base64,${Buffer.from(avatar.video).toString('base64')}`
    }))
 
    const data = { predefined:predefinedFormatted, user:userAvatarFormatted };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return NextResponse.json({ message: 'Error fetching avatars' }, { status: 500 });
  }
}