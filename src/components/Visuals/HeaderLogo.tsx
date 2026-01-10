import React from "react";

export const HeaderLogo = ({ 
    height = 40, 
    style,
    className
}: { 
    height?: number, 
    style?: React.CSSProperties,
    className?: string
}) => {
    // Vi räknar ut bredden baserat på höjden för att behålla proportionerna
    const width = height * 5.5; 

    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 64" 
        width={width}
        height={height}
        style={style}
        className={className}
      >
        <defs>
          <filter id="headerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- IKON-DELEN (Vänster) --- */}
        <g transform="translate(32, 32) scale(0.12) rotate(-45) translate(-300, -150)">
             {/* VÄNSTER: Plan */}
            <g filter="url(#headerGlow)">
                <polyline points="300,0 0,0 0,300 300,300" fill="none" stroke="#38BDF8" strokeWidth="20" />
                <line x1="300" y1="0" x2="300" y2="300" stroke="#38BDF8" strokeWidth="20" />
                <path d="M 300 120 A 30 30 0 0 0 300 180" fill="none" stroke="#38BDF8" strokeWidth="15" />
                <rect x="-10" y="127.5" width="10" height="45" fill="#38BDF8" stroke="none" />
                <path d="M 0 60 A 90 90 0 0 1 90 150 A 90 90 0 0 1 0 240" fill="none" stroke="#38BDF8" strokeWidth="20" />
            </g>

            {/* HÖGER: Tablet */}
            <g>
                <path d="M 300 0 L 600 0 Q 640 0 640 40 L 640 260 Q 640 300 600 300 L 300 300 Z" 
                      fill="#1E293B" stroke="#38BDF8" strokeWidth="20" />
                {/* Enkel grafik */}
                <polyline points="340,60 390,30 440,50 490,10 540,40" 
                          fill="none" stroke="#F97316" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="360" y="120" width="40" height="80" fill="#38BDF8" rx="4"/>
                <rect x="420" y="90" width="40" height="110" fill="#F97316" rx="4"/>
                <rect x="480" y="130" width="40" height="70" fill="#38BDF8" rx="4"/>
            </g>

            {/* Skiljelinje */}
            <line x1="300" y1="-20" x2="300" y2="320" stroke="#fff" strokeWidth="10" />
        </g>

        {/* --- TEXT-DELEN (Höger) --- */}
        <text 
            x="70" 
            y="43" 
            fill="#FFFFFF" 
            style={{ 
                fontSize: "34px", 
                fontFamily: "system-ui, sans-serif", 
                fontWeight: 800,
                letterSpacing: "1px"
            }}
        >
            HANDBALL TAGGER
        </text>
      </svg>
    );
};