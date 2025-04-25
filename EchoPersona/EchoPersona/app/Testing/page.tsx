"use client"
import "@/app/globals.css";

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw, ImageIcon } from "lucide-react"

export default function ResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)

  // Get parameters from URL
  const inputText = searchParams.get("text") || "Default text input"
  const selectedAudio = searchParams.get("audio") || "default-audio"
  const selectedAvatar = searchParams.get("avatar") || "default-avatar"

  // Simulate video loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateAgain = () => {
    router.push("/")
  }

  const handleCustomBackground = () => {
    // This would open a modal or redirect to a background selection page
    alert("Custom background feature would open here")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">Your Video is Ready</h1>

        <Card className="shadow-xl border-0 overflow-hidden mb-10">
          <div className="aspect-video w-full bg-black relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-900/10">
                <div className="text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-blue-600 font-medium">Preparing your video...</p>
                </div>
              </div>
            ) : (
              <video
                className="w-full h-full object-contain"
                controls
                autoPlay
                poster="/placeholder.svg?height=720&width=1280"
              >
                <source src="#" type="video/mp4" />
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
              <Button
                size="lg"
                variant="outline"
                className="h-14 text-lg font-medium border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                onClick={handleCustomBackground}
              >
                <ImageIcon className="mr-2 h-5 w-5" />
                Set Your Own Custom Background
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
          <p className="text-lg mb-2">Your video has been successfully generated!</p>
          <p className="text-sm opacity-80">
            You can download this video, set a custom background, or create a new one with different settings.
          </p>
        </div>
      </div>
    </div>
  )
}
