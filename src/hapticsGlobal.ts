// src/hapticsGlobal.ts
import { hapticTap } from "./haptics";
import { getSetting } from "./kv";

let hapticsEnabled = true; // lokal cache

// håll värdet uppdaterat
async function syncSetting() {
  hapticsEnabled = await getSetting("hapticsEnabled", true);
}

// init direkt
void syncSetting();

// exponera så Settings kan trigga uppdatering
export async function refreshHapticsSetting() {
  await syncSetting();
}

function isInteractive(el: Element | null) {
  if (!el) return false;

  if (el.closest("[data-no-haptics]")) return false;

  if (el.closest("button")) return true;
  if (el.closest('a[href]')) return true;
  if (el.closest('[role="button"]')) return true;

  return false;
}

export function installGlobalHaptics() {
  const onClickCapture = (ev: MouseEvent) => {
    if (!hapticsEnabled) return;

    const t = ev.target as Element | null;
    if (!isInteractive(t)) return;

    void hapticTap();
  };

  document.addEventListener("click", onClickCapture, { capture: true });

  return () => {
    document.removeEventListener("click", onClickCapture, { capture: true } as any);
  };
}
