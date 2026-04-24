// Hi-fi #1 — Unified Stream (flagship view)
// Dark, masculine, Linear/Raycast-inspired. Three panes:
// sidebar | main stream | AI assistant rail.

function HF1_Stream() {
  return (
    <div className="hf-root" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <HFTopBar view="Stream" right={
        <>
          <button className="hf-btn hf-btn-sm hf-btn-ghost">Filter</button>
          <button className="hf-btn hf-btn-primary hf-btn-sm">{HFIcon.plus(12)} New task</button>
        </>
      } />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: 200, background: HF.bg1, borderRight: `1px solid ${HF.line}`, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
          <SidebarItem icon={HFIcon.flash()} label="Stream" count={23} active />
          <SidebarItem icon={HFIcon.today()} label="Today" count={7} />
          <SidebarItem icon={HFIcon.cal()} label="Upcoming" count={14} />
          <SidebarItem icon={HFIcon.done()} label="Done" dim />

          <SidebarHeader>Sources</SidebarHeader>
          <SidebarSource kind="granola" label="Granola" count={12} />
          <SidebarSource kind="slack" label="Slack" count={7} />
          <SidebarSource kind="outlook" label="Outlook" count={4} />
          <SidebarSource kind="personal" label="Personal" count={5} />

          <SidebarHeader>Views</SidebarHeader>
          <SidebarItem icon={HFIcon.user()} label="Delegated" />
          <SidebarItem icon={HFIcon.meet()} label="From meetings" />

          <div style={{ flex: 1 }} />
          <div style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: 8, color: HF.fg2, fontSize: 11.5 }}>
            {HFIcon.settings()} <span>Connections</span>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto', background: HF.bg0 }}>
          <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h1>Stream</h1>
              <div className="hf-mono" style={{ fontSize: 11.5, color: HF.fg2, marginTop: 4 }}>
                Thu 24 Apr · 23 open · 3 need reply
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="hf-btn hf-btn-sm hf-btn-ghost">Group: Priority</button>
              <button className="hf-btn hf-btn-sm hf-btn-ghost">Sort</button>
            </div>
          </div>

          {/* Section: NOW */}
          <SectionHeader label="Now" color={HF.oxblood} count={2} />
          <HFTask priority="hot" title="Reply to Sara — Q2 budget numbers" src="slack"
            meta="#finance · 2h ago · leadership sync at 3pm"
            aiDraft={`Hi Sara — here's Q2: Revenue $1.2M (+18% QoQ), margin 34%. Full deck attached. Ping if you need the raw figures before 3.`} />
          <HFTask priority="hot" title="Send design deck to Marcus" src="outlook"
            meta="Due today 5:00 PM · attachments ready" />

          {/* Meeting card */}
          <div style={{ padding: '0 14px', marginTop: 8 }}>
            <MeetingCard />
          </div>

          {/* Section: TODAY */}
          <SectionHeader label="Today" color={HF.bronze} count={6} />
          <HFTask title="Review PR #842 — Auth refactor" src="slack" meta="from Jen · #eng · yesterday" />
          <HFTask title="Approve Q1 expense report" src="outlook" meta="HR team · 1 day" />
          <HFTask title="Follow up on vendor contract" src="personal"
            meta="Added Mon · no reply 3 days"
            aiDraft={`Quick follow-up on the MSA redline we sent Monday — any updates? Happy to jump on a call if easier.`} />
          <HFTask title="Confirm launch date with marketing" src="granola" meta="Extracted · Product sync · 11:32" />
          <HFTask title="Review API spec — section 3" src="granola" meta="Extracted · Product sync · 11:32" />
          <HFTask title="Draft hiring rubric — Sr. PM" src="granola" meta="Extracted · 1:1 w/ David · Tue" />

          {/* Section: THIS WEEK */}
          <SectionHeader label="This week" color={HF.steel} count={4} />
          <HFTask title="Update roadmap doc with Q3 OKRs" src="personal" meta="No due date" />
          <HFTask title="Prep notes for Monday offsite" src="personal" meta="Due Mon 28 Apr" />
          <HFTask done title="Send NDA to legal" src="outlook" meta="Completed 9:14 AM" />
          <HFTask done title="Schedule 1:1 with David" src="outlook" meta="Completed yesterday" />

          <div style={{ padding: '30px 14px 40px', textAlign: 'center' }}>
            <span className="hf-mono" style={{ fontSize: 11, color: HF.fg3 }}>— end of stream —</span>
          </div>
        </div>

        {/* AI rail */}
        <AIRail />
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, count, active, dim }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px',
      color: active ? HF.fg0 : dim ? HF.fg3 : HF.fg1,
      background: active ? HF.bg3 : 'transparent',
      border: active ? `1px solid ${HF.line2}` : '1px solid transparent',
      borderRadius: HF.r2, fontSize: 12.5, fontWeight: active ? 500 : 400,
      cursor: 'pointer',
    }}>
      <span style={{ color: active ? HF.bronze : 'inherit', display: 'flex' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && (
        <span className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3 }}>{count}</span>
      )}
    </div>
  );
}

function SidebarHeader({ children }) {
  return (
    <div className="hf-mono" style={{
      fontSize: 10, color: HF.fg3, letterSpacing: '0.08em',
      textTransform: 'uppercase', padding: '14px 10px 6px',
    }}>{children}</div>
  );
}

function SidebarSource({ kind, label, count }) {
  const c = HF['src' + kind[0].toUpperCase() + kind.slice(1)] || HF.srcPersonal;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '5px 10px',
      color: HF.fg1, fontSize: 12.5, cursor: 'pointer', borderRadius: HF.r2,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.fg }} />
      <span style={{ flex: 1 }}>{label}</span>
      <span className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3 }}>{count}</span>
    </div>
  );
}

function SectionHeader({ label, count, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px 6px',
      borderBottom: `1px solid ${HF.line}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      <span className="hf-mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: HF.fg1 }}>{label}</span>
      <span className="hf-mono" style={{ fontSize: 11, color: HF.fg3 }}>{count}</span>
      <div style={{ flex: 1 }} />
      <button className="hf-btn hf-btn-ghost hf-btn-xs">{HFIcon.plus(10)}</button>
    </div>
  );
}

function MeetingCard() {
  return (
    <div className="hf-card" style={{ padding: 14, borderLeft: `2px solid ${HF.forest}`, background: HF.bg2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <HFSrc kind="granola" />
        <span className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3, letterSpacing: '0.05em' }}>MEETING · ENDED 11:32 · 48 MIN</span>
        <div style={{ flex: 1 }} />
        <button className="hf-btn hf-btn-sm hf-btn-ghost">View notes ↗</button>
      </div>
      <h2 style={{ marginBottom: 8 }}>Product sync with Eng</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        {['M','J','K','A','R'].map(i => <HFAvatar key={i} initial={i} size={22} />)}
        <span style={{ fontSize: 11.5, color: HF.fg2, marginLeft: 4 }}>5 attendees</span>
      </div>
      <div style={{ borderTop: `1px solid ${HF.line}`, paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <HFSparkle size={10} />
          <span className="hf-mono" style={{ fontSize: 10, color: HF.bronze, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Extracted for you · 2 actions</span>
        </div>
        <ExtractedAction title="Confirm launch date with marketing" quote="Marcus: &ldquo;…can you loop in marketing by Fri?&rdquo;" />
        <ExtractedAction title="Review API spec before Tuesday" quote="Jen: &ldquo;…need your eyes on section 3…&rdquo;" />
      </div>
    </div>
  );
}

function ExtractedAction({ title, quote }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 0', alignItems: 'flex-start' }}>
      <div className="hf-check" style={{ marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: HF.fg0 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: HF.fg2, fontStyle: 'italic', marginTop: 2 }} dangerouslySetInnerHTML={{ __html: quote }} />
      </div>
      <button className="hf-btn hf-btn-sm">Add</button>
      <button className="hf-btn hf-btn-ghost hf-btn-sm">Skip</button>
    </div>
  );
}

function AIRail() {
  return (
    <div style={{ width: 300, background: HF.bg1, borderLeft: `1px solid ${HF.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${HF.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: `linear-gradient(135deg, ${HF.bronze}, ${HF.oxblood})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HFSparkle size={12} color="#1a1108" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Assistant</div>
          <div className="hf-mono" style={{ fontSize: 10, color: HF.fg3, letterSpacing: '0.04em' }}>4 SUGGESTIONS · LIVE</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        <AICard label="Draft ready · Slack" body={`&ldquo;Thanks — I'll send the deck by EOD Thursday. Let me know if earlier works.&rdquo;`} actions={[['Send','primary'],['Edit',''],['Skip','ghost']]} />
        <AICard label="Batch suggestion" body="3 'budget' tasks could be handled together in a 25 min block Wed 2:00 PM." actions={[['Schedule','primary'],['Dismiss','ghost']]} />
        <AICard label="Turn into meeting" body="&ldquo;Confirm launch date&rdquo; may need marketing + eng. Propose 15 min Fri 10:00?" actions={[['Create invite','primary'],['Not now','ghost']]} />
        <AICard label="Auto-handle" body="&ldquo;Can you share the Q2 doc?&rdquo; → reply with Q2-plan.pdf link." actions={[['Approve','primary'],['Review','']]} dashed />
      </div>

      <div style={{ padding: 12, borderTop: `1px solid ${HF.line}`, background: HF.bg2 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="hf-input" placeholder="Ask your assistant…" style={{ height: 30, fontSize: 12 }} />
          <button className="hf-btn hf-btn-primary hf-btn-sm" style={{ padding: '0 10px' }}>↵</button>
        </div>
      </div>
    </div>
  );
}

function AICard({ label, body, actions, dashed }) {
  return (
    <div className="hf-card" style={{ padding: 12, border: dashed ? `1px dashed ${HF.bronzeLine}` : `1px solid ${HF.line}`, background: HF.bg2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <HFSparkle size={10} />
        <span className="hf-mono" style={{ fontSize: 10, color: HF.bronze, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 12.5, color: HF.fg1, lineHeight: 1.5, marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: body }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {actions.map(([t, k], i) => (
          <button key={i} className={`hf-btn hf-btn-sm ${k==='primary'?'hf-btn-primary':k==='ghost'?'hf-btn-ghost':''}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}

window.HF1_Stream = HF1_Stream;
window.HFSidebarItem = SidebarItem;
window.HFSidebarHeader = SidebarHeader;
window.HFSidebarSource = SidebarSource;
window.HFSectionHeader = SectionHeader;
window.HFMeetingCard = MeetingCard;
window.HFAIRail = AIRail;
window.HFAICard = AICard;
