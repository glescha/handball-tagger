// FILE: src/components/Layout/ControlGrid.tsx
import React, { ReactNode } from 'react';

interface Props {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
}

export const ControlGrid: React.FC<Props> = ({ leftPanel, centerPanel, rightPanel }) => {
  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "300px 1fr 300px", // Fasta sidor, flexibel mitten
      height: "100%", 
      width: "100%",
      overflow: "hidden", // VIKTIGT: Förhindrar att hela sidan scrollar
      backgroundColor: "#0F172A"
    }}>
      {/* Vänster Panel (Scrollbar) */}
      <div style={{ 
        borderRight: "1px solid rgba(255,255,255,0.1)", 
        overflowY: "auto", 
        height: "100%",
        display: "flex", 
        flexDirection: "column",
        background: "rgba(0,0,0,0.2)"
      }}>
        {leftPanel}
      </div>

      {/* Mitten (Planen) - VIKTIGT: Flexbox center + overflow hidden */}
      <div style={{ 
        position: "relative", 
        overflow: "hidden", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        height: "100%",
        width: "100%",
        padding: 10
      }}>
        {centerPanel}
      </div>

      {/* Höger Panel (Historik) */}
      <div style={{ 
        borderLeft: "1px solid rgba(255,255,255,0.1)", 
        overflowY: "auto", 
        height: "100%",
        display: "flex", 
        flexDirection: "column",
        background: "rgba(0,0,0,0.2)"
      }}>
        {rightPanel}
      </div>
    </div>
  );
};
