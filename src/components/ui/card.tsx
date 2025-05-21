import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-lg border bg-white text-black shadow-sm", className)}>
      {children}
    </div>
  );
}
