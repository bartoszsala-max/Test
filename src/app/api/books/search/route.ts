import { NextRequest, NextResponse } from "next/server";
import { searchBooks } from "@/lib/google-books";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  if (!query) return NextResponse.json([]);

  const results = await searchBooks(query);
  return NextResponse.json(results);
}
