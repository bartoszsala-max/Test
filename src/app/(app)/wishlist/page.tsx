"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/book-cover";
import { BookSearchDialog } from "@/components/book-search-dialog";
import { PromoteToReadingDialog } from "@/components/promote-to-reading-dialog";
import { getBooks, deleteBook } from "@/lib/books";
import { toast } from "@/hooks/use-toast";
import { currentYear } from "@/lib/utils";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear());
  const [promoteBook, setPromoteBook] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      const data = await getBooks("wishlist");
      setBooks(data);
    } catch {
      toast({ title: "Failed to load books", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const years = Array.from(new Set(books.map((b) => b.wishlist_year ?? 0))).sort((a, b) => a - b);
  if (!years.includes(currentYear())) years.push(currentYear());
  years.sort((a, b) => a - b);

  const filteredBooks = books.filter((b) => (b.wishlist_year ?? 0) === selectedYear);

  async function handleDelete(book: Book) {
    if (!confirm(`Remove "${book.title}" from your wishlist?`)) return;
    try {
      await deleteBook(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      toast({ title: "Removed from wishlist", variant: "default" });
    } catch {
      toast({ title: "Failed to remove book", variant: "error" });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-charcoal dark:text-ivory">Wishlist</h1>
          <p className="text-sm text-charcoal/60 dark:text-ivory/60 mt-0.5">
            {books.length} book{books.length !== 1 ? "s" : ""} on your reading radar
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add book
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {years.map((year) => {
          const count = books.filter((b) => (b.wishlist_year ?? 0) === year).length;
          return (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedYear === year
                  ? "bg-sienna text-white shadow-sm"
                  : "bg-charcoal/8 dark:bg-ivory/8 text-charcoal/70 dark:text-ivory/70 hover:bg-charcoal/12 dark:hover:bg-ivory/12"
              )}
            >
              {year === 0 ? "Unscheduled" : year}
              {count > 0 && (
                <span className={cn("ml-1.5 text-xs", selectedYear === year ? "text-white/80" : "text-charcoal/40 dark:text-ivory/40")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton aspect-[2/3] rounded-xl" />
              <div className="skeleton h-4 rounded w-3/4" />
              <div className="skeleton h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-charcoal/20 dark:text-ivory/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-charcoal/60 dark:text-ivory/60">Nothing here yet</h3>
          <p className="text-sm text-charcoal/40 dark:text-ivory/40 mt-1 mb-6">
            Add books you want to read in {selectedYear === 0 ? "Unscheduled" : selectedYear}.
          </p>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add first book
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBooks.map((book) => (
            <div key={book.id} className="group book-card">
              <div className="relative">
                <BookCover src={book.cover_url} title={book.title} className="aspect-[2/3] w-full shadow-md" />
                <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button size="sm" onClick={() => setPromoteBook(book)} className="text-xs">
                    <BookOpen className="h-3.5 w-3.5" />
                    Start
                  </Button>
                  <Button size="icon-sm" variant="destructive" onClick={() => handleDelete(book)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 px-0.5">
                <p className="text-sm font-medium text-charcoal dark:text-ivory leading-snug line-clamp-2">{book.title}</p>
                <p className="text-xs text-charcoal/60 dark:text-ivory/60 mt-0.5 truncate">{book.authors?.join(", ") ?? "Unknown author"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookSearchDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onBookAdded={fetchBooks}
        defaultYear={selectedYear === 0 ? currentYear() : selectedYear}
      />
      <PromoteToReadingDialog
        book={promoteBook}
        onOpenChange={(open) => !open && setPromoteBook(null)}
        onSuccess={fetchBooks}
      />
    </div>
  );
}
