import { Worker, Job, Queue } from "bullmq";
import { uploadVideo } from "./gridfs";
import { prisma } from "./prisma";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

console.log("🧑🏻‍🏭 Worker Started");
let videoCount = 1;

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

const generation = new Queue("video-generation",{connection});

const worker = new Worker(
  "video-generation",
  async (job: Job) => {
    const { email, text, audioId, videoId, audio_text } = job.data;
    console.log("🚀 Recived data from job");

    let voice = await prisma.voice.findUnique({
      where: { id: audioId },
      select: { audio: true },
    });
    if (!voice) {
      console.log("Voice not found in predefined voices. Searching in user voices");
      voice = await prisma.userVoice.findUnique({
        where: { id: audioId },
        select: { audio: true },
      });
    }

    let avatar = await prisma.avatar.findUnique({
      where: { id: videoId },
      select: { video: true },
    });
    if (!avatar) {
      console.log("Avatar not found in predefined avatars. Searching in user avatars");
      avatar = await prisma.userAvatar.findUnique({
        where: { id: videoId },
        select: { video: true },
      });
    }

    if (!voice?.audio) throw new Error("Audio not found for provided ID");
    if (!avatar?.video) throw new Error("Video not found for provided ID");

    const audioBuffer = Buffer.from(voice.audio as Buffer);
    const videoBuffer = Buffer.from(avatar.video as Buffer);

    const audioFile = new File([audioBuffer], "input_audio.wav", {
      type: "audio/wav",
    });
    const videoFile = new File([videoBuffer], "input_video.mp4", {
      type: "video/mp4",
    });
    console.log("🚀 Retrived data from postgree successfully");

    const TTS = new FormData();
    TTS.append("text", text);
    TTS.append("audio", audioFile);
    TTS.append("text_normalized", audio_text);
    
    console.log("🚀 Sending data to TTS !");
    const TTS_res = await fetch(process.env.TTS_URL!, {
      method: "POST",
      body: TTS,
    });

    if (!TTS_res.ok) {
      const errText = await TTS_res.text();
      throw new Error(`TTS failed: ${errText}`);
    }

    const generatedAudioBuffer = Buffer.from(await TTS_res.arrayBuffer());
    const generatedAudioFile = new File([generatedAudioBuffer], "generated.wav", {
      type: "audio/wav",
    });
    console.log("✅ Audio generated successfully !");

    const THV = new FormData();
    THV.append("reference_audio", generatedAudioFile);
    THV.append("reference_video", videoFile);

    console.log("🚀 Sending data to Diffdub !");
    const videoRes = await axios.post(process.env.DIFF_DUB_URL!, THV, {
      timeout: 30 * 60 * 1000,
      responseType: "arraybuffer",
    });

    const finalVideoBuffer = Buffer.from(await videoRes.data);
    const finalVideoFile = new File([finalVideoBuffer], `Untitled Video (${videoCount}).mp4`, {
      type: "video/mp4",
    });

    const result = await uploadVideo(email, finalVideoFile);
    console.log("✅ Video generated successfully !");
    videoCount = videoCount + 1;
    return result.fileId.toString()
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed !`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message} !`);
});

export { generation };