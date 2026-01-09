import { create } from "zustand";
import type { GenericStatus, Manga } from "../types.js";
import moment from "moment";
import { loadFromStorage } from "./storeHelpers.js";

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
  mangaCompleted: Manga[];
  mangaProgress: Manga[];
  mangaPlanned: Manga[];
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

  mangaCompleted: loadFromStorage<Manga>("manga_completed"),
  mangaProgress: loadFromStorage<Manga>("manga_progress"),
  mangaPlanned: loadFromStorage<Manga>("manga_planned"),

  addMangaToList: (manga: Manga, status: GenericStatus) => {
    let currentList: Manga[];
    let storageKey: string;

    switch (status) {
      case "completed":
        currentList = get().mangaCompleted;
        storageKey = "manga_completed";
        break;
      case "progress":
        currentList = get().mangaProgress;
        storageKey = "manga_progress";
        break;
      case "planned":
        currentList = get().mangaPlanned;
        storageKey = "manga_planned";
        break;
      default:
        return;
    }

    if (currentList.some((m) => m.id === manga.id)) return;
    manga.dateAdded = moment().format("ll");
    status === "progress" && (manga.progressValue = 1);
    const updatedList = [...currentList, manga];

    switch (status) {
      case "completed":
        set({ mangaCompleted: updatedList });
        break;
      case "progress":
        set({ mangaProgress: updatedList });
        break;
      case "planned":
        set({ mangaPlanned: updatedList });
        break;
    }
    localStorage.setItem(storageKey, JSON.stringify(updatedList));
  },

  getMangaStatus: (id: number): GenericStatus | null => {
    const { mangaCompleted, mangaProgress, mangaPlanned } = get();

    if (mangaCompleted.some((m) => m.id === id)) return "completed";
    if (mangaProgress.some((m) => m.id === id)) return "progress";
    if (mangaPlanned.some((m) => m.id === id)) return "planned";

    return null;
  },

  removeMangaFromList: (id: number, status: GenericStatus) => {
    let currentList: Manga[];
    let storageKey: string;

    switch (status) {
      case "completed":
        currentList = get().mangaCompleted;
        storageKey = "manga_completed";
        break;
      case "progress":
        currentList = get().mangaProgress;
        storageKey = "manga_progress";
        break;
      case "planned":
        currentList = get().mangaPlanned;
        storageKey = "manga_planned";
        break;
      default:
        return;
    }

    const updatedList = currentList.filter((m) => m.id !== id);

    switch (status) {
      case "completed":
        set({ mangaCompleted: updatedList });
        break;
      case "progress":
        set({ mangaProgress: updatedList });
        break;
      case "planned":
        set({ mangaPlanned: updatedList });
        break;
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedList));
  },

  getDateAdded: (id: number): string | null => {
    const { mangaCompleted } = get();
    return mangaCompleted.find((m) => m.id === id)?.dateAdded || null;
  },

  getCurrentChapter: (id: number): number | null => {
    const { mangaProgress } = get();
    return mangaProgress.find((m) => m.id === id)?.progressValue || null;
  },

  setCurrentChapter: (id: number, chapter: number) => {
    const { mangaProgress } = get();
    const mangaIndex = mangaProgress.findIndex((m) => m.id === id);
    if (mangaIndex === -1) return;

    const updatedManga = {
      ...mangaProgress[mangaIndex],
      progressValue: chapter,
    } as Manga;
    const updatedList = [...mangaProgress];
    updatedList[mangaIndex] = updatedManga;

    set({ mangaProgress: updatedList });
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
