import { NextResponse } from "next/server";
import connectMDB from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { db } = await connectMDB();
    const { username, email, password } = await req.json();

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const newUser = { username, email, password, createdAt: new Date()};

    await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
