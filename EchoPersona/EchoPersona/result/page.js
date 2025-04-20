// app/result/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Share, Download, Home, PlayCircle } from 'lucide-react';

export default function ResultPage() {
    const [videoData, setVideoData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        // Get the generated video data from localStorage
        const data = localStorage.getItem('generatedVideo');

        if (!data) {
            router.push('/Home');
        } else {
            setVideoData(JSON.parse(data));
        }
    }, [router]);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleDownload = () => {
        // In a real app, this would download the actual video file
        alert('Download feature would be implemented here');
    };

    const handleShare = () => {
        // In a real app, this would open sharing options
        alert('Share feature would be implemented here');
    };

    const handleCreateNew = () => {
        router.push('/Home');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white p-4 shadow-md">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-blue-600">Your Generated Video</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    {videoData ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Video player */}
                            <div className="bg-black rounded-lg overflow-hidden shadow-xl mb-6 relative">
                                <div className="aspect-video relative">
                                    {/* This would be a real video in production */}
                                    <img
                                        ref={videoRef}
                                        src={videoData.videoUrl}
                                        alt="Generated talking head video"
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Play button overlay */}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                        onClick={handlePlayPause}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0.8, scale: 0.9 }}
                                            whileHover={{ opacity: 1, scale: 1 }}
                                            className="rounded-full bg-black/50 p-4"
                                        >
                                            <PlayCircle size={64} className="text-white" />
                                        </motion.div>
                                    </div>
                                </div>
                            </div>

                            {/* Video info */}
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                <h2 className="text-xl font-semibold mb-4">Video Details</h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Text</h3>
                                        <p className="text-gray-800">{videoData.text}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Avatar</h3>
                                            <p className="text-gray-800">{videoData.avatar.name}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Voice</h3>
                                            <p className="text-gray-800">{videoData.voice.name} ({videoData.voice.accent})</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Created</h3>
                                        <p className="text-gray-800">{new Date(videoData.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download size={20} />
                                    Download Video
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Share size={20} />
                                    Share
                                </button>

                                <button
                                    onClick={handleCreateNew}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ml-auto"
                                >
                                    <Home size={20} />
                                    Create New
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}