// Placeholder för lokal lagring om du behöver det
export const saveToLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
export const getFromLocal = (key: string) => JSON.parse(localStorage.getItem(key) || "null");
