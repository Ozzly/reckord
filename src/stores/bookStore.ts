import { create } from "zustand";
import type { Book, GenericStatus } from "../types.js";
import moment from "moment";
import { addItemToList, loadFromStorage } from "./storeHelpers.js";

const API_BASE_URL = "https://openlibrary.org";
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
  },
};

const transformAPIData = (data: any): Book => {
  const scoreOfTen = data.ratings_average ? data.ratings_average * 2 : null;
  return {
    id: data.key,
    title: data.title,
    cover_i: data.cover_i,
    first_publish_year: data.first_publish_year,
    author_name: data.author_name || [],
    edition_count: data.edition_count,
    pages: data.number_of_pages_median,
    score: scoreOfTen,
  };
};

type BookStore = {
  isLoading: boolean;
  bookResults: Book[];
  fetchBooksQuery: (searchTerm: string) => Promise<void>;
  completed: Book[];
  planned: Book[];
  progress: Book[];
  getBookStatus: (id: string) => GenericStatus | null;
  addBookToList: (book: Book, status: GenericStatus) => void;
  removeBookFromList: (id: string, status: GenericStatus) => void;
  getDateAdded: (id: string) => string | null;
  getCurrentPage: (id: string) => number | null;
  setCurrentPage: (id: string, page: number) => void;
};

export const useBookStore = create<BookStore>((set, get) => ({
  isLoading: true,
  bookResults: [],

  completed: loadFromStorage<Book>("books_completed"),
  progress: loadFromStorage<Book>("books_progress"),
  planned: loadFromStorage<Book>("books_planned"),

  addBookToList: (book: Book, status: GenericStatus) => {
    const updatedList = addItemToList<Book>(
      status,
      book,
      get()[status],
      "books"
    );
    if (!updatedList) return;
    set({ [status]: updatedList });
  },

  getBookStatus: (id: string): GenericStatus | null => {
    const {
      completed: completedBooks,
      planned: planToReadBooks,
      progress: booksProgress,
    } = get();

    if (completedBooks.some((book) => book.id === id)) return "completed";
    if (booksProgress.some((book) => book.id === id)) return "progress";
    if (planToReadBooks.some((book) => book.id === id)) return "planned";

    return null;
  },

  removeBookFromList: (id: string, status: GenericStatus) => {
    let currentList: Book[];
    let storageKey: string;

    switch (status) {
      case "completed":
        currentList = get().completed;
        storageKey = "books_completed";
        break;
      case "progress":
        currentList = get().progress;
        storageKey = "books_progress";
        break;
      case "planned":
        currentList = get().planned;
        storageKey = "books_planned";
        break;
      default:
        return;
    }

    const updatedList = currentList.filter((b) => b.id !== id);

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

    localStorage.setItem(storageKey, JSON.stringify(updatedList));
  },

  getDateAdded: (id: string): string | null => {
    const { completed: completedBooks } = get();
    return completedBooks.find((book) => book.id === id)?.dateAdded || null;
  },

  getCurrentPage: (id: string): number | null => {
    const { progress: booksProgress } = get();
    return booksProgress.find((book) => book.id === id)?.progressValue || null;
  },

  setCurrentPage: (id: string, page: number) => {
    const { progress: booksProgress } = get();
    const index = booksProgress.findIndex((b) => b.id === id);
    if (index === -1) return;

    const currentBook = booksProgress[index];
    const updatedBook = { ...currentBook, progressValue: page } as Book;
    const updatedList = [
      ...booksProgress.slice(0, index),
      updatedBook,
      ...booksProgress.slice(index + 1),
    ];
    set({ progress: updatedList });

    localStorage.setItem("books_progress", JSON.stringify(updatedList));
  },

  fetchBooksQuery: async (searchTerm) => {
    set({ isLoading: true });

    try {
      const endpoint = `${API_BASE_URL}/search.json?title=${encodeURIComponent(
        searchTerm
      )}&fields=number_of_pages_median,ratings_average,key,title,cover_i,first_publish_year,author_name,edition_count`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();
      const transformedData = data.docs.map(transformAPIData);

      if (data.Response === "False") {
        // setErrorMessage(data.Error || "Failed to fetch movies");
        set({ bookResults: [] });
        return;
      }

      set({ bookResults: transformedData || [] });
    } catch (error) {
      console.log(`Error fetching book: ${error}`);
      //   setErrorMessage("Error fetching books.");
    } finally {
      set({ isLoading: false });
      console.log(`Finished fetching books`);
    }
  },
}));
