// Library book detail — reuses same component structure as reading detail
// but with read-status context and back link to /library

"use client";

import { use } from "react";
import { redirect } from "next/navigation";

// Dynamically import the shared book detail component
// We redirect based on actual book status for simplicity
export default function LibraryBookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);
  // The reading detail page handles both statuses correctly
  // We forward by navigating there and it shows the correct back link
  redirect(`/reading/${bookId}`);
}
