import React from "react";

export const Logo = ({ size = 128, style }: { size?: number, style?: React.CSSProperties }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 512 512" 
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    {/* --- BAKGRUND: SURFPLATTA (Massiv form) --- */}
    {/* En mörk, tung platta som grund */}
    <rect x="56" y="56" width="400" height="400" rx="60" fill="#0F172A" stroke="#334155" strokeWidth="24"/>
    
    {/* --- STATISTIK / ANALYS (Bakgrunden i plattan) --- */}
    {/* Tre tjocka staplar som stiger uppåt. Symboliserar data som byggs. */}
    <rect x="110" y="280" width="60" height="120" rx="8" fill="#1E293B" />
    <rect x="190" y="220" width="60" height="180" rx="8" fill="#1E293B" />
    <rect x="270" y="160" width="60" height="240" rx="8" fill="#1E293B" />
    <rect x="350" y="100" width="60" height="300" rx="8" fill="#1E293B" />

    {/* --- HANDBOLL (Fokuspunkt) --- */}
    {/* Solid Orange boll. Ligger "framför" statistiken. */}
    <circle cx="210" cy="210" r="75" fill="#F97316" stroke="#0F172A" strokeWidth="8"/>
    {/* Bollens mönster (Subtilt, vitt) */}
    <path d="M210 155 Q240 210 210 265 M170 210 Q210 180 250 210" stroke="#fff" strokeWidth="6" fill="none" opacity="0.8"/>

    {/* --- LIVE TAGGNING / "SNABB" (Action) --- */}
    {/* En stor, fet blixt/markör som "klickar" på bollen. 
        Symboliserar fingret som träffar skärmen snabbt. 
        Anfallsblå (#38BDF8) för att matcha dina knappar.
    */}
    <path 
        d="M320 280 L280 240 L340 240 L310 140 L420 220 L360 220 L400 340 Z" 
        fill="#38BDF8" 
        stroke="#0F172A" 
        strokeWidth="8"
        strokeLinejoin="round"
    />

    {/* --- TOUCH EFEKT (Ringar) --- */}
    {/* Visar att en interaktion sker just nu */}
    <circle cx="350" cy="260" r="100" stroke="#38BDF8" strokeWidth="6" fill="none" opacity="0.4" strokeDasharray="20 10"/>

  </svg>
);