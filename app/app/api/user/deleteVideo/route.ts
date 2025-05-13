import connectMDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

async function moveToTrash(fileId: string, email: string) {
  const { db } = await connectMDB();
  await db.collection("videos.files").updateOne(
    { _id: new ObjectId(fileId), "metadata.email": email },
    {
      $set: {
        "metadata.trashed": true,
        "metadata.trashedAt": new Date()
      }
    }
  );
}

async function restoreFromTrash(fileId: string, email: string) {
  const { db } = await connectMDB();
  await db.collection("videos.files").updateOne(
    { _id: new ObjectId(fileId), "metadata.email": email },
    {
      $set: { "metadata.trashed": false },
      $unset: { "metadata.trashedAt": "" }
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email, videoID, role } = await req.json();

    if (!email || !videoID || !role) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    if (role === "delete") {
      await moveToTrash(videoID, email);
      return NextResponse.json({ message: "Moved to trash" },{status:200});
    } else if (role === "restore") {
      await restoreFromTrash(videoID, email);
      return NextResponse.json({ message: "Restored from trash" },{status:200});
    } else {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
