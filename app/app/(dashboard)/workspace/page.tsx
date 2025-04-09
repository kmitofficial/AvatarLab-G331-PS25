"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCw, ArrowRight, ArrowLeft, Check, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Sample avatar data
const avatars = [
  {
    id: "emma",
    name: "Emma",
    gender: "Female",
    image: "/images/emma.jpeg",
  },
  {
    id: "michael",
    name: "Michael",
    gender: "Male",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "sofia",
    name: "Sofia",
    gender: "Female",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "james",
    name: "James",
    gender: "Male",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "alex",
    name: "Alex",
    gender: "Neutral",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "custom",
    name: "Custom",
    gender: "Custom",
    image: "/placeholder.svg?height=400&width=400",
  },
]

// Sample voice data
const voices = [
  {
    id: "voice1",
    name: "Emma Voice",
    gender: "Female",
    language: "English (US)",
    preview: "/path-to-audio.mp3",
  },
  {
    id: "voice2",
    name: "Michael Voice",
    gender: "Male",
    language: "English (US)",
    preview: "/path-to-audio.mp3",
  },
  {
    id: "voice3",
    name: "Sofia Voice",
    gender: "Female",
    language: "English (UK)",
    preview: "/path-to-audio.mp3",
  },
  {
    id: "voice4",
    name: "James Voice",
    gender: "Male",
    language: "English (UK)",
    preview: "/path-to-audio.mp3",
  },
  {
    id: "voice5",
    name: "Alex Voice",
    gender: "Neutral",
    language: "English (US)",
    preview: "/path-to-audio.mp3",
  },
]

export default function WorkspacePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [scriptText, setScriptText] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewReady, setPreviewReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleNextStep = () => {
    if (currentStep === 1 && scriptText.trim() !== "") {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedAvatar !== "") {
      setCurrentStep(3)
    } else if (currentStep === 3 && selectedVoice !== "") {
      handleGenerate()
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false)
      setPreviewReady(true)
      setCurrentStep(4) // Move to preview step
    }, 3000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && currentStep === 1) {
      e.preventDefault()
      if (scriptText.trim() !== "") {
        handleNextStep()
      }
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "AI Talking Head Synthesis"
      case 2:
        return "Select an Avatar"
      case 3:
        return "Choose a Voice"
      case 4:
        return "Preview Your Video"
      default:
        return "Create Talking Head Video"
    }
  }

  return (
    <div className="p-2 container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {getStepTitle()}
        </h1>
        <p className="text-muted-foreground text-sm">{currentStep < 4 ? `Step ${currentStep} of 3` : "Your video is ready"}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Step 1: Enter Script - ChatGPT-like interface */}
        {currentStep === 1 && (
          <div className="transition-all duration-300">
            <div className="mb-6 text-center">
              <p className="text-base text-center max-w-2xl mx-auto">
                Enter your text below to create a realistic talking head video with synchronized lip movements
              </p>
            </div>

            <div className="relative mt-8">
              <Textarea
                ref={textareaRef}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type or paste your script here..."
                className="min-h-[150px] pr-12 resize-none border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500 rounded-xl"
              />
              <Button
                onClick={handleNextStep}
                disabled={scriptText.trim() === ""}
                className="absolute bottom-3 right-3 rounded-full h-9 w-9 p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>

            <div className="mt-2 text-xs text-center text-muted-foreground">Press Enter to continue</div>
          </div>
        )}

        {/* Step 2: Select Avatar */}
        {currentStep === 2 && (
          <div className="transition-all duration-300">
            <div className="mb-6">
              <p className="text-base text-center max-w-2xl mx-auto">
                Choose the character that will deliver your message
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {avatars.map((avatar) => (
                <Card
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`p-0 rounded-sm overflow-hidden cursor-pointer transition-all hover:shadow-md
                    ${
                      selectedAvatar === avatar.id
                        ? "border-blue-500 ring-2 ring-blue-500"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={avatar.image || "/placeholder.svg"}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{avatar.name}</p>
                        <p className="text-xs text-muted-foreground">{avatar.gender}</p>
                      </div>
                      {selectedAvatar === avatar.id && (
                        <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousStep} className="border-blue-200 dark:border-blue-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleNextStep}
                disabled={selectedAvatar === ""}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Select Voice */}
        {currentStep === 3 && (
          <div className="transition-all duration-300">
            <div className="mb-6">
              <p className="text-base text-center max-w-2xl mx-auto">Select the voice that will be used for your video</p>
            </div>

            <div className="space-y-3 mb-6">
              {voices.map((voice) => (
                <Card
                  key={voice.id}
                  className={`p-0 rounded-none shadow-md overflow-hidden transition-all
                    ${
                      selectedVoice === voice.id
                        ? "border-blue-500 ring-1 ring-blue-500"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroup value={selectedVoice} onValueChange={setSelectedVoice} className="flex-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={voice.id} id={voice.id} className="text-blue-600" />
                          <div>
                            <Label htmlFor={voice.id} className="font-medium cursor-pointer">
                              {voice.name}
                            </Label>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {voice.gender} • {voice.language}
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                      <Button variant="outline" size="sm" className="h-8 border-blue-200 dark:border-blue-800">
                        <Play className="h-3 w-3 mr-1" /> Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousStep} className="border-blue-200 dark:border-blue-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={selectedVoice === "" || isGenerating}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Video</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 4 && (
          <div className="transition-all duration-300">
            <div className="mb-6">
              <p className="text-lg text-center max-w-2xl mx-auto">
                Preview your talking head video and make adjustments if needed
              </p>
            </div>

            <Card className="p-0 rounded-none overflow-hidden border-blue-200 dark:border-blue-800 shadow-md mb-6">
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black">
                {previewReady ? (
                  <div className="h-full w-full">
                    <img
                      src="/placeholder.svg?height=720&width=1280"
                      alt="Video preview"
                      className="h-50 w-50 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70 border-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 pl-1" />}
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <div className="flex-1">
                        <Slider
                          defaultValue={[0]}
                          className="[&>span:first-child]:bg-white/30 [&>span:first-child_span]:bg-blue-500"
                        />
                      </div>
                      <div className="text-sm text-white">00:00 / 01:30</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-white">
                    <RotateCw className="h-8 w-8 animate-spin mb-4" />
                    <p className="text-center text-lg font-medium">Generating your video...</p>
                    <p className="text-center text-sm text-white/70">This may take a few moments</p>
                  </div>
                )}
              </div>
            </Card>

            {previewReady && (
              <>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="border-blue-200 dark:border-blue-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Voice Selection
                  </Button>

                  <div className="space-x-2">
                    <Button variant="outline" className="border-blue-200 dark:border-blue-800">
                      Download
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Save Video
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

