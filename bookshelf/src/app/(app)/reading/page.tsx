"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BookOpen, Headphones, Tablet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/book-cover";
import { FinishBookDialog } from "@/components/finish-book-dialog";
import { getBooks } from "@/lib/books";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Book, ReadingFormat } from "@/types";

const FORMAT_ICONS: Record<ReadingFormat, React.ComponentType<{ className?: string }>> = {
  paper: BookOpen,
  kindle: Tablet,
  audiobook: Headphones,
};

export default function ReadingPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [finishBook, setFinishBook] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      const data = await getBooks("in_reading");
      setBooks(data);
    } catch {
      toast({ title: "Failed to load books", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-charcoal dark:text-ivory">Currently Reading</h1>
        <p className="text-sm text-charcoal/60 dark:text-ivory/60 mt-0.5">
          {books.length} book{books.length !== 1 ? "s" : ""} in progress
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-charcoal/8 dark:border-ivory/8">
              <div className="skeleton w-20 h-28 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="skeleton h-5 rounded w-4/5" />
                <div className="skeleton h-4 rounded w-3/5" />
                <div className="skeleton h-3 rounded w-2/5 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-charcoal/20 dark:text-ivory/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-charcoal/60 dark:text-ivory/60">
            No books in progress
          </h3>
          <p className="text-sm text-charcoal/40 dark:text-ivory/40 mt-1">
            Promote a book from your wishlist to start reading.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book) => {
            const FormatIcon = book.reading_format ? FORMAT_ICONS[book.reading_format] : BookOpen;
            return (
              <div
                key={book.id}
                className="group relative flex flex-col bg-white dark:bg-charcoal/60 rounded-2xl border border-charcoal/8 dark:border-ivory/8 shadow-sm overflow-hidden book-card"
              >
                {/* Cover hero */}
                <Link href={`/reading/${book.id}`} className="relative h-48 shrink-0 overflow-hidden">
                  {book.cover_url ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-40"
                      style={{ backgroundImage: `url(${book.cover_url})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-sienna/20 to-teal/20" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookCover
                      src={book.cover_url}
                      title={book.title}
                      className="h-36 w-24 shadow-xl"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex flex-col flex-1 p-4">
                  <Link href={`/reading/${book.id}`} className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-charcoal dark:text-ivory leading-snug line-clamp-2 hover:text-sienna transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-charcoal/60 dark:text-ivory/60 mt-0.5 truncate">
                      {book.authors?.join(", ") ?? "Unknown author"}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-xs text-charcoal/50 dark:text-ivory/50">
                      <FormatIcon className="h-3.5 w-3.5" />
                      <span>Since {formatDate(book.start_date)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setFinishBook(book)}
                      className="text-xs"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Finish
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FinishBookDialog
        book={finishBook}
        onOpenChange={(open) => !open && setFinishBook(null)}
        onSuccess={fetchBooks}
      />
    </div>
  );
}
