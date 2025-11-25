import React from "react";
import type { GenericStatus, Manga } from "../types.js";
import { useMangaStore } from "../stores/mangaStore.js";
import MediaCard from "./MediaCard.js";
import PublicRating from "./PublicRating.js";
import StatusWithExtraInfo from "./StatusWithExtraInfo.js";

function MangaCard({ item }: { item: Manga }) {
  const {
    id,
    title,
    score,
    cover_image,
    chapters,
    volumes,
    releaseYear,
    authors,
    type,
    releaseStatus,
    themes,
  } = item;

  const currentStatus = useMangaStore((state) => state.getMangaStatus(id));
  const dateAdded = useMangaStore((state) => state.getDateAdded(id));
  const currentChapter = useMangaStore((state) => state.getCurrentChapter(id));
  const removeMangaFromList = useMangaStore(
    (state) => state.removeMangaFromList
  );
  const addMangaToList = useMangaStore((state) => state.addMangaToList);
  const setCurrentChapter = useMangaStore((state) => state.setCurrentChapter);

  function getButtonText(): string {
    switch (currentStatus) {
      case "completed":
        return "Read";
      case "progress":
        return "Reading";
      case "planned":
        return "Planned";
      default:
        return "Mark Read";
    }
  }

  function onStatusChange(status: GenericStatus | null) {
    if (currentStatus) {
      removeMangaFromList(id, currentStatus);
    }
    if (status === null) return;
    addMangaToList(item, status);
  }

  function onCountChange(newCount: number) {
    setCurrentChapter(id, newCount);
  }

  return (
    <MediaCard coverImage={cover_image} alt={title}>
      <h2 className="font-bold line-clamp-2 leading-tight" title={title}>
        {title}
      </h2>
      <p className="text-sm mb-1 line-clamp-1">{authors.join(" | ")}</p>
      <p>
        {releaseYear} | {releaseStatus}
      </p>
      <PublicRating score={score} />
      <div className="flex justify-between">
        <p>{chapters || "N/A"} chapters </p>
      </div>

      <div className="absolute bottom-0 w-full">
        <StatusWithExtraInfo
          status={currentStatus}
          dateAdded={dateAdded}
          count={currentChapter}
          maxCount={chapters}
          onStatusChange={onStatusChange}
          onCountChange={onCountChange}
          buttonText={getButtonText()}
        />
      </div>
    </MediaCard>
  );
}

export default MangaCard;
