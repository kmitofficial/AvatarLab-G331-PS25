// app/api/generate-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    console.log("Received request to /api/generate-token at", new Date().toISOString());

    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return NextResponse.json({ message: "Server configuration error: JWT_SECRET missing" }, { status: 500 });
    }

    const { email, username, image } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Generate a custom JWT token
    const token = sign(
      { email, username: username ?? "Unknown", image: image ?? "" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Generated JWT token:", token);

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Generate Token Error:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}