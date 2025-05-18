import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const gender = formData.get("gender") as string
    const text = formData.get("text") as string
    const language = formData.get("language") as string
    const email = formData.get("email") as string
    const audio = formData.get("audio") as File

    if (!name || !gender || !text || !language || !email || !audio) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["audio/webm", "audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg"]
    if (!validTypes.includes(audio.type)) {
      return NextResponse.json({ message: "Invalid file type. Please upload an audio file." }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (audio.size > maxSize) {
      return NextResponse.json({ message: "File is too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Convert audio File to Buffer
    const audioBuffer = Buffer.from(await audio.arrayBuffer())

    // Save to UserVoice table
    const voice = await prisma.userVoice.create({
      data: {
        name,
        gender,
        text,
        language,
        email,
        audio: audioBuffer,
      },
    })

    return NextResponse.json(
      { message: "Voice created successfully", voice: { id: voice.id, name, gender, text, language, email } },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error uploading voice:", error)
    return NextResponse.json({ message: "Error uploading voice" }, { status: 500 })
  }
}
