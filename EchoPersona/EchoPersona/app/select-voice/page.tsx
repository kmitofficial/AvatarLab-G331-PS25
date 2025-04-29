// app/select-voice/page.tsx
"use client";
import "@/app/globals.css";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2 } from "lucide-react";

// Global API URL - replace with your actual ngrok URL
const API_URL = "/api"; // Update with your Flask/ngrok URL

export default function SelectVoice() {
  const [selectedVoice, setSelectedVoice] = useState<{
    id: number;
    name: string;
    gender: string;
    accent: string;
    audioData: string;
  } | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<{
    name: string;
    videoUrl: string;
    posterUrl?: string;
  } | null>(null);
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [playingAvatar, setPlayingAvatar] = useState<boolean>(false);
  const [audioOptions, setAudioOptions] = useState<
    { id: number; name: string; gender: string; accent: string; audioData: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const router = useRouter();
  const audioPlayers = useRef<{ [key: number]: HTMLAudioElement }>({});
  const avatarVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Get userId, text, and avatar from localStorage
    const storedUserId = localStorage.getItem("userId");
    const text = localStorage.getItem("synthesisText");
    const avatar = localStorage.getItem("selectedAvatar");

    if (!storedUserId) {
      console.error("No userId found. Redirecting to SignIn.");
      router.push("/signin");
      return;
    }

    if (!text) {
      router.push("/Home");
      return;
    }

    setUserId(storedUserId);
    setInputText(text);
    if (avatar) {
      const parsedAvatar = JSON.parse(avatar);
      setSelectedAvatar(parsedAvatar);
    }

    fetchUsername(storedUserId);
    generateAudioOptions(text);
  }, [router]);

  const fetchUsername = async (userId: string) => {
    try {
      const res = await fetch(`/api/auth/user?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setUsername(data.username || "Unknown");
      } else {
        console.error("Failed to fetch username:", data.message);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const generateAudioOptions = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.audio_files && data.audio_files.length > 0) {
        const voices = data.audio_files.map((file: { audio_data: string }, index: number) => ({
          id: index + 1,
          name: `Voice Option ${index + 1}`,
          gender: "AI",
          accent: "Generated",
          audioData: file.audio_data,
        }));

        setAudioOptions(voices);
        if (voices.length > 0) {
          setSelectedVoice(voices[0]);
        }
      }
    } catch (error) {
      console.error("Error generating audio options:", error);
      alert("Failed to load audio options. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/Home");
  };

  const handleNext = async () => {
    if (!selectedVoice || !userId || !username) {
      console.error("Missing selectedVoice, userId, or username");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Save .wav file to server and PostgreSQL
      const dbResponse = await fetch("/api/save-wav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          username,
          voiceAudioInput: selectedVoice.name,
          audioData: selectedVoice.audioData,
        }),
      });
      
      if (!dbResponse.ok) {
        const errorData = await dbResponse.json();
        throw new Error(`Failed to save audio: ${errorData.message}`);
      }
      
      const { audioFilePath } = await dbResponse.json();
      
      // Simulate video generation (replace with actual API call if needed)
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Store the selected voice ID along with other data
      localStorage.setItem(
        "generatedVideo",
        JSON.stringify({
          text: inputText,
          avatar: selectedAvatar,
          voice: selectedVoice,
          voiceId: selectedVoice.id, // Store the voice ID
          audioUrl: audioFilePath, // Store .wav URL
          timestamp: new Date().toISOString(),
        })
      );
      
      // Also store just the voice ID separately for easy access
      localStorage.setItem("selectedVoiceId", selectedVoice.id);
      
      router.push("/select-avatar");
    } catch (error) {
      console.error("Error generating video or saving audio:", error);
      alert("There was an error generating your video or saving audio. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playVoiceSample = (voice: { id: number; audioData: string }) => {
    if (playingVoice === voice.id) {
      if (audioPlayers.current[voice.id]) {
        audioPlayers.current[voice.id].pause();
      }
      setPlayingVoice(null);
    } else {
      if (playingVoice && audioPlayers.current[playingVoice]) {
        audioPlayers.current[playingVoice].pause();
      }

      const audio = new Audio(`data:audio/wav;base64,${voice.audioData}`);
      audioPlayers.current[voice.id] = audio;
      audio.play();
      setPlayingVoice(voice.id);

      audio.onended = () => {
        setPlayingVoice(null);
      };
    }
  };

  const playAvatarPreview = () => {
    if (!selectedAvatar || !selectedAvatar.videoUrl) return;

    const videoElement = avatarVideoRef.current;

    if (playingAvatar) {
      videoElement?.pause();
      setPlayingAvatar(false);
    } else {
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.muted = false;
        videoElement.play().catch((error) => {
          console.error("Error playing avatar video:", error);
        });
        setPlayingAvatar(true);
      }
    }

    if (videoElement) {
      videoElement.onended = () => {
        setPlayingAvatar(false);
      };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Select a Voice</h1>
          <div className="text-sm text-gray-500">Step 1 of 2</div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              {selectedAvatar && (
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <video
                    ref={avatarVideoRef}
                    src={selectedAvatar.videoUrl}
                    poster={selectedAvatar.posterUrl || "/placeholder.jpg"}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    controls={false}
                    onError={(e) => console.error("Video load error for avatar:", e.target)}
                  />
                  <button
                    className="absolute bottom-2 left-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
                    onClick={playAvatarPreview}
                  >
                    {playingAvatar ? (
                      <Pause size={18} className="text-blue-600" />
                    ) : (
                      <Play size={18} className="text-blue-600" />
                    )}
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white font-medium">{selectedAvatar.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="md:w-3/4">
              <h3 className="font-semibold text-gray-700 mb-2">Your text:</h3>
              <p className="text-gray-600 italic mb-4">{inputText}</p>

              {selectedVoice && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Selected voice:</h3>
                  <p className="text-blue-600">
                    {selectedVoice.name} ({selectedVoice.accent} {selectedVoice.gender})
                  </p>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Generating voice options...</p>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {audioOptions.map((voice) => (
                <motion.div
                  key={voice.id}
                  variants={itemVariants}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer flex items-center ${
                    selectedVoice?.id === voice.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedVoice(voice)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{voice.name}</h3>
                    <p className="text-sm text-gray-500">
                      {voice.accent} {voice.gender}
                    </p>
                  </div>
                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      playVoiceSample(voice);
                    }}
                  >
                    {playingVoice === voice.id ? (
                      <Pause size={20} className="text-blue-600" />
                    ) : (
                      <Play size={20} className="text-blue-600" />
                    )}
                  </button>
                </motion.div>
              ))}

              <motion.div
                key="custom"
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer flex items-center"
                onClick={() => alert("Upload your own voice feature coming soon!")}
              >
                <div className="flex-1">
                  <h3 className="font-medium">Custom Voice</h3>
                  <p className="text-sm text-gray-500">Upload Your Own</p>
                </div>
                <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert("Upload your own voice feature coming soon!");
                  }}
                >
                  <Volume2 size={20} className="text-blue-600" />
                </button>
              </motion.div>
            </motion.div>
          )}

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ChevronLeft size={20} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedVoice || isGenerating || isLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                selectedVoice && !isGenerating && !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate Video"}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}