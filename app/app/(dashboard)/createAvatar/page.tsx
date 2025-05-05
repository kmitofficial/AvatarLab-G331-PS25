"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Video, X, Check, AlertCircle, Info, Camera, Square } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getEmail, getUserId } from "@/lib/authenticate";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UploadAvatarPage() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Male");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; video?: string; webcam?: string }>({});
  const router = useRouter();

  // Modal state and recording logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tempVideoFile, setTempVideoFile] = useState<File | null>(null);
  const [tempVideoPreviewUrl, setTempVideoPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const hasWebcamInitialized = useRef(false);

  // Start webcam stream with proper error handling
  const startWebcam = useCallback(async () => {
    if (hasWebcamInitialized.current) return;

    hasWebcamInitialized.current = true;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((error) => {
          toast.error("Failed to play webcam stream. Please try again.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        });
      }
      setErrors((prev) => ({ ...prev, webcam: undefined }));
    } catch (error) {
      let errorMessage = "Could not access your webcam. Please grant permission and ensure a webcam is available.";
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Webcam access denied. Please allow camera and microphone access in your browser settings.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No webcam found. Please connect a webcam and try again.";
        }
      }
      setErrors((prev) => ({ ...prev, webcam: errorMessage }));
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      hasWebcamInitialized.current = false; // Allow retry on error
    }
  }, []);

  // Handle webcam initialization and cleanup
  useEffect(() => {
    if (isModalOpen) {
      startWebcam();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (tempVideoPreviewUrl) {
        URL.revokeObjectURL(tempVideoPreviewUrl);
        setTempVideoPreviewUrl(null);
      }
      hasWebcamInitialized.current = false;
    };
  }, [isModalOpen, tempVideoPreviewUrl, startWebcam]);

  // Cleanup video preview on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl(null);
      }
    };
  }, [videoPreviewUrl]);

  // Start recording with browser compatibility
  const startRecording = () => {
    if (!stream || !videoRef.current) {
      setErrors((prev) => ({ ...prev, video: "Webcam stream not available. Please try again." }));
      toast.error("Webcam stream not available. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    recordedChunksRef.current = [];
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const mimeType = isSafari ? "video/mp4" : "video/webm;codecs=vp8,opus";
    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fileType = isSafari ? "video/mp4" : "video/webm";
        const blob = new Blob(recordedChunksRef.current, { type: fileType });
        const file = new File([blob], `recorded-video.${isSafari ? "mp4" : "webm"}`, { type: fileType });
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
          setErrors((prev) => ({ ...prev, video: "Recorded video is too large. Maximum size is 100MB." }));
          toast.error("Recorded video is too large. Maximum size is 100MB.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
          return;
        }

        setTempVideoFile(file);
        setErrors((prev) => ({ ...prev, video: undefined }));

        const previewUrl = URL.createObjectURL(blob);
        setTempVideoPreviewUrl(previewUrl);
      };

      mediaRecorder.onerror = (event: Event) => {
        setErrors((prev) => ({ ...prev, video: "Failed to record video. Please try again." }));
        toast.error("Failed to record video. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
          toast.info("Recording stopped after 10 seconds.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }
      }, 10000);
    } catch (error) {
      setErrors((prev) => ({ ...prev, video: "Failed to start recording. Please try again." }));
      toast.error("Failed to start recording. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Clear temporary recorded video (inside modal)
  const clearTempRecordedVideo = () => {
    if (tempVideoPreviewUrl) {
      URL.revokeObjectURL(tempVideoPreviewUrl);
    }
    setTempVideoFile(null);
    setTempVideoPreviewUrl(null);
    setIsRecording(false);
    startWebcam(); // Restart webcam for a new recording
  };

  // Confirm recording and close modal
  const confirmRecording = () => {
    if (tempVideoFile && tempVideoPreviewUrl) {
      setVideoFile(tempVideoFile);
      setVideoPreviewUrl(tempVideoPreviewUrl);
    }
    closeModal();
  };

  // Close modal and clean up
  const closeModal = () => {
    setIsModalOpen(false);
    setIsRecording(false);
    setTempVideoFile(null);
    setTempVideoPreviewUrl(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    hasWebcamInitialized.current = false;
  };

  // Clear recorded video (on the main page)
  const clearRecordedVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { name?: string; video?: string; webcam?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Avatar name is required";
      isValid = false;
    }

    if (!videoFile) {
      newErrors.video = "Please record a video";
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
    formData.append("gender", gender);
    if (videoFile) {
      formData.append("video", videoFile);
    }

    try {
      const userIdentifier = await getUserId();
      if (!userIdentifier || !userIdentifier) {
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

      const response = await fetch("/api/dev/uploadAvatars", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      if (result.success) {
        toast.success("Your avatar has been uploaded successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        setTimeout(() => {
          router.push("/avatars");
        }, 1000);
      } else {
        throw new Error(result.error || "Failed to upload avatar");
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Create Your Digital Avatar</h1>
          <p className="text-blue-600 max-w-2xl mx-auto">
            Record a short video of your face to create your personalized avatar.
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

                <Alert className="bg-blue-50 border-blue-200">
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
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-xl font-bold text-blue-700">Record Your Avatar</CardTitle>
                <CardDescription className="text-blue-600">
                  Record a video of your face and fill in the details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form id="upload-avatar-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-blue-700">
                      Avatar Name <span className="text-red-500">*</span>
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
                      placeholder="Enter a name for your avatar"
                      className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                      Record Your Face <span className="text-red-500">*</span>
                    </Label>

                    <div className="border-2 border-dashed rounded-lg p-6 bg-white">
                      {!videoFile ? (
                        <div className="text-center">
                          <Video className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                          <p className="text-blue-700 font-medium mb-4">No video recorded yet</p>
                          <Button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Record Video
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Video className="h-8 w-8 text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-700 truncate max-w-[200px]">{videoFile.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={clearRecordedVideo}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {videoPreviewUrl && (
                            <div className="rounded-md overflow-hidden border border-blue-200">
                              <video src={videoPreviewUrl} controls className="w-full h-auto max-h-[200px] bg-gray-200" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {errors.video && (
                      <div className="flex items-start gap-2 mt-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <p className="text-red-500 text-sm">{errors.video}</p>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter className="bg-blue-50 border-t border-blue-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/avatars")}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="upload-avatar-form"
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
                      Upload Avatar
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-700">Record Your Video</h2>
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
              {errors.webcam ? (
                <div className="text-center text-red-500">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>{errors.webcam}</p>
                  <Button
                    type="button"
                    onClick={startWebcam}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Retry Webcam Access
                  </Button>
                </div>
              ) : !tempVideoFile ? (
                <div className="space-y-4">
                  <div className="relative rounded-md overflow-hidden border border-blue-200">
                    {stream ? (
                      <video
                        ref={videoRef}
                        className="w-full h-auto max-h-[300px] bg-gray-200"
                        muted
                        autoPlay
                      />
                    ) : (
                      <div className="w-full h-[300px] flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500">Loading webcam...</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center space-x-3">
                    <Button
                      type="button"
                      onClick={startRecording}
                      disabled={isRecording || !stream}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Camera className="h-4 w-4 mr-2" />
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
                      <Video className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-700 truncate max-w-[200px]">{tempVideoFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(tempVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearTempRecordedVideo}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {tempVideoPreviewUrl && (
                    <div className="rounded-md overflow-hidden border border-blue-200">
                      <video src={tempVideoPreviewUrl} controls className="w-full h-auto max-h-[300px] bg-gray-200" />
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearTempRecordedVideo}
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