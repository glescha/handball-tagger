import React from "react";

// Färgpalett från Logo.tsx för att matcha exakt
const C = {
    bg: "#0F172A",       
    floor: "#1E293B",    
    lines: "#38BDF8",    
    tabletBezel: "#1E293B", 
    tabletScreen: "#0F172A", 
    camera: "#E2E8F0", 
    dataGraph: "#EF4444", 
    dataBars: "#38BDF8",
    dataBg: "rgba(255, 255, 255, 0.05)",
    grid: "rgba(56, 189, 248, 0.15)",
    tacticWhite: "#F8FAFC",
    defense: "#EF4444"
};

export const AppIcon = ({ 
    size = 128, 
    style,
    withBackground = true 
}: { 
    size?: number, 
    style?: React.CSSProperties,
    withBackground?: boolean
}) => {

  // Centrera innehållet (300x485) i 512x512
  // X: (512 - 300) / 2 = 106
  // Y: (512 - 485) / 2 = 13.5
  const startX = 106;
  const startY = 13.5;

  return (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    style={style}
  >
    <defs>
        <mask id="iconDrawEraseMask">
            <rect x="-20" y="-10" height="60" fill="white">
                <animate attributeName="width" values="0; 270; 270; 0" keyTimes="0; 0.4; 0.6; 1" dur="6s" repeatCount="indefinite" fill="freeze" />
                <animate attributeName="x" values="-20; -20; -20; 250" keyTimes="0; 0.4; 0.6; 1" dur="6s" repeatCount="indefinite" fill="freeze" />
            </rect>
        </mask>
        <clipPath id="iconScreenMask"><rect x="0" y="0" width="165" height="300" /></clipPath>
        <clipPath id="iconCourtHalf"><rect x="0" y="-10" width="300" height="320" /></clipPath>
        <clipPath id="iconBoundsY"><rect x="-10" y="0" width="240" height="300" /></clipPath>
        
        <marker id="iconArrowHead" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
            <path d="M 0 0 L 4 2 L 0 4 Z" fill={C.tacticWhite} />
        </marker>

        <style>
            {`
              @keyframes barGrowIcon { 
                0%, 100% { height: 20px; y: 110px; } 
                50% { height: 90px; y: 40px; } 
              }
            `}
        </style>
    </defs>

    {/* BAKGRUND */}
    {withBackground && (
        <rect width="512" height="512" rx="110" fill={C.bg} />
    )}

    <g transform={`translate(${startX}, ${startY})`}>
        
        {/* --- SPELPLANEN (Bakgrund) --- */}
        <g transform="rotate(90, 150, 150)">
            <g strokeWidth="4" fill="none">
                <g clipPath="url(#iconCourtHalf)"><rect x="0" y="0" width="300" height="300" fill={C.floor} stroke="none" /></g>

                <g clipPath="url(#iconCourtHalf)" stroke="#FFFFFF" strokeWidth="2">
                    <circle cx="300" cy="150" r="30" fill={C.bg} /><circle cx="300" cy="150" r="3" fill="#FFFFFF" stroke="none" />
                    <path d="M 0,37.5 A 90,90 0 0,1 90,127.5 L 90,172.5 A 90,90 0 0,1 0,262.5" fill={C.bg} />
                    <g clipPath="url(#iconBoundsY)"><path d="M 0,-7.5 A 135,135 0 0,1 135,127.5 L 135,172.5 A 135,135 0 0,1 0,307.5" strokeDasharray="10 8" opacity="0.8" /></g>
                    <line x1="105" y1="142.5" x2="105" y2="157.5" /><line x1="60" y1="147" x2="60" y2="153" />
                    <rect x="-5" y="127.5" width="8" height="45" fill="none" stroke="none" />
                    <line x1="3" y1="127.5" x2="3" y2="172.5" />
                </g>

                {/* Taktik-element */}
                <g stroke={C.tacticWhite} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="115" cy="110" r="11.25" stroke={C.defense} />
                    <path d="M 225,60 L 252.81,48.75 L 252.81,71.25 Z" stroke={C.lines} transform="rotate(-23, 225, 60)" />
                    <path d="M 225,75 C 190,140 160,150 120,150" markerEnd="url(#iconArrowHead)" fill="none" />
                </g>

                <line x1="300" y1="0" x2="300" y2="300" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="butt" />
                
                <g strokeWidth="5">
                    <line x1="0" y1="2.5" x2="302" y2="2.5" stroke="#FFFFFF" />
                    <line x1="0" y1="297.5" x2="302" y2="297.5" stroke="#FFFFFF" />
                    <line x1="2.5" y1="0" x2="2.5" y2="300" stroke="#FFFFFF" />
                </g>
            </g>
        </g>

        {/* --- SURFPLATTAN (Förgrund) --- */}
        <g transform="translate(300, 300) rotate(90)">
        {/* Ram (Bezel) */}
        <path 
                d={`M 0,0 L 169,0 A 16,16 0 0,1 185,16 L 185,284 A 16,16 0 0,1 169,300 L 0,300 Z`}
            fill={C.tabletBezel} stroke="none"
        />
        
        {/* Vit kantlinje */}
        <g fill="none" strokeWidth="5" strokeLinecap="round">
            <path 
                    d={`M 0,2.5 L 169,2.5 A 16,16 0 0,1 185,17.5 L 185,282.5 A 16,16 0 0,1 169,297.5 L 0,297.5`}
                stroke="#FFFFFF" 
            />
        </g>

        {/* Skärm */}
            <path d={`M 0,14 L 157,14 A 10,10 0 0,1 167,24 L 167,276 A 10,10 0 0,1 157,286 L 0,286 Z`} fill={C.tabletScreen} />
        <circle cx="176" cy="150" r="5" fill={C.camera} />

        {/* Skärminnehåll */}
            <g clipPath="url(#iconScreenMask)">
            <g transform="translate(0, 70) scale(0.54)">
                {/* LIVE TREND */}
                <g>
                    <rect x="-15" y="-40" width="270" height="105" fill={C.dataBg} />
                    <text x="0" y="-15" fill={C.dataGraph} fontSize="24" fontWeight="800" letterSpacing="1" opacity="0.9" style={{ fontFamily: "'Inter', sans-serif" }}>LIVE TREND</text>
                    <line x1="0" y1="0" x2="220" y2="0" stroke={C.grid} strokeWidth="3" />
                    <line x1="0" y1="50" x2="220" y2="50" stroke={C.grid} strokeWidth="3" />
                    <g mask="url(#iconDrawEraseMask)">
                        <polyline points="-20,30 0,30 40,10 80,40 120,20 160,35 200,5 240,40" fill="none" stroke={C.dataGraph} strokeWidth="5" />
                        {[0,40,80,120,160,200,240].map((x,i) => (<circle key={i} cx={x} cy={[30,10,40,20,35,5,40][i]} r="7" fill={C.dataGraph} />))}
                    </g>
                </g>
                
                {/* GOAL STATS */}
                <g transform="translate(0, 150)">
                    <rect x="-15" y="-40" width="270" height="185" fill={C.dataBg} />
                    <text x="0" y="-15" fill={C.dataBars} fontSize="24" fontWeight="800" letterSpacing="1" style={{ fontFamily: "'Inter', sans-serif" }}>GOAL STATS</text>
                    <line x1="0" y1="130" x2="220" y2="130" stroke={C.grid} strokeWidth="3" />
                    <line x1="0" y1="35" x2="0" y2="130" stroke={C.grid} strokeWidth="3" />
                    {[0, 1, 2, 3, 4, 5].map(i => (<rect key={i} x={i * 35 + 15} width={22} rx={4} fill={C.dataBars} opacity="0.9" y="40" height="90" style={{ animation: `barGrowIcon 3s ease-in-out infinite alternate`, animationDelay: `${i * 0.4}s`, transformBox: "fill-box", transformOrigin: "bottom" }} />))}
                </g>
            </g>
        </g>
        </g>
    </g>
  </svg>
);
};