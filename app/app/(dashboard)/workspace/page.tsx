"use client"

import React from "react"

import { useState, useRef } from "react"
import { Play, Pause, RotateCw, ArrowRight, ArrowLeft, Check, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getEmail } from "@/lib/authenticate"
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation"

type Avatar = { id: string; name: string; gender: string; video: string; }
type Voice = { id: string; name: string; gender: string; audio: string; text: string };

export default function WorkspacePage() {

  const [email, setEmail] = useState("");

  const [currentStep, setCurrentStep] = useState(1)

  const [generateForm, setGenerateForm] = React.useState({ email: "", text: "", videoId: "", audioId: "", audio_text: "" });

  const [isGenerating, setIsGenerating] = useState(false)
  const [preview, setPreview] = useState("")

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [preDefinedAvatar, setpreDefinedAvatars] = useState<Avatar[]>([]);
  const [userAvatars, setUserAvatars] = useState<Avatar[]>();

  const [preDefinedVoice, setpreDefinedVoices] = useState<Voice[]>([]);
  const [userVoice, setUserVoices] = useState<Voice[]>([]);

  const [playingVideo, setPlayingVideo] = useState<Record<string, boolean>>({})
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const [playingAudio, setPlayingAudio] = useState<Record<string, boolean>>({})
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})

  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      const result = await getEmail();
      if (result) {
        const email = result.email;
        setEmail(email);

        const avatarsRes = await fetch('/api/dev/avatars', {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        const { predefined: predefinedAvatars, user: userAvatars } = await avatarsRes.json();
        setpreDefinedAvatars(predefinedAvatars);
        setUserAvatars(userAvatars);

        const voicesRes = await fetch('/api/dev/voices', {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        const { predefined: predefinedVoices, user: userVoices } = await voicesRes.json();
        setpreDefinedVoices(predefinedVoices);
        setUserVoices(userVoices);
      } else {
        router.push("/login");
      }
    };

    fetchData();
  }, []);

  const toggleVideo = (id: string) => {
    const video = videoRefs.current[id];
    if (video) {
      if (video.paused) {
        video.play();
        setPlayingVideo((prev) => ({ ...prev, [id]: true }));
      } else {
        video.pause();
        setPlayingVideo((prev) => ({ ...prev, [id]: false }))
      }
    }
  }

  const toggleAudio = (id: string) => {
    const audio = audioRefs.current[id]
    if (audio) {
      if (audio.paused) {
        Object.entries(audioRefs.current).forEach(([key, a]) => {
          if (a && key !== id) {
            a.pause()
            setPlayingAudio((prev) => ({ ...prev, [key]: false }))
          }
        })
        audio.play()
        setPlayingAudio((prev) => ({ ...prev, [id]: true }))
      } else {
        audio.pause()
        setPlayingAudio((prev) => ({ ...prev, [id]: false }))
      }
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1 && generateForm.text.trim() !== "") {
      setCurrentStep(2)
    } else if (currentStep === 2 && generateForm.videoId !== "") {
      setCurrentStep(3)
    } else if (currentStep === 3 && generateForm.audioId !== "") {
      handleGenerate()
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true);;
    setGenerateForm((prev) => ({ ...prev, email: email }));
    const response = await fetch('/api/user/generate', {
      method: 'POST',
      body: JSON.stringify(generateForm)
    });
    if (response.ok) {
      setIsGenerating(false);
      const { video } = await response.json();
      setPreview(video);
      setCurrentStep(4);
    }
  }

  return (
    <>
      {/* Step 1: Enter Script - ChatGPT-like interface */}
      {currentStep === 1 && (
        <motion.div
          className="min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} >
          <div className="container mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-4xl fontfamily font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Talking Head Synthesis
              </h1>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="transition-all duration-300">
                <div className="mb-6 text-center">
                  <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                    Enter your text below to create a realistic talking head video with synchronized lip movements
                  </p>
                </div>

                <div className="relative mt-8">
                  <Textarea
                    ref={textareaRef} value={generateForm.text}
                    onChange={(e) => setGenerateForm((prev) => ({ ...prev, text: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && currentStep === 1) {
                        e.preventDefault();
                        if (generateForm.text.trim() !== "") {
                          handleNextStep();
                        }
                      }
                    }}
                    placeholder="Type or paste your script here..."
                    className="min-h-[120px] pr-12 resize-none border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500 rounded-xl"
                  />
                  <Button
                    onClick={handleNextStep}
                    disabled={generateForm.text.trim() === ""}
                    className="absolute bottom-3 right-3 rounded-full h-9 w-9 p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>

                <div className="mt-2 text-xs text-center text-muted-foreground">Press Enter to continue</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Select Avatar */}
      {currentStep === 2 && (
        <motion.div
          className="container mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              Select an Avatar
            </h1>
            <p className="text-muted-foreground text-sm">{currentStep < 4 ? `Step ${currentStep} of 3` : "Your video is ready"}</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="transition-all duration-300">
              <div className="mb-6">
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  Choose the character that will deliver your message
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {preDefinedAvatar.map((avatar) => (
                  <motion.div
                    key={avatar.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card
                      onClick={() => setGenerateForm((prev) => ({ ...prev, videoId: avatar.id }))}
                      className={`p-0 rounded-sm overflow-hidden cursor-pointer transition-all hover:shadow-md
                    ${generateForm.videoId === avatar.id
                          ? "border-blue-500 ring-2 ring-blue-500"
                          : "border-gray-200 dark:border-gray-800"
                        }`}
                    >
                      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                        <video ref={(el) => { if (el) videoRefs.current[avatar.id] = el; }} src={avatar.video} preload="metadata" />

                        {/* Play/Pause button overlay */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-3 left-3 h-10 w-10 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 shadow-md"
                          onClick={() => toggleVideo(avatar.id)}
                        >
                          {playingVideo[avatar.id] === true ? (
                            <Pause className="h-5 w-5 text-blue-600 dark:text-white" />
                          ) : (
                            <Play className="h-5 w-5 text-blue-600 dark:text-white" />
                          )}
                        </Button>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{avatar.name}</p>
                            <p className="text-xs text-muted-foreground">{avatar.gender}</p>
                          </div>
                          {generateForm.videoId === avatar.id && (
                            <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep} className="border-blue-200 dark:border-blue-800">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  onClick={handleNextStep}
                  disabled={generateForm.videoId === ""}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Select Voice */}
      {currentStep === 3 && (
        <motion.div
          className="container mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              Choose a Voice
            </h1>
            <p className="text-muted-foreground text-sm">{currentStep < 4 ? `Step ${currentStep} of 3` : "Your video is ready"}</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="transition-all duration-300">
              <div className="mb-6">
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">Select the voice that will be used for your video</p>
              </div>

              <div className="space-y-3 mb-6">
                {preDefinedVoice.map((voice) => (
                  <motion.div
                    key={voice.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.4 }} >
                    <Card
                      onClick={() => setGenerateForm((prev) => ({ ...prev, audioId: voice.id, audio_text: voice.text }))}
                      className={`p-0 rounded-none shadow-md overflow-hidden transition-all cursor-pointer 
                    ${generateForm.audioId === voice.id
                          ? "border-blue-500 ring-1 ring-blue-500"
                          : "border-gray-200 dark:border-gray-800"
                        }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroup value={generateForm.audioId} className="flex-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={voice.id} id={voice.id} className="text-blue-600" />
                              <div>
                                <Label htmlFor={voice.id} className="font-medium cursor-pointer">
                                  {voice.name}
                                </Label>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {voice.gender} • English
                                </p>
                              </div>
                            </div>
                          </RadioGroup>
                          <Button variant="outline" size="sm" className="h-8 border-blue-200 dark:border-blue-800"
                            onClick={() => toggleAudio(voice.id)}>
                            {playingAudio[voice.id] ? (<Pause className="h-4 w-4 mr-1" />) : (<Play className="h-4 w-4 mr-1" />)}
                            Preview
                            <audio ref={(el) => { if (el) audioRefs.current[voice.id] = el; }} src={voice.audio}></audio>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep} className="border-blue-200 dark:border-blue-800">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={generateForm.audioId === "" || isGenerating}
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
          </div>
        </motion.div>
      )}

      {/* Step 4: Preview */}
      {currentStep === 4 && (
        <motion.div
          className="container mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl fontfamily font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Preview Your Video
            </h1>
            <p className="text-muted-foreground text-sm">{currentStep < 4 ? `Step ${currentStep} of 3` : "Your video is ready"}</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="transition-all duration-300">
              <div className="mb-6">
                <p className="text-lg text-center max-w-2xl mx-auto">
                  Preview your talking head video and make adjustments if needed
                </p>
              </div>

              <div className="flex justify-center items-center mb-6">
                <video
                  src={preview}
                  width={400}
                  height={400}
                  className="object-cover rounded-sm shadow-md"
                  preload="metadata"
                  controls
                />
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="border-blue-200 dark:border-blue-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Regenerate Video
                </Button>

                <div className="space-x-2">
                  <Button variant="outline" className="border-blue-200 dark:border-blue-800">
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}