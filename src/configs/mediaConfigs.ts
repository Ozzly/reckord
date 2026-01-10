import AnimeCard from "../components/AnimeCard.js";
import BookCard from "../components/BookCard.js";
import MangaCard from "../components/MangaCard.js";
import { useAnimeStore } from "../stores/animeStore.js";
import { useBookStore } from "../stores/bookStore.js";
import { useMangaStore } from "../stores/mangaStore.js";
import type { Anime, Book, Manga } from "../types.js";

type Media = Anime[] | Book[] | Manga[];

export interface MediaConfig {
  title: string;
  searchPlaceholder: string;
  statusOptions: {
    completed: string;
    progress: string;
    planned: string;
  };
  cardComponent: React.ComponentType<any>;
  useStore: () => {
    results: Media;
    completed: Media;
    progress?: Media;
    planned: Media;
  };
  sortOptions: string[];
}

export const animeConfig: MediaConfig = {
  title: "Anime",
  searchPlaceholder: "Search your anime collection...",
  statusOptions: {
    completed: "Watched",
    progress: "Watching",
    planned: "Planned",
  },
  cardComponent: AnimeCard,
  useStore: () => {
    const store = useAnimeStore();
    return {
      results: store.animeResults,
      completed: store.completed,
      progress: store.progress,
      planned: store.planned,
    };
  },
  sortOptions: ["Title", "Rating"],
};

export const bookConfig: MediaConfig = {
  title: "Books",
  searchPlaceholder: "Search your book collection...",
  statusOptions: {
    completed: "Read",
    progress: "Reading",
    planned: "Planned",
  },
  cardComponent: BookCard,
  useStore: () => {
    const store = useBookStore();
    return {
      results: store.bookResults,
      completed: store.completed,
      progress: store.progress,
      planned: store.planned,
    };
  },
  sortOptions: ["Title", "Rating"],
};

export const mangaConfig: MediaConfig = {
  title: "Manga",
  searchPlaceholder: "Search your manga collection...",
  statusOptions: {
    completed: "Read",
    progress: "Reading",
    planned: "Planned",
  },
  cardComponent: MangaCard,
  useStore: () => {
    const store = useMangaStore();
    return {
      results: store.mangaResults,
      completed: store.completed,
      progress: store.progress,
      planned: store.planned,
    };
  },
  sortOptions: ["Title", "Rating"],
};
