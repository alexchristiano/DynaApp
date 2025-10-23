import React, { useState, useEffect, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const defaultSettings = {
  theme: 'light', // options: light, dark, grey
  welcomeText: 'Welcome to the Application',
  welcomeColor: '#FF9900',
  logoText: 'Arya Framework',
  logoDataUrl: null,
  logoSize: 80, // px
  logoFit: 'contain', // contain, cover
  logoAspectLocked: false,
  welcomeDuration: 1200,
  loginTransitionEffect: 'zoomout', // fadein, fadeout, zoomin, zoomout
  loginTransitionDuration: 1200,
  menuWidth: 260,
  menuVisible: true,
  previewOpen: false,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem('appSettings');
    return raw ? JSON.parse(raw) : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
}

export default function AdminPage({ onSettingsChange }) {
  const [settings, setSettings] = useState(loadSettings());
  const [hiding, setHiding] = useState(false);
  const [menuVisible, setMenuVisible] = useState(settings.menuVisible);
  const [menuWidth, setMenuWidth] = useState(settings.menuWidth);

//   useEffect(() => {
//     try {
//       localStorage.setItem('appSettings', JSON.stringify(settings));
//     } catch (e) {}
//     if (onSettingsChange) onSettingsChange(settings);
//   }, [settings, onSettingsChange]);

  function toggleMenuWithDelay() {
    if (hiding) return; // debounce additional clicks while waiting
    setHiding(true);
    setTimeout(() => {
      setMenuVisible(v => !v);
      setHiding(false);
    }, 1200);
  }

//   function update(partial) {
//     setSettings(s => {
//       const next = ({ ...s, ...partial });
//       return next;
//     });
//   }
// Combine the state updates into a single function
function update(partial) {
  setSettings(s => {
    const next = ({ ...s, ...partial });
    try {
      localStorage.setItem('appSettings', JSON.stringify(next));
    } catch (e) {}
    if (onSettingsChange) onSettingsChange(next);
    return next;
  });
}

// Remove the separate useEffect for settings persistence since it's now handled in update()

  // handle file uploads for logo image
  function handleLogoUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      update({ logoDataUrl: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    update({ logoDataUrl: null });
  }

  const cropperRef = useRef(null);
  const [showCropper, setShowCropper] = useState(false);

  const [previewState, setPreviewState] = useState({ mode: 'idle' }); // 'idle' | 'welcome' | 'login'

  function playPreview() {
    const dur = settings.welcomeDuration || 1200;
    setPreviewState({ mode: 'welcome' });
    // after welcome duration, show a simulated login state (fade)
    setTimeout(() => {
      setPreviewState({ mode: 'login' });
      // revert to idle after a bit
      setTimeout(() => setPreviewState({ mode: 'idle' }), 900);
    }, dur);
  }

  function startCrop() {
    setShowCropper(true);
  }

  function cancelCrop() {
    setShowCropper(false);
  }

  function applyCrop() {
    const cropper = cropperRef.current && cropperRef.current.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        update({ logoDataUrl: dataUrl });
      }
    }
    setShowCropper(false);
  }

  // keyboard nudge for cropper when visible
  useEffect(() => {
    function onKey(e) {
      const cropper = cropperRef.current && cropperRef.current.cropper;
      if (!showCropper || !cropper) return;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') { cropper.move(-step, 0); e.preventDefault(); }
      if (e.key === 'ArrowRight') { cropper.move(step, 0); e.preventDefault(); }
      if (e.key === 'ArrowUp') { cropper.move(0, -step); e.preventDefault(); }
      if (e.key === 'ArrowDown') { cropper.move(0, step); e.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCropper]);

  const resizingRef = useRef(false);

  function onStartResize(e) {
    e.preventDefault();
    resizingRef.current = true;
    const startX = e.clientX;
    const startWidth = menuWidth;
    function onMove(ev) {
      const dx = ev.clientX - startX;
      const newWidth = Math.max(160, Math.min(480, startWidth + dx));
      setMenuWidth(newWidth);
      update({ menuWidth: newWidth });
    }
    function onUp() {
      resizingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // arrow toggle to open/close immediately
  function toggleMenuImmediate() {
    const newVisible = !menuVisible;
    setMenuVisible(newVisible);
    update({ menuVisible: newVisible });
  }

  return (
    <div className="admin-root">
      <div className={`side-menu ${menuVisible ? 'visible' : 'hidden'}`} style={{ width: menuWidth }}>
        {/* <button className="menu-toggle" onClick={toggleMenuWithDelay} disabled={hiding}>
          {menuVisible ? 'Hide' : 'Show'}
        </button> */}
        <div className="menu-spacing"></div>
        <div className="menu-items">
          <div className="menu-item active">Application Setup</div>
        </div>
        {/* resizer bar */}
        <div className="menu-resizer" onMouseDown={onStartResize} />
        {/* arrow toggle in middle */}
        <div className={`menu-arrow ${menuVisible ? 'expanded' : 'collapsed'}`} onClick={toggleMenuImmediate}>
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 2L2 8L8.5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <div className="admin-main">
        <h1>Application Setup</h1>
        <section className="setting">
          <label>Theme</label>
          <select value={settings.theme} onChange={e => update({ theme: e.target.value })}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="grey">Grey</option>
          </select>
        </section>

        <section className="setting">
          <label>Welcome Text</label>
          <input type="text" value={settings.welcomeText} onChange={e => update({ welcomeText: e.target.value })} />
        </section>

        <section className="setting">
          <label>Welcome Color</label>
          <input type="color" value={settings.welcomeColor} onChange={e => update({ welcomeColor: e.target.value })} />
        </section>

        <section className="setting">
          <label>Logo Text</label>
          <input type="text" value={settings.logoText} onChange={e => update({ logoText: e.target.value })} />
        </section>

        <section className="setting">
          <label>Logo Image</label>
          <input type="file" accept="image/*" onChange={e => handleLogoUpload(e.target.files && e.target.files[0])} />
          {settings.logoDataUrl && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: showCropper ? 'block' : 'none' }}>
                <Cropper
                  src={settings.logoDataUrl}
                  style={{ height: 240, width: '100%' }}
                  // Cropper.js options
                  aspectRatio={settings.logoAspectLocked ? (settings.logoSize || 80) / (settings.logoSize || 80) : NaN}
                  guides={true}
                  viewMode={1}
                  responsive={true}
                  autoCropArea={0.8}
                  background={false}
                  ref={cropperRef}
                />
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexDirection: 'column' }}>
                  <div className="crop-toolbar">
                    <button onClick={() => cropperRef.current?.cropper.setAspectRatio(1)} title="1:1 Square">1:1</button>
                    <button onClick={() => cropperRef.current?.cropper.setAspectRatio(4/3)} title="4:3 Standard">4:3</button>
                    <button onClick={() => cropperRef.current?.cropper.setAspectRatio(16/9)} title="16:9 Widescreen">16:9</button>
                    <button onClick={() => cropperRef.current?.cropper.setAspectRatio(NaN)} title="Free Aspect Ratio">Free</button>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={applyCrop} style={{ padding: '6px 10px' }}>Apply Crop</button>
                    <button onClick={cancelCrop} style={{ padding: '6px 10px' }}>Cancel</button>
                  </div>
                </div>
              </div>

              <div id="admin-logo-wrap" style={{ width: 240, height: 120, position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#fff', display: showCropper ? 'none' : 'block' }}>
                <img id="admin-logo-img" src={settings.logoDataUrl} alt="logo preview" style={{ width: '100%', height: '100%', objectFit: settings.logoFit || 'contain' }} />
              </div>

              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                {!showCropper ? (
                  <button onClick={startCrop} style={{ padding: '6px 10px' }}>Edit / Crop</button>
                ) : null}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={!!settings.logoAspectLocked} onChange={e => update({ logoAspectLocked: e.target.checked })} />
                  Lock Aspect
                </label>
              </div>
            </div>
          )}
        </section>

        <section className="setting">
          <label>Logo Size (px)</label>
          <input type="number" value={settings.logoSize || 80} onChange={e => update({ logoSize: parseInt(e.target.value || 0, 10) })} />
        </section>

        <section className="setting">
          <label>Logo Fit</label>
          <select value={settings.logoFit || 'contain'} onChange={e => update({ logoFit: e.target.value })}>
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
          </select>
        </section>

        <section className="setting">
          <button onClick={removeLogo} style={{ padding: '8px 12px', borderRadius: 6 }}>Remove Logo</button>
        </section>

        {/* Live preview */}
        <section className="setting" style={{ marginTop: 24 }}>
          <label>Live Preview</label>
          <div style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8, width: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: settings.logoSize || 80, height: settings.logoSize || 80, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: settings.welcomeColor || '#FF9900', borderRadius: 8 }}>
                {settings.logoDataUrl ? (
                  <img src={settings.logoDataUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: settings.logoFit || 'contain' }} />
                ) : (
                  <div style={{ color: '#fff', fontWeight: 700 }}>{settings.logoText}</div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{settings.welcomeText}</div>
                <div style={{ color: settings.welcomeColor }}>{settings.welcomeColor}</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => playPreview()} style={{ padding: '6px 10px' }}>Play Preview</button>
          </div>
        </section>

        <section className="setting">
          <label>Welcome Duration (ms)</label>
          <input type="number" value={settings.welcomeDuration} onChange={e => update({ welcomeDuration: parseInt(e.target.value || 0, 10) })} />
        </section>

        <section className="setting">
          <label>Login Transition Effect</label>
          <select value={settings.loginTransitionEffect} onChange={e => update({ loginTransitionEffect: e.target.value })}>
            <option value="fadein">Fade In</option>
            <option value="fadeout">Fade Out</option>
            <option value="zoomin">Zoom In</option>
            <option value="zoomout">Zoom Out</option>
          </select>
        </section>

        <section className="setting">
          <label>Login Transition Duration (ms)</label>
          <input type="number" value={settings.loginTransitionDuration} onChange={e => update({ loginTransitionDuration: parseInt(e.target.value || 0, 10) })} />
        </section>
      </div>
    </div>
  );
}
