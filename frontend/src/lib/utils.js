import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const fmtMoney = (n) => {
  const v = Number(n || 0);

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
};

export const fmtDate = (d) => {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" });
};

export const CATEGORIES = ["Food", "Transport", "Utilities", "Entertainment", "Salary", "Savings", "Other"];

export const CATEGORY_COLORS = {
  Food: "hsl(4 100% 65%)",
  Transport: "hsl(212 100% 60%)",
  Utilities: "hsl(50 100% 60%)",
  Entertainment: "hsl(271 91% 70%)",
  Salary: "hsl(142 76% 50%)",
  Savings: "hsl(180 84% 55%)",
  Other: "hsl(240 5% 65%)",
};
