import Image from "next/image";

import { isApiHostedMedia } from "@/lib/media";
import type { AdminVideo } from "@/types";

type AdminVideoCardProps = {
  video: AdminVideo;
  onEdit: (video: AdminVideo) => void;
  onDeactivate: (id: string) => void;
};

export function AdminVideoCard({
  video,
  onEdit,
  onDeactivate,
}: AdminVideoCardProps) {
  return (
    <article className="card-soft flex flex-col overflow-hidden transition hover:shadow-[var(--shadow-soft)]">
      <div className="relative aspect-video w-full bg-zinc-900">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover"
          unoptimized={isApiHostedMedia(video.thumbnailUrl)}
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            video.isActive
              ? "bg-emerald-600/90 text-white"
              : "bg-stone-600/90 text-white"
          }`}
        >
          {video.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
            {video.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
            {video.description}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div>
            <dt className="text-muted">Sort order</dt>
            <dd className="font-medium">{video.sortOrder}</dd>
          </div>
          <div>
            <dt className="text-muted">Engagement</dt>
            <dd className="font-medium">
              {video.likesCount} likes · {video.sharesCount} shares
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted">Comments</dt>
            <dd className="font-medium">{video.commentsCount}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted">Video URL</dt>
            <dd className="truncate font-medium" title={video.url}>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline-offset-2 hover:underline"
              >
                {video.url}
              </a>
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => onEdit(video)}
            className="btn-secondary flex-1 py-1.5 text-xs"
          >
            Edit
          </button>
          {video.isActive ? (
            <button
              type="button"
              onClick={() => onDeactivate(video.id)}
              className="btn-ghost flex-1 py-1.5 text-xs text-danger hover:border-danger/40 hover:bg-danger/10"
            >
              Deactivate
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
