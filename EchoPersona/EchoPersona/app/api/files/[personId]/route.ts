import { NextResponse } from 'next/server';
     import { prisma } from '@/lib/prisma';
     import { Buffer } from 'buffer';

     export async function GET(req: Request, { params }: { params: { personId: string } }) {
       const p=await params;
       console.log('Received params:', params); // Debug log
       const personIdParam = p.personId; // Capture parameter
       console.log('Raw personId param:', personIdParam); // Debug log
       const personId = parseInt(personIdParam);
       if (isNaN(personId)) {
         console.log('Failed to parse personId:', personIdParam);
         return NextResponse.json({ error: 'Invalid personId' }, { status: 400 });
       }
       console.log('Fetching files for personId:', personId); // Debug log
       try {
         const files = await prisma.person_files.findMany({
           where: {
             person_id: personId,
           },
           select: {
             file_type: true,
             file_data: true,
             file_name: true,
           },
         });
         if (!files.length) {
           console.log('No files found for person_id:', personId);
           return NextResponse.json({ error: 'No files found for this person' }, { status: 404 });
         }
         const response = {
           mp4: files.find(f => f.file_type === 'mp4')?.file_data ? Buffer.from(files.find(f => f.file_type === 'mp4')!.file_data).toString('base64') : null,
           npy: files.find(f => f.file_type === 'npy')?.file_data ? Buffer.from(files.find(f => f.file_type === 'npy')!.file_data).toString('base64') : null,
           wav: files.find(f => f.file_type === 'wav')?.file_data ? Buffer.from(files.find(f => f.file_type === 'wav')!.file_data).toString('base64') : null,
           file_names: {
             mp4: files.find(f => f.file_type === 'mp4')?.file_name || null,
             npy: files.find(f => f.file_type === 'npy')?.file_name || null,
             wav: files.find(f => f.file_type === 'wav')?.file_name || null,
           },
         };
         return NextResponse.json(response);
       } catch (error) {
         console.error('Fetch failed:', error); // Debug log
         return NextResponse.json({ error: 'Fetch failed', details: error }, { status: 500 });
       }
     }