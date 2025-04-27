import { prisma } from "@/lib/prisma";
import { NextRequest,NextResponse } from "next/server";


export async function GET(req:NextRequest) {
    try{

        const voices = await prisma.voice.findMany({
            select:{ id:true, name:true, text:true, audio:true, gender:true },
        })

        const formatted = voices.map((voice: { id: any; name: any; text: any; gender: any; audio: any; }) => ({
            id: voice.id, name:voice.name, text: voice.text, gender: voice.gender,
            audio: `data:audio/wav;base64,${Buffer.from(voice.audio).toString('base64')}`,

        }))

        return NextResponse.json(formatted,{status:200});
    }catch(error){
        console.error(error);
        return NextResponse.json({message:'Server Issue'},{status:500})
    }
}