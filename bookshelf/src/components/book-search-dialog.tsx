"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Plus, PenLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/book-cover";
import type { GoogleBook } from "@/types";
import { googleBookToBook } from "@/lib/google-books";
import { addBook } from "@/lib/books";
import { toast } from "@/hooks/use-toast";
import { currentYear } from "@/lib/utils";

interface BookSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookAdded: () => void;
  defaultYear?: number;
}

export function BookSearchDialog({ open, onOpenChange, onBookAdded, defaultYear }: BookSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim() || manualMode) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, manualMode]);

  async function handleAdd(gb: GoogleBook) {
    setAdding(gb.id);
    try {
      const bookData = googleBookToBook(gb);
      await addBook({
        ...bookData,
        status: "wishlist",
        wishlist_year: defaultYear ?? currentYear(),
        reading_format: null,
        start_date: null,
        end_date: null,
        personal_rating: null,
        personal_review: null,
        sort_order: 0,
      });
      toast({ title: "Added to wishlist!", variant: "success" });
      onBookAdded();
      onOpenChange(false);
      setQuery("");
      setResults([]);
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "error" });
    } finally {
      setAdding(null);
    }
  }

  async function handleManualAdd() {
    if (!manualTitle.trim()) return;
    setAdding("manual");
    try {
      await addBook({
        title: manualTitle.trim(),
        authors: manualAuthor.trim() ? [manualAuthor.trim()] : [],
        cover_url: null,
        isbn: null,
        page_count: null,
        description: null,
        categories: null,
        avg_rating: null,
        published_date: null,
        preview_link: null,
        status: "wishlist",
        wishlist_year: defaultYear ?? currentYear(),
        reading_format: null,
        start_date: null,
        end_date: null,
        personal_rating: null,
        personal_review: null,
        sort_order: 0,
      });
      toast({ title: "Added to wishlist!", variant: "success" });
      onBookAdded();
      onOpenChange(false);
      setManualTitle("");
      setManualAuthor("");
      setManualMode(false);
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "error" });
    } finally {
      setAdding(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a book</DialogTitle>
        </DialogHeader>

        {!manualMode ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40 dark:text-ivory/40" />
              <Input
                placeholder="Search by title or author…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-charcoal/40 dark:text-ivory/40" />
              )}
            </div>

            {results.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {results.map((gb) => {
                  const info = gb.volumeInfo;
                  const coverUrl = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
                  return (
                    <div
                      key={gb.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-charcoal/8 dark:border-ivory/8 hover:bg-charcoal/3 dark:hover:bg-ivory/3 transition-colors"
                    >
                      <div className="relative w-10 h-14 shrink-0">
                        <BookCover
                          src={coverUrl ? coverUrl.replace("http://", "https://") : null}
                          title={info.title}
                          className="w-10 h-14 rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal dark:text-ivory truncate">{info.title}</p>
                        <p className="text-xs text-charcoal/60 dark:text-ivory/60 truncate">
                          {info.authors?.join(", ") ?? "Unknown author"}
                        </p>
                        {info.publishedDate && (
                          <p className="text-xs text-charcoal/40 dark:text-ivory/40">{info.publishedDate.slice(0, 4)}</p>
                        )}
                      </div>
                      <Button
                        size="icon-sm"
                        onClick={() => handleAdd(gb)}
                        disabled={adding === gb.id}
                      >
                        {adding === gb.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {query.trim() && !searching && results.length === 0 && (
              <p className="text-sm text-center text-charcoal/50 dark:text-ivory/50 py-4">
                No results found.
              </p>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-charcoal/60 dark:text-ivory/60"
              onClick={() => setManualMode(true)}
            >
              <PenLine className="h-4 w-4" />
              Add manually
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Book title *"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              autoFocus
            />
            <Input
              placeholder="Author (optional)"
              value={manualAuthor}
              onChange={(e) => setManualAuthor(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setManualMode(false)} className="flex-1">
                Back to search
              </Button>
              <Button
                onClick={handleManualAdd}
                disabled={!manualTitle.trim() || adding === "manual"}
                className="flex-1"
              >
                {adding === "manual" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Add book
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
