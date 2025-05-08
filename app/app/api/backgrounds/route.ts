import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct

export async function GET() {
  try {
    const bgs = await prisma.images.findMany({});

    const formatted = bgs.map((image) => ({
      id: image.id,
      category: image.category,
      name: image.name,
      src: image.file 
        ? `data:image/jpeg;base64,${Buffer.from(image.file).toString('base64')}` 
        : null,
      premium: false // You can add logic to determine premium status if needed
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
