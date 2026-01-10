import { create } from "zustand";
import type { GenericStatus, Manga } from "../types.js";
import moment from "moment";
import {
  addItemToList,
  loadFromStorage,
  removeItemFromList,
} from "./storeHelpers.js";

function transformAPIData(data: any): Manga {
  const themes = data.themes.map((theme: any) => theme.name);
  const genres = data.genres.map((genre: any) => genre.name);
  const genresAndThemes = [...themes, ...genres];

  return {
    id: data.mal_id,
    title: data.title,
    chapters: data.chapters,
    volumes: data.volumes,
    score: data.score,
    authors: data.authors.map((author: any) => author.name),
    cover_image: data.images.jpg.image_url,
    type: data.type,
    releaseStatus: data.status,
    releaseYear: data.published.prop.from.year,
    themes: genresAndThemes,
  };
}

type MangaStore = {
  mangaResults: Manga[];
  completed: Manga[];
  progress: Manga[];
  planned: Manga[];
  addMangaToList: (item: Manga, status: GenericStatus) => void;
  getMangaStatus: (id: number) => GenericStatus | null;
  removeMangaFromList: (id: number, status: GenericStatus) => void;
  getDateAdded: (id: number) => string | null;
  getCurrentChapter: (id: number) => number | null;
  setCurrentChapter: (id: number, chapter: number) => void;
  fetchMangaQuery: (query: string) => Promise<void>;
};

export const useMangaStore = create<MangaStore>((set, get) => ({
  mangaResults: [],

  completed: loadFromStorage<Manga>("manga_completed"),
  progress: loadFromStorage<Manga>("manga_progress"),
  planned: loadFromStorage<Manga>("manga_planned"),

  addMangaToList: (manga: Manga, status: GenericStatus) => {
    const updatedList = addItemToList<Manga>(
      status,
      manga,
      get()[status],
      "manga"
    );
    if (!updatedList) return;
    set({ [status]: updatedList });
  },

  getMangaStatus: (id: number): GenericStatus | null => {
    const {
      completed: mangaCompleted,
      progress: mangaProgress,
      planned: mangaPlanned,
    } = get();

    if (mangaCompleted.some((m) => m.id === id)) return "completed";
    if (mangaProgress.some((m) => m.id === id)) return "progress";
    if (mangaPlanned.some((m) => m.id === id)) return "planned";

    return null;
  },

  removeMangaFromList: (id: number, status: GenericStatus) => {
    const updatedList = removeItemFromList<Manga>(
      id,
      status,
      get()[status],
      "manga"
    );
    if (!updatedList) return;
    set({ [status]: updatedList });
  },

  getDateAdded: (id: number): string | null => {
    const { completed: mangaCompleted } = get();
    return mangaCompleted.find((m) => m.id === id)?.dateAdded || null;
  },

  getCurrentChapter: (id: number): number | null => {
    const { progress: mangaProgress } = get();
    return mangaProgress.find((m) => m.id === id)?.progressValue || null;
  },

  setCurrentChapter: (id: number, chapter: number) => {
    const { progress: mangaProgress } = get();
    const mangaIndex = mangaProgress.findIndex((m) => m.id === id);
    if (mangaIndex === -1) return;

    const updatedManga = {
      ...mangaProgress[mangaIndex],
      progressValue: chapter,
    } as Manga;
    const updatedList = [...mangaProgress];
    updatedList[mangaIndex] = updatedManga;

    set({ progress: updatedList });
    localStorage.setItem("manga_progress", JSON.stringify(updatedList));
  },

  fetchMangaQuery: async (query: string) => {
    if (query.trim() === "") {
      set({ mangaResults: [] });
      return;
    }

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const transformedData = data.data.map(transformAPIData);
      console.log(transformedData);

      const uniqueMap = new Map<number, Manga>();
      transformedData.forEach((manga: Manga) => {
        uniqueMap.set(manga.id, manga);
      });

      const uniqueData = Array.from(uniqueMap.values());
      set({ mangaResults: uniqueData });
    } catch (error) {
      console.error("Error fetching manga data:", error);
    }
  },
}));
