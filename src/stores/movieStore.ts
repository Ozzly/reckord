import { create } from "zustand";
import type { GenericStatus, Movie } from "../types.js";
import {
  addItemToList,
  loadFromStorage,
  removeItemFromList,
} from "./storeHelpers.js";

type MovieStore = {
  results: Movie[];
  completed: Movie[];
  progress: Movie[];
  planned: Movie[];
};

export const useMovieStore = create<MovieStore>((set, get) => ({
  results: [],
  completed: loadFromStorage<Movie>("movie_completed"),
  progress: loadFromStorage<Movie>("movie_progress"),
  planned: loadFromStorage<Movie>("movie_planned"),

  addMovieToList: (movie: Movie, status: GenericStatus) => {
    const updatedList = addItemToList<Movie>(
      status,
      movie,
      get()[status],
      "movie",
    );
    if (!updatedList) return;
    set({ [status]: updatedList });
  },

  removeMovieFromList: (id: number, status: GenericStatus) => {
    const updatedList = removeItemFromList<Movie>(
      id,
      status,
      get()[status],
      "movie",
    );
    if (!updatedList) return;
    set({ [status]: updatedList });
  },
}));
