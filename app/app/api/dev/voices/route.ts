import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    const predefinedVoices = await prisma.voice.findMany({
      select: { id: true, name: true, gender: true, text: true, language: true, audio: true },
    })

    const userDefinedVoices = await prisma.userVoice.findMany({
      select: { id: true, name: true, gender: true, text: true, language: true, email: true, audio: true },
    })

    const userVoices = await prisma.userVoice.findMany({
      where: { email },
      select: { id: true, name: true, gender: true, text: true, language: true, email: true, audio: true },
    })

    // Format predefined voices
    const predefinedFormatted = predefinedVoices.map((voice) => ({
      id: voice.id,
      name: voice.name,
      gender: voice.gender,
      text: voice.text,
      language: voice.language,
      audio: `data:audio/mp3;base64,${Buffer.from(voice.audio).toString("base64")}`,
    }))

    // Format user-defined voices
    const userDefinedFormatted = userDefinedVoices.map((voice) => ({
      id: voice.id,
      name: voice.name,
      gender: voice.gender,
      text: voice.text,
      language: voice.language,
      email: voice.email,
      audio: `data:audio/mp3;base64,${Buffer.from(voice.audio).toString("base64")}`,
    }))

    // Format user-specific voices
    const userFormatted =
      userVoices.length > 0
        ? userVoices.map((voice) => ({
            id: voice.id,
            name: voice.name,
            gender: voice.gender,
            text: voice.text,
            language: voice.language,
            email: voice.email,
            audio: `data:audio/mp3;base64,${Buffer.from(voice.audio).toString("base64")}`,
          }))
        : null

    const data = {
      predefined: predefinedFormatted,
      userdefined: userDefinedFormatted,
      user: userFormatted,
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error fetching voices:", error)
    return NextResponse.json({ message: "Error fetching voices" }, { status: 500 })
  }
}
