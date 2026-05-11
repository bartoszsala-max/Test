"use client";

import { use } from "react";
import { redirect } from "next/navigation";

export default function LibraryBookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);
  redirect(`/reading/${bookId}`);
}
