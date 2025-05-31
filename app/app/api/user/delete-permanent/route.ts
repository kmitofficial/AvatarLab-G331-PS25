import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectMDB from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email, videoId } = await req.json();

    if (!email || !videoId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const {db} = await connectMDB();

    const fileObjectId = new ObjectId(videoId);

    const file = await db
      .collection("videos.files")
      .findOne({ _id: fileObjectId, "metadata.email": email });

    if (!file) {
      return NextResponse.json({ message: "Video not found or unauthorized" }, { status: 404 });
    }

    await db.collection("videos.chunks").deleteMany({ files_id: fileObjectId });
    await db.collection("videos.files").deleteOne({ _id: fileObjectId });

    return NextResponse.json({ message: "Video deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
