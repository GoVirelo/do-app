// Hi-fi design system — dark, masculine, modern
// A proper production-grade design language for "do."
// Inspired by tools like Linear, Raycast, Granola itself — deep slate,
// tight typography, restrained color, precise spacing.

const HF = {
  // Surfaces (near-black, cooled)
  bg0: '#0a0b0d',        // canvas / deepest
  bg1: '#111316',        // panel
  bg2: '#16191d',        // card
  bg3: '#1c2026',        // card-raised / hover
  bg4: '#252a31',        // input bg
  line: '#2a2f36',       // borders, dividers
  line2: '#373d45',      // stronger border

  // Text
  fg0: '#f4f4f2',        // primary
  fg1: '#c9cbce',        // secondary
  fg2: '#8a8f97',        // tertiary, meta
  fg3: '#5a5f67',        // muted, placeholders

  // Accents — dark, masculine (bronze/amber + steel + oxblood)
  bronze:    '#c8893f',  // primary accent (AI, active)
  bronzeSoft:'#3a2a18',  // accent bg fill
  bronzeLine:'#5a3e1e',
  steel:     '#6d89a8',  // secondary (info, focus)
  steelSoft: '#1c2838',
  oxblood:   '#a14545',  // urgent / hot
  oxbloodSoft:'#301818',
  forest:    '#4a7a5e',  // done / success
  forestSoft:'#15221b',
  plum:      '#7d5a8c',  // slack
  plumSoft:  '#231828',
  amber:     '#b8893f',  // granola

  // Source colors (each source gets a distinct hue)
  srcGranola: { fg: '#d4a55a', bg: '#2a1f10', line: '#4d3920' },
  srcSlack:   { fg: '#a77bb8', bg: '#241a2a', line: '#3d2b47' },
  srcOutlook: { fg: '#7092b8', bg: '#172032', line: '#2a3a54' },
  srcPersonal:{ fg: '#8a8f97', bg: '#1c2026', line: '#373d45' },

  // Type
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',

  // Radii / spacing
  r1: '4px', r2: '6px', r3: '8px', r4: '12px',
};

// Inject fonts + base CSS
if (typeof document !== 'undefined' && !document.getElementById('hf-styles')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'hf-styles';
  s.textContent = `
    .hf-root {
      font-family: ${HF.sans};
      color: ${HF.fg0};
      background: ${HF.bg0};
      font-size: 13px;
      line-height: 1.5;
      letter-spacing: -0.005em;
      font-feature-settings: 'cv11', 'ss01', 'ss03';
    }
    .hf-root * { box-sizing: border-box; }
    .hf-root h1, .hf-root h2, .hf-root h3 { font-family: ${HF.display}; font-weight: 600; margin: 0; letter-spacing: -0.02em; }
    .hf-root h1 { font-size: 22px; }
    .hf-root h2 { font-size: 16px; }
    .hf-root h3 { font-size: 14px; }
    .hf-root p { margin: 0; color: ${HF.fg1}; }
    .hf-mono { font-family: ${HF.mono}; font-feature-settings: 'zero'; }

    .hf-panel { background: ${HF.bg1}; border: 1px solid ${HF.line}; border-radius: ${HF.r3}; }
    .hf-card { background: ${HF.bg2}; border: 1px solid ${HF.line}; border-radius: ${HF.r2}; }
    .hf-card-raised { background: ${HF.bg3}; border: 1px solid ${HF.line2}; border-radius: ${HF.r2}; }
    .hf-divider { height: 1px; background: ${HF.line}; }

    /* Buttons */
    .hf-btn {
      display: inline-flex; align-items: center; gap: 6px;
      height: 28px; padding: 0 10px;
      background: ${HF.bg3}; color: ${HF.fg0};
      border: 1px solid ${HF.line2}; border-radius: ${HF.r2};
      font: 500 12px ${HF.sans}; letter-spacing: -0.005em;
      cursor: pointer; transition: background .1s, border-color .1s;
    }
    .hf-btn:hover { background: ${HF.bg4}; border-color: ${HF.fg3}; }
    .hf-btn-ghost { background: transparent; border-color: transparent; color: ${HF.fg1}; }
    .hf-btn-ghost:hover { background: ${HF.bg3}; color: ${HF.fg0}; }
    .hf-btn-primary {
      background: linear-gradient(180deg, #d4964a, #b87a30);
      color: #1a1108; border-color: #8a5a1e;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.4);
      font-weight: 600;
    }
    .hf-btn-primary:hover { filter: brightness(1.08); }
    .hf-btn-sm { height: 22px; padding: 0 8px; font-size: 11px; }
    .hf-btn-xs { height: 20px; padding: 0 6px; font-size: 10.5px; }

    /* Chips */
    .hf-chip {
      display: inline-flex; align-items: center; gap: 4px;
      height: 19px; padding: 0 7px;
      background: ${HF.bg3}; color: ${HF.fg1};
      border: 1px solid ${HF.line}; border-radius: ${HF.r1};
      font: 500 10.5px ${HF.sans}; letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    /* Kbd */
    .hf-kbd {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: ${HF.bg3}; color: ${HF.fg2};
      border: 1px solid ${HF.line2}; border-radius: 3px;
      font: 500 10px ${HF.mono};
    }

    /* Inputs */
    .hf-input {
      background: ${HF.bg4}; color: ${HF.fg0};
      border: 1px solid ${HF.line2}; border-radius: ${HF.r2};
      height: 32px; padding: 0 10px;
      font: 400 13px ${HF.sans};
      outline: none; width: 100%;
    }
    .hf-input:focus { border-color: ${HF.bronze}; background: ${HF.bg3}; }
    .hf-input::placeholder { color: ${HF.fg3}; }

    /* Checkbox (custom) */
    .hf-check {
      width: 15px; height: 15px; flex-shrink: 0;
      border: 1.5px solid ${HF.line2}; border-radius: 3.5px;
      background: transparent; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      transition: all .12s;
    }
    .hf-check:hover { border-color: ${HF.fg2}; background: ${HF.bg3}; }
    .hf-check-done { background: ${HF.bronze}; border-color: ${HF.bronze}; }
    .hf-check-done::after { content: ''; width: 7px; height: 4px; border-left: 1.6px solid #120a02; border-bottom: 1.6px solid #120a02; transform: rotate(-45deg) translate(1px, -1px); }

    /* Priority bar */
    .hf-prio { width: 2px; height: 12px; border-radius: 1px; background: ${HF.line2}; }
    .hf-prio-hot { background: ${HF.oxblood}; box-shadow: 0 0 6px ${HF.oxblood}; }

    /* Source badge */
    .hf-src { display:inline-flex; align-items:center; gap:4px; height:18px; padding:0 6px; border-radius:3px; font:600 9.5px ${HF.sans}; letter-spacing:0.06em; text-transform:uppercase; }
    .hf-src::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }

    /* AI accent elements */
    .hf-ai-fill { background: linear-gradient(135deg, ${HF.bronzeSoft}, #2a1d0e); border: 1px solid ${HF.bronzeLine}; }
    .hf-ai-text { color: ${HF.bronze}; }

    /* Scroll */
    .hf-root *::-webkit-scrollbar { width: 8px; height: 8px; }
    .hf-root *::-webkit-scrollbar-track { background: transparent; }
    .hf-root *::-webkit-scrollbar-thumb { background: ${HF.line2}; border-radius: 4px; }
    .hf-root *::-webkit-scrollbar-thumb:hover { background: ${HF.fg3}; }

    /* Dotted separator */
    .hf-dots {
      height: 1px;
      background-image: radial-gradient(circle, ${HF.line2} 0.8px, transparent 0.8px);
      background-size: 4px 1px; background-repeat: repeat-x;
    }

    /* Row hover */
    .hf-row { transition: background .1s; border-radius: ${HF.r2}; }
    .hf-row:hover { background: ${HF.bg2}; }
  `;
  document.head.appendChild(s);
}

// ── Source badge ──────────────────────────────────────────────
function HFSrc({ kind, children, style }) {
  const src = {
    granola:  HF.srcGranola,
    slack:    HF.srcSlack,
    outlook:  HF.srcOutlook,
    personal: HF.srcPersonal,
    me:       HF.srcPersonal,
  }[kind] || HF.srcPersonal;
  const label = children || ({ granola: 'Granola', slack: 'Slack', outlook: 'Outlook', personal: 'Personal', me: 'Personal' })[kind];
  return (
    <span className="hf-src" style={{ color: src.fg, background: src.bg, border: `1px solid ${src.line}`, ...style }}>
      {label}
    </span>
  );
}

// ── Avatar ─────────────────────────────────────────────────────
function HFAvatar({ initial, size = 22, color }) {
  const colors = ['#6d89a8','#8a6a3a','#7d5a8c','#4a7a5e','#a14545','#888'];
  const c = color || colors[initial.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, fontWeight: 600, flexShrink: 0,
      border: `1px solid rgba(255,255,255,0.08)`,
    }}>{initial}</div>
  );
}

// ── Top bar ────────────────────────────────────────────────────
function HFTopBar({ view, onView, right }) {
  const views = ['Stream', 'Board', 'Day', 'Personal'];
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 16px', borderBottom: `1px solid ${HF.line}`,
      background: HF.bg1, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: `linear-gradient(135deg, ${HF.bronze}, #8a5a1e)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1a1108' }}>d.</div>
        <span style={{ fontFamily: HF.display, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>do.</span>
      </div>
      <div style={{ display: 'flex', gap: 2, background: HF.bg2, border: `1px solid ${HF.line}`, borderRadius: HF.r2, padding: 2, marginLeft: 8 }}>
        {views.map(v => (
          <button key={v} onClick={() => onView && onView(v)}
            style={{
              height: 24, padding: '0 10px', fontSize: 11.5, fontWeight: 500,
              background: view === v ? HF.bg4 : 'transparent',
              color: view === v ? HF.fg0 : HF.fg2,
              border: 'none', borderRadius: HF.r1, cursor: 'pointer',
              fontFamily: HF.sans, letterSpacing: '-0.005em',
            }}>{v}</button>
        ))}
      </div>
      <div style={{ flex: 1, maxWidth: 340, margin: '0 8px', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 28, padding: '0 10px',
          background: HF.bg2, border: `1px solid ${HF.line}`, borderRadius: HF.r2,
          color: HF.fg3, fontSize: 12,
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
          <span style={{ flex: 1 }}>Search or ask…</span>
          <span className="hf-kbd">⌘K</span>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      {right}
      <HFAvatar initial="M" size={24} />
    </div>
  );
}

// ── Task row (hi-fi) ──────────────────────────────────────────
function HFTask({ done, title, src, meta, priority, aiDraft, hover }) {
  return (
    <div className="hf-row" style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '9px 10px', borderBottom: `1px solid ${HF.line}`,
      background: hover ? HF.bg2 : 'transparent',
    }}>
      <div className={`hf-check ${done ? 'hf-check-done' : ''}`} style={{ marginTop: 2 }} />
      <div className={`hf-prio ${priority === 'hot' ? 'hf-prio-hot' : ''}`} style={{ marginTop: 4 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: done ? HF.fg3 : HF.fg0, textDecoration: done ? 'line-through' : 'none' }}>{title}</span>
          {src && <HFSrc kind={src} />}
        </div>
        {meta && (
          <div className="hf-mono" style={{ fontSize: 11, color: HF.fg3, marginTop: 3, letterSpacing: '-0.01em' }}>
            {meta}
          </div>
        )}
        {aiDraft && (
          <div className="hf-ai-fill" style={{ marginTop: 8, padding: '8px 10px', borderRadius: HF.r2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <HFSparkle />
              <span className="hf-mono" style={{ fontSize: 10, color: HF.bronze, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>AI Draft</span>
            </div>
            <div style={{ fontSize: 12.5, color: HF.fg1, lineHeight: 1.5 }}>{aiDraft}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="hf-btn hf-btn-primary hf-btn-sm">Send</button>
              <button className="hf-btn hf-btn-sm">Edit</button>
              <button className="hf-btn hf-btn-ghost hf-btn-sm">Skip</button>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.7 }}>
        <HFAvatar initial="M" size={18} />
      </div>
    </div>
  );
}

// ── Sparkle icon (AI marker) ──────────────────────────────────
function HFSparkle({ size = 12, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill={color || HF.bronze}>
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
    </svg>
  );
}

// ── Icon helpers ──────────────────────────────────────────────
const HFIcon = {
  inbox: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8"/><path d="M2 8l2-6h8l2 6"/><path d="M2 8h3l1 2h4l1-2h3"/></svg>,
  today: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M2 6h12M5 2v3M11 2v3"/></svg>,
  cal:   (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M2 6h12M5 1v3M11 1v3"/><circle cx="8" cy="10" r="1" fill="currentColor"/></svg>,
  done:  (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 8l3 3 7-7"/></svg>,
  flash: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M9 1 L3 9 L7 9 L6 15 L13 7 L9 7 Z"/></svg>,
  plus:  (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  user:  (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 3-5 6-5s6 2 6 5"/></svg>,
  settings: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3"/></svg>,
  chev:  (d='right', s=12) => <svg width={s} height={s} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ transform: d==='down'?'rotate(90deg)':d==='left'?'rotate(180deg)':d==='up'?'rotate(-90deg)':'none' }}><path d="M4 2l4 4-4 4"/></svg>,
  meet:  (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="10" height="8" rx="1"/><path d="M11 7l4-2v6l-4-2z" fill="currentColor" stroke="none"/></svg>,
};

Object.assign(window, { HF, HFSrc, HFAvatar, HFTopBar, HFTask, HFSparkle, HFIcon });
