"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { getEmail } from "@/lib/authenticate"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Pause, Play, Plus, Search, Info, Mic, Square, Volume2, VolumeX } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import React from "react"
import { toast } from "react-toastify"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Voice = {
  id: string
  name: string
  text: string
  gender: string
  language: string
  email?: string
  audio: string
}

export default function VoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    name: "",
    gender: "Male",
    text: "",
    language: "English",
  })
  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [preDefinedVoices, setPreDefinedVoices] = useState<Voice[]>([])
  const [userDefinedVoices, setUserDefinedVoices] = useState<Voice[]>([])
  const [userEmail, setUserEmail] = useState("")
  const [playingAudio, setPlayingAudio] = useState<Record<string, boolean>>({})

  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})

  // Sample texts for voice recording
  const sampleTexts = [
    "Hello, I'm excited to create my digital voice!",
    "This is a sample of my voice for the AI system.",
    "Welcome to the future of digital communication.",
    "Voice technology is transforming how we interact with computers.",
    "Thank you for helping me create my personalized voice.",
  ]

  // Sample languages
  const languages = ["English", "Spanish", "French", "German", "Hindi", "Mandarin", "Japanese", "Arabic"]

  React.useEffect(() => {
    const fetchVoices = async () => {
      try {
        const result = await getEmail()
        const userEmail = result?.email
        if (!userEmail) {
          toast.error("Failed to fetch user email. Please try again.")
          return
        }
        setUserEmail(userEmail)

        const res = await fetch("/api/dev/voices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch voices: ${res.statusText}`)
        }

        const { predefined, userdefined } = await res.json()
        setPreDefinedVoices(predefined || [])
        setUserDefinedVoices(userdefined || [])
      } catch (error) {
        console.error("Error fetching voices:", error)
        toast.error("Error fetching voices. Please try again.")
      }
    }

    fetchVoices();
  }, [])

  // Audio recording functions
  const stopMicrophone = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const startMicrophone = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(media)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast.error("Unable to access your microphone. Please check permissions.")
    }
  }

  const resetRecording = () => {
    setRecordedBlob(null)
    setIsRecording(false)
    startMicrophone()
  }

  const startRecording = () => {
    if (!stream) return

    const chunks: Blob[] = []
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" })
      const url = URL.createObjectURL(blob)
      setRecordedBlob(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.controls = true
      }
    }

    recorder.start()
    setIsRecording(true)
    setRecordingTime(0)

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const toggleAudio = (id: string) => {
    const audio = audioRefs.current[id]
    if (audio) {
      if (audio.paused) {
        // Pause all other playing audio first
        Object.values(audioRefs.current).forEach((audioElement) => {
          if (audioElement && !audioElement.paused) {
            audioElement.pause()
            audioElement.currentTime = 0
          }
        })

        // Reset all playing states
        setPlayingAudio({})

        // Play the selected audio
        audio.play()
        setPlayingAudio((prev) => ({ ...prev, [id]: true }))

        // When audio ends, update state
        audio.onended = () => {
          setPlayingAudio((prev) => ({ ...prev, [id]: false }))
        }
      } else {
        audio.pause()
        audio.currentTime = 0
        setPlayingAudio((prev) => ({ ...prev, [id]: false }))
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleNextStep = () => {
    if (currentStep === 1 && form.name.trim() !== "" && form.text.trim() !== "") {
      setCurrentStep(2)
    } else if (currentStep === 2 && recordedBlob) {
      handleSubmit()
    } else {
      toast.error(
        currentStep === 1
          ? "Please enter a voice name and select a text sample"
          : "Please record your voice before proceeding",
      )
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.text.trim() || !recordedBlob) {
      toast.error("Please fill in all required fields and record your voice")
      return
    }

    // Validate audio size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (recordedBlob.size > maxSize) {
      toast.error("Audio file is too large. Please record a shorter sample (max 5MB).")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("gender", form.gender)
      formData.append("text", form.text)
      formData.append("language", form.language)
      formData.append("audio", recordedBlob, "voice-recording.webm")
      formData.append("email", userEmail)

      // Log FormData for debugging
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }

      const response = await fetch("/api/dev/uploadUserVoice", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to save voice")
      }

      // Refresh voices
      const resultEmail = await getEmail()
      const res = await fetch("/api/dev/voices", {
        method: "POST",
        body: JSON.stringify({ email: resultEmail?.email }),
      })
      const { predefined, userdefined } = await res.json()
      setPreDefinedVoices(predefined || [])
      setUserDefinedVoices(userdefined || [])

      toast.success(`Your voice "${form.name}" created successfully!`)
      setForm({ name: "", gender: "Male", text: "", language: "English" })
      setRecordedBlob(null)
      setCurrentStep(1)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("There was an error creating your voice. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up resources when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      stopMicrophone()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isDialogOpen])

  // Initialize microphone when step 2 is active
  useEffect(() => {
    if (isDialogOpen && currentStep === 2 && !recordedBlob) {
      startMicrophone()
    }
  }, [isDialogOpen, currentStep, recordedBlob])

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopMicrophone()
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Clean up audio URLs
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio && audio.src) {
          URL.revokeObjectURL(audio.src)
        }
      })
    }
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Voice Library</h1>
        </div>

        {/* My Voices Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Voices</h2>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md text-sm">
                {userDefinedVoices.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Create New Voice Card */}
            <Card
              className="overflow-hidden transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg border border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:border-indigo-600 cursor-pointer h-full"
              onClick={() => setIsDialogOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Create New Voice</p>
              </CardContent>
            </Card>

            {/* Existing Voices */}
            {userDefinedVoices.map((voice) => (
              <Card
                key={voice.id}
                className="overflow-hidden transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex flex-col items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                    {playingAudio[voice.id] ? (
                      <Volume2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <VolumeX className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>

                  <p className="text-sm text-center text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    "{voice.text}"
                  </p>

                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current[voice.id] = el
                    }}
                    src={voice.audio}
                    preload="metadata"
                    className="hidden"
                  />

                  {/* Play/Pause button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 shadow-md"
                    onClick={() => toggleAudio(voice.id)}
                  >
                    {playingAudio[voice.id] ? (
                      <Pause className="h-5 w-5 text-indigo-600 dark:text-white" />
                    ) : (
                      <Play className="h-5 w-5 text-indigo-600 dark:text-white" />
                    )}
                  </Button>
                </div>
                <CardContent className="bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">{voice.name}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{voice.gender}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{voice.language}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Public Voices Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Public Voices</h2>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md text-sm">
                {preDefinedVoices.length}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 dark:border-gray-700 rounded-md"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[180px] justify-between">
                  Filter by language
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 opacity-50"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Spanish</DropdownMenuItem>
                <DropdownMenuItem>French</DropdownMenuItem>
                <DropdownMenuItem>German</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Public Voices Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {preDefinedVoices
              .filter(
                (voice) =>
                  voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  voice.language.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((voice) => (
                <Card
                  key={voice.id}
                  className="overflow-hidden transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg"
                >
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex flex-col items-center justify-center p-6">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                      {playingAudio[voice.id] ? (
                        <Volume2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <VolumeX className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>

                    <p className="text-sm text-center text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      "{voice.text}"
                    </p>

                    <audio
                      ref={(el) => {
                        if (el) audioRefs.current[voice.id] = el
                      }}
                      src={voice.audio}
                      preload="metadata"
                      className="hidden"
                    />

                    {/* Play/Pause button */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 shadow-md"
                      onClick={() => toggleAudio(voice.id)}
                    >
                      {playingAudio[voice.id] ? (
                        <Pause className="h-5 w-5 text-indigo-600 dark:text-white" />
                      ) : (
                        <Play className="h-5 w-5 text-indigo-600 dark:text-white" />
                      )}
                    </Button>
                  </div>
                  <CardContent className="bg-gray-50 dark:bg-gray-900">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">{voice.name}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{voice.gender}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{voice.language}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Create Voice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[80vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-700 sm:text-3xl">
              {currentStep === 1 ? "Create Your Voice" : "Record Your Voice"}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {currentStep === 1
                ? "Enter your voice details to get started"
                : "Record your voice reading the selected text"}
            </DialogDescription>
          </DialogHeader>

          {currentStep === 1 ? (
            <div className="grid gap-6 py-4 sm:py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-indigo-700 text-sm sm:text-base">
                  Voice Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a name for your voice"
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                />
                <p className="text-sm text-gray-500">
                  This name will be used to identify your voice in your collection
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-indigo-700 text-sm sm:text-base">
                  Gender
                </Label>
                <RadioGroup
                  value={form.gender}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" className="text-indigo-600" />
                    <Label htmlFor="male" className="text-sm sm:text-base">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" className="text-indigo-600" />
                    <Label htmlFor="female" className="text-sm sm:text-base">
                      Female
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-indigo-700 text-sm sm:text-base">
                  Language
                </Label>
                <Select
                  value={form.language}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language} className="text-sm sm:text-base">
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text" className="text-indigo-700 text-sm sm:text-base">
                  Text to Read <span className="text-red-500">*</span>
                </Label>
                <Select value={form.text} onValueChange={(value) => setForm((prev) => ({ ...prev, text: value }))}>
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base">
                    <SelectValue placeholder="Select text to read" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleTexts.map((text) => (
                      <SelectItem key={text} value={text} className="text-sm sm:text-base">
                        {text.length > 40 ? text.substring(0, 40) + "..." : text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">Select a text that you'll read aloud in the next step</p>
              </div>

              <Alert className="bg-indigo-50 border-indigo-200">
                <Info className="h-4 w-4 text-indigo-600" />
                <AlertTitle className="text-indigo-700 text-sm sm:text-base">Next: Record Your Voice</AlertTitle>
                <AlertDescription className="text-indigo-600 text-sm">
                  In the next step, you'll record yourself reading the selected text. Make sure you're in a quiet
                  environment with minimal background noise.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="grid gap-6 py-4 sm:py-6">
              {/* Text to Read */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                <h3 className="font-medium text-indigo-700 mb-2">Read this text aloud:</h3>
                <p className="text-gray-800 text-lg">"{form.text}"</p>
              </div>

              {/* Audio Recording */}
              <div className="bg-gray-50 border border-indigo-200 rounded-md p-6 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  {isRecording ? (
                    <div className="relative">
                      <Mic className="h-12 w-12 text-red-600" />
                      <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-600 animate-pulse"></div>
                    </div>
                  ) : recordedBlob ? (
                    <Volume2 className="h-12 w-12 text-indigo-600" />
                  ) : (
                    <Mic className="h-12 w-12 text-indigo-600" />
                  )}
                </div>

                {isRecording && (
                  <div className="text-red-600 font-medium mb-4">Recording... {formatTime(recordingTime)}</div>
                )}

                {recordedBlob && (
                  <div className="mb-4 w-full max-w-md">
                    <audio ref={audioRef} controls className="w-full" />
                  </div>
                )}

                <div className="flex gap-4">
                  {!recordedBlob ? (
                    <>
                      <Button
                        type="button"
                        onClick={startRecording}
                        disabled={isRecording || !stream}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording ? "Recording..." : "Start Recording"}
                      </Button>
                      {isRecording && (
                        <Button
                          type="button"
                          onClick={stopRecording}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button type="button" onClick={resetRecording} variant="outline" className="border-indigo-200">
                      Record Again
                    </Button>
                  )}
                </div>
              </div>

              <Alert className="bg-indigo-50 border-indigo-200">
                <Info className="h-4 w-4 text-indigo-600" />
                <AlertTitle className="text-indigo-700 text-sm sm:text-base">Recording Tips</AlertTitle>
                <AlertDescription className="text-indigo-600 text-sm">
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Speak clearly at a natural pace</li>
                    <li>Use a quiet environment with minimal background noise</li>
                    <li>Maintain a consistent distance from your microphone</li>
                    <li>Read the entire text without pausing</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="pt-4 sticky bottom-0 bg-white dark:bg-gray-900 pb-8 sm:pb-10">
            {currentStep === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                className="mr-auto text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={
                isSubmitting ||
                (currentStep === 1 && (!form.name.trim() || !form.text.trim())) ||
                (currentStep === 2 && !recordedBlob)
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : currentStep === 1 ? (
                "Continue"
              ) : (
                "Create Voice"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
