"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getEmail } from "@/lib/authenticate";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pause, Play, Plus, Search, RotateCw, Info, Camera, Square, ChevronDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import React from "react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion'
import { pageVariants, workspaceVideoVariants } from "@/lib/animations";

type Avatar = { id: string; name: string; gender: string; video: string; }
type userAvatar = { id: string; name: string; gender: string; email: string, video: string; }

export default function AvatarsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({ name: "", gender: "Male" });
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [preDefinedAvatar, setpreDefinedAvatars] = useState<Avatar[]>([]);
  const [userDefinedAvatar, setuserDefinedAvatars] = useState<userAvatar[]>([]);

  const [useremail, setuserEmail] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [playingVideo, setPlayingVideo] = useState<Record<string, boolean>>({})
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const fetchAvatars = async () => {
    try {
      const result = await getEmail();
      const userEmail = result?.email;
      if (!userEmail) {
        toast.error("Failed to fetch user email");
        return;
      }
      setuserEmail(userEmail);
      const res = await fetch("/api/dev/avatars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch avatars: ${res.statusText}`);
      }

      const { predefined, userdefined } = await res.json();
      setpreDefinedAvatars(predefined || []);
      setuserDefinedAvatars(userdefined || []);
    } catch (error) {
      console.error("Error fetching avatars:", error);
    }
  };

  React.useEffect(() => {
    fetchAvatars();
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access your camera. Please check permissions.");
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
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.controls = true;
      }
    };

    recorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && form.name.trim() !== "") {
      setCurrentStep(2);
    } else if (currentStep === 2 && recordedBlob) {
      handleSubmit();
    } else {
      toast.error("Fill all details");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!recordedBlob) {
      toast.error("Please record again");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("gender", form.gender);
      formData.append("video", recordedBlob, "avatar-recording.mp4");
      formData.append("email", useremail);

      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch("/api/user/uploadUserAvatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save avatar");
      }
      const resultEmail = await getEmail();
      const res = await fetch('/api/dev/avatars', {
        method: 'POST',
        body: JSON.stringify({ email: resultEmail?.email }),
      });
      const { predefined, userdefined, user } = await res.json();
      setpreDefinedAvatars(predefined || []);
      setuserDefinedAvatars(userdefined || []);

      toast.success(`Created successfully!`);
      setRecordedBlob(null);
      setCurrentStep(1);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/user/delete', { method: 'POST', body: JSON.stringify({ email: useremail, id: id, role: "useravatar" }) });
      const { message } = await response.json();
      if (response.ok) {
        toast.success(message);
        fetchAvatars();
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!isDialogOpen) {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (isDialogOpen && currentStep === 2 && !recordedBlob) {
      startCamera();
    }
  }, [isDialogOpen, currentStep, recordedBlob]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="container mx-auto p-2">
      <div className="p-0 sm:p-4">
        <div className="flex flex-col space-y-8">
          {/* My Avatars Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Avatars</h2>
                <span className="border border-gray-200 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 mt-1 rounded-sm text-xs">
                  {userDefinedAvatar.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {/* Create New Avatar Card */}
              <motion.div {...workspaceVideoVariants}>
                <Card
                  className="h-full p-0 rounded-sm overflow-hidden transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg border border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:border-indigo-600 cursor-pointer"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full py-12">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                      <Plus className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      Create Avatar
                    </p>
                  </CardContent>
                </Card></motion.div>

              {/* User Avatars */}
              {userDefinedAvatar.map((avatar) => (
                <motion.div {...workspaceVideoVariants}>
                  <Card
                    key={avatar.id}
                    className="p-0 rounded-sm overflow-hidden transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg cursor-pointer"
                    onClick={() => toggleVideo(avatar.id)}
                  >
                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                      <video
                        className="h-full w-full object-cover"
                        ref={(el) => {
                          if (el) videoRefs.current[avatar.id] = el;
                        }}
                        src={avatar.video}
                        preload="metadata"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-3 left-3 h-10 w-10 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 shadow-md"
                      >
                        {playingVideo[avatar.id] === true ? (
                          <Pause className="h-5 w-5 text-blue-600 dark:text-white" />
                        ) : (
                          <Play className="h-5 w-5 text-blue-600 dark:text-white" />
                        )}
                      </Button>
                    </div>

                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-1">
                          {avatar.name}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-28">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(avatar.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{avatar.gender}</p>
                    </CardContent>
                  </Card></motion.div>
              ))}
            </div>

          </div>

          {/* Public Avatars Section */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Public Avatars</h2>
                <span className="border border-gray-200 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 mt-1 rounded-sm text-xs">
                  {preDefinedAvatar.length}
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-100 text-sm pl-8 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:text-white py-2"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    Search by tag
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Business</DropdownMenuItem>
                  <DropdownMenuItem>Casual</DropdownMenuItem>
                  <DropdownMenuItem>Professional</DropdownMenuItem>
                  <DropdownMenuItem>Creative</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Avatars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {preDefinedAvatar.filter(
                (avatar) =>
                  avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  avatar.gender.toLowerCase().includes(searchQuery.toLowerCase()),
              ).map((avatar) => (
                <motion.div key={avatar.id} {...workspaceVideoVariants}>
                  <Card
                    key={avatar.id}
                    className="p-0 rounded-sm overflow-hidden transform transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg cursor-pointer"
                    onClick={() => toggleVideo(avatar.id)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <video className="w-full h-full object-cover" ref={(el) => { if (el) videoRefs.current[avatar.id] = el; }} src={avatar.video} preload="metadata" />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-3 left-3 h-10 w-10 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 shadow-md"
                      >
                        {playingVideo[avatar.id] === true ? (
                          <Pause className="h-5 w-5 text-blue-600 dark:text-white" />
                        ) : (
                          <Play className="h-5 w-5 text-blue-600 dark:text-white" />
                        )}
                      </Button>
                    </div>
                    <CardContent className="p-4 pt-0">
                      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-1">
                        {avatar.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{avatar.gender}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Avatar Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[80vh] overflow-y-auto rounded-sm">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-indigo-700 sm:text-3xl">
                {currentStep === 1 ? "Create Your Avatar" : "Record Your Video"}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {currentStep === 1
                  ? "Enter your avatar details to get started"
                  : "Record a short video of your face and select a sentence to create your avatar"}
              </DialogDescription>
            </DialogHeader>

            {currentStep === 1 ? (
              <div className="grid gap-6 py-4 sm:py-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-indigo-700 text-sm sm:text-base">
                    Avatar Name <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a name for your avatar"
                    className="w-full border border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base rounded-sm px-2 py-2 outline-none focus:ring-1"
                  />
                  <p className="text-sm text-gray-500">
                    This name will be used to identify your avatar in your collection
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
                      <Label htmlFor="male" className="text-sm sm:text-base">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" className="text-indigo-600" />
                      <Label htmlFor="female" className="text-sm sm:text-base">Female</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Alert className="bg-indigo-50 border-indigo-200">
                  <Info className="h-4 w-4 text-indigo-600" />
                  <AlertTitle className="text-indigo-700 text-sm sm:text-base">Next: Record Your Video</AlertTitle>
                  <AlertDescription className="text-indigo-600 text-sm">
                    In the next step, you'll record a short video of your face and select a sentence to create your avatar.
                    Make sure you're in a well-lit environment with a neutral background.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="grid gap-6 py-4 sm:py-6">
                {/* Video Recording */}
                <div className="relative rounded-sm overflow-hidden border border-indigo-200 bg-black aspect-[8/6] max-h-[2000vh] sm:max-h-[40vh]">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted={!recordedBlob}
                    autoPlay
                    playsInline
                    controls={!!recordedBlob}
                  />
                  {isRecording && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full flex items-center gap-2 text-xs sm:text-sm">
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      Recording {formatTime(recordingTime)}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Recording Controls */}
                  {!recordedBlob ? (
                    <div className="flex justify-center gap-4">
                      <Button
                        type="button"
                        onClick={startRecording}
                        disabled={isRecording || !stream}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isRecording ? "Recording..." : "Start Recording"}
                      </Button>
                      <Button
                        type="button"
                        onClick={stopRecording}
                        disabled={!isRecording}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop Recording
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-4">
                      <Button
                        type="button"
                        onClick={resetRecording}
                        variant="outline"
                        className="border-indigo-200 text-sm sm:text-base px-3 sm:px-4 py-2"
                      >
                        Record Again
                      </Button>
                    </div>
                  )}

                  {/* Recording Tips */}
                  <Alert className="bg-indigo-50 border-indigo-200">
                    <Info className="h-4 w-4 text-indigo-600" />
                    <AlertTitle className="text-indigo-700 text-sm sm:text-base">Recording Tips</AlertTitle>
                    <AlertDescription className="text-indigo-600 text-sm">
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Ensure good lighting on your face</li>
                        <li>Use a plain background</li>
                        <li>Keep your face centered in the frame</li>
                        <li>Record for 5-10 seconds</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 bottom-0 bg-white dark:bg-gray-900">
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
                  (currentStep === 1 && !form.name.trim()) ||
                  (currentStep === 2 && (!recordedBlob))
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                {isSubmitting ? (
                  <><RotateCw className="mr-2 h-4 w-4 animate-spin" />Creating</>
                ) : currentStep === 1 ? ("Continue") : ("Create Avatar")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}