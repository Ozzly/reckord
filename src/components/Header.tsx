import React, { useEffect } from "react";
import Search from "./SearchInput.js";
import { Select } from "radix-ui";
import { useSearchStore } from "../stores/searchUIStore.js";
import { useBookStore } from "../stores/bookStore.js";
import { useAnimeStore } from "../stores/animeStore.js";
import { useNavigate } from "react-router";

import { HiMenu } from "react-icons/hi";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import type { Category } from "../types.js";
import { useMangaStore } from "../stores/mangaStore.js";

interface props {
  onToggleSidebar: () => void;
}

function Header({ onToggleSidebar }: props) {
  const searchCategory = useSearchStore((state) => state.searchCategory);
  const setSearchCategory = useSearchStore((state) => state.setSearchCategory);

  const fetchBooksQuery = useBookStore((state) => state.fetchBooksQuery);
  const fetchAnimeQuery = useAnimeStore((state) => state.fetchAnimeQuery);
  const fetchMangaQuery = useMangaStore((state) => state.fetchMangaQuery);

  const setIsLoading = useSearchStore((state) => state.setIsLoading);

  const searchTerm = useSearchStore((state) => state.searchTerm);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  const navigate = useNavigate();

  useEffect(() => {
    handleSearchChange();
    searchTerm && navigate(`/${searchCategory}`);
  }, [searchCategory, searchTerm]);

  async function handleSearchChange() {
    setIsLoading(true);
    switch (searchCategory) {
      case "books":
        await fetchBooksQuery(searchTerm);
        break;
      case "anime":
        await fetchAnimeQuery(searchTerm);
        break;
      case "manga":
        await fetchMangaQuery(searchTerm);
        break;
    }
    setIsLoading(false);
  }

  return (
    <div className="w-full border-b-1 border-ctp-surface0 sticky top-0 bg-ctp-base z-10 text-ctp-text flex justify-center mt-1">
      <div className="flex my-3">
        <button>
          <HiMenu size={24} onClick={onToggleSidebar} />
        </button>
        {/* <Search
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder={`Searching by ${searchCategory}`}
        /> */}

        <Select.Root
          value={searchCategory}
          onValueChange={(value) => {
            setSearchCategory(value as Category);
            console.log(value);
            console.log(value as Category);
          }}
        >
          <Select.Trigger
            className="border-3 border-ctp-surface0 rounded-xl w-33 ml-3 flex items-center px-3 hover:border-ctp-mauve justify-between"
            aria-label="Category"
          >
            <Select.Value placeholder="Select a category..." />
            <Select.Icon className="SelectIcon">
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              position="popper"
              alignOffset={6}
              className="SelectContent z-10 bg-ctp-surface0 text-ctp-text rounded-lg show-lg p-3 border-2 border-ctp-surface1"
            >
              <Select.ScrollUpButton className="SelectScrollButton">
                <ChevronUpIcon />
              </Select.ScrollUpButton>
              <Select.Viewport className="">
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="manga">Manga</SelectItem>
                <SelectItem value="movies">Movies</SelectItem>
                <SelectItem value="shows">Shows</SelectItem>
              </Select.Viewport>
              <Select.ScrollDownButton className="SelectScrollButton">
                <ChevronDownIcon />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  );
}

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof Select.Item>,
  React.ComponentPropsWithoutRef<typeof Select.Item>
>(({ children, ...props }, forwardedRef) => {
  return (
    <Select.Item
      className={"hover:bg-ctp-surface1 rounded-md py-1 px-1.5"}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      {/* <Select.ItemIndicator className="SelectItemIndicator">
        <CheckIcon />
      </Select.ItemIndicator> */}
    </Select.Item>
  );
});

export default Header;
