import { NextResponse } from "next/server";

interface VideoResult {
  videoId: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
}

function extractVideos(html: string, count: number): VideoResult[] {
  // ── Primary: parse ytInitialData JSON ──────────────────────────────────────
  const startMarker = "var ytInitialData = ";
  const startIdx = html.indexOf(startMarker);

  if (startIdx !== -1) {
    const jsonStart = startIdx + startMarker.length;
    let depth = 0;
    let jsonEnd = jsonStart;

    for (let i = jsonStart; i < Math.min(html.length, jsonStart + 6_000_000); i++) {
      const c = html[i];
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) { jsonEnd = i + 1; break; }
      }
    }

    try {
      const data = JSON.parse(html.slice(jsonStart, jsonEnd));

      // Collect all itemSection contents (YouTube sometimes has multiple sections)
      const sectionContents: any[] =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents ?? [];

      const allItems: any[] = [];
      for (const section of sectionContents) {
        const items = section?.itemSectionRenderer?.contents ?? [];
        allItems.push(...items);
      }

      const videos: VideoResult[] = allItems
        .filter((item: any) => item.videoRenderer)
        .slice(0, count)
        .map((item: any) => {
          const vr = item.videoRenderer;
          const videoId: string = vr.videoId;
          return {
            videoId,
            title: vr.title?.runs?.[0]?.text ?? "Unknown",
            artist: vr.longBylineText?.runs?.[0]?.text ?? "Unknown",
            duration: vr.lengthText?.simpleText ?? "--:--",
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          };
        });

      if (videos.length > 0) return videos;
    } catch (e) {
      console.error("ytInitialData parse error:", e);
    }
  }

  // ── Fallback: collect unique videoIds from raw HTML ────────────────────────
  const seenIds = new Set<string>();
  const fallback: VideoResult[] = [];
  const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  let m: RegExpExecArray | null;

  while ((m = idRegex.exec(html)) !== null && fallback.length < count) {
    const id = m[1];
    if (!seenIds.has(id)) {
      seenIds.add(id);
      fallback.push({
        videoId: id,
        title: "YouTube Result",
        artist: "Unknown",
        duration: "--:--",
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      });
    }
  }

  return fallback;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const count = Math.min(20, Math.max(1, parseInt(searchParams.get("count") ?? "1")));

    if (!q) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    const html = await res.text();
    const videos = extractVideos(html, count);

    if (videos.length === 0) {
      return NextResponse.json({ error: "No videos found" }, { status: 404 });
    }

    return NextResponse.json(videos);
  } catch (error: any) {
    console.error("YT Scrape Error:", error);
    return NextResponse.json({ error: "Failed to scrape YouTube" }, { status: 500 });
  }
}
