"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Video, X, Check, Info, Camera, Square } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast, ToastContainer } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


export default function UploadAvatarPage() {
  const [form, setForm] = useState({ email: "", name: "", gender: "Male" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);


  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const startCamera = async () => {
    const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(media);
    if (videoRef.current) {
      videoRef.current.srcObject = media;
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setIsRecording(false);
    startCamera();
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
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const file = new File([blob], 'recording.mp4', { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(file);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.controls = true;
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
      console.log('Confirmed video file:', recordedBlob);
      closeModal();
    }
  };

  const closeModal = () => {
    stopCamera();
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error('Autoplay failed:', err);
      });
    }
  }, [stream]);

  useEffect(() => {
    if (isModalOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isModalOpen]);

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-2">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium text-blue-600 mb-2">Create Your Digital Avatar</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Record a short video of your face to create your personalized avatar.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Card className="p-0 rounded-none h-full border-blue-200 shadow-md">
              <CardHeader className="rounded-sm ">
                <CardTitle className="mt-3 text-xl font-bold text-blue-700">Instructions</CardTitle>
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
                    <h3 className="font-medium text-blue-800">Prepare your face</h3>
                    <p className="text-sm text-gray-600">
                      Ensure your face is centered in the frame with good lighting and a neutral background.
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
                    <h3 className="font-medium text-blue-800">Record a short video</h3>
                    <p className="text-sm text-gray-600">
                      Record a 5-10 second video of your face. Avoid moving too much.
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
                    <h3 className="font-medium text-blue-800">Name your avatar</h3>
                    <p className="text-sm text-gray-600">
                      Give your avatar a unique name to identify it in your collection.
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
                    <h3 className="font-medium text-blue-800">Select gender and submit</h3>
                    <p className="text-sm text-gray-600">
                      Choose the gender and click Upload to create your avatar.
                    </p>
                  </div>
                </div>

                <Separator className="my-4 bg-blue-100" />

                <Alert className="mb-4 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-700">Recording Tips</AlertTitle>
                  <AlertDescription className="text-blue-600 text-sm">
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>Ensure good lighting on your face</li>
                      <li>Use a plain background</li>
                      <li>Keep your face centered in the frame</li>
                      <li>Record for 5-10 seconds</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="p-0 rounded-none shadow-xl">
              <CardHeader className="rounded-sm">
                <CardTitle className="text-xl mt-3 font-bold text-blue-700">Record Your Avatar</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Record a video of your face and fill in the details
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-3">
                <form id="upload-avatar-form" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-blue-700">
                      Avatar Name <span className="text-red-500">*</span>
                    </Label>
                    <input
                      type="text"
                      placeholder="Enter Your Name"
                      value={form.name}
                      onChange={(e)=> setForm((prev) => ({...prev,name:e.target.value}))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-blue-700">
                      Gender<span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup value={form.gender} onValueChange={(value) => setForm(prev => ({ ...prev, gender: value }))} className="flex space-x-4">
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
                      Record Your Face <span className="text-red-500">*</span>
                    </Label>

                    <div className="border-2 border-dashed rounded-sm p-4 w-full h-52">
                      {!recordedBlob ? (
                        <div className="text-center">
                          <Video className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                          <p className="text-blue-700 font-medium mb-4">No video recorded yet</p>
                          <Button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-sm bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Record Video
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {recordedBlob && (
                            <div className="relative w-48 h-48 rounded-sm overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setRecordedBlob(null)}
                                className="absolute top-1 right-1 z-10 p-1 rounded-full bg-white shadow hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <video
                                controls
                                className="w-full h-full object-cover bg-gray-200"
                                src={URL.createObjectURL(recordedBlob)}
                              />
                            </div>
                          )}
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

      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="rounded-sm max-auto w-full p-4">
          <div className="flex justify-between items-center mb-4">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-xl">Record Your Video</DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-md overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-auto max-h-[300px]"
                muted={!recordedBlob}
                autoPlay={!recordedBlob}
                playsInline
                controls={!!recordedBlob}
              />
            </div>

            {!recordedBlob && (
              <div className="flex justify-center space-x-3">
                <Button
                  type="button"
                  onClick={startRecording}
                  disabled={isRecording || !stream}
                  className="rounded-sm bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
                <Button
                  type="button"
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="rounded-sm bg-red-600 hover:bg-red-700 text-white"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
            )}

            {recordedBlob && (
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={resetRecording}
                  className="rounded-sm bg-white-600 hover:bg-gray-100 border text-black"
                >
                  Record Again
                </Button>
                <Button
                  type="button"
                  onClick={confirmRecording}
                  className="rounded-sm bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Confirm
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}