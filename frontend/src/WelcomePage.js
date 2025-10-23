import React, { useEffect } from 'react';

// You can replace this SVG with an actual Bank Danamon logo image if available
const DanamonLogo = () => (
  <svg width="300" height="60" viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="60" rx="12" fill="#FF9900"/>
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="bold" fill="#fff" fontFamily="Arial, sans-serif">
      Arya Framework
    </text>
  </svg>
);

const LoadingCircles = () => (
  <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
    {[0, 1, 2].map(i => (
      <div
        key={i}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#FF9900',
          opacity: 0.7,
          animation: `danamon-bounce 1s ${i * 0.2}s infinite alternate`
        }}
      />
    ))}
    <style>
      {`
        @keyframes danamon-bounce {
          to { transform: translateY(-18px); opacity: 1; }
        }
      `}
    </style>
  </div>
);

function loadSettings() {
  try {
    const raw = localStorage.getItem('appSettings');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export default function WelcomePage({ onAnimationComplete, settings: propSettings }) {
  const storageSettings = loadSettings() || {};
  const settings = propSettings || storageSettings || {};
  const duration = settings.welcomeDuration || 1200;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onAnimationComplete) onAnimationComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [onAnimationComplete, duration]);

  const logoColor = settings.welcomeColor || '#FF9900';
  const logoText = settings.logoText || 'Arya Framework';
  const welcomeText = settings.welcomeText || 'Welcome to the Application';

  const DanamonLogoCustom = () => (
    settings.logoDataUrl ? (
      <img src={settings.logoDataUrl} alt="logo" style={{ height: settings.logoSize || 80, borderRadius: 8, objectFit: settings.logoFit || 'contain' }} />
    ) : (
      <svg width="380" height="80" viewBox="0 0 380 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="380" height="80" rx="12" fill={logoColor} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="bold" fill="#fff" fontFamily="Arial, sans-serif">
          {logoText}
        </text>
      </svg>
    )
  );

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #fff 60%, rgba(0,0,0,0.02) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000'
      }}
    >
      <DanamonLogoCustom />
      <h2 style={{ marginTop: 24, color: logoColor }}>{welcomeText}</h2>
      <LoadingCircles />
    </div>
  );
}
