"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, X, Check, AlertCircle, Info, Square } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmail, getUserId } from "@/lib/authenticate";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type VoiceSentence = {
  id: string;
  normalizedText: string;
};

// Static sentences for voice recording
const VOICE_SENTENCES: VoiceSentence[] = [
  { id: "1", normalizedText: "My name is Alex and I'm thrilled to create my voice profile." },
  { id: "2", normalizedText: "The sun sets slowly behind the mountain." },
  { id: "3", normalizedText: "Technology shapes the future of communication." },
  { id: "4", normalizedText: "A journey of a thousand miles begins with a single step." },
  { id: "5", normalizedText: "Thank you for helping me share my voice with the world." },
];

export default function UploadVoicePage() {
  const [name, setName] = useState("");
  const [selectedSentence, setSelectedSentence] = useState(VOICE_SENTENCES[0].normalizedText);
  const [sentences] = useState<VoiceSentence[]>(VOICE_SENTENCES);
  const [gender, setGender] = useState("Male");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; sentence?: string; audio?: string; mic?: string }>({});
  const router = useRouter();

  // Modal state and recording logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tempAudioFile, setTempAudioFile] = useState<File | null>(null);
  const [tempAudioPreviewUrl, setTempAudioPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Stable reference to track if microphone has been initialized
  const hasMicInitialized = useRef(false);

  // Start microphone stream with proper error handling
  const startMicrophone = useCallback(async () => {
    if (hasMicInitialized.current) return;

    hasMicInitialized.current = true;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setStream(mediaStream);
      console.log("Microphone stream initialized:", mediaStream.active, mediaStream.getAudioTracks());
      setErrors((prev) => ({ ...prev, mic: undefined }));
    } catch (error) {
      let errorMessage = "Could not access your microphone. Please grant permission and ensure a microphone is available.";
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No microphone found. Please connect a microphone and try again.";
        }
      }
      setErrors((prev) => ({ ...prev, mic: errorMessage }));
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  }, []);

  // Initialize microphone when modal opens
  useEffect(() => {
    if (isModalOpen) {
      hasMicInitialized.current = false;
      startMicrophone();
    }

    return () => {
      if (tempAudioPreviewUrl) {
        URL.revokeObjectURL(tempAudioPreviewUrl);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [isModalOpen, tempAudioPreviewUrl, startMicrophone]);

  // Cleanup audio preview on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  // Start recording with browser compatibility
  const startRecording = () => {
    if (!stream) {
      setErrors((prev) => ({ ...prev, audio: "Microphone stream not available. Please try again." }));
      return;
    }

    recordedChunksRef.current = [];
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const options = isSafari ? { mimeType: "audio/wav" } : {};
    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/wav" });
        const file = new File([blob], "recorded-voice.wav", { type: "audio/wav" });
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          setErrors((prev) => ({ ...prev, audio: "Recorded audio is too large. Maximum size is 10MB." }));
          return;
        }

        setTempAudioFile(file);
        setErrors((prev) => ({ ...prev, audio: undefined }));

        const previewUrl = URL.createObjectURL(blob);
        setTempAudioPreviewUrl(previewUrl);
      };

      mediaRecorder.onerror = (event) => {
         setErrors((prev) => ({ ...prev, audio: "Failed to record audio. Please try again." }));
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
          toast.info("Recording stopped after 30 seconds.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }
      }, 30000);
    } catch (error) {
      setErrors((prev) => ({ ...prev, audio: "Failed to start recording. Please try again." }));
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Clear temporary recorded audio (inside modal)
  const clearTempRecordedAudio = () => {
    if (tempAudioPreviewUrl) {
      URL.revokeObjectURL(tempAudioPreviewUrl);
    }
    setTempAudioFile(null);
    setTempAudioPreviewUrl(null);
    setIsRecording(false);
    startMicrophone();
  };

  // Confirm recording and close modal
  const confirmRecording = () => {
    if (tempAudioFile && tempAudioPreviewUrl) {
      setAudioFile(tempAudioFile);
      setAudioPreviewUrl(tempAudioPreviewUrl);
    }
    closeModal();
  };

  // Close modal and clean up
  const closeModal = () => {
    setIsModalOpen(false);
    setIsRecording(false);
    setTempAudioFile(null);
    setTempAudioPreviewUrl(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    hasMicInitialized.current = false;
  };

  // Clear recorded audio (on the main page)
  const clearRecordedAudio = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setAudioFile(null);
    setAudioPreviewUrl(null);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { name?: string; sentence?: string; audio?: string; mic?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!selectedSentence) {
      newErrors.sentence = "Please select a sentence to recite";
      isValid = false;
    } else if (!sentences.some((sentence) => sentence.normalizedText === selectedSentence)) {
      newErrors.sentence = "Invalid sentence selected";
      isValid = false;
    }

    if (!audioFile) {
      newErrors.audio = "Please record your voice";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("text_normalized", selectedSentence);
    formData.append("gender", gender);
    formData.append("audio", audioFile as File);
    formData.append("language", "English");

    try {
      const userIdentifier = await getUserId();
      if (!userIdentifier) {
        toast.error("You are not logged in. Please sign in first.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        setIsSubmitting(false);
        router.push("/login");
        return;
      }

      formData.append("userIdentifier", userIdentifier);

      const response = await fetch("/api/dev/uploadVoices", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      if (result.success) {
        toast.success("Your voice has been uploaded successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        throw new Error(result.error || "Failed to upload voice");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Upload Your Voice</h1>
          <p className="text-blue-600 max-w-2xl mx-auto">
            Record your voice reciting a selected sentence to create your personalized voice profile.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Card className="h-full border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-xl font-bold text-blue-700">Instructions</CardTitle>
                <CardDescription className="text-blue-600">Follow these steps for best results</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                    <span className="flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full bg-blue-600 text-white">
                      1
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Prepare your environment</h3>
                    <p className="text-sm text-gray-600">
                      Find a quiet place with minimal background noise.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                    <span className="flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full bg-blue-600 text-white">
                      2
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Select a sentence</h3>
                    <p className="text-sm text-gray-600">
                      Choose a sentence to recite from the dropdown list.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                    <span className="flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full bg-blue-600 text-white">
                      3
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Record your voice</h3>
                    <p className="text-sm text-gray-600">
                      Record yourself clearly reciting the selected sentence.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                    <span className="flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full bg-blue-600 text-white">
                      4
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Fill details and submit</h3>
                    <p className="text-sm text-gray-600">
                      Enter your name, select your gender, and click Upload to save your voice.
                    </p>
                  </div>
                </div>

                <Separator className="my-4 bg-blue-100" />

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-700">Recording Tips</AlertTitle>
                  <AlertDescription className="text-blue-600 text-sm">
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>Speak clearly and at a normal pace</li>
                      <li>Avoid background noise</li>
                      <li>Position the microphone close to your mouth</li>
                      <li>Record for 5-30 seconds</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-xl font-bold text-blue-700">Record Your Voice</CardTitle>
                <CardDescription className="text-blue-600">
                  Record your voice reciting a sentence and fill in the details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form id="upload-voice-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-blue-700">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (e.target.value.trim()) {
                          setErrors((prev) => ({ ...prev, name: undefined }));
                        }
                      }}
                      placeholder="Enter your name"
                      className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sentence" className="text-blue-700">
                      Sentence to Recite <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedSentence}
                      onValueChange={(value) => {
                        setSelectedSentence(value);
                        setErrors((prev) => ({ ...prev, sentence: undefined }));
                      }}
                    >
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select a sentence" />
                      </SelectTrigger>
                      <SelectContent>
                        {sentences.map((sentence) => (
                          <SelectItem key={sentence.id} value={sentence.normalizedText}>
                            {sentence.normalizedText}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sentence && <p className="text-red-500 text-sm mt-1">{errors.sentence}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-blue-700">
                      Gender
                    </Label>
                    <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Male" id="male" className="text-blue-600" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Female" id="female" className="text-blue-600" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-700">
                      Record Your Voice <span className="text-red-500">*</span>
                    </Label>

                    <div className="border-2 border-dashed rounded-lg p-6 bg-white">
                      {!audioFile ? (
                        <div className="text-center">
                          <Mic className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                          <p className="text-blue-700 font-medium mb-4">No voice recorded yet</p>
                          <Button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={sentences.length === 0}
                          >
                            <Mic className="h-4 w-4 mr-2" />
                            Record Voice
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Mic className="h-8 w-8 text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-700 truncate max-w-[200px]">{audioFile.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={clearRecordedAudio}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {audioPreviewUrl && (
                            <div className="rounded-md overflow-hidden border border-blue-200">
                              <audio src={audioPreviewUrl} controls className="w-full" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {errors.audio && (
                      <div className="flex items-start gap-2 mt-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <p className="text-red-500 text-sm">{errors.audio}</p>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter className="bg-blue-50 border-t border-blue-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/voices")}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="upload-voice-form"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Upload Voice
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal for recording voice */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-700">Record Your Voice</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-blue-700 font-medium">Please recite the following sentence:</p>
                <p className="text-blue-600 mt-1">{selectedSentence}</p>
              </div>

              {errors.mic ? (
                <div className="text-center text-red-500">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>{errors.mic}</p>
                  < Button
                    type="button"
                    onClick={startMicrophone}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Retry Microphone Access
                  </Button>
                </div>
              ) : !tempAudioFile ? (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-3">
                    <Button
                      type="button"
                      onClick={startRecording}
                      disabled={isRecording || !stream}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                    <Button
                      type="button"
                      onClick={stopRecording}
                      disabled={!isRecording}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mic className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-700 truncate max-w-[200px]">{tempAudioFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(tempAudioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearTempRecordedAudio}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {tempAudioPreviewUrl && (
                    <div className="rounded-md overflow-hidden border border-blue-200">
                      <audio src={tempAudioPreviewUrl} controls className="w-full" />
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearTempRecordedAudio}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Record Again
                    </Button>
                    <Button
                      type="button"
                      onClick={confirmRecording}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}