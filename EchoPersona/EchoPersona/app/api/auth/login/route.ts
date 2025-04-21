// app/api/auth/login/route.ts
import connectMDB from "@/lib/mongodb";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
  await connectMDB();

  const { email, password } = await req.json();

  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return NextResponse.json({ message: "Invalid Credentials" }, { status: 404 });
    }

    const userId = user._id.toString();
    console.log("Setting userId cookie:", userId);

    const cookie = serialize("userId", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    const response = NextResponse.json({ message: "Successful", userId }, { status: 200 });
    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}