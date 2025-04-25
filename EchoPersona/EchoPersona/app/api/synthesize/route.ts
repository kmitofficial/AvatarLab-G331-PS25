// For App Router (Next.js 13+)
import { NextRequest, NextResponse } from "next/server";
// app/api/synthesize/route.js
export async function POST(req: NextRequest) {
    const data = await req.json();
    
    const response = await fetch(' https://2a15-34-45-89-150.ngrok-free.app/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  }