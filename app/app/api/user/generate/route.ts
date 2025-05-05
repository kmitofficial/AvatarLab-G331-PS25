import { NextRequest, NextResponse } from "next/server";
import { uploadVideo } from "@/lib/gridfs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { email, text, audioId, videoId, audio_text } = await req.json();

        const voice = await prisma.voice.findUnique({
            where: { id: audioId },
            select: { audio: true },
        });

        const avatar = await prisma.avatar.findUnique({
            where:{id:videoId},
            select:{video:true}
        })

        console.log("🚀Recived Request Data...")

        if (!voice || !voice.audio) {
            throw new Error("Audio not found for the provided ID");
        }
        if (!avatar || !avatar.video){
            throw new Error("Video not found for the provided ID");
        }

        {/*Audio File*/}
        const audioBuffer = Buffer.from(voice.audio as Buffer);
        if (audioBuffer.length === 0) {
            throw new Error('Audio data is empty');
        }
        const audioFile = new File([audioBuffer], 'input_audio.wav', { type: 'audio/wav' });

        {/*Video File*/}
        const videoBuffer = Buffer.from(avatar.video as Buffer)
        if (videoBuffer.length === 0){
            throw new Error('Video data is empty');
        }
        const videoFile = new File([videoBuffer],'input_video.mp4',{type: 'video/mp4'})

        const TTS = new FormData();
        TTS.append('text', text);
        TTS.append('audio', audioFile, 'input_audio.wav');
        TTS.append('text_normalized', audio_text);

        console.log("🚀Sending data to TTS model for inference...")

        const TTS_res = await fetch(process.env.TTS_URL!, { method: 'POST', body: TTS,});

        if (!TTS_res.ok) {
            const errorText = await TTS_res.text();
            console.error(`TTS server failed with status ${TTS_res.status}: ${errorText}`);
            throw new Error(`TTS server failed: ${errorText}`);
        }

        const generatedAudioBuffer = Buffer.from(await TTS_res.arrayBuffer());
        const generatedAudioFile = new File([generatedAudioBuffer], 'generated_audio.wav', { type: 'audio/wav' });

        console.log("🚀Audio generated successfully...");

        const THV = new FormData();
        THV.append('reference_audio', generatedAudioFile);
        THV.append('reference_video', videoFile);

        console.log("🚀Sending data to DiffDub model for inference...");

        const videoResponse = await fetch(process.env.DIFF_DUB_URL!, { method: 'POST', body: THV,});

        if (!videoResponse.ok) {
            const errorText = await videoResponse.text();
            console.error(`DiffDub server failed with status: ${videoId.status}: ${errorText}`)
            throw new Error(`DiffDub video generation failed: ${errorText}`);
        }

        const generatedVideoBuffer = Buffer.from(await videoResponse.arrayBuffer());
        const generatedVideoFile = new File([generatedVideoBuffer], 'final_video.mp4', { type: 'video/mp4' });

        const base64Video = generatedVideoBuffer.toString('base64');

        console.log("🚀Video generated successfully...");

        await uploadVideo(email, generatedVideoFile);

        console.log("🚀Saved video successfully...");

        return NextResponse.json({ message: "Success", video: `data:video/mp4;base64,${base64Video}` }, { status: 200 });

    } catch (error) {
        console.error("Error in POST handler:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ message: "Server Error", error: errorMessage }, { status: 500 });
    }
}
