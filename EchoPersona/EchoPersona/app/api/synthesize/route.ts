// For App Router (Next.js 13+)
import { NextRequest, NextResponse } from "next/server";

// app/api/synthesize/route.ts
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const response = await fetch('https://fab2-35-238-243-44.ngrok-free.app/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      // If error, read text and return safely
      const errorText = await response.text();
      console.error("Response body (error):", errorText);
      return new Response(
        JSON.stringify({ error: "Server Error", details: errorText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If ok, safely parse JSON
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error occurred" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
