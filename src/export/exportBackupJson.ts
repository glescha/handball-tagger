export const exportAllDataToJson = () => {
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
    const blob = new Blob([jsonString], { type: "application/json" });

    // 3. Skapa en nedladdningslänk och klicka på den programmatiskt
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    a.download = `handball-tagger-backup-${dateStr}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    // 4. Städa upp
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportBackupJson = (events: any[], matchId: string, filename: string) => {
    const data = {
        matchId,
        events
    };

    const jsonString = JSON.stringify(data, null, 2);
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