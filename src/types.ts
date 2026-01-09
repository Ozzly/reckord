export interface Book {
  id: string;
  title: string;
  author_name: string[];
  edition_count: number;
  first_publish_year: number;
  cover_i: number;
  progressValue?: number;
  dateAdded?: string;
  pages: number;
  score: number | null;
}

export type Category = "books" | "anime" | "manga" | "movies" | "shows";

export interface Anime {
  id: number;
  title: string;
  score: number;
  cover_image: string;
  episodes: number;
  year: number;
  release_season: string;
  studio: string; // Replace with array for multiple studios later
  dateAdded?: string;
  progressValue?: number;
  themes: string[];
  videoType: VideoType;
}

export type VideoType =
  | "TV"
  | "Movie"
  | "OVA"
  | "ONA"
  | "Music"
  | "Special"
  | "tv_special"
  | "pv";

export type AnimeStatus = "Watched" | "Watching" | "Planned";

export type GenericStatus = "completed" | "progress" | "planned";

export interface Manga {
  id: number;
  title: string;
  score: number;
  authors: string[];
  cover_image: string;
  type: string;
  chapters: number | null;
  volumes: number | null;
  releaseStatus: string;
  releaseYear: number | null;
  themes: string[];
  dateAdded?: string;
  progressValue?: number;
}
