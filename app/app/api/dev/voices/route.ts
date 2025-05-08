import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const voices = await prisma.voice.findMany({
        select:{ id:true, name:true, text:true, audio:true, gender:true },
    })

    const userVoices = await prisma.userVoice.findMany({
      where: { email },
      select: { id: true, name: true, text: true, audio: true, gender:true },
    });

    const preDefinedFormatted = voices.map((voice: { id: any; name: any; text: any; gender: any; audio: any; }) => ({
        id: voice.id, name:voice.name, text: voice.text, gender: voice.gender,
        audio: `data:audio/wav;base64,${Buffer.from(voice.audio).toString('base64')}`,

    }))

    const userVoiceFormatted = userVoices.length > 0
      ? userVoices.map((voice) => ({
          id: voice.id,
          name: voice.name,
          text: voice.text,
          gender: voice.gender,
          audio: `data:video/mp4;base64,${Buffer.from(voice.audio).toString('base64')}`,
        }))
      : null;

    const data = { predefined: preDefinedFormatted, user: userVoiceFormatted };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return NextResponse.json({ message: 'Error fetching avatars' }, { status: 500 });
  }
}
