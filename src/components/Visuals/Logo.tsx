import React from "react";

// Färgpalett
const C = {
    bg: "#0F172A",       
    floor: "#1E293B",    
    lines: "#38BDF8",    // Anfallsblå
    tabletBezel: "#1E293B", 
    tabletScreen: "#0F172A", 
    tabletBorderStart: "#38BDF8", 
    tabletBorderEnd: "#F8FAFC", // Vit ram
    camera: "#E2E8F0", 
    dataGraph: "#EF4444", 
    dataBars: "#38BDF8",
    dataBg: "rgba(255, 255, 255, 0.05)",
    grid: "rgba(56, 189, 248, 0.15)",
    text: "#F8FAFC",     
    tacticWhite: "#F8FAFC", // Vit färg för taktik
    defense: "#EF4444"      // Försvarsröd
};

export const Logo = ({ 
    width = "100%", 
    height = "auto", 
    style 
}: { 
    width?: string | number, 
    height?: string | number, 
    style?: React.CSSProperties 
}) => {

  // DIMENSIONER (1m = 15px)
  const courtWidth = 300;      // 20m
  const tabletWidth = 185;     // Återställt till Golden Ratio
  
  const splitX = courtWidth;
  const tabletEnd = splitX + tabletWidth;
  
  const strokeW = 4;
  const outerStrokeW = strokeW + 1;
  const halfOuterStrokeW = outerStrokeW / 2;
  const innerStrokeW = 2;
  const overlap = 2;           
  
  // Handbollslinjer
  const path6m = `M 0,37.5 A 90,90 0 0,1 90,127.5 L 90,172.5 A 90,90 0 0,1 0,262.5`;
  const path9m = `M 0,-7.5 A 135,135 0 0,1 135,127.5 L 135,172.5 A 135,135 0 0,1 0,307.5`;

  // TAKTIK-KONFIGURATION
  const px = 15; // pixels per meter
  const defenderRadius = (1.5 * px) / 2; // 11.25px
  
  // Triangel (1.5m bas, 2m sida)
  const triHeight = 1.854 * px; // ~27.8px
  const triBaseHalf = (1.5 * px) / 2; // 11.25px

  return (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="140 80 520 440"
    width={width}
    height={height}
    style={{ ...style, maxWidth: "1000px" }}
  >
    <style>
        {`
          @keyframes barGrow { 
            0%, 100% { height: 20px; y: 110px; } 
            50% { height: 85px; y: 45px; } 
          }
        `}
    </style>

    <defs>
      {/* SKUGGA */}
      <filter id="logoShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur" />
          <feOffset in="blur" dx="0" dy="12" result="offsetBlur" />
          <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
          <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
          </feMerge>
      </filter>

      {/* MASKER */}
      <clipPath id="courtLeftHalf"><rect x="0" y="-10" width={splitX} height="320" /></clipPath>
      <clipPath id="boundsY"><rect x="-10" y="0" width={240} height="300" /></clipPath>
      <clipPath id="screenMask"><rect x={splitX} y="0" width={tabletWidth - 20} height="300" /></clipPath>
      
      <mask id="drawEraseMask">
          <rect x="-20" y="-10" height="60" fill="white">
              <animate attributeName="width" values="0; 270; 270; 0" keyTimes="0; 0.4; 0.6; 1" dur="6s" repeatCount="indefinite" fill="freeze" />
              <animate attributeName="x" values="-20; -20; -20; 250" keyTimes="0; 0.4; 0.6; 1" dur="6s" repeatCount="indefinite" fill="freeze" />
          </rect>
      </mask>

        {/* Markör för pilspets */}
        <marker id="tacticArrowHead" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
            <path d="M 0 0 L 4 2 L 0 4 Z" fill={C.tacticWhite} />
        </marker>
    </defs>

    <rect width="800" height="600" fill={C.bg} />

    {/* HUVUDGRUPP */}
    <g transform="translate(400, 300) translate(-242.5, -150)" filter="url(#logoShadow)">

        {/* --- SURFPLATTAN --- */}
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
            <g clipPath="url(#screenMask)">
                <g transform="translate(318, 62) scale(0.54)">
                    <g transform="translate(0, 25)">
                        <rect x="-15" y="-40" width="270" height="105" fill={C.dataBg} />
                        <text x="0" y="-15" fill={C.dataGraph} fontSize="24" fontWeight="800" letterSpacing="1" opacity="0.9" style={{ fontFamily: "'Inter', sans-serif" }}>LIVE TREND</text>
                        <line x1="0" y1="0" x2="220" y2="0" stroke={C.grid} strokeWidth="3" />
                        <line x1="0" y1="50" x2="220" y2="50" stroke={C.grid} strokeWidth="3" />
                        <g mask="url(#drawEraseMask)"><polyline points="-20,30 0,30 40,10 80,40 120,20 160,35 200,5 240,40" fill="none" stroke={C.dataGraph} strokeWidth="5" />{[0,40,80,120,160,200,240].map((x,i) => (<circle key={i} cx={x} cy={[30,10,40,20,35,5,40][i]} r="7" fill={C.dataGraph} />))}</g>
                    </g>
                    <g transform="translate(0, 220)">
                        <rect x="-15" y="-40" width="270" height="185" fill={C.dataBg} />
                        <text x="0" y="-15" fill={C.dataBars} fontSize="24" fontWeight="800" letterSpacing="1" style={{ fontFamily: "'Inter', sans-serif" }}>GOAL STATS</text>
                        <line x1="0" y1="130" x2="220" y2="130" stroke={C.grid} strokeWidth="3" />
                        <line x1="0" y1="35" x2="0" y2="130" stroke={C.grid} strokeWidth="3" />
                        {[0, 1, 2, 3, 4, 5].map(i => (<rect key={i} x={i * 35 + 15} width={22} rx={4} fill={C.dataBars} opacity="0.9" y="45" height="85" style={{ animation: `barGrow 3s ease-in-out infinite alternate`, animationDelay: `${i * 0.4}s`, transformBox: "fill-box", transformOrigin: "bottom" }} />))}
                    </g>
                </g>
            </g>
        </g>

        {/* --- SPELPLANEN --- */}
        <g strokeWidth={strokeW} fill="none">
            <g clipPath="url(#courtLeftHalf)"><rect x="0" y="0" width={splitX} height="300" fill={C.floor} stroke="none" /></g>

            <g clipPath="url(#courtLeftHalf)" stroke="#FFFFFF" strokeWidth={innerStrokeW}>
                <circle cx={splitX} cy="150" r="30" fill={C.bg} /><circle cx={splitX} cy="150" r="3" fill="#FFFFFF" stroke="none" />
                <path d={path6m} fill={C.bg} /><g clipPath="url(#boundsY)"><path d={path9m} strokeDasharray="10 8" opacity="0.8" /></g>
                <line x1="105" y1="142.5" x2="105" y2="157.5" /><line x1="60" y1="147" x2="60" y2="153" />
                <rect x="-5" y="127.5" width="8" height="45" fill="none" stroke="none" />
                <line x1="3" y1="127.5" x2="3" y2="172.5" />
            </g>

            {/* --- TAKTIKTAVLA-OBJEKT (Skarpa linjer) --- */}
            <g 
                stroke={C.tacticWhite} 
                strokeWidth="5" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                {/* Försvarare (Cirkel) */}
                {/* Tillbaka till positionen: x=115, y=110 */}
                <circle cx="115" cy="110" r={defenderRadius} stroke={C.defense} />

                {/* Anfallare (Triangel) */}
                {/* Kvar på: x=225, y=60 */}
                <path 
                    d={`M 225,60 L ${225 + triHeight},${60 - triBaseHalf} L ${225 + triHeight},${60 + triBaseHalf} Z`} 
                    stroke={C.lines} 
                    transform="rotate(-23, 225, 60)"
                />

                {/* Pil (S-kurva åt andra hållet) */}
                {/* Start: x=225, y=75 */}
                {/* Slut: x=120, y=150 */}
                {/* Kurva: Går nu "neråt" (högre Y) mot mitten för att runda försvararen på insidan */}
                <path 
                    d="M 225,75 C 190,140 160,150 120,150" 
                    markerEnd="url(#tacticArrowHead)" 
                    fill="none" 
                />
            </g>

            {/* Mittlinjen - ritas nu FÖRE ramlinjerna för att hamna under */}
            <line x1={splitX} y1="0" x2={splitX} y2="300" stroke="#FFFFFF" strokeWidth={innerStrokeW} strokeLinecap="butt" />

            <g strokeWidth={outerStrokeW}>
                <line x1="0" y1={halfOuterStrokeW} x2={splitX + overlap} y2={halfOuterStrokeW} stroke="#FFFFFF" />
                <line x1="0" y1={300 - halfOuterStrokeW} x2={splitX + overlap} y2={300 - halfOuterStrokeW} stroke="#FFFFFF" />
                <line x1={halfOuterStrokeW} y1="0" x2={halfOuterStrokeW} y2="300" stroke="#FFFFFF" />
            </g>
            
            <text 
                x={splitX - 3} 
                y={290} 
                textAnchor="start" 
                dominantBaseline="hanging"
                textLength={tabletWidth + 3}
                lengthAdjust="spacingAndGlyphs"
                fill={C.text}
                style={{ 
                    fontSize: "55px", fontFamily: "system-ui, sans-serif", fontWeight: 900,
                }}
            >
                TAGGER
            </text>

            <text 
                x={splitX + 3} 
                y={1} 
                textAnchor="end" 
                textLength={300}
                lengthAdjust="spacingAndGlyphs"
                fill={C.text}
                style={{ 
                    fontSize: "55px", fontFamily: "system-ui, sans-serif", fontWeight: 900,
                }}
            >
                HANDBALL
            </text>
        </g>

    </g>

  </svg>
);
};