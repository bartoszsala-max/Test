import { createClient } from "@/lib/supabase/client";
import type { Book, Excerpt, Thought, BookStatus, ReadingFormat } from "@/types";

// ── Books ────────────────────────────────────────────────────────────────────

export async function getBooks(status?: BookStatus): Promise<Book[]> {
  const supabase = createClient();
  let query = supabase
    .from("books")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data as Book[];
}

export async function getBook(id: string): Promise<Book | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Book;
}

export async function addBook(book: Omit<Book, "id" | "user_id" | "created_at" | "updated_at">): Promise<Book> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("books")
    .insert({ ...book, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Book;
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<Book> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("books")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Book;
}

export async function deleteBook(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw error;
}

export async function promoteToReading(
  id: string,
  format: ReadingFormat,
  startDate?: string
): Promise<Book> {
  return updateBook(id, {
    status: "in_reading",
    reading_format: format,
    start_date: startDate ?? new Date().toISOString().split("T")[0],
  });
}

export async function promoteToRead(
  id: string,
  personalRating?: number,
  personalReview?: string,
  endDate?: string
): Promise<Book> {
  return updateBook(id, {
    status: "read",
    personal_rating: personalRating ?? null,
    personal_review: personalReview ?? null,
    end_date: endDate ?? new Date().toISOString().split("T")[0],
  });
}

// ── Excerpts ─────────────────────────────────────────────────────────────────

export async function getExcerpts(bookId: string): Promise<Excerpt[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("excerpts")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Excerpt[];
}

export async function addExcerpt(
  bookId: string,
  text: string,
  pageRef?: string
): Promise<Excerpt> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("excerpts")
    .insert({ book_id: bookId, text, page_ref: pageRef ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as Excerpt;
}

export async function updateExcerpt(id: string, updates: Partial<Excerpt>): Promise<Excerpt> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("excerpts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Excerpt;
}

export async function deleteExcerpt(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("excerpts").delete().eq("id", id);
  if (error) throw error;
}

// ── Thoughts ─────────────────────────────────────────────────────────────────

export async function getThoughts(bookId: string): Promise<Thought[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("thoughts")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Thought[];
}

export async function addThought(bookId: string, content: string): Promise<Thought> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("thoughts")
    .insert({ book_id: bookId, content })
    .select()
    .single();
  if (error) throw error;
  return data as Thought;
}

export async function deleteThought(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("thoughts").delete().eq("id", id);
  if (error) throw error;
}
