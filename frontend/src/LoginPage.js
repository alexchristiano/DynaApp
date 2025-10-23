import React, { useState, useEffect } from 'react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // don't auto-trigger login success here — App controls initial route
  }, [onLoginSuccess]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // hardcoded credentials for testing
    if (username === 'admin' && password === 'admin') {
      // read effect/duration from settings
      let effect = 'zoomout';
      let duration = 1200;
      try {
        const raw = localStorage.getItem('appSettings');
        const s = raw ? JSON.parse(raw) : null;
        if (s) {
          effect = s.loginTransitionEffect || effect;
          duration = s.loginTransitionDuration || duration;
        }
      } catch (e) {}

      // trigger card animation using CSS classes
      const card = document.querySelector('.login-card');
      if (card) {
        // set css variable for duration
        card.style.setProperty('--anim-duration', `${duration}ms`);
        // remove any existing animation classes
        card.classList.remove('login-anim-zoomin','login-anim-zoomout','login-anim-fadein','login-anim-fadeout');
        const cls = effect === 'zoomin' ? 'login-anim-zoomin' : effect === 'zoomout' ? 'login-anim-zoomout' : effect === 'fadein' ? 'login-anim-fadein' : 'login-anim-fadeout';
        // listen for animation end once
        const onEnd = () => {
          card.removeEventListener('animationend', onEnd);
          if (onLoginSuccess) onLoginSuccess();
        };
        card.addEventListener('animationend', onEnd);
        void card.offsetWidth; // force reflow
        card.classList.add(cls);
      } else {
        if (onLoginSuccess) onLoginSuccess();
      }
    } else {
      alert('Invalid credentials. Use admin / admin');
    }
  };

  return (
    <div className="login-root">
      <div className="login-left" />
      <div className="login-right">
        <div className={`login-card ${visible ? 'visible' : ''}`}>
          <h2>Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}