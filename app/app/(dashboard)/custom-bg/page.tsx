"use client"
import "@/app/globals.css"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon, Play, Pause, ChevronLeft, Upload, Lock, Crown, ChevronRight } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import BackgroundGallery from "@/components/background-gallery"

export default function ResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [backgroundType, setBackgroundType] = useState("original")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<number | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("nature") // Will be updated dynamically based on available categories
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [videoSelectionOpen, setVideoSelectionOpen] = useState(true)
  const [availableVideos, setAvailableVideos] = useState([
    {
      id: 1,
      title: "Nature Exploration",
      thumbnail: "/placeholder.svg?height=180&width=320",
      url: "/Outputs/GeneratedVideo.mp4",
    },
    {
      id: 2,
      title: "Tech Presentation",
      thumbnail: "/placeholder.svg?height=180&width=320",
      url: "/Outputs/GeneratedVideo2.mp4",
    },
    {
      id: 3,
      title: "Product Demo",
      thumbnail: "/placeholder.svg?height=180&width=320",
      url: "/Outputs/GeneratedVideo3.mp4",
    },
  ])
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null)

  // Get parameters from URL
  const inputText = searchParams.get("text") || "Default text input"
  const selectedAudio = searchParams.get("audio") || "default-audio"
  const selectedAvatar = searchParams.get("avatar") || "default-avatar"

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("generatedVideo") || "{}")
    const processingStatus = localStorage.getItem("videoProcessingStatus")
    const errorMsg = localStorage.getItem("videoError")

    if (processingStatus === "completed" && storedData.videoUrl) {
      setVideoUrl(storedData.videoUrl)
      setLoading(false)
    } else if (processingStatus === "failed") {
      setError(errorMsg || "Failed to generate video")
      setLoading(false)
    } else {
      const checkVideoExists = async () => {
        try {
          const expectedPath = "/Outputs/GeneratedVideo.mp4"
          const response = await fetch(expectedPath, { method: "HEAD" })

          if (response.ok) {
            setVideoUrl(expectedPath)
            setLoading(false)
            localStorage.setItem(
              "generatedVideo",
              JSON.stringify({ ...storedData, videoUrl: expectedPath, status: "completed" }),
            )
            localStorage.setItem("videoProcessingStatus", "completed")
          } else {
            const pollInterval = setInterval(async () => {
              try {
                const pollResponse = await fetch(expectedPath, { method: "HEAD" })
                if (pollResponse.ok) {
                  clearInterval(pollInterval)
                  setVideoUrl(expectedPath)
                  setLoading(false)
                  localStorage.setItem(
                    "generatedVideo",
                    JSON.stringify({ ...storedData, videoUrl: expectedPath, status: "completed" }),
                  )
                  localStorage.setItem("videoProcessingStatus", "completed")
                }
              } catch (err) {
                console.log("Still checking for video...")
              }
            }, 5000)

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

  const handleDownload = () => {
    const urlToDownload = processedVideoUrl || videoUrl

    if (urlToDownload) {
      const a = document.createElement("a")
      a.href = urlToDownload
      a.download = "generated-video.mp4"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleSelectBackground = (src: string, id: number) => {
    setSelectedBackground(src)
    setSelectedBackgroundId(id)
    setBackgroundType("gallery")
    setGalleryOpen(false)
  }

  const handleSelectVideo = (videoId: number) => {
    const selectedVideo = availableVideos.find((video) => video.id === videoId)
    if (selectedVideo) {
      setSelectedVideoId(videoId)
      setVideoUrl(selectedVideo.url)
      setLoading(false)
      setVideoSelectionOpen(false)

      // Save to localStorage
      localStorage.setItem("generatedVideo", JSON.stringify({ videoUrl: selectedVideo.url, status: "completed" }))
      localStorage.setItem("videoProcessingStatus", "completed")
    }
  }

  const handleApplyBackground = async () => {
    if (!videoUrl) {
      console.error("No video available to process")
      return
    }

    if (backgroundType === "original") {
      // No processing needed for original background
      setProcessedVideoUrl(null)
      return
    }

    if (backgroundType === "gallery" && !selectedBackground) {
      console.error("Please select a background from the gallery")
      return
    }

    try {
      setIsProcessing(true)

      // Create a FormData object to send the files
      const formData = new FormData()

      // Add the video file
      // First, we need to fetch the video as a blob
      const videoResponse = await fetch(videoUrl)
      const videoBlob = await videoResponse.blob()
      formData.append("video", videoBlob, "input-video.mp4")

      // Add the background image if using gallery
      if (backgroundType === "gallery" && selectedBackground) {
        // For base64 images, we need to convert them to a blob
        if (selectedBackground.startsWith("data:")) {
          // Convert base64 to blob
          const response = await fetch(selectedBackground)
          const bgBlob = await response.blob()
          formData.append("bg", bgBlob, "background.png")
        } else {
          // For regular URLs, fetch the image first
          const bgResponse = await fetch(selectedBackground)
          const bgBlob = await bgResponse.blob()
          formData.append("bg", bgBlob, "background.png")
        }
      }

      // Add metadata about the selected background
      if (selectedBackgroundId) {
        formData.append("backgroundId", selectedBackgroundId.toString())
      }

      // Send the request to our API endpoint
      const response = await fetch("/api/process-video", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process video")
      }

      // Get the processed video as a blob and create a URL for it
      const processedVideoBlob = await response.blob()
      const processedUrl = URL.createObjectURL(processedVideoBlob)

      setProcessedVideoUrl(processedUrl)

      // Save the processed video info
      localStorage.setItem(
        "processedVideo",
        JSON.stringify({
          url: processedUrl,
          backgroundType,
          backgroundId: selectedBackgroundId,
        }),
      )

      console.log("Background applied successfully!")
    } catch (error) {
      console.error("Error processing video:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Determine which video URL to display
  const displayVideoUrl = processedVideoUrl || videoUrl

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      {/* Video Selection Dialog */}
      <Dialog open={videoSelectionOpen} onOpenChange={setVideoSelectionOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Select a Video</DialogTitle>
          <DialogDescription>Choose a video from the list below to customize and preview.</DialogDescription>
          <div className="mt-4 border rounded-lg overflow-hidden">
            <div className="bg-slate-50 py-2 px-4 border-b font-medium">Available Videos</div>
            <div className="divide-y">
              {availableVideos.map((video) => (
                <div
                  key={video.id}
                  className={`flex items-center p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedVideoId === video.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleSelectVideo(video.id)}
                >
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-3">
                    {selectedVideoId === video.id ? (
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{video.title}</h3>
                    <p className="text-xs text-slate-500">Video #{video.id}</p>
                  </div>
                  <Play className="w-5 h-5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => handleSelectVideo(availableVideos[0].id)}>Continue with Selected Video</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mx-auto max-w-7xl bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            {loading ? "Processing Your Video" : "Customize & Preview Your Video"}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Preview Section */}
            <div className="lg:col-span-2">
              <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video shadow-md">
                <div className="absolute inset-0 flex items-center justify-center">
                  {backgroundType === "original" && !processedVideoUrl && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700"></div>
                  )}
                  {backgroundType === "upload" && uploadedImage && !processedVideoUrl && (
                    <Image
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Custom background"
                      fill
                      className="object-cover"
                    />
                  )}
                  {backgroundType === "gallery" && selectedBackground && !processedVideoUrl && (
                    <Image
                      src={selectedBackground || "/placeholder.svg"}
                      alt="Gallery background"
                      fill
                      className="object-cover"
                    />
                  )}

                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-900/10 z-10">
                      <div className="text-center">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-blue-600 font-medium">Generating your video...</p>
                        <p className="text-blue-400 text-sm mt-2">This may take several minutes</p>
                      </div>
                    </div>
                  ) : isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-900/10 z-10">
                      <div className="text-center">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-blue-600 font-medium">Applying background...</p>
                        <p className="text-blue-400 text-sm mt-2">This may take a moment</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/10 z-10">
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
                      className="relative z-10 w-full h-full object-contain"
                      controls
                      autoPlay
                      src={displayVideoUrl}
                      poster="/placeholder.svg?height=720&width=1280"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <source src={displayVideoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>

                {!loading && !error && !isProcessing && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 rounded-full px-4 py-2 flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const video = document.querySelector("video")
                        if (video) {
                          if (isPlaying) video.pause()
                          else video.play()
                        }
                      }}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="w-32 h-1 bg-white/30 rounded-full">
                      <div className="w-1/3 h-1 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>

              {!loading && !error && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">Video Details</h2>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={handleDownload} disabled={isProcessing}>
                        Download Video
                      </Button>
                      <Button
                        onClick={handleApplyBackground}
                        disabled={isProcessing || (backgroundType === "gallery" && !selectedBackground)}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Apply Background"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 text-slate-800">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Text Input:</span> {inputText}
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Audio Style:</span> {selectedAudio}
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Avatar:</span> {selectedAvatar}
                    </div>
                    {processedVideoUrl && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="font-medium text-blue-800">Background Applied:</span>{" "}
                        <span className="text-blue-700">
                          {backgroundType === "original"
                            ? "Original Background"
                            : backgroundType === "gallery" && selectedBackground
                              ? "Custom Background from Gallery"
                              : "Custom Background"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Background Selection Section */}
            <div className="bg-slate-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <span className="text-blue-600 mr-2">✨</span>
                <h2 className="text-xl font-semibold text-slate-800">Choose a Background</h2>
              </div>

              <RadioGroup value={backgroundType} onValueChange={setBackgroundType} className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <RadioGroupItem value="original" id="original" />
                  <div className="flex-1">
                    <Label htmlFor="original" className="font-medium text-slate-800">
                      Original Background
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">Keep the original background from your recording</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <RadioGroupItem value="upload" id="upload" disabled={true} />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Label htmlFor="upload" className="font-medium text-slate-800">
                        Upload Custom Image
                      </Label>
                      <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        PREMIUM
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Use your own image as background</p>

                    <div className="mt-3 border-2 border-dashed rounded-lg p-4 text-center border-slate-300 relative">
                      <div className="absolute inset-0 bg-slate-200/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="text-center p-2">
                          <Lock className="h-6 w-6 text-slate-500 mx-auto" />
                          <span className="text-sm font-medium text-slate-700 block mt-1">Premium Feature</span>
                          <Button size="sm" variant="default" className="mt-2 text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Upgrade to Upload
                          </Button>
                        </div>
                      </div>
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-500">Drag & drop an image here or</p>
                      <label className="mt-2 inline-block">
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                          Browse files
                        </span>
                        <input type="file" className="hidden" accept="image/*" disabled />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <RadioGroupItem value="gallery" id="gallery" />
                  <div className="flex-1">
                    <Label htmlFor="gallery" className="font-medium text-slate-800">
                      Browse Background Gallery
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">Choose from our curated collection</p>

                    <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="mt-3 w-full" onClick={() => setGalleryOpen(true)}>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Open Gallery
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden">
                        <BackgroundGallery
                          onSelectBackground={handleSelectBackground}
                          onClose={() => setGalleryOpen(false)}
                          activeCategory={activeCategory}
                          setActiveCategory={setActiveCategory}
                        />
                      </DialogContent>
                    </Dialog>

                    {backgroundType === "gallery" && selectedBackground && (
                      <div className="mt-3 relative rounded-md overflow-hidden">
                        <Image
                          src={selectedBackground || "/placeholder.svg"}
                          alt="Selected background"
                          width={300}
                          height={150}
                          className="w-full h-24 object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 bg-black/50 text-white hover:bg-black/70 p-1 h-auto"
                          onClick={() => setGalleryOpen(true)}
                        >
                          Change
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>

              <div className="mt-8 pt-4 border-t border-slate-200">
                <div className="flex justify-between">
                  <Button variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <div className="flex">
                  <Crown className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Premium Feature</p>
                    <p className="text-xs text-blue-600 mt-1">Unlock all backgrounds with our Premium plan</p>
                    <Button size="sm" variant="default" className="mt-2 bg-blue-600 hover:bg-blue-700">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
