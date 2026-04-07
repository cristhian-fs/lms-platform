import { env } from "@lms-platform/env/web";

export function thumbnailSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/"))
    return `${env.VITE_SERVER_URL}/api/local-asset?path=${encodeURIComponent(url)}`;
  return url;
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
  if (m > 0) return `${m}m`;
  return "< 1m";
}
