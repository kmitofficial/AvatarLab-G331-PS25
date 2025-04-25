// app/Home/page.tsx
"use client";

import "@/app/globals.css";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "../../components/Sidebar";
import TextInput from "../../components/TextInput";

export default function HomePage() {
  const [inputText, setInputText] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log("Retrieved userId from localStorage:", storedUserId); // Debug log
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error("No userId found in localStorage. Redirecting to SignIn.");
      router.push("/Login");
    }
  }, [router]);

  const handleSubmit = async (text: string) => {
    if (text.trim() && userId) {
      try {
        const response = await fetch("/api/saveSessionLog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            textInput: text,
          }),
        });

        if (response.ok) {
          localStorage.setItem("synthesisText", text);
          router.push("/select-voice");
        } else {
          console.error("Failed to save session log");
        }
      } catch (error) {
        console.error("Error saving text:", error);
      }
    } else {
      console.error("No userId available or empty text");
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <motion.div
          className="flex-1 flex flex-col items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-4xl font-bold mb-6 text-center text-blue-600"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            AI Talking Head Synthesis
          </motion.h1>
          <motion.p
            className="text-lg text-center max-w-2xl mb-10 text-gray-600"
            initial={{ y: -30 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 70 }}
          >
            Enter your text below to create a realistic talking head video with synchronized lip movements
          </motion.p>
          <motion.div
            className="w-full max-w-4xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TextInput
              value={inputText}
              onChange={setInputText}
              onSubmit={handleSubmit}
              placeholder="Type or paste your script here. We'll help you refine it for the perfect talking head video..."
            />
            <p className="text-sm text-gray-500 mt-4 text-center px-4">
              Tip: For best results, write 100-300 words. Our AI will analyze your text and suggest tone improvements.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}