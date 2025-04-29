"use client";
import "@/app/globals.css";
import "@/app/select-avatar/page.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {Button} from "@/components/ui/button" // Assuming these are from a UI library like ShadCN

export default function SelectAvatar() {
    const [avatars, setAvatars] = useState([]);
    const [generateForm, setGenerateForm] = useState({ video: null }); // Updated to match the new logic's state
    const [inputText, setInputText] = useState("");
    const [playingVideo, setPlayingVideo] = useState({}); // Updated to match the new logic's state
    const [videoLoaded, setVideoLoaded] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const videoRefs = useRef({});
    const router = useRouter();

    useEffect(() => {
        async function fetchAvatars() {
            try {
                const response = await fetch("/api/avatars");
                if (!response.ok) {
                    throw new Error("Failed to fetch avatars");
                }
                const data = await response.json();
                const fetchedAvatars = data.map(avatar => ({
                    id: avatar.id,
                    name: avatar.name,
                    video: avatar.video, // Updated to match the API response field
                    gender: avatar.gender,
                }));
                setAvatars(fetchedAvatars);
            } catch (error) {
                console.error("Error fetching avatars:", error);
            }
        }

        fetchAvatars();
    }, []);

    useEffect(() => {
        const text = localStorage.getItem("synthesisText");
        if (!text) {
            router.push("/Home");
        } else {
            setInputText(text);
        }
    }, [router]);

    useEffect(() => {
        const loadingStatus = {};
        avatars.forEach((avatar) => {
            fetch(avatar.video, { method: "HEAD" })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Video not accessible: ${avatar.video}`);
                    }
                    console.log(`Video for ${avatar.name} is accessible`);
                    loadingStatus[avatar.id] = true;
                    setVideoLoaded((prev) => ({ ...prev, [avatar.id]: true }));
                })
                .catch((error) => {
                    console.error(`Error checking video for ${avatar.name}: ${error.message}`);
                    loadingStatus[avatar.id] = false;
                    setVideoLoaded((prev) => ({ ...prev, [avatar.id]: false }));
                });
        });

        return () => {
            Object.keys(videoRefs.current).forEach((id) => {
                if (videoRefs.current[id]) {
                    videoRefs.current[id].pause();
                }
            });
        };
    }, [avatars]);

    const toggleVideo = (avatarId) => {
        const videoElement = videoRefs.current[avatarId];
        if (!videoElement) {
            console.error(`Video element for avatar ${avatarId} not found`);
            return;
        }

        if (playingVideo[avatarId]) {
            videoElement.pause();
            setPlayingVideo((prev) => ({ ...prev, [avatarId]: false }));
        } else {
            Object.keys(playingVideo).forEach((id) => {
                if (playingVideo[id] && videoRefs.current[id]) {
                    videoRefs.current[id].pause();
                    setPlayingVideo((prev) => ({ ...prev, [id]: false }));
                }
            });

            videoElement.currentTime = 0;
            videoElement.muted = false;
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setPlayingVideo((prev) => ({ ...prev, [avatarId]: true }));
                        console.log(`Playing video for avatar ID ${avatarId}`);
                    })
                    .catch((error) => {
                        console.error("Error playing video:", error);
                    });
            }
        }
    };

    const handleNext = async () => {
        if (generateForm.video) {
          const selectedAvatar = avatars.find((avatar) => avatar.video === generateForm.video);
          if (selectedAvatar) {
            try {
              // Store the selected avatar
              localStorage.setItem("selectedAvatar", JSON.stringify(selectedAvatar));
              
              // Set loading state
              localStorage.setItem("videoProcessingStatus", "processing");
              
              // Get previously stored data
              const storedData = JSON.parse(localStorage.getItem("generatedVideo") || "{}");
              
              // Prepare form data for the API request
              const formData = new FormData();
              
              // Add the reference audio file
              if (storedData.audioUrl) {
                const audioResponse = await fetch(storedData.audioUrl);
                const audioBlob = await audioResponse.blob();
                formData.append('reference_audio', audioBlob, 'user_audio.wav');
              }
              
              // Add the reference video file
              const videoResponse = await fetch(selectedAvatar.video);
              const videoBlob = await videoResponse.blob();
              formData.append('reference_video', videoBlob, 'user_video.mp4');
              
              // Send request to the local proxy API
              const response = await fetch('/api/generate-video', {
                method: 'POST',
                body: formData,
              });
              
              if (!response.ok) {
                throw new Error(`Failed to generate video: ${response.statusText}`);
              }
              
              const result = await response.json();
              
              // Check if the API returned a video path
              if (!result.video_path && !result.success) {
                throw new Error("Failed to generate video: No video path received");
              }
              
              // Update stored data with the result
              localStorage.setItem("generatedVideo", JSON.stringify({
                ...storedData,
                avatar: selectedAvatar,
                videoUrl: result.video_path, // Use the path from the API
                status: "completed"
              }));
              
              localStorage.setItem("videoProcessingStatus", "completed");
              
              // Redirect to result page with query params
              router.push(`/result?text=${encodeURIComponent(storedData.text || "")}&audio=${encodeURIComponent(storedData.voice?.name || "")}&avatar=${encodeURIComponent(selectedAvatar.name || "")}`);
              
            } catch (error) {
              console.error("Error generating video:", error);
              
              // Still redirect but with error status
              localStorage.setItem("videoProcessingStatus", "failed");
              localStorage.setItem("videoError", error.message);
              
              // Redirect to result page anyway
              const storedData = JSON.parse(localStorage.getItem("generatedVideo") || "{}");
              router.push(`/result?text=${encodeURIComponent(storedData.text || "")}&audio=${encodeURIComponent(storedData.voice?.name || "")}&avatar=${encodeURIComponent(selectedAvatar.name || "")}`);
            }
          }
        }
      };
    const handleBack = () => {
        router.push("/select-voice");
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

    const avatarVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 },
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                <div className="mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                        <h3 className="font-medium text-gray-700 mb-2">Your text:</h3>
                        <p className="text-gray-600 italic">{inputText}</p>
                    </div>

                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {avatars.map((avatar) => (
                            <motion.div
                                key={avatar.id}
                                variants={avatarVariants}
                            >
                                <Card
                                    onClick={() => setGenerateForm((prev) => ({ ...prev, video: avatar.video }))}
                                    className={`p-0 rounded-sm overflow-hidden cursor-pointer transition-all hover:shadow-md
                                        ${generateForm.video === avatar.video
                                            ? "border-blue-500 ring-2 ring-blue-500"
                                            : "border-gray-200 dark:border-gray-800"
                                        }`}
                                >
                                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                                        <video
                                            ref={(el) => {
                                                if (el) videoRefs.current[avatar.id] = el;
                                            }}
                                            src={avatar.video}
                                            loop
                                            playsInline
                                            controls={false}
                                            className="w-full h-full object-cover"
                                            style={{
                                                objectFit: "cover",
                                                opacity: 1,
                                                zIndex: 0,
                                                display: "block",
                                            }}
                                            onLoadedData={() => {
                                                console.log(`Video for ${avatar.name} loaded successfully`);
                                                setVideoLoaded((prev) => ({ ...prev, [avatar.id]: true }));
                                            }}
                                            onError={(e) => {
                                                console.error(`Failed to load video for ${avatar.name}:`, e.target.error);
                                                setVideoLoaded((prev) => ({ ...prev, [avatar.id]: false }));
                                            }}
                                        />

                                        {/* Play/Pause button overlay */}
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute bottom-3 left-3 h-10 w-10 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 shadow-md"
                                            onClick={() => toggleVideo(avatar.id)}
                                        >
                                            {playingVideo[avatar.id] === true ? (
                                                <Pause className="h-5 w-5 text-blue-600 dark:text-white" />
                                            ) : (
                                                <Play className="h-5 w-5 text-blue-600 dark:text-white" />
                                            )}
                                        </Button>

                                        {videoLoaded[avatar.id] === false && (
                                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-5">
                                                <p className="text-white text-sm font-medium">Video not available</p>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{avatar.name}</p>
                                                <p className="text-xs text-muted-foreground">{avatar.gender}</p>
                                            </div>
                                            {generateForm.video === avatar.video && (
                                                <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="flex justify-between">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft size={20} /> Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!generateForm.video}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                                generateForm.video
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}