"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, X, Check, Info, Square } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type VoiceSentence = {
  id: string;
  normalizedText: string;
};

const VOICE_SENTENCES: VoiceSentence[] = [
  { id: "1", normalizedText: "My name is Alex and I'm thrilled to create my voice profile." },
  { id: "2", normalizedText: "The sun sets slowly behind the mountain." },
  { id: "3", normalizedText: "Technology shapes the future of communication." },
  { id: "4", normalizedText: "A journey of a thousand miles begins with a single step." },
  { id: "5", normalizedText: "Thank you for helping me share my voice with the world." },
];

export default function UploadVoicePage() {
  const [form, setForm] = useState({ email: "", name: "", gender: "Male", text: "My name is Alex and I'm thrilled to create my voice profile." });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startMicrophone = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(media);
      if (audioRef.current) {
        audioRef.current.srcObject = media;
        audioRef.current.controls = false;
      }
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  };

  const stopMicrophone = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setIsRecording(false);
    startMicrophone();
  };

  const startRecording = () => {
    if (!stream) return;

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" }); // or "audio/wav"
      const file = new File([blob], "recording.webm", { type: "audio/webm" });
      const url = URL.createObjectURL(blob);

      setRecordedBlob(file);

      if (audioRef.current) {
        audioRef.current.srcObject = null;
        audioRef.current.src = url;
        audioRef.current.controls = true;
      }

      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const confirmRecording = () => {
    if (recordedBlob) {
      console.log("Confirmed audio file:", recordedBlob);
      closeModal();
    }
  };

  const closeModal = () => {
    stopMicrophone();
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (stream && audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch((err) => {
        console.error("Autoplay failed:", err);
      });
    }
  }, [stream]);

  useEffect(() => {
    if (isModalOpen) {
      startMicrophone();
    } else {
      stopMicrophone();
    }
  }, [isModalOpen]);

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-2">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium text-blue-600 mb-2">Create Your Voice</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Record your voice reciting a selected sentence to create your personalized voice profile.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Card className="p-0 rounded-none h-full border-blue-200 shadow-md">
              <CardHeader className="rounded-sm">
                <CardTitle className="mt-3 text-xl font-medium text-blue-700">Instructions</CardTitle>
                <CardDescription className="text-muted-foreground">Follow these steps for best results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
            <Card className="p-0 rounded-none shadow-xl">
              <CardHeader className="rounded-sm">
                <CardTitle className="mt-3 text-xl font-medium text-blue-700">Record Your Voice</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Record your voice reciting a sentence and fill in the details
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-3">
                <form id="upload-voice-form" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-blue-700">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <input
                      type="text"
                      placeholder="Enter Your Name"
                      required
                      className="w-full px-2 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sentence" className="text-blue-700">
                      Sentence to Recite <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.text}
                      onValueChange={(value) => {
                        setForm((prev) => ({ ...prev, text: value }));
                      }}
                    >
                      <SelectTrigger className="rounded-sm border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select a sentence" />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICE_SENTENCES.map((sentence) => (
                          <SelectItem key={sentence.id} value={sentence.normalizedText}>
                            {sentence.normalizedText}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-blue-700">
                      Gender<span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup value={form.gender} onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))} className="flex space-x-4">
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

                    <div className="border-2 border-dashed rounded-lg p-6">
                      {!recordedBlob ? (
                        <div className="text-center">
                          <Mic className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                          <p className="text-blue-700 font-medium mb-4">No voice recorded yet</p>
                          <Button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                                <p className="text-blue-700 font-medium">Recording available</p>
                                <p className="text-xs text-gray-500">
                                  {(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={resetRecording}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="rounded-md overflow-hidden border border-blue-200">
                            <audio src={URL.createObjectURL(recordedBlob)} controls className="w-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </form>
              </CardContent>
              <CardFooter className="p-4 flex justify-end gap-3">
                <Button
                  type="submit"
                  form="upload-avatar-form"
                  className="rounded-sm bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Upload Avatar
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal for recording voice */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-blue-700">Record Your Voice</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-700 font-medium">Please recite the following sentence:</p>
              <p className="text-blue-600 mt-1">{form.text}</p>
            </div>

            {!recordedBlob ? (
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
                    <Mic size={25} className="text-blue-600" />
                    <div>
                      <p className="text-blue-700 font-medium">Recording available</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRecordedBlob(null)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="rounded-none overflow-hidden">
                  <audio src={URL.createObjectURL(recordedBlob)} controls className="w-full" />
                </div>

                <DialogFooter className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetRecording}
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
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}