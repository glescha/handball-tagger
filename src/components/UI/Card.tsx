// FILE: src/components/UI/Card.tsx
import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return <div className="appCard">{children}</div>;
}
