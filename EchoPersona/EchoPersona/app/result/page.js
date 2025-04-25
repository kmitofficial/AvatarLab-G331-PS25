"use client"
import "@/app/globals.css";

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw, ImageIcon, Download } from "lucide-react"

export default function ResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)

  // Get parameters from URL
  const inputText = searchParams.get("text") || "Default text input"
  const selectedAudio = searchParams.get("audio") || "default-audio"
  const selectedAvatar = searchParams.get("avatar") || "default-avatar"

  useEffect(() => {
    // Check localStorage for video data and status
    const storedData = JSON.parse(localStorage.getItem("generatedVideo") || "{}")
    const processingStatus = localStorage.getItem("videoProcessingStatus")
    const errorMsg = localStorage.getItem("videoError")
    
    if (processingStatus === "completed" && storedData.videoUrl) {
      // Video generation completed successfully
      setVideoUrl(storedData.videoUrl)
      setLoading(false)
    } else if (processingStatus === "failed") {
      // Video generation failed
      setError(errorMsg || "Failed to generate video")
      setLoading(false)
    } else {
      // Still processing or default case - check for the expected file path
      const checkVideoExists = async () => {
        try {
          // Try to fetch the expected video file
          const expectedPath = "/Outputs/GeneratedVideo.mp4"
          const response = await fetch(expectedPath, { method: 'HEAD' })
          
          if (response.ok) {
            // Video file found
            setVideoUrl(expectedPath)
            setLoading(false)
            
            // Update localStorage
            localStorage.setItem("generatedVideo", JSON.stringify({
              ...storedData,
              videoUrl: expectedPath,
              status: "completed"
            }))
            localStorage.setItem("videoProcessingStatus", "completed")
          } else {
            // Start polling for the video file
            const pollInterval = setInterval(async () => {
              try {
                const pollResponse = await fetch(expectedPath, { method: 'HEAD' })
                if (pollResponse.ok) {
                  clearInterval(pollInterval)
                  setVideoUrl(expectedPath)
                  setLoading(false)
                  
                  // Update localStorage
                  localStorage.setItem("generatedVideo", JSON.stringify({
                    ...storedData,
                    videoUrl: expectedPath,
                    status: "completed"
                  }))
                  localStorage.setItem("videoProcessingStatus", "completed")
                }
              } catch (err) {
                console.log("Still checking for video...")
              }
            }, 5000) // Check every 5 seconds
            
            // Stop polling after 5 minutes (300000ms)
            setTimeout(() => {
              clearInterval(pollInterval)
              if (loading) {
                setError("Video generation timed out. Please try again.")
                setLoading(false)
                localStorage.setItem("videoProcessingStatus", "failed")
              }
            }, 300000)
            
            return () => clearInterval(pollInterval)
          }
        } catch (err) {
          console.error("Error checking video:", err)
        }
      }
      
      checkVideoExists()
    }
  }, [])

  const handleCreateAgain = () => {
    router.push("/")
  }

  const handleCustomBackground = () => {
    // This would open a modal or redirect to a background selection page
    alert("Custom background feature would open here")
  }

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a')
      a.href = videoUrl
      a.download = 'generated-video.mp4'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
          {loading ? "Processing Your Video" : "Your Video is Ready"}
        </h1>

        <Card className="shadow-xl border-0 overflow-hidden mb-10">
          <div className="aspect-video w-full bg-black relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-900/10">
                <div className="text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-blue-600 font-medium">Generating your video...</p>
                  <p className="text-blue-400 text-sm mt-2">This may take several minutes</p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/10">
                <div className="text-center p-8">
                  <p className="text-red-600 font-medium text-xl mb-4">Error generating video</p>
                  <p className="text-red-500">{error}</p>
                  <Button 
                    className="mt-4 bg-red-600 hover:bg-red-700" 
                    onClick={() => router.push("/select-avatar")}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <video
                className="w-full h-full object-contain"
                controls
                autoPlay
                src={videoUrl}
                poster="/placeholder.svg?height=720&width=1280"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">Video Details</h2>
              <div className="grid gap-3 text-blue-800">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Text Input:</span> {inputText}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Audio Style:</span> {selectedAudio}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Avatar:</span> {selectedAvatar}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {!loading && !error && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 text-lg font-medium border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Video
                </Button>
              )}

              <Button
                size="lg"
                variant="outline"
                className="h-14 text-lg font-medium border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                onClick={handleCustomBackground}
                disabled={loading || error}
              >
                <ImageIcon className="mr-2 h-5 w-5" />
                Set Custom Background
              </Button>

              <Button
                size="lg"
                className="h-14 text-lg font-medium bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateAgain}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Create Another One
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-blue-600 max-w-2xl mx-auto">
          {!loading && !error ? (
            <>
              <p className="text-lg mb-2">Your video has been successfully generated!</p>
              <p className="text-sm opacity-80">
                You can download this video, set a custom background, or create a new one with different settings.
              </p>
            </>
          ) : loading ? (
            <p className="text-lg mb-2">Please wait while we process your video...</p>
          ) : (
            <p className="text-lg mb-2">Sorry, we encountered an issue. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  )
}