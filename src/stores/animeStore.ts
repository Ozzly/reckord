import { create } from "zustand";
import type { Anime, GenericStatus } from "../types.js";
import moment from "moment";
import { addItemToList, loadFromStorage } from "./storeHelpers.js";

const API_BASE_URL = "https://api.jikan.moe/v4";

type AnimeStore = {
  isLoading: boolean;
  animeResults: Anime[];
  completed: Anime[];
  progress: Anime[];
  planned: Anime[];
  addAnimeToList: (anime: Anime, listName: GenericStatus) => void;
  getAnimeStatus: (mal_id: number) => GenericStatus | null;
  removeAnimeFromList: (mal_id: number, listName: GenericStatus) => void;
  getDateAdded: (mal_id: number) => string | null;
  getCurrentEpisode: (mal_id: number) => number | null;
  setCurrentEpisode: (
    mal_id: number,
    updatedEpisodeCount: number | null
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
      "anime"
    );
    if (!updatedList) return;
    set({ [status]: updatedList });
  },

  getAnimeStatus: (mal_id: number): GenericStatus | null => {
    const {
      completed: animeWatched,
      progress: animeWatching,
      planned: animePlanned,
    } = get();

    if (animeWatched.some((anime) => anime.id === mal_id)) return "completed";
    if (animeWatching.some((anime) => anime.id === mal_id)) return "progress";
    if (animePlanned.some((anime) => anime.id === mal_id)) return "planned";

    return null;
  },

  removeAnimeFromList: (mal_id: number, status: GenericStatus) => {
    let currentList: Anime[];
    switch (status) {
      case "completed":
        currentList = get().completed;
        break;
      case "progress":
        currentList = get().progress;
        break;
      case "planned":
        currentList = get().planned;
        break;
      default:
        return;
    }

    const updatedList = currentList.filter((anime) => anime.id !== mal_id);

    switch (status) {
      case "completed":
        set({ completed: updatedList });
        break;
      case "progress":
        set({ progress: updatedList });
        break;
      case "planned":
        set({ planned: updatedList });
        break;
    }

    localStorage.setItem(`anime_${status}`, JSON.stringify(updatedList));
  },

  getDateAdded: (mal_id: number): string | null => {
    const { completed: animeWatched } = get();
    return animeWatched.find((anime) => anime.id === mal_id)?.dateAdded || null;
  },

  getCurrentEpisode: (mal_id: number): number | null => {
    const { progress: animeWatching } = get();
    return (
      animeWatching.find((anime) => anime.id === mal_id)?.progressValue ?? null
    );
  },

  setCurrentEpisode: (mal_id: number, updatedEpisodeCount: number | null) => {
    const { progress: animeWatching } = get();
    const index = animeWatching.findIndex((anime) => anime.id === mal_id);
    if (index === -1) return;

    const currentAnime = animeWatching[index];
    const updatedEpisode = {
      ...currentAnime,
      progressValue: updatedEpisodeCount,
    } as Anime;
    const updatedList = [
      ...animeWatching.slice(0, index),
      updatedEpisode,
      ...animeWatching.slice(index + 1),
    ];
    set({
      progress: updatedList,
    });
    localStorage.setItem("animeWatching", JSON.stringify(updatedList));
  },

  fetchAnimeQuery: async (searchTerm: string) => {
    if (searchTerm.trim() === "") {
      set({ animeResults: [] });
      return;
    }

    set({ isLoading: true });

    try {
      const endpoint = `${API_BASE_URL}/anime?q=${encodeURIComponent(
        searchTerm
      )}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const transformedData = data.data.map(transformAPIData);
      console.log(transformedData);

      const uniqueMap = new Map<number, Anime>();
      transformedData.forEach((anime: Anime) => {
        uniqueMap.set(anime.id, anime);
      });
      const uniqueData = Array.from(uniqueMap.values());

      set({ animeResults: uniqueData || [] });
    } catch (error) {
      console.log(`Error fetching anime: ${error}`);
    } finally {
      set({ isLoading: false });
      console.log(`Finished fetching anime`);
    }
  },
}));
