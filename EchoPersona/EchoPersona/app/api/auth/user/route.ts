// app/api/auth/user/route.ts
import connectMDB from "@/lib/mongodb";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectMDB();
  const userId = req.nextUrl.searchParams.get("userId");

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ username: user.email.split("@")[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}