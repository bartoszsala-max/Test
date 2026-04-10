"use client";

import { useState } from "react";
import { Loader2, BookOpen, Headphones, Tablet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { promoteToReading } from "@/lib/books";
import { toast } from "@/hooks/use-toast";
import type { Book, ReadingFormat } from "@/types";
import { cn } from "@/lib/utils";

interface PromoteToReadingDialogProps {
  book: Book | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formats: { value: ReadingFormat; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "paper", label: "Paper", icon: BookOpen },
  { value: "kindle", label: "Kindle", icon: Tablet },
  { value: "audiobook", label: "Audiobook", icon: Headphones },
];

export function PromoteToReadingDialog({ book, onOpenChange, onSuccess }: PromoteToReadingDialogProps) {
  const [format, setFormat] = useState<ReadingFormat>("paper");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!book) return;
    setLoading(true);
    try {
      await promoteToReading(book.id, format, startDate);
      toast({ title: `"${book.title}" moved to In Reading!`, variant: "success" });
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!book} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Start reading</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-charcoal/70 dark:text-ivory/70">
            Moving <strong className="text-charcoal dark:text-ivory">{book?.title}</strong> to In Reading.
          </p>

          <div>
            <p className="text-xs font-medium text-charcoal/60 dark:text-ivory/60 mb-2">Reading format</p>
            <div className="flex gap-2">
              {formats.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormat(value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all",
                    format === value
                      ? "border-sienna bg-sienna/10 text-sienna"
                      : "border-charcoal/15 dark:border-ivory/15 text-charcoal/60 dark:text-ivory/60 hover:border-sienna/40"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-charcoal/60 dark:text-ivory/60 mb-2">Start date</p>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Start reading
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
