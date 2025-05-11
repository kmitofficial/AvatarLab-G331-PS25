import { NextResponse } from 'next/server';

type LanguageToolResponse = {
  matches: Array<{
    message: string;
    replacements: Array<{ value: string }>;
    offset: number;
    length: number;
  }>;
};

type ApiResponse = {
  matches?: LanguageToolResponse['matches'];
  error?: string;
};

export async function POST(req: Request) {
  const { text } = await req.json() as { text: string };
  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        text,
        language: 'en-US',
        enabledCategories: 'GRAMMAR,TYPOGRAPHY,STYLE',
        enabledOnly: 'false',
      }),
    });

    if (!response.ok) {
      throw new Error(`LanguageTool API error: ${response.statusText}`);
    }

    const data: LanguageToolResponse = await response.json();
    return NextResponse.json({ matches: data.matches });
  } catch (error) {
    console.error('LanguageTool API error:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}