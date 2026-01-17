import { create } from "zustand";
import type { Anime, GenericStatus } from "../types.js";
import moment from "moment";
import {
  addItemToList,
  fetchQuery,
  getDateAdded,
  loadFromStorage,
  removeItemFromList,
  updateProgressValue,
} from "./storeHelpers.js";

type AnimeStore = {
  isLoading: boolean;
  animeResults: Anime[];
  completed: Anime[];
  progress: Anime[];
  planned: Anime[];
  addAnimeToList: (anime: Anime, listName: GenericStatus) => void;
  getAnimeStatus: (mal_id: number) => GenericStatus | null;
  removeAnimeFromList: (mal_id: number, listName: GenericStatus) => void;
  getDateAdded: (mal_id: number, status: GenericStatus) => string | null;
  getCurrentEpisode: (mal_id: number) => number | null;
  setCurrentEpisode: (
    mal_id: number,
    updatedEpisodeCount: number | null,
  ) => void;
  fetchAnimeQuery: (searchTerm: string) => Promise<void>;
};

const transformAPIData = (data: any): Anime => {
  function getSeason(month: number): string {
    if ([12, 1, 2].includes(month)) return "Winter";
    if ([3, 4, 5].includes(month)) return "Spring";
    if ([6, 7, 8].includes(month)) return "Summer";
    if ([9, 10, 11].includes(month)) return "Fall";
    return "Unknown";
  }

  const releaseSeason = getSeason(data.aired.prop.from.month);

  const themes = data.themes.map((theme: any) => theme.name);
  const genres = data.genres.map((genre: any) => genre.name);
  const genresAndThemes = [...themes, ...genres];

  return {
    id: data.mal_id,
    title: data.title,
    score: data.score,
    cover_image: data.images.jpg.image_url,
    episodes: data.episodes,
    year: data.aired.prop.from.year,
    release_season: releaseSeason,
    studio: data.studios[0]?.name || "Unknown", // Should replace with logic to handle multiple studios
    themes: genresAndThemes,
    videoType: data.type,
  };
};

export const useAnimeStore = create<AnimeStore>((set, get) => ({
  isLoading: false,
  animeResults: [],

  completed: loadFromStorage<Anime>("anime_completed"),
  progress: loadFromStorage<Anime>("anime_progress"),
  planned: loadFromStorage<Anime>("anime_planned"),

  addAnimeToList: (anime: Anime, status: GenericStatus) => {
    const updatedList = addItemToList<Anime>(
      status,
      anime,
      get()[status],
      "anime",
    );
    if (!updatedList) return;
    set({ [status]: updatedList });
  },

  getAnimeStatus: (mal_id: number): GenericStatus | null => {
    const { completed, progress, planned } = get();

    if (completed.some((anime) => anime.id === mal_id)) return "completed";
    if (progress.some((anime) => anime.id === mal_id)) return "progress";
    if (planned.some((anime) => anime.id === mal_id)) return "planned";

    return null;
  },

  removeAnimeFromList: (mal_id: number, status: GenericStatus) => {
    const updatedList = removeItemFromList<Anime>(
      mal_id,
      status,
      get()[status],
      "anime",
    );
    if (!updatedList) return;
    set({ [status]: updatedList });
  },

  getDateAdded: (mal_id: number, status: GenericStatus): string | null => {
    return getDateAdded<Anime>(mal_id, get()[status]);
  },

  getCurrentEpisode: (mal_id: number): number | null => {
    const { progress: animeWatching } = get();
    return (
      animeWatching.find((anime) => anime.id === mal_id)?.progressValue ?? null
    );
  },

  setCurrentEpisode: (mal_id: number, updatedEpisodeCount: number | null) => {
    const updatedList = updateProgressValue<Anime>(
      mal_id,
      updatedEpisodeCount,
      "anime_progress",
      get().progress,
    );
    if (!updatedList) return;
    set({ progress: updatedList });
  },

  fetchAnimeQuery: async (searchTerm: string) => {
    if (searchTerm.trim() === "") {
      set({ animeResults: [] });
      return;
    }

    set({ isLoading: true });
    const query = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}`;
    const { error, result } = await fetchQuery<Anime>(query, transformAPIData);
    if (error) {
      console.error("Error fetching anime data:", error);
      return;
    }
    set({ animeResults: result, isLoading: false });
  },
}));
