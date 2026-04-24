// Hi-fi #5 — Mobile (iOS)
// Stream + quick actions, fits 390×844. Tap to expand task, approve/edit drafts.

function HF5_Mobile() {
  return (
    <div className="hf-root" style={{ width: 390, height: 844, background: HF.bg0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 36, border: `1px solid ${HF.line2}`, position: 'relative' }}>
      {/* Status bar */}
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', fontFamily: HF.sans, fontSize: 14, fontWeight: 600 }}>
        <span>10:24</span>
        <span style={{ display: 'flex', gap: 5 }}>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="6" width="2" height="4" rx="0.5"/><rect x="4" y="4" width="2" height="6" rx="0.5"/><rect x="8" y="2" width="2" height="8" rx="0.5"/><rect x="12" y="0" width="2" height="10" rx="0.5"/></svg>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><path d="M8 9l3-3a4 4 0 0 0-6 0zM8 9l6-6a8 8 0 0 0-12 0z" opacity="0.5"/></svg>
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor"/><rect x="2" y="2" width="14" height="6" rx="1" fill="currentColor"/><rect x="19.5" y="3" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>
        </span>
      </div>

      {/* Header */}
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: HF.display, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>do.</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: HF.bg2, border: `1px solid ${HF.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HFSparkle size={14} />
            </div>
            <HFAvatar initial="M" size={32} />
          </div>
        </div>
        <div className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Thu 24 Apr · 23 open</div>
        <h1 style={{ fontSize: 28 }}>3 need reply</h1>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 14px', overflow: 'auto' }}>
        {[['All',23,true],['Hot',2],['Today',6],['Meetings',4],['Personal',5]].map(([l,c,a]) => (
          <div key={l} style={{
            height: 30, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6,
            background: a ? HF.bg3 : HF.bg2, color: a ? HF.fg0 : HF.fg2,
            border: `1px solid ${a ? HF.line2 : HF.line}`, borderRadius: 15,
            fontSize: 12, fontWeight: 500, flexShrink: 0,
          }}>
            {l} <span className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3 }}>{c}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 100px' }}>
        {/* Meeting card */}
        <div className="hf-card" style={{ padding: 14, marginBottom: 12, borderLeft: `2px solid ${HF.amber}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <HFSrc kind="granola" />
            <span className="hf-mono" style={{ fontSize: 10, color: HF.fg3, letterSpacing: '0.04em' }}>MEETING · ENDED 11:32</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>Product sync with Eng</div>
          <div style={{ fontSize: 11.5, color: HF.fg2, marginBottom: 10 }}>2 actions extracted for you</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="hf-btn hf-btn-primary hf-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Review</button>
            <button className="hf-btn hf-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Add all</button>
          </div>
        </div>

        <MobileSection label="Now" color={HF.oxblood}>
          <MobileTask priority="hot" src="slack" title="Reply to Sara — Q2 budget" meta="2h ago · before 3pm" expanded draft="Hi Sara — here's Q2: Revenue $1.2M (+18% QoQ), margin 34%. Full deck attached. Ping if you need raw figures before 3." />
          <MobileTask priority="hot" src="outlook" title="Send design deck to Marcus" meta="Due 5:00 PM" />
        </MobileSection>

        <MobileSection label="Today" color={HF.bronze}>
          <MobileTask src="granola" title="Confirm launch date" meta="Product sync · 11:32" />
          <MobileTask src="granola" title="Review API spec §3" meta="Product sync · 11:32" />
          <MobileTask src="slack" title="Review PR #842" meta="from Jen · #eng" />
          <MobileTask src="outlook" title="Approve Q1 expenses" meta="HR · 1 day" />
        </MobileSection>
      </div>

      {/* Floating quick-add */}
      <div style={{ position: 'absolute', bottom: 100, right: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${HF.bronze}, #8a5a1e)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px rgba(200,137,63,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`, color: '#1a1108' }}>
          {HFIcon.plus(22)}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 84, background: HF.bg1, borderTop: `1px solid ${HF.line}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: 10 }}>
        {[['Stream',HFIcon.flash(),true],['Day',HFIcon.today()],['Assistant',<HFSparkle size={16}/>],['Me',HFIcon.user()]].map(([l,i,a]) => (
          <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: a ? HF.bronze : HF.fg3 }}>
            {i}
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.02em' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileSection({ label, color, children }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 6px 8px' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        <span className="hf-mono" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: HF.fg1 }}>{label}</span>
      </div>
      {children}
    </>
  );
}

function MobileTask({ title, meta, src, priority, expanded, draft }) {
  return (
    <div className="hf-card" style={{ padding: 14, marginBottom: 8, borderLeft: priority === 'hot' ? `2px solid ${HF.oxblood}` : `1px solid ${HF.line}` }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div className="hf-check" style={{ marginTop: 2, width: 18, height: 18 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 5 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HFSrc kind={src} />
            <span className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3 }}>{meta}</span>
          </div>
          {expanded && draft && (
            <div className="hf-ai-fill" style={{ marginTop: 10, padding: 10, borderRadius: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <HFSparkle size={10} />
                <span className="hf-mono" style={{ fontSize: 9.5, color: HF.bronze, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Draft reply</span>
              </div>
              <div style={{ fontSize: 12.5, color: HF.fg1, lineHeight: 1.5 }}>{draft}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button className="hf-btn hf-btn-primary hf-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Send</button>
                <button className="hf-btn hf-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Edit</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.HF5_Mobile = HF5_Mobile;
