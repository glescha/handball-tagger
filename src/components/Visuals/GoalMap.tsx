import { useMemo } from "react";
import type { AppEvent, GoalCell } from "../../types/AppEvents";

type Props = { events: AppEvent[] };

const C = {
    post: "#E2E8F0",
    net: "rgba(255,255,255,0.05)",
    grid: "rgba(255,255,255,0.1)", 
    
    // Färgkoder
    goal: "#22C55E",   // Grön
    save: "#EAB308",   // Gul (Räddning)
    penalty: "#C084FC", // Lila
    miss: "#EF4444"    
};

export function GoalMap({ events }: Props) {
    
    const getCoordinates = (cell: GoalCell, seed: string) => {
        const col = (cell - 1) % 3; 
        const row = Math.floor((cell - 1) / 3); 

        const baseX = col * 1 + 0.5;
        const baseY = row * 1 + 0.5;

        // Deterministisk slump
        const hash = seed.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        const randX = (Math.sin(hash) * 0.35); 
        const randY = (Math.cos(hash * 2) * 0.35);

        return { x: baseX + randX, y: baseY + randY };
    };

    const dots = useMemo(() => {
        return events
            .filter(e => e.goalCell) 
            .map(e => {
                const { x, y } = getCoordinates(e.goalCell as GoalCell, e.id);
                
                let color = C.goal;
                let stroke = "none"; 
                let strokeWidth = "0";

                if (e.isPenalty) {
                    color = C.penalty; 
                    
                    if (e.outcome === "GOAL") {
                        stroke = C.goal; 
                        strokeWidth = "0.02"; 
                    } else if (e.outcome === "SAVE") {
                        stroke = C.save; 
                        strokeWidth = "0.02";
                    }

                } else {
                    if (e.outcome === "SAVE") color = C.save;
                    else if (e.outcome === "GOAL") color = C.goal;
                    else if (e.outcome === "MISS") color = C.miss;
                    
                    stroke = "rgba(0,0,0,0.3)";
                    strokeWidth = "0.01";
                }

                return { x, y, color, stroke, strokeWidth, id: e.id };
            });
    }, [events]);

    const LegendItem = ({ color, label, border = "none" }: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ 
                width: 8, height: 8, borderRadius: "50%", 
                background: color, 
                border: border !== "none" ? `2px solid ${border}` : "1px solid rgba(255,255,255,0.1)" 
            }} />
            <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>{label}</span>
        </div>
    );

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
             
             {/* SJÄLVA MÅLET (SVG) */}
             <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
                <svg width="100%" height="100%" viewBox="-0.1 -0.1 3.2 2.2" preserveAspectRatio="xMidYMid meet">
                    
                    <rect x="0" y="0" width="3" height="2" fill={C.net} />

                    {/* Rutnät */}
                    <line x1="1" y1="0" x2="1" y2="2" stroke={C.grid} strokeWidth="0.015" />
                    <line x1="2" y1="0" x2="2" y2="2" stroke={C.grid} strokeWidth="0.015" />
                    <line x1="0" y1="1" x2="3" y2="1" stroke={C.grid} strokeWidth="0.015" />
                    
                    {/* Stolpar */}
                    <rect x="-0.1" y="-0.1" width="0.1" height="2.1" fill={C.post} rx="0.02" />
                    <rect x="3.0" y="-0.1" width="0.1" height="2.1" fill={C.post} rx="0.02" />
                    <rect x="-0.1" y="-0.1" width="3.2" height="0.1" fill={C.post} rx="0.02" />

                    {/* Prickar */}
                    {dots.map(d => (
                        <circle 
                            key={d.id} 
                            cx={d.x} 
                            cy={d.y} 
                            r="0.08" 
                            fill={d.color} 
                            stroke={d.stroke} 
                            strokeWidth={d.strokeWidth} 
                        />
                    ))}
                </svg>
             </div>

             {/* DISKRET FÖRKLARING UNDER MÅLET */}
             <div style={{ 
                 display: "flex", justifyContent: "center", gap: 12, 
                 paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)",
                 marginTop: 4
             }}>
                 <LegendItem color={C.goal} label="MÅL" />
                 <LegendItem color={C.save} label="RÄDDN" />
                 <LegendItem color={C.penalty} label="7m MÅL" border={C.goal} />
                 <LegendItem color={C.penalty} label="7m RÄDDN" border={C.save} />
             </div>
        </div>
    );
}