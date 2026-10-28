"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Heart, Search, Library, Sparkles,
  ListMusic, Settings, Wand2, Music, PlusCircle,
  Loader2, X, Trash2, Check, MoreHorizontal, Radio,
  ChevronDown, Home, Disc3, TrendingUp, Clock, Zap, RefreshCw
} from "lucide-react";
import { clsx } from "clsx";

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "0:00";
  const h = +(m[1] || 0), min = +(m[2] || 0), s = +(m[3] || 0);
  if (h) return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${min}:${String(s).padStart(2, "0")}`;
}

function parseDurationSeconds(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+(m[1] || 0) * 3600) + (+(m[2] || 0) * 60) + +(m[3] || 0);
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

async function searchYouTube(query: string, count = 1, officialAudio = true): Promise<Track[]> {
  try {
    const q = officialAudio ? query + " official audio" : query;
    const res = await fetch(`/api/yt?q=${encodeURIComponent(q)}&count=${count}`);
    const data = await res.json();

    const toTrack = (d: any): Track => ({
      videoId: d.videoId,
      title: d.title || query,
      artist: d.artist || "YouTube",
      thumbnail: d.thumbnail || "",
      duration: d.duration || "--:--",
      durationSeconds: 0,
    });

    if (Array.isArray(data)) return data.map(toTrack);
    if (data.videoId) return [toTrack(data)];
    return [];
  } catch (e) {
    console.error("YT Scrape error:", e);
    return [];
  }
}

// ─── Waveform Component ───────────────────────────────────────────────────────

function Waveform({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center gap-[2px] h-4 w-8">
      {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
        <div
          key={i}
          className="w-[2px] bg-accent rounded-full"
          style={{
            height: `${h * 2}px`,
            animation: isPlaying ? `waveBar ${0.6 + i * 0.1}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WebplayerPage() {
  const ytPlayerRef = useRef<any>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Player state
  const [ytReady, setYtReady] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"none" | "one" | "all">("none");

  // UI state — "home" is now the default, like Spotify
  const [view, setView] = useState<"home" | "search" | "library" | "ai" | "queue" | "liked" | "playlist">("home");
  const [showAi, setShowAi] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [trackMenu, setTrackMenu] = useState<Track | null>(null);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCount, setAiCount] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<Track[]>([]);
  const [aiPendingTracks, setAiPendingTracks] = useState<string[]>([]);
  const [aiLoadingProgress, setAiLoadingProgress] = useState(0);
  const [aiPlaylistName, setAiPlaylistName] = useState("");
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [isAiLoadingNext, setIsAiLoadingNext] = useState(false);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  const handleNextRef = useRef<() => void>(() => {});

  // Persistent
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const currentTrack = queue[queueIndex] ?? null;

  // ── localStorage ────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const pl = localStorage.getItem("sonar_playlists");
      const lk = localStorage.getItem("sonar_liked");
      if (pl) setPlaylists(JSON.parse(pl));
      if (lk) setLiked(new Set(JSON.parse(lk)));
    } catch { }
  }, []);

  const savePlaylists = useCallback((pl: Playlist[]) => {
    setPlaylists(pl);
    localStorage.setItem("sonar_playlists", JSON.stringify(pl));
  }, []);

  const toggleLike = useCallback((track: Track) => {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(track.videoId) ? next.delete(track.videoId) : next.add(track.videoId);
      localStorage.setItem("sonar_liked", JSON.stringify([...next]));
      return next;
    });
  }, []);

  // ── YouTube IFrame API ───────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p?.getCurrentTime) return;
      const cur = p.getCurrentTime() ?? 0;
      const dur = p.getDuration() ?? 1;
      setCurrentTime(cur);
      setProgress(dur > 0 ? cur / dur : 0);
    }, 500);
  }, []);

  const stopTimer = useCallback(() => {
    if (progressTimer.current) { clearInterval(progressTimer.current); progressTimer.current = null; }
  }, []);

  const handleNext = useCallback(async () => {
    if (isAiLoadingNext) return;
    if (queue.length === 0) return;

    if (shuffle && currentTrack) {
        setIsAiLoadingNext(true);
        try {
            const history = queue.slice(Math.max(0, queueIndex - 5), queueIndex).map(t => `${t.artist} - ${t.title}`);
            const res = await fetch('/api/ai/shuffle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentTrack, history })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.query) {
                    const ytResults = await searchYouTube(data.query);
                    if (ytResults && ytResults.length > 0) {
                        const newTrack = ytResults[0];
                        setQueue(q => {
                           const newQ = [...q];
                           newQ.splice(queueIndex + 1, 0, newTrack);
                           return newQ;
                        });
                        setQueueIndex(i => i + 1);
                        if (ytPlayerRef.current?.loadVideoById) {
                            ytPlayerRef.current.loadVideoById(newTrack.videoId);
                            setTimeout(() => ytPlayerRef.current?.playVideo(), 300);
                        }
                        setIsAiLoadingNext(false);
                        return;
                    }
                }
            } else {
                console.warn("AI Shuffle failed. Falling back to simple shuffle.");
            }
        } catch (e) {
            console.error("AI Shuffle Error:", e);
        }
        setIsAiLoadingNext(false);
    }
    
    setQueue(q => {
      setQueueIndex(i => {
        let next = i + 1;
        if (shuffle) next = Math.floor(Math.random() * q.length);
        if (next >= q.length) { if (repeat === "all") next = 0; else return i; }
        
        const nextTrack = q[next];
        setTimeout(() => {
          if (!ytPlayerRef.current) return;
          if (nextTrack?.videoId.startsWith("search:")) {
            ytPlayerRef.current.loadPlaylist({ list: nextTrack.videoId.substring(7), listType: "search", index: 0 });
          } else if (nextTrack?.videoId) {
            ytPlayerRef.current.loadVideoById(nextTrack.videoId);
          }
        }, 50);
        return next;
      });
      return q;
    });
  }, [shuffle, repeat, currentTrack, queue, queueIndex, isAiLoadingNext]);

  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).onYouTubeIframeAPIReady = () => {
      const player = new (window as any).YT.Player("yt-iframe", {
        height: "1", width: "1",
        videoId: "",
        playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => { ytPlayerRef.current = player; setYtReady(true); player.setVolume(80); },
          onStateChange: (e: any) => {
            if (e.data === 1) { setIsPlaying(true); startTimer(); }
            else if (e.data === 2) { setIsPlaying(false); stopTimer(); }
            else if (e.data === 0) { setIsPlaying(false); stopTimer(); handleNextRef.current(); }
            else if (e.data === 5) { e.target.playVideo(); } // Auto-play CUED playlists
          },
          onError: () => handleNextRef.current(),
        },
      });
    };

    if (!(window as any).YT?.Player) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(s);
    } else {
      (window as any).onYouTubeIframeAPIReady();
    }

    return () => stopTimer();
  }, [startTimer, stopTimer]);

  // ── Playback Controls ────────────────────────────────────────────────────────

  const playTrack = useCallback((track: Track, trackQueue?: Track[], index?: number) => {
    const newQueue = trackQueue ?? [track];
    const newIndex = index ?? 0;
    setQueue(newQueue);
    setQueueIndex(newIndex);
    if (!ytPlayerRef.current) return;
    
    if (track.videoId.startsWith("search:")) {
      ytPlayerRef.current.loadPlaylist({ list: track.videoId.substring(7), listType: "search", index: 0 });
      setTimeout(() => ytPlayerRef.current?.playVideo(), 300);
    } else if (ytPlayerRef.current.loadVideoById) {
      ytPlayerRef.current.loadVideoById(track.videoId);
      setTimeout(() => ytPlayerRef.current?.playVideo(), 300);
    }
  }, []);

  const handlePlayPause = () => {
    if (!ytPlayerRef.current) return;
    if (isPlaying) ytPlayerRef.current.pauseVideo();
    else ytPlayerRef.current.playVideo();
  };

  const handlePrev = () => {
    if (currentTime > 3) { ytPlayerRef.current?.seekTo(0, true); return; }
    const prev = Math.max(0, queueIndex - 1);
    if (queue[prev]) playTrack(queue[prev], queue, prev);
  };

  const seekToPosition = useCallback((clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const dur = ytPlayerRef.current?.getDuration() ?? 0;
    ytPlayerRef.current?.seekTo(dur * p, true);
    setProgress(p);
    setCurrentTime(dur * p);
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    seekToPosition(e.clientX, e.currentTarget);
  };

  const handleTouchSeek = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.touches[0] || e.changedTouches[0];
    if (touch) seekToPosition(touch.clientX, e.currentTarget);
  };

  const handleVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const v = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    setVolume(v);
    setMuted(false);
    ytPlayerRef.current?.setVolume(v);
    ytPlayerRef.current?.unMute();
  };

  const toggleMute = () => {
    if (muted) { ytPlayerRef.current?.unMute(); ytPlayerRef.current?.setVolume(volume); }
    else ytPlayerRef.current?.mute();
    setMuted(!muted);
  };

  // ── Search ───────────────────────────────────────────────────────────────────

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setView("search");
    const results = await searchYouTube(searchQuery, 15, false);
    setSearchResults(results);
    setSearching(false);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    setAiPendingTracks([]);
    setAiLoadingProgress(0);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, count: aiCount })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tracks && Array.isArray(data.tracks)) {
          setAiPlaylistName(data.name || "AI Mix: " + aiPrompt);
          setAiPendingTracks(data.tracks);

          // Fetch YouTube results in parallel but update UI progressively
          const resolved: (Track | null)[] = new Array(data.tracks.length).fill(null);
          await Promise.all(
            data.tracks.map(async (trackQuery: string, i: number) => {
              try {
                const ytResults = await searchYouTube(trackQuery);
                if (ytResults?.[0]) resolved[i] = ytResults[0];
              } catch { }
              setAiLoadingProgress(p => p + 1);
              setAiResults([...resolved].filter((t): t is Track => t !== null));
            })
          );
        }
      } else {
        console.warn("AI Generation failed. Check API Key.", await res.text());
      }
    } catch (e) {
      console.error("AI Gen error", e);
    }
    setAiPendingTracks([]);
    setAiLoading(false);
  };

  const handleRegenerateTrack = async (index: number, track: Track) => {
    if (regeneratingIndex !== null) return;
    setRegeneratingIndex(index);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          count: 1,
          replaceTrack: `${track.artist} - ${track.title}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tracks?.[0]) {
          const ytResults = await searchYouTube(data.tracks[0]);
          if (ytResults?.[0]) {
            setAiResults(prev => {
              const next = [...prev];
              next[index] = ytResults[0];
              return next;
            });
          }
        }
      }
    } catch (e) {
      console.error("Regenerate error", e);
    }
    setRegeneratingIndex(null);
  };

  // ── Playlists ────────────────────────────────────────────────────────────────

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const pl: Playlist = { id: Date.now().toString(), name: newPlaylistName.trim(), tracks: [] };
    savePlaylists([...playlists, pl]);
    setNewPlaylistName("");
    setShowNewPlaylist(false);
  };

  const deletePlaylist = (id: string) => {
    savePlaylists(playlists.filter(p => p.id !== id));
    if (activePlaylistId === id) { setActivePlaylistId(null); setView("home"); }
  };

  const addToPlaylist = (playlistId: string, track: Track) => {
    const updated = playlists.map(p =>
      p.id === playlistId && !p.tracks.find(t => t.videoId === track.videoId)
        ? { ...p, tracks: [...p.tracks, track] }
        : p
    );
    savePlaylists(updated);
    setTrackMenu(null);
  };

  const removeFromPlaylist = (playlistId: string, videoId: string) => {
    const updated = playlists.map(p =>
      p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.videoId !== videoId) } : p
    );
    savePlaylists(updated);
  };

  // ── Computed ─────────────────────────────────────────────────────────────────

  const likedTracks = Array.from(liked).map(id => {
    return searchResults.find(t => t.videoId === id) ||
      playlists.flatMap(p => p.tracks).find(t => t.videoId === id) ||
      (currentTrack?.videoId === id ? currentTrack : null);
  }).filter(Boolean) as Track[];

  const viewTracks = view === "search" ? searchResults
    : view === "liked" ? likedTracks
      : view === "queue" ? queue
        : view === "playlist" ? (playlists.find(p => p.id === activePlaylistId)?.tracks ?? [])
          : [];

  const viewTitle = view === "search" ? `Results${searchResults.length ? ` (${searchResults.length})` : ""}`
    : view === "liked" ? `Liked (${liked.size})`
      : view === "queue" ? `Queue (${queue.length})`
        : view === "playlist" ? (playlists.find(p => p.id === activePlaylistId)?.name ?? "Playlist")
          : "";

  // Greeting based on time of day
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  // Quick search shortcuts for Home
  const quickSearches = [
    { label: "Chill Vibes", query: "chill lofi beats", icon: "🌊", gradient: "from-blue-600/80 to-cyan-500/80" },
    { label: "Workout Mix", query: "workout gym motivation music", icon: "🔥", gradient: "from-orange-600/80 to-red-500/80" },
    { label: "Focus Mode", query: "focus concentration music instrumental", icon: "🧠", gradient: "from-purple-600/80 to-indigo-500/80" },
    { label: "Late Night", query: "late night vibes r&b", icon: "🌙", gradient: "from-indigo-600/80 to-purple-500/80" },
    { label: "Road Trip", query: "road trip summer playlist", icon: "🚗", gradient: "from-green-600/80 to-emerald-500/80" },
    { label: "Party Time", query: "party hits 2024 2025", icon: "🎉", gradient: "from-pink-600/80 to-rose-500/80" },
  ];

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes waveBar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
        #yt-iframe { position: absolute; bottom: 0; right: 0; width: 1px; height: 1px; opacity: 0.01; pointer-events: none; }
        .fade-in-up { animation: fadeInUp 0.4s ease-out both; }
        .fade-in-up-1 { animation-delay: 0.05s; }
        .fade-in-up-2 { animation-delay: 0.1s; }
        .fade-in-up-3 { animation-delay: 0.15s; }
        .fade-in-up-4 { animation-delay: 0.2s; }
      `}</style>

      {/* Hidden YouTube Player */}
      <div id="yt-iframe" />

      {/* Track context menu overlay */}
      {trackMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={() => setTrackMenu(null)}>
          <div className="bg-surface border border-border-strong shadow-2xl p-2 w-64 max-w-[90vw] rounded-lg" onClick={e => e.stopPropagation()}>
            <div className="px-3 py-2.5 border-b border-border-strong mb-1">
              <div className="font-mono text-[11px] font-bold text-foreground truncate">{trackMenu.title}</div>
              <div className="font-mono text-[10px] text-secondary truncate">{trackMenu.artist}</div>
            </div>
            <button
              onClick={() => { toggleLike(trackMenu); setTrackMenu(null); }}
              className={clsx("w-full text-left px-3 py-2.5 font-mono text-xs flex items-center gap-3 hover:bg-background transition-colors rounded",
                liked.has(trackMenu.videoId) ? "text-accent" : "text-secondary hover:text-foreground"
              )}
            >
              <Heart className="w-4 h-4" />
              {liked.has(trackMenu.videoId) ? "Remove from Liked" : "Add to Liked"}
            </button>
            <button
              onClick={() => { const q = [...queue, trackMenu]; setQueue(q); setTrackMenu(null); }}
              className="w-full text-left px-3 py-2.5 font-mono text-xs text-secondary hover:text-foreground hover:bg-background transition-colors flex items-center gap-3 rounded"
            >
              <PlusCircle className="w-4 h-4" /> Add to Queue
            </button>
            {playlists.length > 0 && (
              <div className="border-t border-border-strong mt-1 pt-1">
                <div className="px-3 py-1.5 font-mono text-[9px] text-secondary/60 uppercase tracking-widest">Add to Playlist</div>
                {playlists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => addToPlaylist(pl.id, trackMenu)}
                    className="w-full text-left px-3 py-2 font-mono text-xs text-secondary hover:text-foreground hover:bg-background transition-colors flex items-center justify-between rounded"
                  >
                    <span className="truncate">{pl.name}</span>
                    {pl.tracks.find(t => t.videoId === trackMenu.videoId) && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Playlist Modal */}
      {showNewPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowNewPlaylist(false)}>
          <div className="bg-surface border border-border-strong p-6 w-80 shadow-2xl rounded-lg" onClick={e => e.stopPropagation()}>
            <div className="font-display font-black text-sm uppercase tracking-tight text-foreground mb-4">New Playlist</div>
            <input
              autoFocus
              type="text"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createPlaylist()}
              placeholder="Playlist name..."
              className="w-full bg-background border border-border-strong px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-secondary/40 focus:outline-none focus:border-accent transition-colors mb-4 rounded"
            />
            <div className="flex gap-2">
              <button onClick={createPlaylist} className="flex-1 bg-accent text-background py-2.5 font-mono text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity rounded">
                Create
              </button>
              <button onClick={() => setShowNewPlaylist(false)} className="px-4 border border-border-strong font-mono text-xs text-secondary hover:text-foreground transition-colors rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE EXPANDED PLAYER ───────────────────────────────────────── */}
      {showMobilePlayer && (
        <div
          className="fixed inset-0 z-[70] bg-background flex flex-col lg:hidden"
          style={{ animation: "slideUp 0.32s cubic-bezier(0.32,0,0.67,0) both" }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-12 pb-2 shrink-0">
            <button onClick={() => setShowMobilePlayer(false)} className="p-2 -ml-2 text-secondary active:text-foreground">
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="font-mono text-[9px] text-secondary/50 uppercase tracking-widest">Now Playing</div>
            </div>
            <button
              onClick={() => { setShowMobilePlayer(false); setView("queue"); }}
              className="p-2 -mr-2 text-secondary active:text-accent"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>

          {/* Album art */}
          <div className="flex-1 flex items-center justify-center px-8 py-2 min-h-0">
            <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl border border-border-strong">
              {currentTrack?.thumbnail
                ? <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-accent/20 to-purple-600/20 flex items-center justify-center">
                    <Music className="w-24 h-24 text-secondary/20" />
                  </div>
              }
            </div>
          </div>

          {/* Track info + like */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3 shrink-0">
            <div className="min-w-0 flex-1 mr-4">
              <div className="font-display font-bold text-2xl text-foreground truncate leading-tight">
                {currentTrack?.title ?? "No track selected"}
              </div>
              <div className="font-mono text-sm text-secondary truncate mt-1">
                {currentTrack?.artist ?? ""}
              </div>
            </div>
            {currentTrack && (
              <button onClick={() => toggleLike(currentTrack)} className="p-2 shrink-0 active:scale-90 transition-transform">
                <Heart className={clsx("w-6 h-6 transition-colors", liked.has(currentTrack.videoId) ? "text-accent fill-accent" : "text-secondary")} />
              </button>
            )}
          </div>

          {/* Progress bar + time */}
          <div className="px-6 pb-2 shrink-0">
            <div
              className="w-full h-5 flex items-center cursor-pointer touch-none"
              onClick={handleSeek}
              onTouchStart={handleTouchSeek}
              onTouchMove={handleTouchSeek}
              onTouchEnd={handleTouchSeek}
            >
              <div className="w-full h-1.5 bg-border-strong rounded-full relative">
                <div
                  className="absolute inset-y-0 left-0 bg-foreground rounded-full transition-none"
                  style={{ width: `${progress * 100}%` }}
                />
                <div
                  className="absolute top-1/2 w-4 h-4 bg-foreground rounded-full shadow-md border border-border-strong"
                  style={{ left: `${progress * 100}%`, transform: "translate(-50%, -50%)" }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[11px] text-secondary">{formatSeconds(currentTime)}</span>
              <span className="font-mono text-[11px] text-secondary">{currentTrack?.duration ?? "0:00"}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-8 py-4 pb-10 shrink-0">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={clsx("p-2 transition-colors active:scale-90", shuffle ? "text-accent" : "text-secondary")}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={handlePrev} className="p-2 text-foreground active:scale-90 transition-transform">
              <SkipBack className="w-9 h-9 fill-current" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 bg-foreground text-background rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              {isPlaying
                ? <Pause className="w-7 h-7 fill-current" />
                : <Play className="w-7 h-7 fill-current ml-1" />
              }
            </button>
            <button onClick={handleNext} className="p-2 text-foreground active:scale-90 transition-transform">
              <SkipForward className="w-9 h-9 fill-current" />
            </button>
            <button
              onClick={() => setRepeat(r => r === "none" ? "all" : r === "all" ? "one" : "none")}
              className={clsx("p-2 relative transition-colors active:scale-90", repeat !== "none" ? "text-accent" : "text-secondary")}
            >
              <Repeat className="w-5 h-5" />
              {repeat === "one" && <span className="absolute top-1 right-1 text-[7px] text-accent font-bold leading-none">1</span>}
            </button>
          </div>
        </div>
      )}

      <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">

        {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
        <div className="h-12 border-b border-border-strong flex items-center justify-between px-3 sm:px-4 bg-surface shrink-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M0 0H12V12H24V24H12V12H0V0Z" fill="currentColor" className="text-foreground" />
              <path d="M12 0H24V12L12 0Z" fill="#6236F4" />
              <path d="M0 12H12V24L0 12Z" fill="#6236F4" />
            </svg>
            <span className="font-display font-black text-sm tracking-tight text-foreground uppercase">SONAR</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className={clsx("flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest", ytReady ? "text-green-500" : "text-yellow-400")}>
              <span className={clsx("w-1.5 h-1.5 rounded-full", ytReady ? "bg-green-500 animate-pulse" : "bg-yellow-400")} />
              {ytReady ? "Ready" : "Loading..."}
            </div>
          </div>
        </div>

        {/* ── MAIN LAYOUT ──────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── DESKTOP SIDEBAR (hidden on mobile) ─────────────────────────── */}
          <div className="hidden lg:flex flex-col w-56 xl:w-64 border-r border-border-strong bg-surface shrink-0">
            {/* Primary nav */}
            <div className="flex flex-col py-2 border-b border-border-strong">
              {[
                { icon: Home, label: "Home", id: "home" as const },
                { icon: Search, label: "Search", id: "search" as const },
                { icon: Wand2, label: "AI Generate", id: "ai" as const },
              ].map(({ icon: Icon, label, id }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={clsx("flex items-center gap-3 px-4 py-2.5 text-left transition-colors group",
                    view === id
                      ? "bg-background text-accent" : "text-secondary hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
                </button>
              ))}
            </div>

            {/* Library section */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-strong">
              <button
                onClick={() => setView("library")}
                className={clsx("flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest transition-colors",
                  view === "library" || view === "liked" || view === "queue" || view === "playlist" ? "text-accent" : "text-secondary hover:text-foreground"
                )}
              >
                <Library className="w-5 h-5" />
                Your Library
              </button>
              <button onClick={() => setShowNewPlaylist(true)} className="text-secondary hover:text-accent transition-colors p-1">
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Library items */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <button
                onClick={() => setView("liked")}
                className={clsx("flex items-center gap-3 px-4 py-2.5 w-full text-left transition-colors",
                  view === "liked" ? "text-accent bg-background" : "text-secondary hover:text-foreground hover:bg-background/50"
                )}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-400 rounded-sm flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold truncate">Liked Songs</div>
                  <div className="font-mono text-[9px] text-secondary">{liked.size} songs</div>
                </div>
              </button>

              <button
                onClick={() => setView("queue")}
                className={clsx("flex items-center gap-3 px-4 py-2.5 w-full text-left transition-colors",
                  view === "queue" ? "text-accent bg-background" : "text-secondary hover:text-foreground hover:bg-background/50"
                )}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-400 rounded-sm flex items-center justify-center shrink-0">
                  <ListMusic className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold truncate">Queue</div>
                  <div className="font-mono text-[9px] text-secondary">{queue.length} tracks</div>
                </div>
              </button>

              {playlists.map(pl => (
                <div key={pl.id} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-background/50 transition-colors">
                  <button
                    onClick={() => { setActivePlaylistId(pl.id); setView("playlist"); }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="w-8 h-8 bg-surface border border-border-strong rounded-sm flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <div className={clsx("font-mono text-[11px] font-bold truncate",
                        activePlaylistId === pl.id && view === "playlist" ? "text-accent" : "text-foreground"
                      )}>{pl.name}</div>
                      <div className="font-mono text-[9px] text-secondary">{pl.tracks.length} songs</div>
                    </div>
                  </button>
                  <button onClick={() => deletePlaylist(pl.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary/40 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {playlists.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <div className="font-mono text-[10px] text-secondary/40 mb-2">No playlists yet</div>
                  <button onClick={() => setShowNewPlaylist(true)} className="font-mono text-[10px] text-accent hover:underline">
                    Create your first playlist
                  </button>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="p-3 border-t border-border-strong shrink-0">
              <div className="flex justify-between font-mono text-[9px] text-secondary">
                <span>Buffer</span>
                <span className={ytReady ? "text-green-500" : "text-yellow-400"}>{ytReady ? "OK" : "INIT"}</span>
              </div>
              <div className="w-full h-[2px] bg-border-strong mt-1">
                <div className={clsx("h-full transition-all", ytReady ? "bg-green-500 w-full" : "bg-yellow-400 w-1/2")} />
              </div>
            </div>
          </div>

          {/* ── CONTENT AREA ─────────────────────────────────────────────── */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

            {/* ── HOME VIEW ────────────────────────────────────────────────── */}
            {view === "home" && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32 lg:pb-8">
                <div className="max-w-4xl mx-auto">
                  {/* Greeting */}
                  <div className="mb-6 sm:mb-8 fade-in-up">
                    <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-foreground mb-1">
                      {getGreeting()}
                    </h1>
                    <p className="font-mono text-sm text-secondary">What do you want to listen to?</p>
                  </div>

                  {/* Quick search */}
                  <div className="mb-6 sm:mb-8 fade-in-up fade-in-up-1">
                    <form onSubmit={handleSearch} className="relative max-w-xl">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search for songs, artists..."
                        className="w-full bg-surface border border-border-strong pl-12 pr-4 py-3.5 font-mono text-sm text-foreground placeholder:text-secondary/40 focus:outline-none focus:border-accent transition-colors rounded-full"
                      />
                    </form>
                  </div>

                  {/* Quick genre cards */}
                  <div className="mb-8 fade-in-up fade-in-up-2">
                    <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-accent" />
                      Quick Start
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {quickSearches.map((item) => (
                        <button
                          key={item.label}
                          onClick={async () => {
                            setSearchQuery(item.query);
                            setSearching(true);
                            setView("search");
                            const results = await searchYouTube(item.query, 15, false);
                            setSearchResults(results);
                            setSearching(false);
                          }}
                          className={clsx(
                            "relative overflow-hidden rounded-lg p-4 sm:p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group",
                            `bg-gradient-to-br ${item.gradient}`
                          )}
                        >
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <div className="font-display font-bold text-sm text-white">{item.label}</div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 text-white/80" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Section promo */}
                  <div className="mb-8 fade-in-up fade-in-up-3">
                    <button
                      onClick={() => setView("ai")}
                      className="w-full relative overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 via-purple-500/10 to-accent/10 p-6 sm:p-8 text-left group hover:border-accent/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent/30 transition-colors">
                          <Wand2 className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-foreground mb-1">AI Music Generator</h3>
                          <p className="font-mono text-xs text-secondary leading-relaxed">
                            Describe your mood or vibe and let SONAR AI find the perfect tracks for you. Try &quot;dark ambient for late night coding&quot; or &quot;upbeat summer playlist&quot;.
                          </p>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 font-mono text-[9px] text-accent animate-pulse uppercase tracking-widest">
                        SONAR-7B
                      </div>
                    </button>
                  </div>

                  {/* Currently Playing / Queue preview */}
                  {queue.length > 0 && (
                    <div className="mb-8 fade-in-up fade-in-up-4">
                      <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                        <Disc3 className={clsx("w-5 h-5 text-accent", isPlaying && "animate-spin")} style={{ animationDuration: "3s" }} />
                        Now Playing
                      </h2>
                      <div className="flex flex-col gap-1">
                        {queue.slice(Math.max(0, queueIndex), queueIndex + 5).map((track, i) => {
                          const realI = queueIndex + i;
                          const isActive = realI === queueIndex;
                          return (
                            <button
                              key={track.videoId}
                              onClick={() => playTrack(track, queue, realI)}
                              className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                isActive ? "bg-accent/10 border border-accent/30" : "hover:bg-surface"
                              )}
                            >
                              <img src={track.thumbnail} alt="" className="w-10 h-10 object-cover rounded-sm shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className={clsx("font-mono text-xs font-bold truncate", isActive ? "text-accent" : "text-foreground")}>{track.title}</div>
                                <div className="font-mono text-[10px] text-secondary truncate">{track.artist}</div>
                              </div>
                              {isActive && <Waveform isPlaying={isPlaying} />}
                              <span className="font-mono text-[10px] text-secondary shrink-0">{track.duration}</span>
                            </button>
                          );
                        })}
                        {queue.length > 5 && (
                          <button onClick={() => setView("queue")} className="font-mono text-xs text-accent hover:underline mt-2 text-center">
                            View all {queue.length} tracks →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── AI VIEW ──────────────────────────────────────────────────── */}
            {view === "ai" && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32 lg:pb-8">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-6 fade-in-up">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                      <Wand2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h1 className="font-display font-bold text-xl text-foreground">AI Music Generator</h1>
                      <p className="font-mono text-[10px] text-accent uppercase tracking-widest">SONAR-7B Active</p>
                    </div>
                  </div>

                  <div className="fade-in-up fade-in-up-1">
                    <div className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-2">Describe Your Vibe</div>
                    <div className="relative border border-border-strong bg-surface focus-within:border-accent transition-colors rounded-lg overflow-hidden">
                      <div className="absolute left-3 top-3 w-[2px] h-[calc(100%-24px)] bg-accent rounded-full" />
                      <textarea
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="e.g. dark ambient instrumental for late night coding..."
                        className="w-full bg-transparent pl-6 pr-3 py-4 font-mono text-sm text-foreground placeholder:text-secondary/40 focus:outline-none resize-none"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="font-mono text-[9px] text-secondary/40">{aiPrompt.length} chars</span>
                      <div className="flex items-center gap-2">
                        <label className="font-mono text-[9px] text-secondary/60 uppercase tracking-widest">Songs</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={aiCount}
                          onChange={e => setAiCount(Math.max(1, Math.min(50, Number(e.target.value) || 10)))}
                          className="w-14 bg-background border border-border-strong px-2 py-1 font-mono text-xs text-foreground text-center focus:outline-none focus:border-accent transition-colors rounded"
                        />
                        <span className="font-mono text-[9px] text-secondary/40">/ 50</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 fade-in-up fade-in-up-2">
                    {[
                      "dark focus instrumental",
                      "synthwave retro 80s",
                      "lo-fi hip hop beats",
                      "epic orchestral cinematic",
                      "acoustic chill cafe",
                      "phonk aggressive drift",
                    ].map((p) => (
                      <button key={p} onClick={() => setAiPrompt(p)} disabled={aiLoading}
                        className="text-left p-3 border border-border-strong bg-surface hover:border-accent transition-colors rounded-lg disabled:opacity-40">
                        <div className="font-mono text-[10px] text-secondary">&gt;_ {p}</div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className={clsx(
                      "w-full py-3.5 mt-4 font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all border rounded-lg fade-in-up fade-in-up-3",
                      aiLoading || !aiPrompt.trim()
                        ? "border-border-strong text-secondary cursor-not-allowed"
                        : "border-accent bg-accent/10 text-accent hover:bg-accent hover:text-background"
                    )}
                  >
                    {aiLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" />
                          {aiPendingTracks.length === 0
                            ? "Curating your playlist..."
                            : `Finding tracks... ${aiLoadingProgress} / ${aiPendingTracks.length}`}
                        </>
                      : <><Sparkles className="w-4 h-4" />Generate Playlist</>
                    }
                  </button>

                  {/* ── Loading progress bar ── */}
                  {aiLoading && aiPendingTracks.length > 0 && (
                    <div className="mt-3 fade-in-up">
                      <div className="w-full h-1 bg-border-strong rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-300"
                          style={{ width: `${(aiLoadingProgress / aiPendingTracks.length) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="font-mono text-[9px] text-secondary/40">
                          {aiLoadingProgress === 0 ? "Connecting to YouTube..." : `${aiResults.length} found`}
                        </span>
                        <span className="font-mono text-[9px] text-accent">
                          {Math.round((aiLoadingProgress / aiPendingTracks.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── Results (show while loading too) ── */}
                  {(aiResults.length > 0 || (aiLoading && aiPendingTracks.length > 0)) && (
                    <div className="mt-6 border border-accent/30 bg-accent/5 rounded-lg overflow-hidden fade-in-up">
                      <div className="flex justify-between items-center p-3 border-b border-border-strong">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-accent uppercase tracking-widest">
                            {aiPlaylistName || "Generated Tracks"}
                          </span>
                          {aiLoading && (
                            <span className="font-mono text-[9px] text-secondary/50">
                              ({aiResults.length}{aiPendingTracks.length > 0 ? `/${aiPendingTracks.length}` : ""})
                            </span>
                          )}
                        </div>
                        {!aiLoading && (
                          <div className="flex gap-4">
                            <button
                              onClick={() => {
                                const pl: Playlist = { id: Date.now().toString(), name: aiPlaylistName || "AI Mix", tracks: aiResults };
                                savePlaylists([...playlists, pl]);
                                setAiPlaylistName("Saved ✓");
                                setTimeout(() => setAiPlaylistName(pl.name), 2000);
                              }}
                              className="flex items-center gap-1.5 font-mono text-[10px] text-foreground hover:text-accent transition-colors"
                            >
                              <PlusCircle className="w-3 h-3" /> Save to Library
                            </button>
                            <button
                              onClick={() => { setQueue(aiResults); setQueueIndex(0); if (aiResults[0]) playTrack(aiResults[0], aiResults, 0); }}
                              className="flex items-center gap-1.5 font-mono text-[10px] text-accent hover:underline"
                            >
                              <Play className="w-3 h-3" /> Play All
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Resolved tracks */}
                      {aiResults.map((t, i) => (
                        <div
                          key={t.videoId + i}
                          className="flex items-center gap-3 p-3 hover:bg-surface transition-colors border-b border-border-strong/30 last:border-none group"
                          style={{ animation: "fadeInUp 0.3s ease-out both" }}
                        >
                          <button
                            onClick={() => playTrack(t, aiResults, i)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          >
                            {t.thumbnail ? (
                              <img src={t.thumbnail} alt="" className="w-9 h-9 object-cover shrink-0 rounded-sm" />
                            ) : (
                              <div className="w-9 h-9 bg-gradient-to-br from-accent to-purple-600 rounded-sm shrink-0 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-[11px] font-bold text-foreground truncate">{t.title}</div>
                              <div className="font-mono text-[9px] text-secondary truncate">{t.artist}</div>
                            </div>
                            <span className="font-mono text-[9px] text-secondary shrink-0 mr-1">{t.duration}</span>
                          </button>
                          {!aiLoading && (
                            <button
                              onClick={() => handleRegenerateTrack(i, t)}
                              disabled={regeneratingIndex !== null}
                              title="Diesen Song neu generieren"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-accent p-1 shrink-0 disabled:opacity-30"
                            >
                              {regeneratingIndex === i
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                                : <RefreshCw className="w-3.5 h-3.5" />
                              }
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Skeleton placeholders for pending tracks not yet resolved */}
                      {aiLoading && aiPendingTracks.slice(aiResults.length).map((name, i) => (
                        <div key={"skeleton-" + i} className="flex items-center gap-3 p-3 border-b border-border-strong/20 last:border-none">
                          <div className="w-9 h-9 bg-border-strong/40 rounded-sm shrink-0 animate-pulse" />
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="h-2.5 bg-border-strong/40 rounded animate-pulse w-3/4" />
                            <div className="font-mono text-[9px] text-secondary/40 truncate">{name}</div>
                          </div>
                          <Loader2 className="w-3 h-3 animate-spin text-secondary/30 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── LIBRARY VIEW (mobile) ────────────────────────────────────── */}
            {view === "library" && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-32 lg:pb-6">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-6 fade-in-up">
                    <h1 className="font-display font-bold text-xl text-foreground">Your Library</h1>
                    <button onClick={() => setShowNewPlaylist(true)} className="flex items-center gap-1.5 font-mono text-[10px] text-accent uppercase tracking-widest">
                      <PlusCircle className="w-4 h-4" /> New
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 fade-in-up fade-in-up-1">
                    <button
                      onClick={() => setView("liked")}
                      className="flex items-center gap-3 p-3 hover:bg-surface transition-colors rounded-lg text-left"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-400 rounded-md flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 text-white fill-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-sm font-bold text-foreground">Liked Songs</div>
                        <div className="font-mono text-[10px] text-secondary">{liked.size} songs</div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-secondary -rotate-90" />
                    </button>

                    <button
                      onClick={() => setView("queue")}
                      className="flex items-center gap-3 p-3 hover:bg-surface transition-colors rounded-lg text-left"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-400 rounded-md flex items-center justify-center shrink-0">
                        <ListMusic className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-sm font-bold text-foreground">Queue</div>
                        <div className="font-mono text-[10px] text-secondary">{queue.length} tracks</div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-secondary -rotate-90" />
                    </button>

                    {playlists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={() => { setActivePlaylistId(pl.id); setView("playlist"); }}
                        className="flex items-center gap-3 p-3 hover:bg-surface transition-colors rounded-lg text-left"
                      >
                        <div className="w-12 h-12 bg-surface border border-border-strong rounded-md flex items-center justify-center shrink-0">
                          <Music className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-sm font-bold text-foreground">{pl.name}</div>
                          <div className="font-mono text-[10px] text-secondary">{pl.tracks.length} songs</div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-secondary -rotate-90" />
                      </button>
                    ))}

                    {playlists.length === 0 && (
                      <div className="text-center py-8">
                        <Music className="w-12 h-12 text-secondary/20 mx-auto mb-3" />
                        <p className="font-mono text-xs text-secondary/40 mb-3">No playlists yet</p>
                        <button onClick={() => setShowNewPlaylist(true)} className="font-mono text-xs text-accent hover:underline">
                          Create your first playlist
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── SEARCH / TRACK LIST VIEW ─────────────────────────────────── */}
            {(view === "search" || view === "queue" || view === "liked" || view === "playlist") && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 px-3 sm:px-4 py-2.5 border-b border-border-strong bg-surface/60 shrink-0">
                  <div className="relative min-w-0 flex-1 sm:max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search music..."
                      className="w-full bg-background border border-border-strong pl-9 pr-4 py-2 font-mono text-xs text-foreground placeholder:text-secondary/40 focus:outline-none focus:border-accent transition-colors rounded-full"
                    />
                  </div>
                  <button type="submit" disabled={searching} className="flex items-center gap-2 px-4 py-2 bg-accent text-background font-mono text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 rounded-full">
                    {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                    <span className="hidden sm:block">Search</span>
                  </button>
                  {view !== "search" && (
                    <div className="font-mono text-xs font-bold text-foreground basis-full sm:basis-auto shrink-0 flex items-center gap-2">
                      <button onClick={() => setView("home")} className="text-secondary hover:text-foreground">
                        <Home className="w-4 h-4" />
                      </button>
                      <span className="text-secondary">/</span>
                      <span>{viewTitle}</span>
                    </div>
                  )}
                </form>

                {/* Column headers */}
                <div className="hidden sm:grid sm:grid-cols-[1.5rem_1fr_1fr_auto] px-4 py-2 border-b border-border-strong/50 shrink-0">
                  <span className="font-mono text-[8px] text-secondary/40 uppercase">#</span>
                  <span className="font-mono text-[8px] text-secondary/40 uppercase">Title / Artist</span>
                  <span className="font-mono text-[8px] text-secondary/40 uppercase">Channel</span>
                  <span className="font-mono text-[8px] text-secondary/40 uppercase text-right">Time</span>
                </div>

                {/* Track List */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {searching && (
                    <div className="flex items-center justify-center h-40 gap-3 font-mono text-xs text-secondary">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      Searching YouTube Music...
                    </div>
                  )}

                  {!searching && viewTracks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                      <Music className="w-8 h-8 text-secondary/20" />
                      <p className="font-mono text-xs text-secondary/40">
                        {view === "search" ? "Search for music above" :
                          view === "liked" ? "No liked tracks yet" :
                            view === "queue" ? "Queue is empty" : "Playlist is empty"}
                      </p>
                    </div>
                  )}

                  {!searching && viewTracks.map((track, i) => {
                    const isActive = currentTrack?.videoId === track.videoId;
                    return (
                      <div
                        key={`${track.videoId}-${i}`}
                        onClick={() => playTrack(track, viewTracks, i)}
                        className={clsx(
                          "grid grid-cols-[1.5rem_1fr_auto] sm:grid-cols-[1.5rem_1fr_1fr_auto] px-4 py-2.5 items-center group cursor-pointer border-b border-border-strong/20 hover:bg-surface transition-colors gap-3",
                          isActive && "bg-accent/5 border-l-2 border-l-accent"
                        )}
                      >
                        <div className="flex items-center justify-center">
                          {isActive
                            ? <Waveform isPlaying={isPlaying} />
                            : <span className="font-mono text-[10px] text-secondary/40">{i + 1}</span>
                          }
                        </div>

                        <div className="flex items-center gap-3 min-w-0">
                          {track.thumbnail && (
                            <img src={track.thumbnail} alt="" className="w-9 h-9 object-cover shrink-0 bg-surface rounded-sm" />
                          )}
                          <div className="min-w-0">
                            <div className={clsx("font-mono text-xs font-bold truncate", isActive ? "text-accent" : "text-foreground")}>
                              {track.title}
                            </div>
                            <div className="font-mono text-[10px] text-secondary truncate sm:hidden">{track.artist}</div>
                          </div>
                        </div>

                        <div className="font-mono text-[10px] text-secondary truncate hidden sm:block">{track.artist}</div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); toggleLike(track); }}
                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1"
                          >
                            <Heart className={clsx("w-3.5 h-3.5", liked.has(track.videoId) ? "text-accent fill-accent" : "text-secondary hover:text-foreground")} />
                          </button>
                          <span className="font-mono text-[10px] text-secondary">{track.duration}</span>
                          <button
                            onClick={e => { e.stopPropagation(); setTrackMenu(trackMenu?.videoId === track.videoId ? null : track); }}
                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-secondary hover:text-foreground p-1"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                          {view === "playlist" && (
                            <button
                              onClick={e => { e.stopPropagation(); if (activePlaylistId) removeFromPlaylist(activePlaylistId, track.videoId); }}
                              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-secondary hover:text-red-400 p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── PLAYER BAR ───────────────────────────────────────────────────── */}
        <div className="absolute lg:static bottom-14 lg:bottom-0 left-0 right-0 z-50 px-2 lg:px-0 bg-transparent lg:bg-surface lg:border-t lg:border-border-strong shrink-0 pointer-events-none lg:pointer-events-auto">
          <div className="pointer-events-auto flex flex-col lg:flex-row lg:items-center lg:justify-between w-full h-14 lg:h-[90px] lg:px-6 bg-surface/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border lg:border-none border-border-strong rounded-xl lg:rounded-none shadow-2xl lg:shadow-none overflow-hidden lg:overflow-visible">
            
            {/* Left: Desktop Track info */}
            <div className="hidden lg:flex items-center gap-4 w-1/3 min-w-0">
              <div className="w-14 h-14 bg-surface text-secondary border border-border-strong overflow-hidden rounded shadow-sm flex items-center justify-center shrink-0">
                {currentTrack?.thumbnail
                  ? <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover" />
                  : <Music className="w-6 h-6" />
                }
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-sm font-semibold text-foreground truncate">{currentTrack?.title ?? "SONAR"}</div>
                <div className="text-xs text-secondary truncate mt-0.5">{currentTrack?.artist ?? "Select a track to play"}</div>
              </div>
              {currentTrack && (
                <button onClick={() => toggleLike(currentTrack)} className="p-2 shrink-0 transition-transform active:scale-90">
                  <Heart className={clsx("w-5 h-5 transition-colors", liked.has(currentTrack.videoId) ? "text-accent fill-accent" : "text-secondary hover:text-foreground")} />
                </button>
              )}
            </div>

            {/* Mobile Layout (Track Info + Controls Mixed) */}
            <div className="flex lg:hidden items-center justify-between w-full h-full px-3 relative">
              {/* Progress bar at bottom edge */}
              <div className="absolute bottom-0 left-0 h-[2px] bg-border-strong w-full" />
              <div className="absolute bottom-0 left-0 h-[2px] bg-accent transition-all" style={{ width: `${progress * 100}%` }} />

              {/* Tap area → expand player */}
              <button
                className="flex items-center gap-3 min-w-0 flex-1 text-left h-full"
                onClick={() => setShowMobilePlayer(true)}
              >
                <div className="w-9 h-9 bg-surface border border-border-strong overflow-hidden rounded shrink-0 flex items-center justify-center text-secondary">
                  {currentTrack?.thumbnail
                    ? <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <Music className="w-5 h-5" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground truncate">{currentTrack?.title ?? "SONAR"}</div>
                  <div className="text-[10px] text-secondary truncate">{currentTrack?.artist ?? "Select a track to play"}</div>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0 ml-1">
                {currentTrack && (
                  <button onClick={() => toggleLike(currentTrack)} className="p-2">
                    <Heart className={clsx("w-4 h-4", liked.has(currentTrack.videoId) ? "text-accent fill-accent" : "text-secondary")} />
                  </button>
                )}
                <button
                  onClick={handlePlayPause}
                  className="w-9 h-9 bg-foreground text-background flex items-center justify-center transition-all rounded-full shadow-lg active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Center: Desktop Controls & Progress */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-2 w-1/3 max-w-2xl px-4">
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => setShuffle(!shuffle)} className={clsx("transition-colors active:scale-90", shuffle ? "text-accent" : "text-secondary hover:text-foreground")}>
                  <Shuffle className="w-4 h-4" />
                </button>
                <button onClick={handlePrev} className="text-secondary hover:text-foreground transition-colors p-1 active:scale-90">
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 bg-foreground hover:bg-accent text-background flex items-center justify-center transition-all rounded-full shadow active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button onClick={handleNext} className="text-secondary hover:text-foreground transition-colors p-1 active:scale-90">
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
                <button
                  onClick={() => setRepeat(r => r === "none" ? "all" : r === "all" ? "one" : "none")}
                  className={clsx("transition-colors relative active:scale-90", repeat !== "none" ? "text-accent" : "text-secondary hover:text-foreground")}
                >
                  <Repeat className="w-4 h-4" />
                  {repeat === "one" && <span className="absolute -top-1 -right-1 text-[7px] text-accent font-bold">1</span>}
                </button>
              </div>
              
              <div className="flex items-center gap-3 w-full">
                <span className="text-[10px] text-secondary font-mono w-10 text-right shrink-0">{formatSeconds(currentTime)}</span>
                <div
                  className="flex-1 h-3 flex items-center cursor-pointer group touch-none"
                  onClick={handleSeek}
                  onTouchStart={handleTouchSeek}
                  onTouchMove={handleTouchSeek}
                  onTouchEnd={handleTouchSeek}
                >
                  <div className="w-full h-1 bg-border-strong rounded-full relative overflow-visible">
                    <div className="absolute inset-y-0 left-0 bg-foreground group-hover:bg-accent rounded-full transition-colors" style={{ width: `${progress * 100}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border border-border-strong shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${progress * 100}%`, transform: "translate(-50%,-50%)" }} />
                  </div>
                </div>
                <span className="text-[10px] text-secondary font-mono w-10 shrink-0">{currentTrack?.duration ?? "0:00"}</span>
              </div>
            </div>

            {/* Right: Desktop Volume */}
            <div className="hidden lg:flex items-center justify-end gap-3 w-1/3">
              <button onClick={toggleMute} className="text-secondary hover:text-foreground transition-colors shrink-0 p-1">
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="w-24 h-5 flex items-center cursor-pointer group touch-none mx-2 mt-1" onClick={handleVolume}>
                  <div className="w-full h-1 bg-border-strong rounded-full relative overflow-visible">
                    <div className="absolute inset-y-0 left-0 bg-foreground group-hover:bg-accent rounded-full transition-colors" style={{ width: `${muted ? 0 : volume}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border border-border-strong shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${muted ? 0 : volume}%`, transform: "translate(-50%,-50%)" }} />
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE BOTTOM TAB BAR ────────────────────────────────────────── */}
        <div className="lg:hidden border-t border-border-strong bg-surface shrink-0 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around">
            {[
              { icon: Home, label: "Home", id: "home" as const },
              { icon: Search, label: "Search", id: "search" as const },
              { icon: Library, label: "Library", id: "library" as const },
              { icon: Wand2, label: "AI", id: "ai" as const },
            ].map(({ icon: Icon, label, id }) => {
              const isActive = view === id || (id === "library" && (view === "liked" || view === "queue" || view === "playlist"));
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={clsx(
                    "flex flex-col items-center gap-0.5 py-2 px-3 transition-colors min-w-0",
                    isActive ? "text-accent" : "text-secondary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-mono text-[9px] uppercase tracking-wider">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
