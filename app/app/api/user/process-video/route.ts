import { NextResponse } from "next/server"
import { uploadVideo } from "@/lib/gridfs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // Get email from formData
    const email = formData.get('email') as string;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get the Flask API URL from environment variable or use a default
    const apiUrl = process.env.FLASK_API_URL || "https://c359-3-235-145-101.ngrok-free.app/api/process-video"

    // Log the request for debugging
    console.log("Sending request to Flask API:", apiUrl)

    // Send the formData directly to the Flask API
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      // No need to set Content-Type as it's automatically set with the correct boundary for multipart/form-data
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Flask API error:", errorText)
      return NextResponse.json({ error: "Failed to process video", details: errorText }, { status: response.status })
    }

    // Get the processed video as a blob
    const videoBlob = await response.blob()
    
    // Create buffer and file from the blob
    const generatedVideoBuffer = Buffer.from(await videoBlob.arrayBuffer());
    const generatedVideoFile = new File([generatedVideoBuffer], 'final_video.mp4', { type: 'video/mp4' });

    // Convert to base64 for response
    const base64Video = generatedVideoBuffer.toString('base64');

    console.log("🚀Video generated successfully...");

    // Save to GridFS
    await uploadVideo(email, generatedVideoFile);

    console.log("🚀Saved video successfully...");

    // Return JSON response with base64 video
    return NextResponse.json({ 
      message: "Success", 
      video: `data:video/mp4;base64,${base64Video}` 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error processing video:", error)
    return NextResponse.json({ error: "Failed to process video", details: String(error) }, { status: 500 })
  }
}