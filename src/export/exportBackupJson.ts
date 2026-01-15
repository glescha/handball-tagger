import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export const exportAllDataToJson = async () => {
    // 1. Samla in all data från localStorage som hör till appen
    const data: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Vi sparar allt som börjar med 'match_' eller 'setting_'
        if (key && (key.startsWith("match_") || key.startsWith("setting_"))) {
            const rawValue = localStorage.getItem(key);
            try {
                // Försök parsa JSON om det går (matcher etc)
                data[key] = JSON.parse(rawValue || "");
            } catch (e) {
                // Annars spara som vanlig sträng (settings)
                data[key] = rawValue;
            }
        }
    }

    // 2. Skapa en Blob (fil) av datan
    const jsonString = JSON.stringify(data, null, 2);
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `handball-tagger-backup-${dateStr}.json`;

    if (Capacitor.isNativePlatform()) {
        try {
            const result = await Filesystem.writeFile({
                path: filename,
                data: jsonString,
                directory: Directory.Cache,
                encoding: Encoding.UTF8,
            });
            await Share.share({
                title: 'Handboll Tagger Backup',
                url: result.uri,
                dialogTitle: 'Spara Backup',
            });
        } catch (error: any) {
            alert(`Kunde inte spara fil: ${error.message}`);
        }
        return;
    }

    const blob = new Blob([jsonString], { type: "application/json" });

    // 3. Skapa en nedladdningslänk och klicka på den programmatiskt
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    
    // 4. Städa upp
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportBackupJson = async (events: any[], matchId: string, filename: string) => {
    const data = {
        matchId,
        events
    };

    const jsonString = JSON.stringify(data, null, 2);

    if (Capacitor.isNativePlatform()) {
        try {
            const result = await Filesystem.writeFile({
                path: filename,
                data: jsonString,
                directory: Directory.Cache,
                encoding: Encoding.UTF8,
            });
            await Share.share({
                title: 'Match Backup',
                url: result.uri,
                dialogTitle: 'Spara Match',
            });
        } catch (error: any) {
            alert(`Kunde inte spara fil: ${error.message}`);
        }
        return;
    }

    const blob = new Blob([jsonString], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};