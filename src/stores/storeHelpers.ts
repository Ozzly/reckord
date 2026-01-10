import moment from "moment";
import type { Anime, Book, GenericStatus, Manga } from "../types.js";

export function loadFromStorage<T>(key: string): T[] {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

type MediaItems = Anime | Book | Manga;

export function addItemToList<T extends MediaItems>(
  status: GenericStatus,
  item: T,
  currentList: T[],
  prefix: string
) {
  if (currentList.some((i) => i.id === item.id)) return;

  let updatedItem = { ...item, dateAdded: moment().format("ll") };
  if (status === "progress") {
    updatedItem.progressValue = 1;
  }
  const updatedList = [...currentList, updatedItem];

  const storageKey = `${prefix}_${status}`;
  localStorage.setItem(storageKey, JSON.stringify(updatedList));

  return updatedList;
}
