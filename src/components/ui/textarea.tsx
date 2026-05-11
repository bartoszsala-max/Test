import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-charcoal/20 dark:border-ivory/20 bg-white dark:bg-charcoal/50 px-3 py-2 text-sm text-charcoal dark:text-ivory shadow-sm placeholder:text-charcoal/40 dark:placeholder:text-ivory/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sienna/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
textarea.displayName = "Textarea";

export { Textarea };
