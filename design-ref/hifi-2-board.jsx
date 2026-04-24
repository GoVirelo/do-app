// Hi-fi #2 — Board / Kanban by Priority
// Columns: NOW · TODAY · THIS WEEK · DONE
// Cards pulled from all sources, dense and scannable.

function HF2_Board() {
  return (
    <div className="hf-root" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <HFTopBar view="Board" right={
        <>
          <button className="hf-btn hf-btn-sm hf-btn-ghost">Filter</button>
          <button className="hf-btn hf-btn-primary hf-btn-sm">{HFIcon.plus(12)} New</button>
        </>
      } />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: HF.bg0 }}>
        <div style={{ width: 200, background: HF.bg1, borderRight: `1px solid ${HF.line}`, padding: '14px 10px' }}>
          <HFSidebarItem icon={HFIcon.flash()} label="Stream" count={23} />
          <HFSidebarItem icon={HFIcon.today()} label="Today" count={7} />
          <HFSidebarItem icon={HFIcon.cal()} label="Board" count={23} active />
          <HFSidebarItem icon={HFIcon.done()} label="Done" dim />
          <HFSidebarHeader>Sources</HFSidebarHeader>
          <HFSidebarSource kind="granola" label="Granola" count={12} />
          <HFSidebarSource kind="slack" label="Slack" count={7} />
          <HFSidebarSource kind="outlook" label="Outlook" count={4} />
          <HFSidebarSource kind="personal" label="Personal" count={5} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 18 }}>
          <div style={{ marginBottom: 14 }}>
            <h1>Board</h1>
            <div className="hf-mono" style={{ fontSize: 11.5, color: HF.fg2, marginTop: 4 }}>Thu 24 Apr · drag to reprioritise</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, minHeight: 500 }}>
            <Column title="Now" color={HF.oxblood} count={3}>
              <Card priority="hot" src="slack" title="Reply to Sara — Q2 budget numbers" meta="2h ago · 3pm sync" hasDraft />
              <Card priority="hot" src="outlook" title="Send design deck to Marcus" meta="Due 5:00 PM" />
              <Card priority="hot" src="slack" title="Approve contract redline" meta="Legal · blocked" />
            </Column>
            <Column title="Today" color={HF.bronze} count={6}>
              <Card src="granola" title="Confirm launch date w/ marketing" meta="Product sync · 11:32" />
              <Card src="granola" title="Review API spec — section 3" meta="Product sync · 11:32" />
              <Card src="slack" title="Review PR #842 — Auth refactor" meta="from Jen · #eng" />
              <Card src="outlook" title="Approve Q1 expense report" meta="HR · 1 day" />
              <Card src="personal" title="Follow up on vendor contract" meta="3 days silent" hasDraft />
              <Card src="granola" title="Draft hiring rubric — Sr. PM" meta="1:1 w/ David" />
            </Column>
            <Column title="This week" color={HF.steel} count={5}>
              <Card src="personal" title="Update roadmap doc w/ Q3 OKRs" meta="—" />
              <Card src="personal" title="Prep notes for Mon offsite" meta="Due Mon 28" />
              <Card src="outlook" title="Review legal MSA draft" meta="Due Fri" />
              <Card src="slack" title="Architecture RFC comments" meta="#eng · Wed" />
              <Card src="granola" title="Follow-up on vendor pricing" meta="Vendor call" />
            </Column>
            <Column title="Done" color={HF.forest} count={9} muted>
              <Card src="outlook" title="Send NDA to legal" meta="Today 9:14" done />
              <Card src="outlook" title="Schedule 1:1 w/ David" meta="Yesterday" done />
              <Card src="slack" title="Reply in #design crit" meta="Tue" done />
              <Card src="granola" title="Share Q1 retro notes" meta="Mon" done />
              <Card src="personal" title="Book flights for offsite" meta="Mon" done />
            </Column>
          </div>
        </div>
      </div>
    </div>
  );
}

function Column({ title, color, count, children, muted }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: muted ? 0.85 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px 8px', borderBottom: `1px solid ${HF.line}` }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <span className="hf-mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: HF.fg1 }}>{title}</span>
        <span className="hf-mono" style={{ fontSize: 11, color: HF.fg3 }}>{count}</span>
        <div style={{ flex: 1 }} />
        <button className="hf-btn hf-btn-ghost hf-btn-xs">{HFIcon.plus(10)}</button>
      </div>
      {children}
    </div>
  );
}

function Card({ title, meta, src, priority, done, hasDraft }) {
  return (
    <div className="hf-card" style={{
      padding: 10, background: HF.bg2, borderLeft: priority === 'hot' ? `2px solid ${HF.oxblood}` : `1px solid ${HF.line}`,
      opacity: done ? 0.55 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div className={`hf-check ${done ? 'hf-check-done' : ''}`} style={{ marginTop: 1 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: HF.fg0, lineHeight: 1.4, textDecoration: done ? 'line-through' : 'none', marginBottom: 6 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <HFSrc kind={src} />
            <span className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3 }}>{meta}</span>
          </div>
          {hasDraft && (
            <div style={{ marginTop: 8, padding: '5px 8px', borderRadius: 4, background: HF.bronzeSoft, border: `1px solid ${HF.bronzeLine}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <HFSparkle size={9} />
              <span className="hf-mono" style={{ fontSize: 10, color: HF.bronze, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Draft ready</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.HF2_Board = HF2_Board;
