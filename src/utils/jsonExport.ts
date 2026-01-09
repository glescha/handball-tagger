export const exportAllDataToJson = () => {
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
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `handboll-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};