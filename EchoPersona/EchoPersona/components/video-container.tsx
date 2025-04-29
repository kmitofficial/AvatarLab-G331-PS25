"use client"

import { useRef, useEffect } from "react"

interface VideoContainerProps {
  videoSrc?: string
  isMuted?: boolean
}

export default function VideoContainer({ videoSrc, isMuted = true }: VideoContainerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement && videoSrc) {
      videoElement.load()
    }
  }, [videoSrc])
  
  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.muted = isMuted
    }
  }, [isMuted])
  
  if (!videoSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-600">
        <p className="text-center text-white">Your AI-generated video will appear here</p>
      </div>
    )
  }
  
  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted={isMuted}
      playsInline
      style={{ background: "transparent" }}
    >
      <source src={videoSrc} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}