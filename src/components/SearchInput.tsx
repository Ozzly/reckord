import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { IoSearch } from "react-icons/io5";

interface SearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder: string;
  debounce?: number;
}

function Search({
  searchTerm,
  setSearchTerm,
  placeholder,
  debounce,
}: SearchProps) {
  const [localSearchTerm, setLocalSearchTerm] = React.useState(searchTerm);
  const [searchDebounce] = useDebounce(localSearchTerm, debounce || 1000);

  useEffect(() => {
    setSearchTerm(searchDebounce);
  }, [searchDebounce]);

  return (
    <div className="flex items-center border-3 border-ctp-surface0 rounded-xl focus-within:border-ctp-mauve transition-colors text-ctp-text h-11">
      <div className="p-2">
        <input
          type="text"
          placeholder={placeholder}
          value={localSearchTerm}
          onChange={(event) => {
            setLocalSearchTerm(event.target.value);
            event.target.value === "" && setSearchTerm("");
          }}
          className="focus:outline-none w-3xs sm:w-sm"
        />
        <button
          onClick={() => {
            setLocalSearchTerm("");
            setSearchTerm("");
          }}
          className={localSearchTerm ? "opacity-100" : "opacity-0"}
        >
          ✕
        </button>
      </div>
      <div className="flex items-center justify-center bg-ctp-surface0 h-full w-10 rounded-r-[9px] active:bg-ctp-surface1 transition-colors duration-600">
        <IoSearch size={20} />
      </div>
    </div>
  );
}

export default Search;
