import React, { useMemo } from "react";
import { useSearchStore } from "../stores/searchUIStore.js";
import { BarLoader } from "react-spinners";
import { RadioGroup } from "radix-ui";
import { Select } from "radix-ui";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { FaSortAlphaDown, FaSortNumericDownAlt } from "react-icons/fa";
import Search from "./SearchInput.js";
import type { MediaConfig } from "../configs/mediaConfigs.js";

interface ToggleGroupItemProps {
  value: string;
  title: string;
  statusOptions: {
    completed: string;
    progress: string;
    planned: string;
  };
}

function ToggleGroupItem({
  value,
  title,
  statusOptions,
}: ToggleGroupItemProps) {
  function getStyle() {
    const baseStyle =
      "border-3 rounded-lg px-4 py-1 data-[state=checked]:text-ctp-base hover:brightness-120 transition-all duration-400";
    switch (value) {
      case "All":
        return `${baseStyle} border-ctp-mauve data-[state=checked]:bg-ctp-mauve text-ctp-mauve`;
      case statusOptions.completed:
        return `${baseStyle} border-ctp-blue data-[state=checked]:bg-ctp-blue text-ctp-blue`;
      case statusOptions.progress:
        return `${baseStyle} border-ctp-peach data-[state=checked]:bg-ctp-peach text-ctp-peach`;
      case statusOptions.planned:
        return `${baseStyle} border-ctp-red data-[state=checked]:bg-ctp-red text-ctp-red`;
      default:
        return baseStyle;
    }
  }
  return (
    <RadioGroup.Item
      value={value}
      aria-label={`Select ${value} ${title}`}
      className={getStyle()}
    >
      {value}
    </RadioGroup.Item>
  );
}

function SelectItem({ value }: { value: string }) {
  return (
    <Select.Item
      value={value}
      className="hover:bg-ctp-surface1 rounded-md py-1 px-2 data-[state=checked]:text-ctp-mauve data-[state=checked]:font-bold"
    >
      <Select.ItemText>
        <div className="flex items-center gap-2">
          {value}
          {value === "Title" ? <FaSortAlphaDown /> : <FaSortNumericDownAlt />}
        </div>
      </Select.ItemText>
    </Select.Item>
  );
}

function MediaPageTemplate({ config }: { config: MediaConfig }) {
  const globalSearchTerm = useSearchStore((state) => state.searchTerm);
  const isLoading = useSearchStore((state) => state.isLoading);

  const { results, completed, progress, planned } = config.useStore();

  const [summarySearchTerm, setSummarySearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("All");
  const [sortBy, setSortBy] = React.useState<string>(
    config.sortOptions[0] || "Title"
  );

  const mediaSummary = useMemo(() => {
    let mediaList: any[] = [];

    switch (filterStatus) {
      case "All":
        mediaList = [...completed, ...(progress || []), ...planned];
        break;
      case config.statusOptions.completed:
        mediaList = [...completed];
        break;
      case config.statusOptions.progress:
        mediaList = [...(progress || [])];
        break;
      case config.statusOptions.planned:
        mediaList = [...planned];
        break;
    }

    if (summarySearchTerm !== "") {
      mediaList = mediaList.filter((item) =>
        item.title.toLowerCase().includes(summarySearchTerm.toLowerCase())
      );
    }

    if (sortBy === "Title") {
      mediaList.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "Rating") {
      mediaList.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return mediaList;
  }, [filterStatus, completed, progress, planned, summarySearchTerm, sortBy]);

  const CardComponent = config.cardComponent;

  return (
    <div className="flex justify-center">
      {globalSearchTerm === "" ? (
        <div className="flex flex-col items-center">
          <div className="text-ctp-text font-bold text-xl mb-2 ml-2">
            Your {config.title} Collection
          </div>
          {/* Summary Toolbar */}
          <div className="flex flex-wrap gap-2 items-center justify-center mb-4 max-w-full p-2">
            <div>
              <Search
                searchTerm={summarySearchTerm}
                setSearchTerm={setSummarySearchTerm}
                placeholder={config.searchPlaceholder}
                debounce={300}
              />
            </div>
            <div>
              <RadioGroup.Root
                defaultValue="All"
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value)}
                className="flex flex-wrap gap-2 justify-center"
              >
                <ToggleGroupItem
                  value="All"
                  title={config.title}
                  statusOptions={config.statusOptions}
                />
                <ToggleGroupItem
                  value={config.statusOptions.completed}
                  title={config.title}
                  statusOptions={config.statusOptions}
                />
                <ToggleGroupItem
                  value={config.statusOptions.progress}
                  title={config.title}
                  statusOptions={config.statusOptions}
                />
                <ToggleGroupItem
                  value={config.statusOptions.planned}
                  title={config.title}
                  statusOptions={config.statusOptions}
                />
              </RadioGroup.Root>
            </div>
            <div>
              <Select.Root
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value as "Title" | "Rating");
                }}
              >
                <Select.Trigger
                  className="text-ctp-text border-3 border-ctp-surface0 rounded-lg flex items-center px-3 py-1 gap-2 hover:brightness-120 transition-all duration-400 justify-between"
                  aria-label="Sort By"
                >
                  <Select.Value>Sort: {sortBy}</Select.Value>
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
                      <SelectItem value="Title" />
                      <SelectItem value="Rating" />
                    </Select.Viewport>
                    <Select.ScrollDownButton className="SelectScrollButton">
                      <ChevronDownIcon />
                    </Select.ScrollDownButton>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {mediaSummary.length === 0 ? (
              <div className="text-ctp-text text-xl text-center">
                <p>Your {config.title} collection is empty.</p>
                <p>
                  Adjust your filters or try searching for{" "}
                  {config.title.toLocaleLowerCase()} to add.
                </p>
              </div>
            ) : (
              mediaSummary.map((item) => (
                <CardComponent key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      ) : isLoading ? (
        <div>
          <h2 className="text-ctp-text text-center font-bold text-xl mb-10">
            Fetching results for "{globalSearchTerm}"...
          </h2>

          <BarLoader loading={true} color="#cba6f7" width="100%" />
        </div>
      ) : (
        <div>
          <h2 className="text-ctp-text text-center font-bold text-xl mb-4">
            Results for "{globalSearchTerm}"
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {results.map((item) => (
              <CardComponent key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaPageTemplate;
