import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { currentTrack, history } = await req.json();

    if (!currentTrack) {
      return NextResponse.json({ error: "No current track provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "YOUR_GROQ_API_KEY_HERE") {
      return NextResponse.json({ error: "Groq API key is missing or not configured" }, { status: 500 });
    }

    const prompt = `You are a world-class AI DJ with expert musical knowledge. 
The user is currently listening to: "${currentTrack.title}" by ${currentTrack.artist}.
Recently played: ${history?.slice(-5).join(", ") || "None"}.

Your task is to pick the PERFECT next song to play. It should seamlessly transition musically, match the mood or genre, and ideally be an incredible discovery or a deeply related track.
Do NOT suggest a track that was recently played.

You MUST respond strictly in valid JSON format, with EXACTLY this structure, and absolutely nothing else (no markdown backticks):
{
  "query": "Artist - Song Name"
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq Error:", err);
      return NextResponse.json({ error: "Failed to communicate with AI" }, { status: 500 });
    }

    const data = await response.json();
    const aiResponseText = data.choices?.[0]?.message?.content;
    
    if (!aiResponseText) {
      return NextResponse.json({ error: "Invalid AI response structure" }, { status: 500 });
    }

    // The AI might wrap the response in markdown. Clean it before parsing.
    const cleanedText = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedText);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("AI Shuffle Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
