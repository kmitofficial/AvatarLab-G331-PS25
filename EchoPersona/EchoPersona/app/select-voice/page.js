"use client";
import "@/app/globals.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2 } from "lucide-react";

// Global API URL - replace with your actual ngrok URL
const API_URL = "/api"; 

export default function SelectVoice() {
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [inputText, setInputText] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [playingVoice, setPlayingVoice] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [playingAvatar, setPlayingAvatar] = useState(null);
    const [audioOptions, setAudioOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const audioPlayers = useRef({});
    const avatarVideoRef = useRef(null);

    useEffect(() => {
        // Get the text and avatar from localStorage
        const text = localStorage.getItem("synthesisText");
        const avatar = localStorage.getItem("selectedAvatar");

        if (!text) {
            router.push("/Home");
        } else {
            setInputText(text);
            if (avatar) {
                const parsedAvatar = JSON.parse(avatar);
                setSelectedAvatar(parsedAvatar);
            }
            
            // Generate audio options when component loads
            generateAudioOptions(text);
        }
    }, [router]);

    // Function to get audio options from the API
    const generateAudioOptions = async (text) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Create voice options from the response
            if (data.audio_files && data.audio_files.length > 0) {
                const voices = data.audio_files.map((file, index) => ({
                    id: index + 1,
                    name: `Voice Option ${index + 1}`,
                    gender: "AI",
                    accent: "Generated",
                    audioData: file.audio_data
                }));
                
                setAudioOptions(voices);
                // Auto-select the first voice
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
        router.push("/select-avatar");
    };

    const handleGenerate = async () => {
        if (!selectedVoice) return;

        setIsGenerating(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate API delay

            localStorage.setItem(
                "generatedVideo",
                JSON.stringify({
                    text: inputText,
                    avatar: selectedAvatar,
                    voice: selectedVoice,
                    videoUrl: "/api/placeholder/640/480", // Real URL in production
                    timestamp: new Date().toISOString(),
                })
            );

            router.push("/result");
        } catch (error) {
            console.error("Error generating video:", error);
            alert("There was an error generating your video. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const playVoiceSample = (voice) => {
        if (playingVoice === voice.id) {
            // Stop currently playing audio
            if (audioPlayers.current[voice.id]) {
                audioPlayers.current[voice.id].pause();
            }
            setPlayingVoice(null);
        } else {
            // Stop any currently playing audio
            if (playingVoice && audioPlayers.current[playingVoice]) {
                audioPlayers.current[playingVoice].pause();
            }
            
            // Create and play new audio
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
            videoElement.pause();
            setPlayingAvatar(null);
        } else {
            if (videoElement) {
                videoElement.currentTime = 0;
                videoElement.muted = false; // Ensure audio is enabled
                videoElement.play().catch((error) => {
                    console.error("Error playing avatar video:", error);
                });
                setPlayingAvatar(true);
            }
        }

        videoElement.onended = () => {
            setPlayingAvatar(null);
        };
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
                    <div className="text-sm text-gray-500">Step 2 of 2</div>
                </div>
            </header>

            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/4">
                            {selectedAvatar && (
                                <div className="aspect-square relative rounded-lg overflow-hidden">
                                    {/* Use video with poster as fallback */}
                                    <video
                                        ref={avatarVideoRef}
                                        src={selectedAvatar.videoUrl}
                                        poster={selectedAvatar.posterUrl || "/placeholder.jpg"}
                                        className="w-full h-full object-cover"
                                        loop
                                        playsInline
                                        controls={false}
                                        onError={(e) =>
                                            console.error("Video load error for avatar:", e.target.error)
                                        }
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
                                        <p className="text-sm text-gray-500">{voice.accent} {voice.gender}</p>
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
                            
                            {/* Custom voice option as last option */}
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
                            onClick={handleGenerate}
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