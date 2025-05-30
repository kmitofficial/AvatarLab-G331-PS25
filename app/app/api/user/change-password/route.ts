// app/api/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMDB from "@/lib/mongodb";


export async function POST(req: NextRequest) {
  try {
    const {email,currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    console.log(email,currentPassword,newPassword);
    const { db } = await connectMDB();

    const user = await db
      .collection("users")
      .findOne({email:email,password:currentPassword});

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password 
    if (currentPassword !== user.password) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Update password in the database 
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { password: newPassword } }
    );

    return NextResponse.json({ message: "Password changed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } 
}