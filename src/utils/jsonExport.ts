import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export const exportAllDataToJson = async () => {
  const data: Record<string, any> = {};
  
  // Hämta allt från localStorage som hör till appen
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("match_") || key.startsWith("setting_")) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) || "null");
      } catch (e) {
        data[key] = localStorage.getItem(key);
      }
    }
  });

  const jsonStr = JSON.stringify(data, null, 2);
  const filename = `handboll-backup-${new Date().toISOString().slice(0, 10)}.json`;

  if (Capacitor.isNativePlatform()) {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: jsonStr,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });

      await Share.share({
        title: 'Backup',
        text: 'Handboll Tagger Backup',
        url: result.uri,
        dialogTitle: 'Spara Backup'
      });
    } catch (e: any) {
      alert("Kunde inte skapa backup: " + e.message);
    }
  } else {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};