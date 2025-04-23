import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    try {
        const avatarId = parseInt(params.id, 10);
        
        const avatar = await prisma.avatars.findUnique({
            where: {
                id: avatarId,
            },
            select: {
                videoData: true,
                name: true
            }
        });

        if (!avatar) {
            return NextResponse.json(
                { error: 'Avatar not found' },
                { status: 404 }
            );
        }

        if (!avatar.videoData) {
            return NextResponse.json(
                { error: 'Video data not available' },
                { status: 404 }
            );
        }

        const range = request.headers.get('range');
        const videoSize = avatar.videoData.length;
        
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
            const chunkSize = end - start + 1;
            
            const videoChunk = avatar.videoData.slice(start, end + 1);
            
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${videoSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            };
            
            return new Response(videoChunk, { 
                status: 206, 
                headers 
            });
        } else {
            const headers = {
                'Content-Length': videoSize,
                'Content-Type': 'video/mp4',
            };
            
            return new Response(avatar.videoData, { 
                status: 200, 
                headers 
            });
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        return NextResponse.json(
            { error: 'Failed to stream video' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}