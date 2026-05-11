"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Camera, Loader2, Trash2, BookOpen, Headphones, Tablet } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookCover } from "@/components/book-cover";
import { ExcerptCard } from "@/components/excerpt-card";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { getBook, getExcerpts, getThoughts, addExcerpt, addThought, deleteThought } from "@/lib/books";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Book, Excerpt, Thought, ReadingFormat } from "@/types";

const FORMAT_ICONS: Record<ReadingFormat, React.ComponentType<{ className?: string }>> = {
  paper: BookOpen,
  kindle: Tablet,
  audiobook: Headphones,
};

export default function BookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);

  const [book, setBook] = useState<Book | null>(null);
  const [excerpts, setExcerpts] = useState<Excerpt[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExcerptText, setNewExcerptText] = useState("");
  const [newExcerptPage, setNewExcerptPage] = useState("");
  const [addingExcerpt, setAddingExcerpt] = useState(false);
  const [newThought, setNewThought] = useState("");
  const [addingThought, setAddingThought] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchData = useCallback(async () => {
    const [bookData, excerptData, thoughtData] = await Promise.all([
      getBook(bookId),
      getExcerpts(bookId),
      getThoughts(bookId),
    ]);
    setBook(bookData);
    setExcerpts(excerptData);
    setThoughts(thoughtData);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAddExcerpt() {
    if (!newExcerptText.trim() || !book) return;
    setAddingExcerpt(true);
    try {
      const excerpt = await addExcerpt(book.id, newExcerptText.trim(), newExcerptPage.trim() || undefined);
      setExcerpts((prev) => [excerpt, ...prev]);
      setNewExcerptText("");
      setNewExcerptPage("");
      toast({ title: "Excerpt saved!", variant: "success" });
    } catch {
      toast({ title: "Failed to save excerpt", variant: "error" });
    } finally {
      setAddingExcerpt(false);
    }
  }

  async function handleAddThought() {
    if (!newThought.trim() || !book) return;
    setAddingThought(true);
    try {
      const thought = await addThought(book.id, newThought.trim());
      setThoughts((prev) => [thought, ...prev]);
      setNewThought("");
      toast({ title: "Thought saved!", variant: "success" });
    } catch {
      toast({ title: "Failed to save thought", variant: "error" });
    } finally {
      setAddingThought(false);
    }
  }

  async function handleDeleteThought(id: string) {
    if (!confirm("Delete this thought?")) return;
    try {
      await deleteThought(id);
      setThoughts((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast({ title: "Failed to delete thought", variant: "error" });
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !book) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookId", book.id);
      const res = await fetch("/api/ai/ocr", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { excerpt } = await res.json();
      setExcerpts((prev) => [excerpt, ...prev]);
      toast({ title: "Photo uploaded and text extracted!", variant: "success" });
    } catch {
      toast({ title: "Photo upload failed", variant: "error" });
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  const backHref = book?.status === "read" ? "/library" : "/reading";
  const backLabel = book?.status === "read" ? "Library" : "Reading";
  const FormatIcon = book?.reading_format ? FORMAT_ICONS[book.reading_format] : BookOpen;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 rounded w-24" />
        <div className="skeleton h-52 rounded-2xl" />
        <div className="skeleton h-10 rounded w-64" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-charcoal/60 dark:text-ivory/60">Book not found.</p>
        <Link href="/reading"><Button variant="ghost" className="mt-4">← Back to Reading</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 dark:text-ivory/60 hover:text-sienna transition-colors mb-5">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="relative rounded-2xl overflow-hidden mb-6">
        {book.cover_url && (
          <div className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-30" style={{ backgroundImage: `url(${book.cover_url})` }} />
        )}
        <div className="relative bg-gradient-to-r from-charcoal/5 to-transparent dark:from-charcoal/40 rounded-2xl p-6 flex gap-6 items-end">
          <BookCover src={book.cover_url} title={book.title} className="w-28 h-40 shrink-0 shadow-2xl" priority />
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {book.status === "in_reading" && <Badge variant="teal">Reading</Badge>}
              {book.status === "read" && <Badge variant="default">Read</Badge>}
              {book.reading_format && (
                <Badge variant="secondary" className="gap-1">
                  <FormatIcon className="h-3 w-3" />
                  {book.reading_format}
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal dark:text-ivory leading-tight mb-1">{book.title}</h1>
            <p className="text-charcoal/70 dark:text-ivory/70 text-sm mb-2">{book.authors?.join(", ") ?? "Unknown author"}</p>
            {book.personal_rating && <StarRating value={book.personal_rating} readonly size="sm" />}
            {book.avg_rating && !book.personal_rating && (
              <p className="text-xs text-charcoal/50 dark:text-ivory/50">Avg. rating: {book.avg_rating}/5</p>
            )}
            <div className="flex gap-4 mt-2 text-xs text-charcoal/50 dark:text-ivory/50">
              {book.start_date && <span>Started {formatDate(book.start_date)}</span>}
              {book.end_date && <span>Finished {formatDate(book.end_date)}</span>}
              {book.page_count && <span>{book.page_count} pages</span>}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="excerpts">
        <TabsList className="mb-5">
          <TabsTrigger value="excerpts">Excerpts <span className="ml-1.5 text-xs opacity-60">{excerpts.length}</span></TabsTrigger>
          <TabsTrigger value="thoughts">Thoughts <span className="ml-1.5 text-xs opacity-60">{thoughts.length}</span></TabsTrigger>
          {book.description && <TabsTrigger value="about">About</TabsTrigger>}
        </TabsList>

        <TabsContent value="excerpts" className="space-y-4">
          <div className="rounded-xl border border-charcoal/10 dark:border-ivory/10 bg-white dark:bg-charcoal/40 p-4 space-y-3">
            <Textarea placeholder="Paste or type an excerpt…" value={newExcerptText} onChange={(e) => setNewExcerptText(e.target.value)} rows={3} />
            <div className="flex items-center gap-2">
              <Input placeholder="Page ref (e.g. p. 42)" value={newExcerptPage} onChange={(e) => setNewExcerptPage(e.target.value)} className="flex-1 text-xs h-8" />
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                <Button type="button" size="icon" variant="outline" disabled={uploadingPhoto} asChild>
                  <span>{uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}</span>
                </Button>
              </label>
              <Button onClick={handleAddExcerpt} disabled={!newExcerptText.trim() || addingExcerpt} size="sm">
                {addingExcerpt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save
              </Button>
            </div>
            <p className="text-xs text-charcoal/40 dark:text-ivory/40">Or upload a photo of a page — AI will extract the text automatically.</p>
          </div>
          {excerpts.length === 0 ? (
            <p className="text-sm text-center text-charcoal/40 dark:text-ivory/40 py-8">No excerpts yet. Save your first passage above.</p>
          ) : (
            <div className="space-y-3">
              {excerpts.map((e) => (
                <ExcerptCard key={e.id} excerpt={e} book={book}
                  onDeleted={(id) => setExcerpts((prev) => prev.filter((x) => x.id !== id))}
                  onUpdated={(updated) => setExcerpts((prev) => prev.map((x) => x.id === updated.id ? updated : x))}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="thoughts" className="space-y-4">
          <div className="rounded-xl border border-charcoal/10 dark:border-ivory/10 bg-white dark:bg-charcoal/40 p-4 space-y-3">
            <Textarea placeholder="Write a personal thought or note…" value={newThought} onChange={(e) => setNewThought(e.target.value)} rows={4} />
            <Button onClick={handleAddThought} disabled={!newThought.trim() || addingThought} size="sm">
              {addingThought ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save thought
            </Button>
          </div>
          {thoughts.length === 0 ? (
            <p className="text-sm text-center text-charcoal/40 dark:text-ivory/40 py-8">No thoughts yet. Capture your impressions above.</p>
          ) : (
            <div className="space-y-3">
              {thoughts.map((t) => (
                <div key={t.id} className="group rounded-xl border border-charcoal/10 dark:border-ivory/10 bg-white dark:bg-charcoal/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-charcoal dark:text-ivory leading-relaxed whitespace-pre-wrap flex-1">{t.content}</p>
                    <Button size="icon-sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 shrink-0" onClick={() => handleDeleteThought(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs text-charcoal/40 dark:text-ivory/40 mt-2">{formatDate(t.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {book.description && (
          <TabsContent value="about">
            <div className="prose prose-sm max-w-none text-charcoal dark:text-ivory">
              <p className="leading-relaxed text-sm">{book.description}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {book.published_date && (
                <div className="rounded-lg bg-white dark:bg-charcoal/40 border border-charcoal/8 dark:border-ivory/8 p-3">
                  <p className="text-xs text-charcoal/50 dark:text-ivory/50">Published</p>
                  <p className="text-sm font-medium text-charcoal dark:text-ivory mt-0.5">{book.published_date}</p>
                </div>
              )}
              {book.page_count && (
                <div className="rounded-lg bg-white dark:bg-charcoal/40 border border-charcoal/8 dark:border-ivory/8 p-3">
                  <p className="text-xs text-charcoal/50 dark:text-ivory/50">Pages</p>
                  <p className="text-sm font-medium text-charcoal dark:text-ivory mt-0.5">{book.page_count}</p>
                </div>
              )}
              {book.avg_rating && (
                <div className="rounded-lg bg-white dark:bg-charcoal/40 border border-charcoal/8 dark:border-ivory/8 p-3">
                  <p className="text-xs text-charcoal/50 dark:text-ivory/50">Avg. Rating</p>
                  <p className="text-sm font-medium text-charcoal dark:text-ivory mt-0.5">{book.avg_rating} / 5</p>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
