// For App Router (Next.js 13+)
// app/api/synthesize/route.js
export async function POST(request) {
    const data = await request.json();
    
    const response = await fetch('https://d881-35-238-122-147.ngrok-free.app/synthesize', {
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