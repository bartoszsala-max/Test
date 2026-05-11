import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-sienna/10 text-sienna",
        teal: "border-transparent bg-teal/10 text-teal",
        secondary: "border-transparent bg-charcoal/10 text-charcoal dark:bg-ivory/10 dark:text-ivory",
        outline: "border-charcoal/20 dark:border-ivory/20 text-charcoal dark:text-ivory",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
