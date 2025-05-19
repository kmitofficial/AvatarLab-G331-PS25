import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function deleteUserAvatar(email: string, id: string) {
  const avatar = await prisma.userAvatar.findUnique({ where: { id } });
  if (!avatar) return NextResponse.json({ message: "Avatar not found" }, { status: 404 });
  if (avatar.email !== email) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  await prisma.userAvatar.delete({ where: { id } });
  return NextResponse.json({ message: "Avatar deleted successfully" }, { status: 200 });
}

async function deleteUserVoice(email: string, id: string) {
  const voice = await prisma.userVoice.findUnique({ where: { id } });
  if (!voice) return NextResponse.json({ message: "Voice not found" }, { status: 404 });
  if (voice.email !== email) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  await prisma.userVoice.delete({ where: { id } });
  return NextResponse.json({ message: "Voice deleted successfully" }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const { email, id, role } = await req.json();

    if (role === "useravatar") return await deleteUserAvatar(email, id);
    if (role === "uservoice") return await deleteUserVoice(email, id);

    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
