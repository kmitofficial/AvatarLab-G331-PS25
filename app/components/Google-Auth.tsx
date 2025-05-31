// components/GoogleAuth.tsx
"use client";

import { signIn, getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const GoogleAuth = () => {
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      // Start Google OAuth login
      console.log("Initiating Google sign-in at", new Date().toISOString());
      const signInResult = await signIn("google", { redirect: false, callbackUrl: "/workspace" });
      console.log("Sign-in result:", signInResult);

      if (signInResult?.error) {
        throw new Error("Google sign-in failed: " + signInResult.error);
      }

      // Fetch the session after sign-in
      const session = await getSession();
      console.log("Session after sign-in:", session);

      if (!session?.user?.email) {
        throw new Error("No user session found after sign-in");
      }

      // Call a server-side endpoint to generate the JWT token
      const response = await fetch("/api/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          username: session.user.name ?? "Unknown",
          image: session.user.image ?? "",
        }),
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Failed to generate token: " + errorData.message);
      }

      const { token } = await response.json();
      console.log("Generated JWT token:", token);

      // Set the cookie client-side (not HTTP-only, less secure)
      const cookieString = `token=${token}; Path=/; Max-Age=${60 * 60}; SameSite=Strict${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`;
      document.cookie = cookieString;
      console.log("Cookie set client-side:", cookieString);

      // Redirect to /workspace
      router.push("/workspace");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google: " + error.message);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
      <Button variant="outline" className="rounded-none w-full" type="submit">
        <img src="/google.png" alt="Google" className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
    </form>
  );
};

export default GoogleAuth;