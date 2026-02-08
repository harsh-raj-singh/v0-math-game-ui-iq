import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("file");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Forward to Groq Whisper API
    const groqFormData = new FormData();
    groqFormData.append("file", audioFile, "audio.webm");
    groqFormData.append("model", "distil-whisper-large-v3-en");
    groqFormData.append("language", "en");
    groqFormData.append("response_format", "json");
    groqFormData.append("temperature", "0.0");
    groqFormData.append(
      "prompt",
      "The user is saying a number as an answer to a math problem. Numbers, digits, and math words like plus, minus, times, divided by. Also commands like start, stop, end, repeat, clear, settings, stats, help."
    );

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: groqFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Transcription failed", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({ text: result.text || "" });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
