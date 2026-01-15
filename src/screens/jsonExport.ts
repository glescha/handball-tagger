import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { db } from '../db';

// Hjälpfunktion för att hantera nedladdning i en vanlig webbläsare
const browserDownload = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

/**
 * Exporterar all data från IndexedDB och localStorage till en JSON-fil.
 * Använder Capacitor Filesystem på mobil och en vanlig nedladdningslänk i webbläsaren.
 */
export const exportAllDataToJson = async () => {
  try {
    // 1. Samla in all data som ska exporteras
    const matches = await db.matches.toArray();
    const events = await db.events.toArray();
    const settings: { [key: string]: string | null } = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('setting_')) {
            settings[key] = localStorage.getItem(key);
        }
    }

    const allData = {
      exportDate: new Date().toISOString(),
      matches,
      events,
      settings,
    };

    const fileName = `handball-tagger-backup-${new Date().toISOString().split('T')[0]}.json`;
    const fileContent = JSON.stringify(allData, null, 2);

    // 2. Välj rätt metod baserat på plattform
    if (Capacitor.isNativePlatform()) {
      // Körs på mobil (Android/iOS)
      const result = await Filesystem.writeFile({
        path: fileName,
        data: fileContent,
        directory: Directory.Cache, // Använd Cache för att undvika rättighetsproblem
        encoding: Encoding.UTF8,
      });

      // Öppna dela-dialogen
      await Share.share({
        title: 'Handboll Tagger Backup',
        url: result.uri,
        dialogTitle: 'Spara Backup',
      });
    } else {
      // Körs i webbläsare
      browserDownload(fileContent, fileName);
    }
  } catch (error: unknown) {
    console.error("Kunde inte exportera data:", error);
    const msg = error instanceof Error ? error.message : String(error);
    alert(`Ett fel uppstod vid export: ${msg}`);
  }
};