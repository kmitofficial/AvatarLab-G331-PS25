import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string;
    const name = formData.get('name') as string;

    if (!file || !name || !category) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());

    const saved = await prisma.images.create({
      data: {
        name,
        category,
        file: imageBuffer,
      },
    });

    return NextResponse.json({ message: 'Image saved', id: saved.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
