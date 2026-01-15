import type { Anime, GenericStatus } from "../types.js";
import { useAnimeStore } from "../stores/animeStore.js";
import { FaStar } from "react-icons/fa";
import MediaCard from "./MediaCard.js";
import StatusWithExtraInfo from "./StatusWithExtraInfo.js";
import PublicRating from "./PublicRating.js";
import { animeConfig } from "../configs/mediaConfigs.js";
interface AnimeCardProps {
  item: Anime;
}

function AnimeCard({ item }: AnimeCardProps) {
  const {
    id,
    title,
    score,
    cover_image,
    episodes,
    year,
    release_season,
    studio,
    themes,
    videoType,
  } = item;

  const currentStatus = useAnimeStore((state) => state.getAnimeStatus(id));

  const dateAdded = useAnimeStore((state) =>
    state.getDateAdded(id, currentStatus as GenericStatus)
  );
  const currentEpisode = useAnimeStore((state) => state.getCurrentEpisode(id));
  const removeAnimeFromList = useAnimeStore(
    (state) => state.removeAnimeFromList
  );
  const addAnimeToList = useAnimeStore((state) => state.addAnimeToList);
  const setCurrentEpisode = useAnimeStore((state) => state.setCurrentEpisode);

  function getButtonText(): string {
    switch (currentStatus) {
      case "completed":
        return "Watched";
      case "progress":
        return "Watching";
      case "planned":
        return "Planned";
      default:
        return "Mark Watched";
    }
  }

  function onStatusChange(status: GenericStatus | null) {
    if (currentStatus) {
      removeAnimeFromList(id, currentStatus);
    }
    if (status === null) return;
    addAnimeToList(item, status);
  }

  function onCountChange(newCount: number) {
    setCurrentEpisode(id, newCount);
  }

  return (
    <MediaCard coverImage={cover_image} alt={title}>
      <h2 className="font-bold line-clamp-2 leading-tight" title={title}>
        {title}
      </h2>
      <p className="text-sm mb-1">{studio}</p>
      <p>
        {release_season} {year}
      </p>
      <PublicRating score={score} />
      <p>
        {episodes || "N/A"} {videoType === "TV" ? "Episodes" : videoType}
      </p>

      <div className="h-12 overflow-hidden mt-1">
        <div className="flex flex-wrap gap-1">
          {themes?.map((theme: string) => (
            <div
              key={theme}
              className="text-xs bg-ctp-surface2 rounded-xl w-fit px-2 py-0.5"
            >
              {theme}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 w-full">
        <StatusWithExtraInfo
          status={currentStatus}
          dateAdded={dateAdded || null}
          count={currentEpisode || null}
          maxCount={episodes || null}
          buttonText={getButtonText()}
          onStatusChange={onStatusChange}
          onCountChange={onCountChange}
          statusOptions={animeConfig.statusOptions}
        />
      </div>
    </MediaCard>
  );
}

export default AnimeCard;
