import { PrismaClient } from '../../../lib/generated/prisma';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        console.log('Prisma client initialized:', prisma);
        console.log('Available models:', Object.keys(prisma));
        const avatars = await prisma.avatars.findMany({
            select: {
                id: true,
                name: true,
                gender: true,
            },
        });
        return NextResponse.json(avatars);
    } catch (error) {
        console.error('Error fetching avatars:', error);
        return NextResponse.json({ error: 'Failed to fetch avatars' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}