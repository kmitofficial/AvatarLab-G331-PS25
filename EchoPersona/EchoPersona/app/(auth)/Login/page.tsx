// components/SignIn.tsx
"use client";
import "@/app/globals.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Slide, toast } from "react-toastify";

interface LogInForm {
  email: string;
  password: string;
}

export default function SignIn() {
  const router = useRouter();
  const [logInForm, setLogInForm] = useState<LogInForm>({ email: "", password: "" });

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logInForm),
      });
      const { message, userId }: { message: string; userId?: string } = await response.json();
      if (response.ok) {
        if (userId) {
          localStorage.setItem("userId", userId); // Store userId in localStorage
          console.log("Stored userId in localStorage:", userId);
        }
        router.push("/Home");
      } else {
        toast.error(message, {
          transition: Slide,
          theme: "light",
          autoClose: 3000,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLogInForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="rounded-none max-w-md mx-auto border border-gray-200 shadow-lg">
      <CardContent className="p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{`Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}`}</h2>
          <p className="mt-2 text-sm text-gray-600">
            We recommend using a work email to easily collaborate with your team.
          </p>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              name="email"
              value={logInForm.email}
              onChange={handleChange}
              placeholder="Enter Your Email"
              className="block rounded-none w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={20} />
            </div>
          </div>
          <div className="relative">
            <input
              type="password"
              name="password"
              value={logInForm.password}
              onChange={handleChange}
              placeholder="Enter Your Password"
              className="block rounded-none w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={20} />
            </div>
          </div>
          <Button onClick={handleLogIn} className="rounded-none w-full bg-blue-600 hover:bg-blue-700">
            Log In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}