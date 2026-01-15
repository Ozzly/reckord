import type { Book, GenericStatus } from "../types.js";
import { useBookStore } from "../stores/bookStore.js";
import MediaCard from "./MediaCard.js";
import StatusWithExtraInfo from "./StatusWithExtraInfo.js";
import PublicRating from "./PublicRating.js";
import { bookConfig } from "../configs/mediaConfigs.js";

interface BookCardProps {
  item: Book;
}

function BookCard({ item: book }: BookCardProps) {
  const {
    id,
    title,
    author_name,
    edition_count,
    first_publish_year,
    cover_i,
    pages,
    score,
  } = book;

  const currentStatus = useBookStore((state) => state.getBookStatus(id));
  const dateAdded = useBookStore((state) =>
    state.getDateAdded(id, currentStatus as GenericStatus)
  );
  const currentPage = useBookStore((state) => state.getCurrentPage(id));
  const removeBookFromList = useBookStore((state) => state.removeBookFromList);
  const addBookToList = useBookStore((state) => state.addBookToList);
  const setCurrentPage = useBookStore((state) => state.setCurrentPage);

  function getButtonText(): string {
    switch (currentStatus) {
      case "completed":
        return "Read";
      case "progress":
        return "Reading";
      case "planned":
        return "Planned";
      default:
        return "Mark Read";
    }
  }

  function onStatusChange(status: GenericStatus | null) {
    if (currentStatus) {
      removeBookFromList(id, currentStatus);
    }
    if (status === null) return;
    addBookToList(book, status);
  }

  function onCountChange(newCount: number) {
    setCurrentPage(id, newCount);
  }

  return (
    <MediaCard
      coverImage={
        cover_i
          ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
          : "/no-cover-image.png"
      }
      alt={title}
    >
      <h2 className="font-bold line-clamp-2 leading-tight" title={title}>
        {title}
      </h2>
      <p className="text-sm mb-1 line-clamp-2">{author_name.join(", ")}</p>
      <p>{first_publish_year}</p>
      <PublicRating score={score} />
      <p>{edition_count} editions</p>
      <p title="Page median across editions">
        {pages ? `${pages}*` : "N/A"} pages
      </p>

      <div className="absolute bottom-0 w-full">
        <StatusWithExtraInfo
          status={currentStatus}
          dateAdded={dateAdded}
          count={currentPage || 0}
          maxCount={pages}
          buttonText={getButtonText()}
          onStatusChange={onStatusChange}
          onCountChange={onCountChange}
          statusOptions={bookConfig.statusOptions}
        />
      </div>
    </MediaCard>
  );
}

export default BookCard;
