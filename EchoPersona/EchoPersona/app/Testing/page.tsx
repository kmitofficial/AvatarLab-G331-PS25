"use client";
  import { useState, useRef } from "react";

  export default function Home() {
    const [personId, setPersonId] = useState("");
    const [files, setFiles] = useState<{ mp4: string | null; npy: string | null; wav: string | null } | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleFetchFiles = async () => {
      if (!personId) return;
      try {
        const res = await fetch(`/api/files/${personId}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setFiles(data);
        if (data.mp4 && videoRef.current) {
          videoRef.current.src = `data:video/mp4;base64,${data.mp4}`;
          videoRef.current.load();
        }
        if (data.wav && audioRef.current) {
          audioRef.current.src = `data:audio/wav;base64,${data.wav}`;
          audioRef.current.load();
        }
      } catch (error) {
        alert("Error fetching files: " + error);
      }
    };

    return (
      <div className="p-4">
        <h1>File Viewer</h1>
        <div>
          <input
            type="number"
            placeholder="Person ID (e.g., 2, 8)"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={handleFetchFiles} className="bg-blue-500 text-white p-2">
            Fetch Files
          </button>
        </div>
        {files && (
          <div className="mt-4">
            <h2>Files</h2>
            {files.mp4 && (
              <div>
                <h3>Video</h3>
                <video ref={videoRef} controls width="600" height="auto" className="border">
                  <source type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {files.wav && (
              <div>
                <h3>Audio</h3>
                <audio ref={audioRef} src={files.wav} controls className="mt-2">
                  <source type="audio/wav" />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            )}
            {files.npy && <p>NPY data available (base64: {files.npy.substring(0, 20)}...)</p>}
          </div>
        )}
      </div>
    );
  }