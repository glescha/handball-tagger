import { useEffect, useState } from 'react';

export default function UpdateChecker() {
  const [updateUrl, setUpdateUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkUpdate = async () => {
      // Kör inte i dev-läge
      if (import.meta.env.DEV) return;

      try {
        // OBS: Detta fungerar bara om ditt repo är publikt.
        // Om det är privat får du 404. Då är Google Play det bästa alternativet.
        const res = await fetch("https://api.github.com/repos/glescha/handball-tagger/releases/latest");
        
        if (res.ok) {
          const data = await res.json();
          const latestVersion = data.tag_name.replace(/^v/, ""); // Ta bort 'v' från 'v1.0.1'
          const currentVersion = import.meta.env.VITE_APP_VERSION;

          // Om versionerna skiljer sig (och vi inte kör en debug-build)
          if (currentVersion && !currentVersion.includes("Debug") && latestVersion !== currentVersion) {
            setUpdateUrl(data.html_url);
          }
        }
      } catch (error) {
        console.error("Kunde inte söka efter uppdateringar", error);
      }
    };

    checkUpdate();
  }, []);

  if (!updateUrl) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#38BDF8', color: '#0F172A', padding: '12px',
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontWeight: 'bold'
    }}>
      <span>Ny version tillgänglig!</span>
      <a 
        href={updateUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          background: '#0F172A', color: '#fff', padding: '6px 12px',
          borderRadius: '8px', textDecoration: 'none', fontSize: '14px'
        }}
      >
        Ladda ner
      </a>
      <button 
        onClick={() => setUpdateUrl(null)}
        style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', marginLeft: '10px' }}
      >
        ✕
      </button>
    </div>
  );
}