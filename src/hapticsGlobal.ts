import { hapticTap } from "./haptics";

function isInteractive(el: Element | null) {
  if (!el) return false;

  // vanliga interaktiva element
  if (el.closest("button")) return true;
  if (el.closest('a[href]')) return true;
  if (el.closest('[role="button"]')) return true;

  // opt-out: om du vill kunna undanta vissa knappar
  if (el.closest("[data-no-haptics]")) return false;

  return false;
}

export function installGlobalHaptics() {
  // Click fångar även keyboard-aktivering av <button> i praktiken
  const onClickCapture = (ev: MouseEvent) => {
    const t = ev.target as Element | null;
    if (!isInteractive(t)) return;

    // trigga haptics (vi bryr oss inte om await här)
    void hapticTap();
  };

  document.addEventListener("click", onClickCapture, { capture: true });

  return () => {
    document.removeEventListener("click", onClickCapture, { capture: true } as any);
  };
}
