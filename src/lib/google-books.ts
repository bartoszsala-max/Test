import type { GoogleBook, Book } from "@/types";

const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes";
const OPEN_LIBRARY_BASE = "https://openlibrary.org";

function getApiKey(): string { return process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY ?? ""; }

function buildCoverUrl(imageLinks?: { thumbnail?: string; smallThumbnail?: string }): string | null {
  if (!imageLinks) return null;
  const url = imageLinks.thumbnail ?? imageLinks.smallThumbnail;
  if (!url) return null;
  return url.replace("http://", "https://");
}

function extractIsbn(identifiers?: Array<{ type: string; identifier: string }>): string | null {
  if (!identifiers) return null;
  const isbn13 = identifiers.find((i) => i.type === "ISBN_13");
  const isbn10 = identifiers.find((i) => i.type === "ISBN_10");
  return isbn13?.identifier ?? isbn10?.identifier ?? null;
}

export function googleBookToBook(gb: GoogleBook): Omit<Book, "id" | "user_id" | "status" | "wishlist_year" | "reading_format" | "start_date" | "end_date" | "personal_rating" | "personal_review" | "sort_order" | "created_at" | "updated_at"> {
  const info = gb.volumeInfo;
  return {
    title: info.title,
    authors: info.authors ?? [],
    cover_url: buildCoverUrl(info.imageLinks),
    isbn: extractIsbn(info.industryIdentifiers),
    page_count: info.pageCount ?? null,
    description: info.description ?? null,
    categories: info.categories ?? null,
    avg_rating: info.averageRating ?? null,
    published_date: info.publishedDate ?? null,
    preview_link: info.previewLink ?? null,
  };
}

export async function searchGoogleBooks(query: string, maxResults = 5): Promise<GoogleBook[]> {
  const key = getApiKey();
  const params = new URLSearchParams({ q: query, maxResults: String(maxResults), printType: "books", ...(key ? { key } : {}) });
  const res = await fetch(`${GOOGLE_BOOKS_BASE}?${params}`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.items ?? []) as GoogleBook[];
}

export async function searchOpenLibrary(query: string, limit = 5): Promise<GoogleBook[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit), fields: "key,title,author_name,cover_i,number_of_pages_median,first_publish_year,isbn,subject" });
  const res = await fetch(`${OPEN_LIBRARY_BASE}/search.json?${params}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.docs ?? []).slice(0, limit).map((doc: Record<string, unknown>) => ({
    id: String(doc.key),
    volumeInfo: {
      title: doc.title as string,
      authors: (doc.author_name as string[]) ?? [],
      imageLinks: doc.cover_i ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` } : undefined,
      pageCount: doc.number_of_pages_median as number | undefined,
      publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
      industryIdentifiers: (doc.isbn as string[] | undefined) ? [{ type: "ISBN_13", identifier: (doc.isbn as string[])[0] }] : undefined,
      categories: (doc.subject as string[] | undefined)?.slice(0, 3),
    },
  })) as GoogleBook[];
}

export async function searchBooks(query: string): Promise<GoogleBook[]> {
  const results = await searchGoogleBooks(query);
  if (results.length > 0) return results;
  return searchOpenLibrary(query);
}
