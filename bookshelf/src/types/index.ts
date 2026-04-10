export type BookStatus = "wishlist" | "in_reading" | "read";
export type ReadingFormat = "paper" | "kindle" | "audiobook";

export interface Book {
  id: string;
  user_id: string;
  title: string;
  authors: string[];
  cover_url: string | null;
  isbn: string | null;
  page_count: number | null;
  description: string | null;
  categories: string[] | null;
  avg_rating: number | null;
  published_date: string | null;
  preview_link: string | null;
  status: BookStatus;
  wishlist_year: number | null;
  reading_format: ReadingFormat | null;
  start_date: string | null;
  end_date: string | null;
  personal_rating: number | null;
  personal_review: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Excerpt {
  id: string;
  book_id: string;
  text: string | null;
  page_ref: string | null;
  photo_url: string | null;
  ai_interpretation: string | null;
  ai_summary: string | null;
  created_at: string;
}

export interface Thought {
  id: string;
  book_id: string;
  content: string;
  created_at: string;
}

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    publishedDate?: string;
    industryIdentifiers?: Array<{ type: string; identifier: string }>;
    previewLink?: string;
  };
}
