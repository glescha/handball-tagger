import React from 'react';

const VersionDisplay: React.FC = () => {
  const version = import.meta.env.VITE_APP_VERSION || 'Dev';

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '4px', 
      right: '4px', 
      fontSize: '10px', 
      opacity: 0.4, 
      pointerEvents: 'none',
      color: '#000'
    }}>
      v{version}
    </div>
  );
};

export default VersionDisplay;