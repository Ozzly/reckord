import React from "react";
import { NavLink } from "react-router";
import { useSearchStore } from "../stores/searchUIStore.js";
import { PiBooks } from "react-icons/pi";
import { FaTv, FaPlayCircle } from "react-icons/fa";
import { BiCameraMovie } from "react-icons/bi";
import { IoHomeOutline, IoReaderOutline } from "react-icons/io5";

type Page = "books" | "anime" | "manga" | "movies" | "shows" | "/";

interface props {
  isOpen: boolean;
  onClose: () => void;
}
function Sidebar({ isOpen, onClose }: props) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-ctp-crust opacity-60 z-40 md:hidden w-full h-full"
          onClick={onClose}
        />
      )}

      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 flex-shrink-0 h-full border-r-1 border-ctp-surface0 overflow-hidden md:relative md:translate-x-0 fixed left-0 top-0 z-50 transition-all duration-300 bg-ctp-base`}
      >
        <div className="flex flex-col m-3 text-ctp-text">
          <SidebarPageItem page="/" onClose={onClose} />
          <SidebarPageItem page="books" onClose={onClose} />
          <SidebarPageItem page="anime" onClose={onClose} />
          <SidebarPageItem page="manga" onClose={onClose} />
          <SidebarPageItem page="movies" onClose={onClose} />
          <SidebarPageItem page="shows" onClose={onClose} />
        </div>
      </div>
    </>
  );
}

interface SidebarPageItemProps {
  page: Page;
  onClose: () => void;
}

const pageDisplayData: Record<
  Page,
  { label: string; icon: React.ReactNode; disabled?: boolean }
> = {
  books: { label: "Books", icon: <PiBooks size={20} /> },
  anime: { label: "Anime", icon: <FaPlayCircle size={20} /> },
  manga: {
    label: "Manga",
    icon: <IoReaderOutline size={20} />,
  },
  movies: {
    label: "Movies",
    icon: <BiCameraMovie size={20} />,
    disabled: true,
  },
  shows: { label: "TV Shows", icon: <FaTv size={20} />, disabled: true },
  "/": { label: "Home", icon: <IoHomeOutline size={20} /> },
};

function SidebarPageItem({ page, onClose }: SidebarPageItemProps) {
  const setSearchCategory = useSearchStore((state) => state.setSearchCategory);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  function handleClick(isActive: boolean) {
    if (page !== "/") {
      if (isActive) {
        setSearchTerm("");
      } else {
        setSearchCategory(page);
      }
    }
    onClose();
  }

  return (
    <NavLink to={`${page}`}>
      {({ isActive }) => (
        <div
          className={`p-1 hover:bg-ctp-surface0 w-full rounded-lg ${
            isActive && "font-bold bg-ctp-surface1 text-ctp-mauve"
          } `}
          onClick={() => handleClick(isActive)}
        >
          <div
            className={`flex items-center gap-3 p-1 ${
              pageDisplayData[page].disabled && "line-through"
            }`}
          >
            {pageDisplayData[page].icon} {pageDisplayData[page].label}
          </div>
        </div>
      )}
    </NavLink>
  );
}

export default Sidebar;
