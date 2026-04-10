"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { promoteToRead } from "@/lib/books";
import { toast } from "@/hooks/use-toast";
import type { Book } from "@/types";

interface FinishBookDialogProps {
  book: Book | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FinishBookDialog({ book, onOpenChange, onSuccess }: FinishBookDialogProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!book) return;
    setLoading(true);
    try {
      await promoteToRead(book.id, rating ?? undefined, review || undefined, endDate);
      toast({ title: `"${book.title}" moved to Library!`, variant: "success" });
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
          <DialogTitle>Mark as finished</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-charcoal/70 dark:text-ivory/70">
            Finished <strong className="text-charcoal dark:text-ivory">{book?.title}</strong>. How was it?
          </p>

          <div>
            <p className="text-xs font-medium text-charcoal/60 dark:text-ivory/60 mb-2">Your rating (optional)</p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <p className="text-xs font-medium text-charcoal/60 dark:text-ivory/60 mb-2">Finish date</p>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div>
            <p className="text-xs font-medium text-charcoal/60 dark:text-ivory/60 mb-2">Personal review (optional)</p>
            <Textarea
              placeholder="Your thoughts on the book…"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading} variant="secondary">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Mark as read
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
