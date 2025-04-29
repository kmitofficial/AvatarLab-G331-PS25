import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Set up a 10-minute timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000000); // 10 minutes (600,000 ms)

    // Forward the request to the external Flask API with timeout
    const response = await fetch('https://f5ee-18-116-98-203.ngrok-free.app/generate_video', {
      method: 'POST',
      body: formData,
      signal: controller.signal, // Attach the abort signal
    });

    // Clear the timeout if the request completes
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to generate video: ${response.statusText}`);
    }

    // The Flask API sends the video file directly, not JSON
    const videoBuffer = await response.arrayBuffer();
    const videoFileName = `generated_video_${Date.now()}.mp4`; // Unique filename
    const videoFilePath = path.join(process.cwd(), 'public', 'videos', videoFileName);

    // Ensure the videos directory exists
    await fs.mkdir(path.dirname(videoFilePath), { recursive: true });

    // Save the video file
    await fs.writeFile(videoFilePath, Buffer.from(videoBuffer));

    // Generate public URL for video
    const videoPublicPath = `/videos/${videoFileName}`;
    
    // Return JSON with the path to the generated video
    return NextResponse.json({
      success: true,
      video_path: videoPublicPath
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}