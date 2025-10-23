import React, { useEffect, useState } from 'react';
import WelcomePage from './WelcomePage';
import LoginPage from './LoginPage';
import AdminPage from './AdminPage';
import './App.css';

function App() {
  const initialLoggedIn = (() => { try { return !!localStorage.getItem('loggedIn'); } catch (e) { return false; } })();
  const [route, setRoute] = useState(initialLoggedIn ? 'admin' : 'welcome'); // welcome, login, admin
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('appSettings');
      return raw ? JSON.parse(raw) : undefined;
    } catch (e) {
      return undefined;
    }
  });
  const [transition, setTransition] = useState({ active: false, effect: 'zoomout', duration: 1200 });
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);

  useEffect(() => {
    if (!settings) {
      // ensure default settings exist
      import('./AdminPage').then(m => {
        const def = m && m.default ? null : null;
      });
    }
  }, [settings]);

  function handleWelcomeComplete() {
    setRoute('login');
  }

  function handleLoginSuccess() {
    // read chosen effect/duration from settings (or localStorage)
    const s = settings || (() => {
      try {
        const raw = localStorage.getItem('appSettings');
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    })();
    const effect = s.loginTransitionEffect || 'zoomout';
    const duration = s.loginTransitionDuration || 1200;
    setTransition({ active: true, effect, duration });
    // after duration, navigate to admin
    setTimeout(() => {
      setTransition({ active: false, effect, duration });
      // mark logged in session
      localStorage.setItem('loggedIn', '1');
      setLoggedIn(true);
      setRoute('admin');
    }, duration);
  }

  function handleLogout() {
    localStorage.removeItem('loggedIn');
    setLoggedIn(false);
    setRoute('login');
  }

  return (
    <div className={`app-root ${settings && settings.theme ? `theme-${settings.theme}` : ''}`}>
      {route === 'welcome' && <WelcomePage onAnimationComplete={handleWelcomeComplete} settings={settings} />}
      {route === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
      {route === 'admin' && <AdminPage onSettingsChange={(s) => { setSettings(s); localStorage.setItem('appSettings', JSON.stringify(s)); }} />}

      {loggedIn && route === 'admin' && (
        <div style={{ position: 'fixed', right: 12, top: 12, zIndex: 9999 }}>
          <button onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>
      )}

      {transition.active && (
        <div className={`transition-overlay ${transition.effect}`} style={{ animationDuration: `${transition.duration}ms` }} />
      )}
    </div>
  );
}

export default App;
