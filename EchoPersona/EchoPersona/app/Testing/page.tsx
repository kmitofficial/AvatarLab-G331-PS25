"use client"

import type React from "react"
import '@/app/globals.css'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Upload, ImageIcon, Lock, ChevronLeft, ChevronRight, X, Crown } from "lucide-react"
import Image from "next/image"

export default function CustomizeVideoBackground() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [backgroundType, setBackgroundType] = useState("original")
  const [selectedBackground, setSelectedBackground] = useState("")
  const [uploadedImage, setUploadedImage] = useState("")
  const [activeCategory, setActiveCategory] = useState("nature")
  const [galleryOpen, setGalleryOpen] = useState(false)

  // Mock backgrounds data
  const backgrounds = {
    nature: [
      { id: "n1", name: "Mountain Lake (Free)", src: "/placeholder.svg?height=200&width=300", premium: false },
      { id: "n2", name: "Forest View (Free)", src: "/placeholder.svg?height=200&width=300", premium: false },
      { id: "n3", name: "Beach Sunset", src: "/placeholder.svg?height=200&width=300", premium: true },
      { id: "n4", name: "Autumn Park", src: "/placeholder.svg?height=200&width=300", premium: true },
    ],
    office: [
      { id: "o1", name: "Modern Office (Free)", src: "/placeholder.svg?height=200&width=300", premium: false },
      { id: "o2", name: "Home Office (Free)", src: "/placeholder.svg?height=200&width=300", premium: false },
      { id: "o3", name: "Executive Suite", src: "/placeholder.svg?height=200&width=300", premium: true },
      { id: "o4", name: "Conference Room", src: "/placeholder.svg?height=200&width=300", premium: true },
    ],
    modern: [
      { id: "m1", name: "Gradient Blue (Free)", src: "/placeholder.svg?height=200&width=300", premium: false },
      { id: "m2", name: "Minimal White (Free)", src: "/placeholder.svg?height=200&width=300", premium: false },
      { id: "m3", name: "Tech Pattern", src: "/placeholder.svg?height=200&width=300", premium: true },
      { id: "m4", name: "Abstract Shapes", src: "/placeholder.svg?height=200&width=300", premium: true },
    ],
    abstract: [
      { id: "a1", name: "Fluid Colors (Free)", src: "/placeholder.svg?height=200&width=300", premium: false },
      { id: "a2", name: "Geometric (Free)", src: "/placeholder.svg?height=200&width=300", premium: false },
      { id: "a3", name: "Neon Waves", src: "/placeholder.svg?height=200&width=300", premium: true },
      { id: "a4", name: "Particle Flow", src: "/placeholder.svg?height=200&width=300", premium: true },
    ],
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImage(e.target.result as string)
          setBackgroundType("upload")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImage(e.target.result as string)
          setBackgroundType("upload")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const selectBackground = (id: string, src: string, isPremium: boolean) => {
    if (!isPremium) {
      setSelectedBackground(src)
      setBackgroundType("gallery")
      setGalleryOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Customize Your Video</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Preview Section */}
            <div className="lg:col-span-2">
              <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video shadow-md">
                <div className="absolute inset-0 flex items-center justify-center">
                  {backgroundType === "original" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700"></div>
                  )}
                  {backgroundType === "upload" && uploadedImage && (
                    <Image
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Custom background"
                      fill
                      className="object-cover"
                    />
                  )}
                  {backgroundType === "gallery" && selectedBackground && (
                    <Image
                      src={selectedBackground || "/placeholder.svg"}
                      alt="Gallery background"
                      fill
                      className="object-cover"
                    />
                  )}

                  {/* Placeholder for the talking head video */}
                  <div className="relative z-10 w-1/2 h-4/5 bg-black/20 rounded-lg flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=300&width=200"
                      alt="Talking head video"
                      width={200}
                      height={300}
                      className="rounded-lg object-cover"
                    />
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 rounded-full px-4 py-2 flex items-center space-x-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <div className="w-32 h-1 bg-white/30 rounded-full">
                    <div className="w-1/3 h-1 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Selection Section */}
            <div className="bg-slate-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <span className="text-blue-600 mr-2">✨</span>
                <h2 className="text-xl font-semibold text-slate-800">Choose a Background</h2>
              </div>

              <RadioGroup value={backgroundType} onValueChange={setBackgroundType} className="space-y-4">
                {/* Original Background Option */}
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <RadioGroupItem value="original" id="original" />
                  <div className="flex-1">
                    <Label htmlFor="original" className="font-medium text-slate-800">
                      Original Background
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">Keep the original background from your recording</p>
                  </div>
                </div>

                {/* Upload Custom Image Option */}
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

                {/* Browse Background Gallery Option */}
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
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">Background Gallery</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setGalleryOpen(false)}
                              className="text-white hover:bg-blue-700/50 rounded-full"
                            >
                              {/* <X size={20} strokeWidth={2.5} /> */}
                            </Button>
                          </div>
                          <p className="text-blue-100 mt-1">Select a background to enhance your video</p>
                        </div>

                        <div className="p-6">
                          <Tabs defaultValue="nature" value={activeCategory} onValueChange={setActiveCategory}>
                            <TabsList className="mb-6 bg-slate-100 p-1">
                              <TabsTrigger value="nature" className="data-[state=active]:bg-white">
                                Nature
                              </TabsTrigger>
                              <TabsTrigger value="office" className="data-[state=active]:bg-white">
                                Office
                              </TabsTrigger>
                              <TabsTrigger value="modern" className="data-[state=active]:bg-white">
                                Modern
                              </TabsTrigger>
                              <TabsTrigger value="abstract" className="data-[state=active]:bg-white">
                                Abstract
                              </TabsTrigger>
                            </TabsList>

                            <ScrollArea className="h-[400px] pr-4">
                              {Object.entries(backgrounds).map(([category, items]) => (
                                <TabsContent key={category} value={category} className="m-0">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {items.map((bg) => (
                                      <div
                                        key={bg.id}
                                        className={`relative group rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                                          selectedBackground === bg.src && backgroundType === "gallery"
                                            ? "ring-2 ring-blue-500 ring-offset-2"
                                            : "hover:shadow-md"
                                        }`}
                                        onClick={() => selectBackground(bg.id, bg.src, bg.premium)}
                                      >
                                        <Image
                                          src={bg.src || "/placeholder.svg"}
                                          alt={bg.name}
                                          width={300}
                                          height={200}
                                          className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                                        />

                                        {bg.premium && (
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="text-center p-2">
                                              <Lock className="h-6 w-6 text-white mx-auto" />
                                              <span className="text-xs font-medium text-white block mt-1">Premium</span>
                                              <Button size="sm" variant="secondary" className="mt-2 text-xs">
                                                <Crown className="h-3 w-3 mr-1" />
                                                Upgrade
                                              </Button>
                                            </div>
                                          </div>
                                        )}

                                        <div className="p-2 bg-white">
                                          <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-slate-700">{bg.name}</p>
                                            {bg.premium && (
                                              <Badge
                                                variant="outline"
                                                className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                                              >
                                                PREMIUM
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </TabsContent>
                              ))}
                            </ScrollArea>
                          </Tabs>
                        </div>
                        <div className="p-4 border-t border-slate-200 flex justify-end">
                          <Button variant="outline" onClick={() => setGalleryOpen(false)}>
                            <X size={16} className="mr-2" /> Close Gallery
                          </Button>
                        </div>
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
