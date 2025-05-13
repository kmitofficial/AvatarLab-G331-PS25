"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, ImageIcon,Upload, Lock, Crown, CirclePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import BackgroundGallery from "@/components/background-gallery"
import { getEmail } from "@/lib/authenticate"
import { motion } from "framer-motion"

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
}

export default function VideoEditorPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [userEmail, setEmail] = useState("");

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [availableVideos, setAvailableVideos] = useState<any[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoSelectionOpen, setVideoSelectionOpen] = useState(true)

  const [backgroundType, setBackgroundType] = useState("gallery")
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<number | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("nature")

  const [isProcessing, setIsProcessing] = useState(false)
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        const result = await getEmail();
        setEmail(result!.email);
        const response = await fetch("/api/user/videos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch videos")
        }

        const videoData = await response.json()
        setAvailableVideos(videoData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching videos:", error)
        setError("Failed to load videos. Please try again.")
        setLoading(false)
      }
    }

    fetchUserVideos()
  }, [userEmail])

  const handleSelectVideo = (videoId: string) => {
    const selectedVideo = availableVideos.find((video) => video.id === videoId)
    if (selectedVideo) {
      setSelectedVideoId(videoId)
      setVideoUrl(selectedVideo.video)
      setVideoSelectionOpen(false)
    }
  }

  const handleSelectBackground = (src: string, id: number) => {
    setSelectedBackground(src)
    setSelectedBackgroundId(id)
    setBackgroundType("gallery")
    setGalleryOpen(false)
  }

  const handleApplyBackground = async () => {
    if (!videoUrl) {
      console.error("No video available to process")
      return
    }
    if (backgroundType === "original") {
      setProcessedVideoUrl(null)
      return
    }
    if (backgroundType === "gallery" && !selectedBackground) {
      console.error("Please select a background from the gallery")
      return
    }

    try {
      setIsProcessing(true)
      const formData = new FormData()
      formData.append("email", userEmail)
      const selectedVideo = availableVideos.find((video) => video.id === selectedVideoId)
      if (!selectedVideo) {
        throw new Error("Selected video not found")
      }
      const videoBlob = await fetch(selectedVideo.video).then((r) => r.blob())
      formData.append("video", videoBlob, "input-video.mp4")

      if (backgroundType === "gallery" && selectedBackground) {
        const bgResponse = await fetch(selectedBackground)
        const bgBlob = await bgResponse.blob()
        formData.append("bg", bgBlob, "background.png")
      }
      if (selectedBackgroundId) {
        formData.append("backgroundId", selectedBackgroundId.toString())
      }
      const response = await fetch("/api/process-video", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process video")
      }
      const responseData = await response.json()
      setProcessedVideoUrl(responseData.video)

      console.log("Background applied successfully!")
    } catch (error) {
      console.error("Error processing video:", error)
      setError("Failed to process video. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    const urlToDownload = processedVideoUrl || videoUrl

    if (urlToDownload) {
      const a = document.createElement("a")
      a.href = urlToDownload
      a.download = "processed-video.mp4"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Video Selection Dialog */}
      <Dialog open={videoSelectionOpen} onOpenChange={setVideoSelectionOpen}>
        <DialogContent className="rounded-sm sm:max-w-[600px]">
          <DialogTitle>Select a Video</DialogTitle>
          <DialogDescription>Choose a video from your library to customize and preview.</DialogDescription>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
              <p>Loading your videos...</p>
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">
              <p>{error}</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <div className="bg-slate-50 py-2 px-4 border-b font-medium">Your Videos</div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {availableVideos.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">No videos found in your library</div>
                ) : (
                  availableVideos.map((video) => (
                    <div
                      key={video.id}
                      className={`flex items-center p-3 cursor-pointer hover:bg-slate-50 transition-colors ${selectedVideoId === video.id ? "bg-blue-50" : ""
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
                        <h3 className="font-medium">{video.filename}</h3>
                        <div className="flex text-xs text-slate-500 space-x-2">
                          <span>{video.date}</span>
                          <span>•</span>
                          <span>{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedVideoId) {
                  handleSelectVideo(selectedVideoId)
                } else if (availableVideos.length > 0) {
                  handleSelectVideo(availableVideos[0].id)
                }
              }}
              disabled={availableVideos.length === 0 || loading}
            >
              Continue with Selected Video
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto p-2">
        <div className="p-2">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            Customize & Preview Your Video
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Preview Section */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video Preview */}
                <div className="space-y-2">
                  <p className="font-medium">Background Preview</p>
                  <div onClick={()=>setVideoSelectionOpen(true)} className="cursor-pointer relative bg-gray-900 rounded-sm overflow-hidden aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/10 z-10">
                          <div className="text-center">
                            <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-blue-600 font-medium">Loading your videos...</p>
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
                            <p className="text-red-600 font-medium text-xl mb-4">Error</p>
                            <p className="text-red-500">{error}</p>
                            <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => window.location.reload()}>
                              Try Again
                            </Button>
                          </div>
                        </div>
                      ) : videoUrl ? (
                        <video
                          ref={videoRef}
                          className="relative z-10 w-full h-full object-contain"
                          controls
                          src={videoUrl}
                        >
                          <source src={videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <CirclePlus size={40} color="white"/>
                          <p className="text-white font-medium mt-2 mb-4">No video selected yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Background Preview */}
                <div className="space-y-2">
                  <p className="font-medium">Background Preview</p>
                  <div onClick={()=> setGalleryOpen(true)} className="cursor-pointer relative transition-all duration-300 ease-in-out bg-slate-100 rounded-sm hover:bg-gray-900 hover:text-white overflow-hidden aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {backgroundType === "original" && !processedVideoUrl ? (
                        <div className="absolute inset-0"></div>
                      ) : backgroundType === "gallery" && selectedBackground && !processedVideoUrl ? (
                        <Image
                          src={selectedBackground || "/placeholder.svg"}
                          alt="Gallery background"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <CirclePlus size={40}/>
                          <p className="mt-2 font-medium mb-4">No background selected yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {videoUrl && !loading && !error && (
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
                            Processing
                          </>
                        ) : (
                          "Apply Background"
                        )}
                      </Button>
                    </div>
                  </div>

                  {selectedVideoId && (
                    <div className="grid gap-3 text-slate-800">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium">Filename:</span>{" "}
                        {availableVideos.find((v) => v.id === selectedVideoId)?.filename || "Selected Video"}
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium">Duration:</span>{" "}
                        {availableVideos.find((v) => v.id === selectedVideoId)?.duration || "Unknown"}
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium">Uploaded:</span>{" "}
                        {availableVideos.find((v) => v.id === selectedVideoId)?.date || "Unknown"}
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
                  )}
                </div>
              )}
            </div>

            {/* Background Selection Section */}
            <div className="bg-slate-100 rounded-lg p-6 shadow-sm">
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

              <div className="mt-8 pt-4 border-t border-slate-400">
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => setVideoSelectionOpen(true)}>
                    Change Video
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
    </motion.div>
  )
}
