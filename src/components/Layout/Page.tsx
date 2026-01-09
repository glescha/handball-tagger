// FILE: src/components/Layout/Page.tsx
import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  maxWidth?: number; // default matchar StartScreen
};

export function Page({ title, children, maxWidth = 500 }: Props) {
  return (
    <div className="appRoot">
      <div className="appContainer" style={{ maxWidth }}>
        {title ? <h1 className="appTitle">{title}</h1> : null}
        {children}
      </div>
    </div>
  );
}
