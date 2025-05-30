import connectMDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectMDB();
    const { email } = await req.json();

    const bucket = new GridFSBucket(db, { bucketName: "videos" });

    const files = await db
      .collection("videos.files")
      .find({ "metadata.email": email, "metadata.trashed": true })
      .toArray();

    const videoData = await Promise.all(
      files.map(async (file) => {
        const chunks: Buffer[] = [];
        const stream = bucket.openDownloadStream(file._id);
        const readable = new Readable().wrap(stream);

        for await (const chunk of readable) {
          chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);
        const base64Video = `data:video/mp4;base64,${buffer.toString("base64")}`;

        const durationInSeconds =
          file.metadata?.duration || Math.round(file.length / (1024 * 50));
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        const trashedAtDate = file.metadata?.trashedAt
          ? new Date(file.metadata.trashedAt)
          : null;

        const formattedTrashedAt = trashedAtDate
          ? trashedAtDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : null;

        const expiryDate = trashedAtDate
          ? new Date(trashedAtDate.getTime() + 30 * 24 * 60 * 60 * 1000)
          : null;

        const formattedExpiry = expiryDate
          ? expiryDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : null;

        return {
          id: file._id,
          filename: file.filename,
          duration: formattedDuration,
          video: base64Video,
          trashedAt: formattedTrashedAt,
          expiry: formattedExpiry,
        };
      })
    );

    return NextResponse.json(videoData, { status: 200 });
  } catch (error) {
    console.error("Error fetching trashed videos:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
