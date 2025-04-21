import connectMDB  from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectMDB();

    const { email, password } = await req.json();

    const user = await db.collection("users").findOne({ email, password });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid Credentials" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Successful" }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
