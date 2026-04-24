// Hi-fi #4 — Triage inbox
// Gmail/Linear-style compact inbox. Tasks listed linearly;
// selecting one reveals full context + AI draft on the right.

function HF4_Triage() {
  return (
    <div className="hf-root" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <HFTopBar view="Stream" right={
        <>
          <button className="hf-btn hf-btn-sm hf-btn-ghost">Mark all read</button>
          <button className="hf-btn hf-btn-primary hf-btn-sm">{HFIcon.plus(12)} New</button>
        </>
      } />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: HF.bg0 }}>
        <div style={{ width: 180, background: HF.bg1, borderRight: `1px solid ${HF.line}`, padding: '14px 10px' }}>
          <HFSidebarItem icon={HFIcon.inbox(14)} label="Inbox" count={23} active />
          <HFSidebarItem icon={HFIcon.flash()} label="Needs reply" count={5} />
          <HFSidebarItem icon={HFIcon.today()} label="Scheduled" count={7} />
          <HFSidebarItem icon={HFIcon.done()} label="Archived" dim />
          <HFSidebarHeader>Sources</HFSidebarHeader>
          <HFSidebarSource kind="granola" label="Granola" count={12} />
          <HFSidebarSource kind="slack" label="Slack" count={7} />
          <HFSidebarSource kind="outlook" label="Outlook" count={4} />
          <HFSidebarSource kind="personal" label="Personal" count={5} />
        </div>

        {/* Inbox list */}
        <div style={{ width: 380, borderRight: `1px solid ${HF.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${HF.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Inbox</h2>
              <div className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3, marginTop: 2 }}>23 OPEN · 5 NEED REPLY</div>
            </div>
            <button className="hf-btn hf-btn-ghost hf-btn-xs">Sort ▾</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <InboxRow active priority="hot" src="slack" from="Sara Chen" title="Q2 budget numbers for Thursday sync"
              preview="Hi M, could you share the rolling Q2 figures before 3? Especially margin breakdown by product line." time="2h" />
            <InboxRow priority="hot" src="outlook" from="Marcus (self)" title="Send design deck to Marcus"
              preview="Reminder: deck export due 5:00 PM today. Attachments already queued." time="3h" />
            <InboxRow src="granola" from="Product sync · Granola" title="Confirm launch date with marketing"
              preview="Marcus: …can you loop in marketing by Fri? We need to lock the comms timeline." time="11:32" />
            <InboxRow src="granola" from="Product sync · Granola" title="Review API spec — section 3"
              preview="Jen: …need your eyes on section 3 before Tue. Especially the rate-limit policy." time="11:32" />
            <InboxRow src="slack" from="Jen · #eng" title="Review PR #842 — Auth refactor"
              preview="Dropped the refactor in #eng. Wanted a second set of eyes before merge Friday." time="Wed" />
            <InboxRow src="outlook" from="HR" title="Approve Q1 expense report"
              preview="Your Q1 report is awaiting approval. 14 line items, $3,247.20 total." time="Wed" />
            <InboxRow src="personal" from="You" title="Follow up on vendor contract"
              preview="Self-note: 3 days no reply from vendor on MSA redline. Escalate or move on." time="Mon" />
            <InboxRow src="granola" from="1:1 w/ David" title="Draft hiring rubric — Sr. PM"
              preview="David committed to drafting the rubric. Target review end of week." time="Tue" />
            <InboxRow src="outlook" from="Legal" title="Review MSA draft" preview="New redline attached. Your comments requested by Fri." time="Mon" />
          </div>
        </div>

        {/* Detail pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px 14px', borderBottom: `1px solid ${HF.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <HFSrc kind="slack" />
              <span className="hf-chip" style={{ color: HF.oxblood, borderColor: HF.oxblood, background: HF.oxbloodSoft }}>Hot</span>
              <span className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3, letterSpacing: '0.05em' }}>#FINANCE · THREAD · 2H AGO</span>
              <div style={{ flex: 1 }} />
              <button className="hf-btn hf-btn-sm">Snooze</button>
              <button className="hf-btn hf-btn-sm">Delegate</button>
              <button className="hf-btn hf-btn-sm">Done</button>
            </div>
            <h1>Reply to Sara — Q2 budget numbers</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <HFAvatar initial="S" size={26} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>Sara Chen</div>
                <div style={{ fontSize: 11, color: HF.fg3 }}>CFO · needs reply before 3:00 PM sync</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '18px 24px' }}>
            <h3 style={{ marginBottom: 8, color: HF.fg2 }}>Context</h3>
            <div className="hf-card" style={{ padding: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: HF.fg1, lineHeight: 1.6 }}>
                "Hi M, could you share the rolling Q2 figures before 3? Especially margin breakdown by product line. We'll review in the leadership sync right after."
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="hf-chip">Q2-plan.pdf</span>
                <span className="hf-chip">margins.xlsx</span>
                <span className="hf-chip">3 related threads</span>
              </div>
            </div>

            <h3 style={{ marginBottom: 8, color: HF.fg2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HFSparkle /> <span style={{ color: HF.bronze }}>AI draft reply</span>
            </h3>
            <div className="hf-ai-fill" style={{ padding: 16, borderRadius: HF.r3 }}>
              <div style={{ fontSize: 13.5, color: HF.fg0, lineHeight: 1.65 }}>
                Hi Sara —<br/><br/>
                Here's Q2 at a glance: Revenue <strong style={{color:HF.bronze}}>$1.2M (+18% QoQ)</strong>, blended margin <strong style={{color:HF.bronze}}>34%</strong>. Margin breakdown by product line is in the attached deck (slide 4). Raw figures in margins.xlsx.<br/><br/>
                Happy to walk through before 3 if useful — otherwise see you in the sync.
              </div>
              <div className="hf-dots" style={{ margin: '14px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button className="hf-btn hf-btn-primary">Send to #finance</button>
                <button className="hf-btn">Edit</button>
                <button className="hf-btn hf-btn-ghost">Regenerate</button>
                <div style={{ flex: 1 }} />
                <span className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3, letterSpacing: '0.04em' }}>USES Q2-PLAN.PDF · MARGINS.XLSX</span>
              </div>
            </div>

            <h3 style={{ margin: '22px 0 8px', color: HF.fg2 }}>Related</h3>
            <div className="hf-card" style={{ padding: 10 }}>
              <MiniRelated src="outlook" title="Leadership sync — 3:00 PM" meta="Blocked until this reply goes" />
              <MiniRelated src="slack" title="Q2 figures thread · #finance" meta="4 messages · Sara, Leo, you" />
              <MiniRelated src="granola" title="Last CFO 1:1 notes" meta="Mentioned margin concerns" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxRow({ active, priority, src, from, title, preview, time }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '12px 14px',
      borderBottom: `1px solid ${HF.line}`,
      background: active ? HF.bg2 : 'transparent',
      borderLeft: active ? `2px solid ${HF.bronze}` : `2px solid transparent`,
      cursor: 'pointer',
    }}>
      <div className={`hf-prio ${priority === 'hot' ? 'hf-prio-hot' : ''}`} style={{ marginTop: 4, height: 14 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <HFSrc kind={src} />
          <span style={{ fontSize: 11.5, color: HF.fg2, fontWeight: 500 }}>{from}</span>
          <div style={{ flex: 1 }} />
          <span className="hf-mono" style={{ fontSize: 10.5, color: HF.fg3 }}>{time}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: HF.fg0, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: 11.5, color: HF.fg2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</div>
      </div>
    </div>
  );
}

function MiniRelated({ src, title, meta }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 6px', borderBottom: `1px solid ${HF.line}` }}>
      <HFSrc kind={src} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: HF.fg0 }}>{title}</div>
        <div style={{ fontSize: 11, color: HF.fg3, marginTop: 1 }}>{meta}</div>
      </div>
      <button className="hf-btn hf-btn-ghost hf-btn-xs">Open ↗</button>
    </div>
  );
}

window.HF4_Triage = HF4_Triage;
