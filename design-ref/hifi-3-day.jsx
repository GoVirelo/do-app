// Hi-fi #3 — Day / Timeline view
// Left: hour-by-hour timeline with meetings + task slots.
// Right: today's actionable list + AI suggestions to schedule.

function HF3_Day() {
  const hours = ['8','9','10','11','12','1','2','3','4','5','6'];
  return (
    <div className="hf-root" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <HFTopBar view="Day" right={
        <>
          <button className="hf-btn hf-btn-sm hf-btn-ghost">‹ Wed</button>
          <button className="hf-btn hf-btn-sm">Thu 24</button>
          <button className="hf-btn hf-btn-sm hf-btn-ghost">Fri ›</button>
        </>
      } />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: HF.bg0 }}>
        <div style={{ width: 200, background: HF.bg1, borderRight: `1px solid ${HF.line}`, padding: '14px 10px' }}>
          <HFSidebarItem icon={HFIcon.flash()} label="Stream" count={23} />
          <HFSidebarItem icon={HFIcon.today()} label="Day" count={7} active />
          <HFSidebarItem icon={HFIcon.cal()} label="Board" />
          <HFSidebarHeader>Layers</HFSidebarHeader>
          <LayerToggle color={HF.steel} label="Outlook calendar" on />
          <LayerToggle color={HF.amber} label="Granola meetings" on />
          <LayerToggle color={HF.bronze} label="Task slots" on />
          <LayerToggle color={HF.plum} label="Slack focus" />
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, display: 'flex', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 18px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, paddingLeft: 44 }}>
              <div>
                <h1>Thursday, 24 April</h1>
                <div className="hf-mono" style={{ fontSize: 11.5, color: HF.fg2, marginTop: 4 }}>3 meetings · 4 task slots · 2h deep work</div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              {hours.map((h, i) => (
                <div key={h} style={{ display: 'flex', alignItems: 'stretch', height: 56, borderTop: `1px solid ${HF.line}` }}>
                  <div className="hf-mono" style={{ width: 44, fontSize: 10.5, color: HF.fg3, paddingTop: 4, textAlign: 'right', paddingRight: 10 }}>{h} {i<4?'AM':'PM'}</div>
                  <div style={{ flex: 1, position: 'relative' }} />
                </div>
              ))}
              {/* Now line */}
              <NowLine top={56 * 3 + 20} />

              {/* Meeting blocks */}
              <Block top={0}   height={56}  left={54} src="outlook" title="Standup" meta="8:00 – 9:00" tone="outlook" />
              <Block top={56*2.5} height={48} left={54} src="granola" title="Product sync (done)" meta="11:00 – 11:48 · 2 actions extracted" tone="granola" done />
              <Block top={56*4 + 10} height={80} left={54} src="personal" title="Focus — Deck work" meta="12:10 – 1:30 · suggested" tone="focus" dashed />
              <Block top={56*5 + 20} height={56} left={54} src="outlook" title="Leadership sync" meta="3:00 – 3:45 · reply to Sara first" tone="outlook" urgent />
              <Block top={56*7 + 30} height={48} left={54} src="personal" title="Send design deck" meta="Task slot · 4:30 – 5:00" tone="task" dashed />
            </div>
          </div>

          {/* Day tasks rail */}
          <div style={{ width: 280, background: HF.bg1, borderLeft: `1px solid ${HF.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${HF.line}` }}>
              <h3>Today's list</h3>
              <div className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3, marginTop: 2 }}>DRAG ONTO TIMELINE TO SCHEDULE</div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 4 }}>
              <MiniTask priority="hot" src="slack" title="Reply to Sara — Q2" meta="before 3pm" draft />
              <MiniTask priority="hot" src="outlook" title="Send design deck" meta="due 5pm" scheduled />
              <MiniTask src="granola" title="Confirm launch date" meta="Product sync" />
              <MiniTask src="granola" title="Review API spec — §3" meta="Product sync" />
              <MiniTask src="slack" title="Review PR #842" meta="#eng" />
              <MiniTask src="outlook" title="Approve expenses" meta="HR" />
              <MiniTask src="personal" title="Follow up vendor" meta="3 days silent" draft />
            </div>
            <div style={{ padding: 12, borderTop: `1px solid ${HF.line}`, background: HF.bg2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <HFSparkle size={10} />
                <span className="hf-mono" style={{ fontSize: 10, color: HF.bronze, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Auto-schedule</span>
              </div>
              <div style={{ fontSize: 11.5, color: HF.fg1, lineHeight: 1.5, marginBottom: 8 }}>Fit 4 remaining tasks into 2h 15m of open slots today?</div>
              <button className="hf-btn hf-btn-primary hf-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Plan my day</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayerToggle({ color, label, on }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 10px', color: HF.fg1, fontSize: 12, cursor: 'pointer' }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: on ? color : 'transparent', border: `1.5px solid ${on ? color : HF.line2}` }} />
      <span style={{ flex: 1, color: on ? HF.fg0 : HF.fg2 }}>{label}</span>
    </div>
  );
}

function NowLine({ top }) {
  return (
    <div style={{ position: 'absolute', top, left: 44, right: 0, height: 2, background: HF.oxblood, boxShadow: `0 0 8px ${HF.oxblood}`, zIndex: 5 }}>
      <div style={{ position: 'absolute', left: -5, top: -4, width: 10, height: 10, borderRadius: '50%', background: HF.oxblood }} />
      <span className="hf-mono" style={{ position: 'absolute', right: 8, top: -18, fontSize: 10, color: HF.oxblood, fontWeight: 600 }}>NOW · 10:24</span>
    </div>
  );
}

function Block({ top, height, left, title, meta, tone, dashed, done, urgent }) {
  const tones = {
    outlook: { bg: HF.srcOutlook.bg, line: HF.srcOutlook.line, fg: HF.srcOutlook.fg },
    granola: { bg: HF.srcGranola.bg, line: HF.srcGranola.line, fg: HF.srcGranola.fg },
    focus:   { bg: HF.bronzeSoft,    line: HF.bronzeLine,     fg: HF.bronze },
    task:    { bg: HF.bg3,           line: HF.line2,          fg: HF.fg1 },
  }[tone] || { bg: HF.bg2, line: HF.line, fg: HF.fg1 };
  return (
    <div style={{
      position: 'absolute', top, left, right: 16, height: height - 4,
      background: tones.bg, border: `1px ${dashed ? 'dashed' : 'solid'} ${urgent ? HF.oxblood : tones.line}`,
      borderLeft: `3px solid ${urgent ? HF.oxblood : tones.fg}`,
      borderRadius: HF.r2, padding: '6px 10px', overflow: 'hidden',
      opacity: done ? 0.55 : 1,
    }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: HF.fg0, textDecoration: done ? 'line-through' : 'none' }}>{title}</div>
      <div className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3, marginTop: 2 }}>{meta}</div>
    </div>
  );
}

function MiniTask({ title, meta, src, priority, draft, scheduled }) {
  return (
    <div className="hf-row" style={{ display: 'flex', gap: 8, padding: '8px 10px', alignItems: 'flex-start', borderRadius: HF.r2, cursor: 'grab' }}>
      <div className={`hf-prio ${priority === 'hot' ? 'hf-prio-hot' : ''}`} style={{ marginTop: 4 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: HF.fg0, fontWeight: 500 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
          <HFSrc kind={src} />
          <span className="hf-mono" style={{ fontSize: 10, color: HF.fg3 }}>{meta}</span>
        </div>
      </div>
      {draft && <HFSparkle size={10} />}
      {scheduled && <span className="hf-mono" style={{ fontSize: 9.5, color: HF.forest, letterSpacing: '0.05em', fontWeight: 600 }}>✓ 4:30</span>}
    </div>
  );
}

window.HF3_Day = HF3_Day;
