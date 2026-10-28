import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, count = 10, replaceTrack } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "YOUR_GROQ_API_KEY_HERE") {
      return NextResponse.json({ error: "Groq API key is missing or not configured" }, { status: 500 });
    }

    const safeCount = Math.max(1, Math.min(50, Number(count) || 10));

    const systemPrompt = replaceTrack
      ? `You are an elite music curator. A user has a playlist about "${prompt}" and wants to replace the song "${replaceTrack}".
Suggest ONE different song that fits the same vibe. Do NOT suggest "${replaceTrack}" again.

You MUST respond strictly in valid JSON format:
{
  "name": "ignored",
  "tracks": ["Artist Name - Exact Song Title"]
}`
      : `You are an elite music curator, an AI DJ, and a musical encyclopedia. The user has given you a vibe, genre, mood, or a specific theme.
Your task is to hand-pick EXACTLY ${safeCount} amazing songs that perfectly match this description.

CRITICAL INSTRUCTION: If the user asks for "walkout songs" (like Darts PDC players, UFC fighters, WWE, etc.), movies, or event-specific themes, you MUST use your factual knowledge to return the ACTUAL real-world songs those specific people use (e.g., Nathan Aspinall = "The Killers - Mr. Brightside", Luke Humphries = "DNCE - Cake by the Ocean"). Do NOT make up songs or just return the athlete's name.

User's requested vibe: "${prompt}"

You MUST respond strictly in valid JSON format, with EXACTLY this structure, and absolutely nothing else:
{
  "name": "A creative, catchy name for this playlist",
  "tracks": [
    "Artist Name - Exact Song Title",
    "Another Artist - Another Title"
  ]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.8,
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

    const cleanedText = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedText);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
