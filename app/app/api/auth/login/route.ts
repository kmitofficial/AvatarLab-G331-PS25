import connectMDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectMDB();

    const { email, password } = await req.json();

    const user = await db.collection("users").findOne({ email, password });

    if (!user) {
      return NextResponse.json( { message: "Invalid Credentials" }, { status: 404 });
    }

    const token = sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const serializedCookie = serialize("token", token, {
      httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/",
      maxAge: 60 * 60,
    });

    const response = NextResponse.json({ message: "Successful", email },{ status: 200 });
    response.headers.set("Set-Cookie", serializedCookie);

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
