# Grafisk Profil – Handboll Tagger

Detta dokument definierar designsystemet för Handboll Tagger. Syftet är att skapa en modern, datadriven och ögonvänlig upplevelse optimerad för mörka miljöer (Dark Mode).

## 1. Varumärke & Namn
* **Namn:** Handboll Tagger (alt. Handball Tagger för int. marknad).
* **Tonalitet:** Professionell, Snabb, Analytisk.
* **Logotyp-koncept:** En stiliserad surfplatta i rörelse med en handboll i fokus, vilket symboliserar "Live Data".

## 2. Typografi
Vi använder ett rent, sans-serif typsnitt för maximal läsbarhet av siffror och data.

* **Primärt Typsnitt:** `Inter` (eller systemfont: San Francisco/Roboto).
* **Rubriker:** * Vikt: `800` (Extra Bold) eller `900` (Black).
    * Stil: `UPPERCASE` (Versaler).
    * Tracking: `1px` (Letter-spacing).
* **Siffror:** Ska alltid visas stort och tydligt (`fontWeight: 700+`).

## 3. Färgpalett (Dark Mode)

### Bakgrund & Struktur
Dessa färger bygger upp appens skelett.

| Färg | Hex | Användning |
| :--- | :--- | :--- |
| **Deep Space** | `#0F172A` | Huvudbakgrund (Background). Mörk marinblå för att spara batteri och ögon. |
| **Surface** | `#1E293B` | Kort, Paneler, Header. Lättare nyans för att skapa djup. |
| **Border** | `#334155` | Gränslinjer, inaktiva fält. |
| **Text Primary** | `#F8FAFC` | Rubriker, viktig data (Nästan vit). |
| **Text Secondary**| `#94A3B8` | Etiketter, beskrivningar, inaktiva ikoner. |

### Funktionella Färger (Accenter)
Används för att koda händelser så användaren intuitivt vet vad som händer.

| Roll | Färg | Hex | Betydelse |
| :--- | :--- | :--- | :--- |
| **ANFALL (Attack)** | **Attack Blue** | `#38BDF8` | Anfall, Starta Match, Navigering, Aktiva val. |
| **FÖRSVAR (Defense)**| **Defense Red** | `#EF4444` | Försvar, Insläppta mål, Radera, Varningar. |
| **MÅLVAKT (Goalie)** | **Goalie Orange**| `#F97316` | Räddningar, Målvaktsstatistik. |
| **POSITIVT** | **Success Green**| `#22C55E` | Mål framåt, Vinst, Positiv trend. |
| **STRAFF** | **Penalty Purple**| `#A855F7` | Straffkast. |

## 4. UI-Komponenter & Designspråk

### Former
* **Knappar:** `border-radius: 12px`. Ger en sportig men modern känsla.
* **Kort (Cards):** `border-radius: 16px`. Mjukare form för att gruppera innehåll.

### Signatur-effekter
**1. The "Flow" Gradient**
Används på listor och knappar för att indikera riktning och fart.
* *Kod:* `linear-gradient(90deg, [FÄRG_MED_OPACITET] 0%, transparent 100%)`
* *Exempel (Anfall):* `linear-gradient(90deg, rgba(56, 189, 248, 0.2) 0%, transparent 100%)`

**2. Glassmorphism**
Används på flytande element (t.ex. Inställningsknappen).
* *Kod:* `background: rgba(30, 41, 59, 0.9)`, `backdrop-filter: blur(10px)` (om möjligt).

**3. Active Glow**
När en viktig knapp är aktiv (t.ex. "Starta Match").
* *Kod:* `box-shadow: 0 4px 15px [FÄRG_MED_0.4_OPACITET]`

## 5. Ikoner
Använd minimalistiska, linjära ikoner (t.ex. från Lucide eller Heroicons) med en `stroke-width` på 2 eller 2.5 för att matcha den feta typografin.