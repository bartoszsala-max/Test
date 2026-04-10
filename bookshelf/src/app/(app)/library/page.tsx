"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Library, SortAsc, BookOpen, Headphones, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/book-cover";
import { StarRating } from "@/components/star-rating";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBooks } from "@/lib/books";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Book, ReadingFormat } from "@/types";
import { cn } from "@/lib/utils";

type SortKey = "end_date" | "title" | "author" | "rating";

const FORMAT_ICONS: Record<ReadingFormat, React.ComponentType<{ className?: string }>> = {
  paper: BookOpen,
  kindle: Tablet,
  audiobook: Headphones,
};

function sortBooks(books: Book[], sort: SortKey): Book[] {
  return [...books].sort((a, b) => {
    switch (sort) {
      case "end_date":
        return (b.end_date ?? "").localeCompare(a.end_date ?? "");
      case "title":
        return a.title.localeCompare(b.title);
      case "author":
        return (a.authors?.[0] ?? "").localeCompare(b.authors?.[0] ?? "");
      case "rating":
        return (b.personal_rating ?? 0) - (a.personal_rating ?? 0);
    }
  });
}

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("end_date");
  const [view, setView] = useState<"grid" | "list">("grid");

  const fetchBooks = useCallback(async () => {
    try {
      const data = await getBooks("read");
      setBooks(data);
    } catch {
      toast({ title: "Failed to load books", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const sorted = sortBooks(books, sort);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-charcoal dark:text-ivory">Library</h1>
          <p className="text-sm text-charcoal/60 dark:text-ivory/60 mt-0.5">
            {books.length} book{books.length !== 1 ? "s" : ""} finished
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SortAsc className="h-3.5 w-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="end_date">Date finished</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-charcoal/15 dark:border-ivory/15 overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "px-2.5 py-1.5 text-xs transition-colors",
                view === "grid"
                  ? "bg-sienna text-white"
                  : "text-charcoal/60 dark:text-ivory/60 hover:bg-charcoal/5 dark:hover:bg-ivory/5"
              )}
            >
              Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "px-2.5 py-1.5 text-xs transition-colors",
                view === "list"
                  ? "bg-sienna text-white"
                  : "text-charcoal/60 dark:text-ivory/60 hover:bg-charcoal/5 dark:hover:bg-ivory/5"
              )}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton aspect-[2/3] rounded-xl" />
              <div className="skeleton h-4 rounded w-3/4" />
              <div className="skeleton h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <Library className="h-12 w-12 text-charcoal/20 dark:text-ivory/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-charcoal/60 dark:text-ivory/60">
            Your library is empty
          </h3>
          <p className="text-sm text-charcoal/40 dark:text-ivory/40 mt-1">
            Finished books will appear here.
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sorted.map((book) => (
            <Link key={book.id} href={`/library/${book.id}`} className="group book-card">
              <BookCover
                src={book.cover_url}
                title={book.title}
                className="aspect-[2/3] w-full shadow-md"
              />
              <div className="mt-2 px-0.5">
                <p className="text-sm font-medium text-charcoal dark:text-ivory leading-snug line-clamp-2 group-hover:text-sienna transition-colors">
                  {book.title}
                </p>
                <p className="text-xs text-charcoal/60 dark:text-ivory/60 mt-0.5 truncate">
                  {book.authors?.join(", ") ?? "Unknown"}
                </p>
                {book.personal_rating && (
                  <StarRating value={book.personal_rating} readonly size="sm" />
                )}
                {book.end_date && (
                  <p className="text-xs text-charcoal/40 dark:text-ivory/40 mt-0.5">
                    {formatDate(book.end_date)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((book) => {
            const FormatIcon = book.reading_format ? FORMAT_ICONS[book.reading_format] : BookOpen;
            return (
              <Link
                key={book.id}
                href={`/library/${book.id}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-charcoal/8 dark:border-ivory/8 bg-white dark:bg-charcoal/40 hover:border-sienna/30 transition-colors"
              >
                <BookCover
                  src={book.cover_url}
                  title={book.title}
                  className="w-12 h-16 shrink-0 rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal dark:text-ivory truncate hover:text-sienna transition-colors">
                    {book.title}
                  </p>
                  <p className="text-xs text-charcoal/60 dark:text-ivory/60 truncate">
                    {book.authors?.join(", ") ?? "Unknown"}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  {book.personal_rating && <StarRating value={book.personal_rating} readonly size="sm" />}
                  <div className="flex items-center gap-1.5 justify-end text-xs text-charcoal/40 dark:text-ivory/40">
                    <FormatIcon className="h-3 w-3" />
                    {book.end_date && <span>{formatDate(book.end_date)}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
