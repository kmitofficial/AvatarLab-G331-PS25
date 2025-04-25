import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Forward the request to the external Flask API
    const response = await fetch('https://3cbe-52-15-120-16.ngrok-free.app/generate_video', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to generate video: ${response.statusText}`);
    }

    // Parse the JSON response from Flask
    const result = await response.json();

    // Check if video_path is provided and attempt to fetch the video
    let videoPublicPath = null;
    if (result.video_path) {
      const videoUrl = `https://3cbe-52-15-120-16.ngrok-free.app/${result.video_path}`; // Attempt to construct URL
      const videoResponse = await fetch(videoUrl);

      if (videoResponse.ok) {
        const videoBuffer = await videoResponse.buffer();
        const videoFileName = `generated_video_${Date.now()}.mp4`; // Unique filename
        const videoFilePath = path.join(process.cwd(), 'public', 'videos', videoFileName);

        // Ensure the videos directory exists
        await fs.mkdir(path.dirname(videoFilePath), { recursive: true });

        // Save the video file
        await fs.writeFile(videoFilePath, videoBuffer);

        // Generate public URL for video
        videoPublicPath = `/videos/${videoFileName}`;
      } else {
        console.warn(`Failed to fetch video from ${videoUrl}. Flask server may not serve ${result.video_path}.`);
        // Note: This will fail unless Flask serves the Outputs directory statically
      }
    }

    // Return the result with the video path if saved, or the original result
    return NextResponse.json({
      ...result,
      videoFilePath: videoPublicPath || result.video_path, // Use saved path or original path
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}