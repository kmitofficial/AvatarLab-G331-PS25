// app/api/dev/avatars/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const avatars = await prisma.avatar.findMany({});

    const formatted = avatars.map((avatar: { id: any; name: any; gender: any; video: any; }) => ({
      id: avatar.id,
      name: avatar.name,
      gender:avatar.gender,
      video: `data:video/mp4;base64,${Buffer.from(avatar.video).toString('base64')}`,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return NextResponse.json({ message: 'Error fetching avatars' }, { status: 500 });
  }
}