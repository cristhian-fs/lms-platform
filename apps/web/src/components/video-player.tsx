import { useEffect, useRef } from "react";
import Hls from "hls.js";
import MediaThemeSutro from "player.style/sutro/react";

interface VideoPlayerProps {
  src: string;
  type?: "hls" | "mp4";
  title?: string;
  className?: string;
  onEnded?: () => void;
}

export function VideoPlayer({ src, type = "hls", title, className, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (type === "mp4") {
      video.src = src;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }

    // Native HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, [src, type]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onEnded) return;
    video.addEventListener("ended", onEnded);
    return () => video.removeEventListener("ended", onEnded);
  }, [onEnded]);

  return (
    <MediaThemeSutro
      title={title}
      className={className}
      style={{ width: "100%", aspectRatio: "16/9" }}
    >
      <video ref={videoRef} slot="media" playsInline />
    </MediaThemeSutro>
  );
}
