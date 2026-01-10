import React from "react";

// Färgpalett (Samma som LogoPortrait)
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

export const LogoSymbol = ({ 
    height = 40, 
    style,
    className,
    animated = true
}: { 
    height?: number, 
    style?: React.CSSProperties,
    className?: string,
    animated?: boolean
}) => {
    // Vi gör symbolen kvadratisk baserat på bredden av innehållet (485px)
    // Innehållet är 485px brett (300 plan + 185 platta) och 300px högt.
    const vbSize = 485;
    const contentHeight = 300;
    
    // Centrera innehållet (300px högt) i kvadraten (485px)
    // y = (485 - 300) / 2 = 92.5
    const offsetY = (vbSize - contentHeight) / 2;

    // Kvadratisk storlek
    const width = height;

    // Konstanter från Logo.tsx
    const splitX = 300;
    const tabletWidth = 185;
    const tabletEnd = splitX + tabletWidth;
    const outerStrokeW = 5;
    const halfOuterStrokeW = outerStrokeW / 2;

    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${vbSize} ${vbSize}`}
        width={width}
        height={height}
        style={{ ...style, display: "block" }} // display: block tar bort extra space under svg
        className={className}
      >
        <defs>
            <mask id="symbolDrawEraseMask">
                <rect x="-20" y="-10" height="60" fill="white">
                    {animated && (
                        <>
                            <animate attributeName="width" values="0; 270; 270; 0" keyTimes="0; 0.4; 0.6; 1" dur="6s" repeatCount="indefinite" fill="freeze" />
                            <animate attributeName="x" values="-20; -20; -20; 250" keyTimes="0; 0.4; 0.6; 1" dur="6s" repeatCount="indefinite" fill="freeze" />
                        </>
                    )}
                </rect>
            </mask>
            <clipPath id="symbolScreenMask"><rect x={0} y={0} width={165} height={300} /></clipPath>
            <clipPath id="symbolCourtHalf"><rect x="0" y="-10" width={300} height={320} /></clipPath>
            <clipPath id="symbolBoundsY"><rect x="-10" y="0" width={240} height={300} /></clipPath>
            
            <marker id="symbolArrowHead" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                <path d="M 0 0 L 4 2 L 0 4 Z" fill={C.tacticWhite} />
            </marker>

            {animated && (
                <style>
                    {`
                    @keyframes symbolBarGrow { 
                        0%, 100% { height: 20px; y: 110px; } 
                        50% { height: 85px; y: 45px; } 
                    }
                    `}
                </style>
            )}
        </defs>

        <g transform={`translate(0, ${offsetY})`}>
            
            {/* --- SPELPLANEN (Vänster) --- */}
            <g strokeWidth="4" fill="none">
                <g clipPath="url(#symbolCourtHalf)"><rect x="0" y="0" width={300} height={300} fill={C.floor} stroke="none" /></g>

                <g clipPath="url(#symbolCourtHalf)" stroke="#FFFFFF" strokeWidth="2">
                    <circle cx="300" cy="150" r="30" fill={C.bg} /><circle cx="300" cy="150" r="3" fill="#FFFFFF" stroke="none" />
                    <path d="M 0,37.5 A 90,90 0 0,1 90,127.5 L 90,172.5 A 90,90 0 0,1 0,262.5" fill={C.bg} />
                    <g clipPath="url(#symbolBoundsY)"><path d="M 0,-7.5 A 135,135 0 0,1 135,127.5 L 135,172.5 A 135,135 0 0,1 0,307.5" strokeDasharray="10 8" opacity="0.8" /></g>
                    <line x1="105" y1="142.5" x2="105" y2="157.5" /><line x1="60" y1="147" x2="60" y2="153" />
                    <rect x="-5" y="127.5" width="8" height="45" fill="none" stroke="none" />
                    <line x1="3" y1="127.5" x2="3" y2="172.5" />
                </g>

                {/* Taktik-element */}
                <g stroke={C.tacticWhite} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="115" cy="110" r="11.25" stroke={C.defense} />
                    <path d="M 225,60 L 252.81,48.75 L 252.81,71.25 Z" stroke={C.lines} transform="rotate(-23, 225, 60)" />
                    <path d="M 225,75 C 190,140 160,150 120,150" markerEnd="url(#symbolArrowHead)" fill="none" />
                </g>

                <line x1="300" y1="0" x2="300" y2="300" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="butt" />
                
                <g strokeWidth="5">
                    <line x1="0" y1="2.5" x2="302" y2="2.5" stroke="#FFFFFF" />
                    <line x1="0" y1="297.5" x2="302" y2="297.5" stroke="#FFFFFF" />
                    <line x1="2.5" y1="0" x2="2.5" y2="300" stroke="#FFFFFF" />
                </g>
            </g>

            {/* --- SURFPLATTAN (Höger) --- */}
            <g>
                <path 
                    d={`M ${splitX},0 L ${tabletEnd - 16},0 A 16,16 0 0,1 ${tabletEnd},16 L ${tabletEnd},284 A 16,16 0 0,1 ${tabletEnd - 16},300 L ${splitX},300 Z`}
                    fill={C.tabletBezel} stroke="none"
                />
                <g fill="none" strokeWidth={outerStrokeW} strokeLinecap="round">
                    <path 
                        d={`M ${splitX},${halfOuterStrokeW} L ${tabletEnd - 16},${halfOuterStrokeW} A 16,16 0 0,1 ${tabletEnd},17.5 L ${tabletEnd},282.5 A 16,16 0 0,1 ${tabletEnd - 16},${300 - halfOuterStrokeW} L ${splitX},${300 - halfOuterStrokeW}`}
                        stroke="#FFFFFF" 
                    />
                </g>
                <path d={`M ${splitX},14 L ${tabletEnd - 28},14 A 10,10 0 0,1 ${tabletEnd - 18},24 L ${tabletEnd - 18},276 A 10,10 0 0,1 ${tabletEnd - 28},286 L ${splitX},286 Z`} fill={C.tabletScreen} />
                <circle cx={tabletEnd - 9} cy="150" r="5" fill={C.camera} />
                
                <g clipPath="url(#symbolScreenMask)">
                    <g transform="translate(318, 62) scale(0.54)">
                        <g transform="translate(0, 25)">
                            <rect x="-15" y="-40" width="270" height="105" fill={C.dataBg} />
                            <text x="0" y="-15" fill={C.dataGraph} fontSize="24" fontWeight="800" letterSpacing="1" opacity="0.9" style={{ fontFamily: "'Inter', sans-serif" }}>LIVE TREND</text>
                            <line x1="0" y1="0" x2="220" y2="0" stroke={C.grid} strokeWidth="3" />
                            <line x1="0" y1="50" x2="220" y2="50" stroke={C.grid} strokeWidth="3" />
                            <g mask="url(#symbolDrawEraseMask)"><polyline points="-20,30 0,30 40,10 80,40 120,20 160,35 200,5 240,40" fill="none" stroke={C.dataGraph} strokeWidth="5" />{[0,40,80,120,160,200,240].map((x,i) => (<circle key={i} cx={x} cy={[30,10,40,20,35,5,40][i]} r="7" fill={C.dataGraph} />))}</g>
                        </g>
                        <g transform="translate(0, 220)">
                            <rect x="-15" y="-40" width="270" height="185" fill={C.dataBg} />
                            <text x="0" y="-15" fill={C.dataBars} fontSize="24" fontWeight="800" letterSpacing="1" style={{ fontFamily: "'Inter', sans-serif" }}>GOAL STATS</text>
                            <line x1="0" y1="130" x2="220" y2="130" stroke={C.grid} strokeWidth="3" />
                            <line x1="0" y1="35" x2="0" y2="130" stroke={C.grid} strokeWidth="3" />
                            {[0, 1, 2, 3, 4, 5].map(i => (<rect key={i} x={i * 35 + 15} width={22} rx={4} fill={C.dataBars} opacity="0.9" y="45" height="85" style={{ animation: animated ? `symbolBarGrow 3s ease-in-out infinite alternate` : 'none', animationDelay: `${i * 0.4}s`, transformBox: "fill-box", transformOrigin: "bottom" }} />))}
                        </g>
                    </g>
                </g>
            </g>
        </g>
      </svg>
    );
};