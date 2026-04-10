import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatYear(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).getFullYear().toString();
}

export function currentYear(): number {
  return new Date().getFullYear();
}
