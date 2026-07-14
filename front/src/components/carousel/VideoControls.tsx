import type { VideoControlsProps } from "@/types";

export function VideoControls({
  playing,
  muted,
  loading,
  progress,
  onTogglePlay,
  onToggleMute,
}: VideoControlsProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
      <div
        className="h-1 overflow-hidden rounded-full bg-white/25"
        aria-hidden
      >
        <div
          className="h-full bg-white transition-[width]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        {loading ? (
          <span className="ml-auto text-xs text-white/80">Loading…</span>
        ) : null}
      </div>
    </div>
  );
}
