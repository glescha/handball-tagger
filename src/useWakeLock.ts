import { useEffect, useRef } from "react";

type WakeLockSentinelLike = {
  release: () => Promise<void>;
};

export function useWakeLock(enabled: boolean) {
  const ref = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function request() {
      try {
        // @ts-ignore
        const wl = await navigator.wakeLock?.request?.("screen");
        if (cancelled) {
          await wl?.release?.();
          return;
        }
        ref.current = wl ?? null;
      } catch {
        // Wake Lock kan saknas/nekas; appen fungerar ändå.
        ref.current = null;
      }
    }

    async function release() {
      try {
        await ref.current?.release?.();
      } catch {
        // ignore
      } finally {
        ref.current = null;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible" && enabled) request();
      if (document.visibilityState !== "visible") release();
    }

    if (enabled) request();

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      release();
    };
  }, [enabled]);
}