import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Get the Flask API URL from environment variable or use a default
    const apiUrl = process.env.FLASK_API_URL || " https://b6c7-3-236-234-38.ngrok-free.app"

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

    // Store the processed video in a temporary location or return it directly
    // For this example, we'll return it directly
    return new NextResponse(videoBlob, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "attachment; filename=processed-video.mp4",
      },
    })
  } catch (error) {
    console.error("Error processing video:", error)
    return NextResponse.json({ error: "Failed to process video", details: String(error) }, { status: 500 })
  }
}
