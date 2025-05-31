import { NextResponse } from "next/server"
import { uploadVideo } from "@/lib/gridfs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const email = formData.get('email') as string;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const apiUrl = process.env.BACKGROUND_API_URL!

    console.log("🚀Sending request data")

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Flask API error:", errorText)
      return NextResponse.json({ error: "Failed to process video", details: errorText }, { status: response.status })
    }
    const videoBlob = await response.blob()

    const generatedVideoBuffer = Buffer.from(await videoBlob.arrayBuffer());
    const generatedVideoFile = new File([generatedVideoBuffer], 'Edited Video.mp4', { type: 'video/mp4' });

    const base64Video = generatedVideoBuffer.toString('base64');

    console.log("🚀Video generated successfully");

    await uploadVideo(email, generatedVideoFile);

    console.log("✅Saved video successfully");

    return NextResponse.json({ 
      message: "Success", 
      video: `data:video/mp4;base64,${base64Video}` 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error processing video:", error)
    return NextResponse.json({ error: "Failed to process video", details: String(error) }, { status: 500 })
  }
}