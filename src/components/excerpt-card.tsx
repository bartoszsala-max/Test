"use client";

import { useState } from "react";
import { Sparkles, AlignLeft, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteExcerpt } from "@/lib/books";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Excerpt, Book } from "@/types";

interface ExcerptCardProps {
  excerpt: Excerpt;
  book: Book;
  onDeleted: (id: string) => void;
  onUpdated: (updated: Excerpt) => void;
}

export function ExcerptCard({ excerpt, book, onDeleted, onUpdated }: ExcerptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [summarizeLoading, setSummarizeLoading] = useState(false);
  const [streamedInterpret, setStreamedInterpret] = useState<string | null>(null);
  const [streamedSummary, setStreamedSummary] = useState<string | null>(null);

  async function handleAI(mode: "interpret" | "summarize") {
    const setter = mode === "interpret" ? setStreamedInterpret : setStreamedSummary;
    const loadingSetter = mode === "interpret" ? setInterpretLoading : setSummarizeLoading;

    loadingSetter(true);
    setter("");
    setExpanded(true);

    try {
      const res = await fetch(`/api/ai/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          excerptId: excerpt.id,
          text: excerpt.text,
          bookTitle: book.title,
          bookAuthors: book.authors?.join(", "),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("AI request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setter(fullText);
      }

      const field = mode === "interpret" ? "ai_interpretation" : "ai_summary";
      onUpdated({ ...excerpt, [field]: fullText });
    } catch {
      toast({ title: "AI request failed", variant: "error" });
      setter(null);
    } finally {
      loadingSetter(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this excerpt?")) return;
    try {
      await deleteExcerpt(excerpt.id);
      onDeleted(excerpt.id);
    } catch {
      toast({ title: "Failed to delete excerpt", variant: "error" });
    }
  }

  const interpretation = streamedInterpret ?? excerpt.ai_interpretation;
  const summary = streamedSummary ?? excerpt.ai_summary;
  const isStreaming = interpretLoading || summarizeLoading;

  return (
    <div className="group rounded-xl border border-charcoal/10 dark:border-ivory/10 bg-white dark:bg-charcoal/40 p-4">
      <blockquote className="text-sm text-charcoal dark:text-ivory leading-relaxed italic border-l-2 border-sienna/40 pl-3 mb-3">
        {excerpt.text && excerpt.text.length > 280 && !expanded
          ? excerpt.text.slice(0, 280) + "…"
          : excerpt.text}
      </blockquote>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {excerpt.page_ref && (
            <span className="text-xs text-charcoal/50 dark:text-ivory/50 font-medium">{excerpt.page_ref}</span>
          )}
          <span className="text-xs text-charcoal/40 dark:text-ivory/40">{formatDate(excerpt.created_at)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => handleAI("interpret")} disabled={isStreaming} title="Literary interpretation">
            {interpretLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-sienna" />}
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => handleAI("summarize")} disabled={isStreaming} title="Summarize">
            {summarizeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlignLeft className="h-3.5 w-3.5 text-teal" />}
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={handleDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {excerpt.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={excerpt.photo_url} alt="Book page" className="rounded-lg max-h-48 object-contain w-full mb-3 border border-charcoal/8 dark:border-ivory/8" />
      )}

      {expanded && (
        <div className="space-y-3 mt-2">
          {(interpretation || interpretLoading) && (
            <div className="rounded-lg bg-sienna/5 dark:bg-sienna/10 border border-sienna/15 p-3">
              <p className="text-xs font-semibold text-sienna mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Literary interpretation <span className="font-normal text-charcoal/40 dark:text-ivory/40">(AI)</span>
              </p>
              <p className={`text-sm text-charcoal dark:text-ivory leading-relaxed ${interpretLoading ? "ai-cursor" : ""}`}>
                {interpretation}
              </p>
            </div>
          )}
          {(summary || summarizeLoading) && (
            <div className="rounded-lg bg-teal/5 dark:bg-teal/10 border border-teal/15 p-3">
              <p className="text-xs font-semibold text-teal mb-1.5 flex items-center gap-1.5">
                <AlignLeft className="h-3 w-3" />
                Summary <span className="font-normal text-charcoal/40 dark:text-ivory/40">(AI)</span>
              </p>
              <p className={`text-sm text-charcoal dark:text-ivory leading-relaxed whitespace-pre-line ${summarizeLoading ? "ai-cursor" : ""}`}>
                {summary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
