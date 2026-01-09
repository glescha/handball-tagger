import { useEffect } from "react";

export function useWakeLock() {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        // Kontrollera om funktionen finns i webbläsaren
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active');
        }
      } catch (err: any) {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
      }
    };

    // Begär lås vid start
    requestWakeLock();

    // Om man minimerar appen (t.ex. kollar sms) och kommer tillbaka,
    // släpper webbläsaren låset. Vi måste begära det igen när appen blir synlig.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock) wakeLock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}