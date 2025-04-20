"use client";
import "@/app/globals.css";
import "@/app/select-avatar/page.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

export default function SelectAvatar() {
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [inputText, setInputText] = useState("");
    const [playingVideo, setPlayingVideo] = useState(null);
    const [videoLoaded, setVideoLoaded] = useState({});
    const videoRefs = useRef({});
    const router = useRouter();

    useEffect(() => {
        const text = localStorage.getItem("synthesisText");
        if (!text) {
            router.push("/Home");
        } else {
            setInputText(text);
        }
    }, [router]);

    // Updated avatar data with re-encoded video URLs and poster URLs
    const avatars = [
        {
            id: 1,
            name: "Bill",
            videoUrl: "/Bill.mp4",
            gender: "Male",
            posterUrl: "Bill.jpeg",
        },
        {
            id: 2,
            name: "Lamar",
            videoUrl: "/lamar.mp4",
            gender: "Male",
            posterUrl: "lamar.jpeg",
        },
    ];

    // Check video file existence and load status
    useEffect(() => {
        const loadingStatus = {};
        avatars.forEach((avatar) => {
            fetch(avatar.videoUrl, { method: "HEAD" })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Video file not found: ${avatar.videoUrl}`);
                    }
                    console.log(`Video file ${avatar.videoUrl} exists and is accessible`);
                    loadingStatus[avatar.id] = true;
                    setVideoLoaded((prev) => ({ ...prev, [avatar.id]: true }));
                })
                .catch((error) => {
                    console.error(`Error checking video file: ${error.message}`);
                    loadingStatus[avatar.id] = false;
                    setVideoLoaded((prev) => ({ ...prev, [avatar.id]: false }));
                });
        });

        return () => {
            if (playingVideo !== null && videoRefs.current[playingVideo]) {
                videoRefs.current[playingVideo].pause();
            }
        };
    }, []);

    const handleNext = () => {
        if (selectedAvatar) {
            localStorage.setItem("selectedAvatar", JSON.stringify(selectedAvatar));
            router.push("/select-voice");
        }
    };


    const handleBack = () => {
        router.push("/Home");
    };

    // Improved play avatar preview function with audio support
    const handlePlayPreview = (e, avatar) => {
        e.stopPropagation();
        e.preventDefault();

        const videoElement = videoRefs.current[avatar.id];

        if (!videoElement) {
            console.error(`Video element for avatar ${avatar.id} not found`);
            return;
        }

        console.log("Video element:", videoElement);
        console.log("Video ready state:", videoElement.readyState);
        console.log("Video network state:", videoElement.networkState);
        console.log("Video error:", videoElement.error);
        console.log("Current src:", videoElement.currentSrc);

        if (playingVideo === avatar.id) {
            videoElement.pause();
            setPlayingVideo(null);
            console.log(`Paused video for avatar ${avatar.name}`);
            return;
        }

        if (playingVideo !== null && videoRefs.current[playingVideo]) {
            videoRefs.current[playingVideo].pause();
        }

        try {
            videoElement.currentTime = 0;
            videoElement.muted = false; // Ensure audio is unmuted
            if (videoElement.readyState >= 3) {
                const playPromise = videoElement.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setPlayingVideo(avatar.id);
                            console.log(`Playing video for ${avatar.name} with audio`);
                        })
                        .catch((error) => {
                            console.error("Error playing video:", error);
                        });
                }
            } else {
                const canPlayHandler = () => {
                    videoElement.play()
                        .then(() => {
                            setPlayingVideo(avatar.id);
                        })
                        .catch((error) => {
                            console.error("Error playing video after canplay event:", error);
                        });
                    videoElement.removeEventListener("canplay", canPlayHandler);
                };
                videoElement.addEventListener("canplay", canPlayHandler);
                if (videoElement.networkState === 0) {
                    videoElement.load();
                }
            }
        } catch (error) {
            console.error("Unexpected error playing video:", error);
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
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {avatars.map((avatar) => (
                            <motion.div
                                key={avatar.id}
                                variants={avatarVariants}
                                className={`bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all ${
                                    selectedAvatar?.id === avatar.id ? "ring-4 ring-purple-400" : "hover:shadow-md"
                                }`}
                                onClick={() => setSelectedAvatar(avatar)}
                            >
                                <div className="aspect-square relative bg-gradient-to-br from-purple-50 to-blue-50">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <video
                                            ref={(el) => {
                                                if (el) videoRefs.current[avatar.id] = el;
                                            }}
                                            key={`video-${avatar.id}`}
                                            src={avatar.videoUrl}
                                            loop
                                            playsInline
                                            controls={false}
                                            poster={avatar.posterUrl} // First frame as placeholder
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
                                            onCanPlay={() => {
                                                console.log(`Video for ${avatar.name} can play now`);
                                            }}
                                            onPlay={() => {
                                                console.log(`Video for ${avatar.name} started playing`);
                                            }}
                                            onError={(e) => {
                                                console.error(`Failed to load video for ${avatar.name}:`, e.target.error);
                                                setVideoLoaded((prev) => ({ ...prev, [avatar.id]: false }));
                                            }}
                                        />
                                        <button
                                            className="absolute bottom-4 left-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors z-10"
                                            onClick={(e) => handlePlayPreview(e, avatar)}
                                            aria-label={playingVideo === avatar.id ? "Pause video" : "Play video"}
                                        >
                                            {playingVideo === avatar.id ? (
                                                <Pause size={18} className="text-purple-600" />
                                            ) : (
                                                <Play size={18} className="text-purple-600" />
                                            )}
                                        </button>

                                        {videoLoaded[avatar.id] === false && (
                                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-5">
                                                <p className="text-white text-sm font-medium">Video not available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-medium text-gray-800">{avatar.name}</h3>
                                    <p className="text-sm text-gray-500">{avatar.gender}</p>
                                </div>
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
                            disabled={!selectedAvatar}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                                selectedAvatar
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