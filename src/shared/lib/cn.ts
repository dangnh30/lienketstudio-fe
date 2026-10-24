import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gộp className, tự loại class Tailwind xung đột (class sau thắng). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
