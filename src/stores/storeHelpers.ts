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

export function removeItemFromList<T extends MediaItems>(
  id: T["id"],
  status: GenericStatus,
  currentList: T[],
  prefix: string
) {
  const updatedList = currentList.filter((item) => item.id !== id);
  const storageKey = `${prefix}_${status}`;
  localStorage.setItem(storageKey, JSON.stringify(updatedList));
  return updatedList;
}

export function updateProgressValue<T extends MediaItems>(
  id: T["id"],
  updatedProgress: number | null,
  storageKey: string,
  currentList: T[]
) {
  const index = currentList.findIndex((item) => item.id === id);
  if (index === -1) return;

  const currentItem = currentList[index];
  const updatedItem = {
    ...currentItem,
    progressValue: updatedProgress,
  } as T;
  const updatedList = [
    ...currentList.slice(0, index),
    updatedItem,
    ...currentList.slice(index + 1),
  ];
  localStorage.setItem(storageKey, JSON.stringify(updatedList));
  return updatedList;
}

export function getDateAdded<T extends MediaItems>(
  id: T["id"],
  list: T[]
): string | null {
  if (!list) return null;
  return list.find((item) => item.id === id)?.dateAdded || null;
}
