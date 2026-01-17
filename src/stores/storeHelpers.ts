import moment from "moment";
import type { Anime, Book, GenericStatus, Manga, Movie } from "../types.js";

export function loadFromStorage<T>(key: string): T[] {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

type MediaItems = Anime | Book | Manga | Movie;

export function addItemToList<T extends MediaItems>(
  status: GenericStatus,
  item: T,
  currentList: T[],
  prefix: string,
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
  prefix: string,
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
  currentList: T[],
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
  list: T[],
): string | null {
  if (!list) return null;
  return list.find((item) => item.id === id)?.dateAdded || null;
}

export async function fetchQuery<T extends MediaItems>(
  query: string,
  transformApiData: (data: any) => T,
): Promise<{ error: string | null; result: T[] }> {
  try {
    const response = await fetch(query);
    if (!response.ok) {
      return {
        error: `Error: ${response.status} ${response.statusText}`,
        result: [],
      };
    }
    const { data } = await response.json();
    if (!data) {
      return { error: null, result: [] };
    }
    const transformedData = data.map(transformApiData);

    let uniqueData = transformedData.filter(
      (item: T, index: number, self: T[]) => {
        return index === self.findIndex((i) => i.id === item.id);
      },
    );
    return { error: null, result: uniqueData };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      result: [],
    };
  }
}
