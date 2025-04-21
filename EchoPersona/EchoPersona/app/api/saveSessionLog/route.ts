// /pages/api/saveSessionLog.js
import connectMDB from "@/lib/mongodb";
import SessionLog from "@/models/sessionLog";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectMDB();

  const { userId, textInput } = await req.json();

  try {
    const newLog = new SessionLog({
      userId,
      textInput,
    });
    await newLog.save();

    return NextResponse.json({ message: "Session log saved" }, { status: 201 });
  } catch (error) {
    console.error("Error saving session log:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}