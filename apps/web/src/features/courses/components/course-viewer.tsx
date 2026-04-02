import { VideoPlayer } from "@/components/video-player";
import { formatDuration } from "@/lib/utils";
import { BookOpenIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { Button } from "@lms-platform/ui/components/button";
import { env } from "@lms-platform/env/web";
import type { Lesson } from "../types";

interface CourseViewerProps {
  lesson: Lesson | null;
  isCompleted?: boolean;
  isMarking?: boolean;
  onMarkComplete?: () => void;
  onVideoEnded?: () => void;
}

export function CourseViewer({
  lesson,
  isCompleted,
  isMarking,
  onMarkComplete,
  onVideoEnded,
}: CourseViewerProps) {
  if (!lesson) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
        <BookOpenIcon className="size-12 text-muted-foreground" />
      </div>
    );
  }

  const isLocalVideo = lesson.videoUrl?.startsWith("/");
  const src = isLocalVideo
    ? `${env.VITE_SERVER_URL}/api/local-stream/${lesson.id}`
    : `${env.VITE_SERVER_URL}/api/stream/${lesson.id}/playlist.m3u8`;

  return (
    <div className="flex flex-col gap-4">
      {lesson.type === "video" ? (
        <VideoPlayer
          key={lesson.id}
          src={src}
          type={isLocalVideo ? "mp4" : "hls"}
          title={lesson.title}
          className="w-full overflow-hidden rounded-xl"
          onEnded={!isCompleted ? onVideoEnded : undefined}
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
          <BookOpenIcon className="size-12 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold">{lesson.title}</h1>
          {lesson.durationSeconds > 0 && (
            <p className="text-sm text-muted-foreground">
              {formatDuration(lesson.durationSeconds)}
            </p>
          )}
        </div>

        {onMarkComplete && (
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            disabled={isCompleted || isMarking}
            onClick={onMarkComplete}
            className="shrink-0"
          >
            {isMarking ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CheckCircle2Icon className="size-4" />
            )}
            {isCompleted ? "Concluído" : "Marcar como concluído"}
          </Button>
        )}
      </div>
    </div>
  );
}
