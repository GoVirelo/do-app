# Handoff: **do.** — Unified To-Do Tool

A personal command center that pulls action items from **Granola** (meeting notes), **Outlook** (email + calendar), and **Slack** (DMs + mentions) into a single prioritized list, surfaces AI-suggested drafts/replies for review, and extracts "actions for me" from meeting transcripts automatically.

---

## About the Design Files

The files in this bundle are **design references created in HTML/JSX** — prototypes showing intended look, structure, and behaviour. They are **not production code to copy directly**. The task is to recreate these designs in the target codebase's existing environment (React web, React Native, Next.js, Electron, SwiftUI, etc.) using its established patterns, state management, and component libraries. If no codebase exists yet, pick the stack that best fits the product (recommended below).

**Recommended stack if starting fresh:**
- **Web:** Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + Zustand (or TanStack Query for server state)
- **Mobile:** React Native (Expo) reusing the same design tokens, or SwiftUI if iOS-only

---

## Fidelity

**High-fidelity.** All colors, typography, spacing, radii, and component states are final. Recreate pixel-accurately using the target codebase's idioms.

---

## Product Summary

### Core jobs
1. **Centralise** — show every action item from Granola, Outlook, Slack in one stream.
2. **Extract** — when a Granola meeting ends, parse the transcript and pull out only items assigned to the current user. Show them as a reviewable meeting card before adding to the main list.
3. **Suggest** — for each task, the AI can propose a draft reply (Slack / email) or an efficient way to complete it (batch similar tasks, schedule a focus block, turn into a meeting).
4. **Approve-to-send** — drafts appear inline with Send / Edit / Skip. Nothing sends without user approval (exception: explicit "Auto-handle" rules the user opts into).
5. **Plan the day** — drag tasks onto a timeline with Outlook calendar + Granola meetings overlaid.

### User roles
- Single user for v1 (personal productivity). Multi-account / delegation is future work.

---

## Integrations

| Source | Auth | What we pull | What we push |
|---|---|---|---|
| **Granola** | OAuth2 | Meetings (title, time, attendees, transcript, summary) | — |
| **Outlook (Microsoft Graph)** | OAuth2 (MS) | Calendar events, flagged emails, @-mentions, tasks (To Do API) | Send email reply (drafted by AI, user-approved), create calendar event |
| **Slack** | OAuth2 (Slack) | DMs addressed to user, channel @-mentions, saved items, messages with action verbs | Post reply in thread, react with ✓, set reminder |

Background sync should run every 2–5 min. Granola action extraction triggers **once per meeting end** (webhook preferred, fall back to polling).

---

## Design Tokens

```
/* Surfaces */
--bg-0: #0a0b0d;   /* canvas */
--bg-1: #111316;   /* panel */
--bg-2: #16191d;   /* card */
--bg-3: #1c2026;   /* card-raised / hover */
--bg-4: #252a31;   /* input bg */
--line:  #2a2f36;
--line-2:#373d45;

/* Text */
--fg-0: #f4f4f2;   /* primary */
--fg-1: #c9cbce;   /* secondary */
--fg-2: #8a8f97;   /* tertiary */
--fg-3: #5a5f67;   /* muted / placeholder */

/* Accents */
--bronze:        #c8893f;   /* primary accent / AI */
--bronze-soft:   #3a2a18;
--bronze-line:   #5a3e1e;
--steel:         #6d89a8;   /* info / Outlook */
--steel-soft:    #1c2838;
--oxblood:       #a14545;   /* hot / urgent */
--oxblood-soft:  #301818;
--forest:        #4a7a5e;   /* done / success */
--forest-soft:   #15221b;
--plum:          #7d5a8c;   /* Slack */
--plum-soft:     #231828;

/* Source hues (for source badges) */
--src-granola:   #d4a55a on #2a1f10 border #4d3920
--src-slack:     #a77bb8 on #241a2a border #3d2b47
--src-outlook:   #7092b8 on #172032 border #2a3a54
--src-personal:  #8a8f97 on #1c2026 border #373d45

/* Typography */
--font-sans:    "Inter", -apple-system, "Segoe UI", system-ui, sans-serif
--font-display: "Space Grotesk", "Inter", system-ui, sans-serif   /* H1/H2 only */
--font-mono:    "JetBrains Mono", "SF Mono", Menlo, monospace     /* timestamps, meta, kbd */

/* Type scale (px) */
h1  22 / display / 600 / -0.02em
h2  16 / display / 600 / -0.02em
h3  14 / display / 600 / -0.02em
body 13 / sans / 400 / -0.005em / 1.5
meta 11 / mono  / 400 / 0 (often uppercase w/ 0.06em tracking)
micro 10.5 / mono / 600 / 0.08em (section labels, "NEEDS REPLY", etc.)

/* Radii */
r1: 4px   r2: 6px   r3: 8px   r4: 12px

/* Spacing: use 4px base grid (4,6,8,10,12,14,16,18,20,24) */

/* Elevation */
primary button: inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.4)
FAB:           0 6px 20px rgba(200,137,63,0.35), inset 0 1px 0 rgba(255,255,255,0.2)

/* Global text features */
font-feature-settings: 'cv11','ss01','ss03'  (Inter)
letter-spacing: -0.005em body, -0.02em display
```

All tokens are defined in `hifi-system.jsx` at the top of the `HF` object — treat that file as source of truth when there's any ambiguity.

---

## Screens / Views

Each view shares the **top bar** and **left sidebar**, then varies the main region.

### Shared chrome

**Top bar** (44px, `bg-1`, bottom border `line`)
- Logo: 22×22 rounded 5px, bronze→brown gradient, "d." in 11px 700
- Wordmark: "do." in display 14/600
- View tabs: Stream · Board · Day · Personal — in a pill group (bg-2, border line, radius r2, 2px pad). Active tab: bg-4, fg-0. Inactive: fg-2. 24px tall buttons.
- Search: max-width 340, bg-2 border line, 28px tall. Placeholder "Search or ask…" + `⌘K` kbd hint.
- Right slot: page-specific actions + user avatar (24px).

**Sidebar** (200px, `bg-1`, right border `line`, 14/10 padding)
- Item rows: 6/10 padding, gap 9, 12.5px, radius r2. Active: bg-3, border line-2, icon in bronze. Hover: subtle bg-2.
- Count badge: mono 10.5, fg-3, right-aligned.
- Section headers: mono 10/600, uppercase, letter-spacing 0.08em, fg-3, 14/10 padding.
- Source rows: 7px colored dot (source fg), label, count.

### 1. Stream (flagship) — `hifi-1-stream.jsx`

**Layout:** sidebar (200) | main (flex, max ~880) | AI rail (300).

**Main stream:**
- Page header: h1 "Stream" + mono sub ("Thu 24 Apr · 23 open · 3 need reply"). Right: Group/Sort buttons.
- **Section headers** (Now / Today / This week): coloured dot (6px) + mono uppercase label + count + small "+" button on the right. Full-width divider.
- **Task row** (`HFTask`): 9/10 padding, bottom border.
  - Checkbox (15×15, 1.5px border line-2, radius 3.5). Checked = bronze fill with white-ish check glyph.
  - Priority bar: 2×12px pill beside checkbox. `hot` = oxblood with 6px glow.
  - Title: 13.5/500, fg-0. Done state: fg-3 + strikethrough.
  - Source badge (`HFSrc`): 18px pill, 9.5/600, uppercase, 0.06em tracking, coloured dot before label.
  - Meta: mono 11/400, fg-3.
  - **AI draft inline** (conditional): bronze-soft bg, bronze-line border, 8/10 padding, r2. Header "AI DRAFT" in bronze mono micro. Body 12.5, fg-1. Buttons: **Send** (primary), Edit, Skip (ghost).
  - Right side: assignee avatar 18px.
- **Meeting card** (`MeetingCard`): bg-2, left border 2px forest. Source badge GRANOLA + mono timestamp. H2 title. Attendee avatar stack (22px, 5 shown). Bottom section: sparkle + "EXTRACTED FOR YOU · 2 ACTIONS". Each extracted action: checkbox + title + italic quote ("Marcus: …can you loop in marketing by Fri?"). Add / Skip buttons per item.

**AI rail (300px, `bg-1`, left border line):**
- Header: 26×26 bronze→oxblood gradient square with sparkle, "Assistant" label + mono sub "4 SUGGESTIONS · LIVE".
- Card list (12px gap). Each card:
  - Micro label in bronze (e.g. "DRAFT READY · SLACK", "BATCH SUGGESTION", "TURN INTO MEETING", "AUTO-HANDLE").
  - Body 12.5/1.5 fg-1.
  - Actions: primary + secondary + ghost.
  - "Auto-handle" variant uses dashed border bronze-line.
- Footer: input ("Ask your assistant…") + primary send button.

### 2. Board — `hifi-2-board.jsx`

4-column kanban by priority.
- Columns: **Now** (oxblood dot) · **Today** (bronze) · **This week** (steel) · **Done** (forest, 85% opacity).
- Column header: coloured dot + mono uppercase label + count + "+" on right, bottom border.
- **Card**: bg-2, 10px pad. Hot cards get a 2px oxblood left border. Done cards 55% opacity + strikethrough.
  - Row: checkbox (15) · title 12.5/500 · meta row (source badge + mono meta).
  - If `hasDraft`: tiny bronze-soft pill "DRAFT READY" below meta.
- Drag-and-drop to reorder/reclassify priority.

### 3. Day — `hifi-3-day.jsx`

Timeline with Outlook + Granola layers.
- Sidebar gets **Layers** section with checkboxes: Outlook calendar, Granola meetings, Task slots, Slack focus. Each layer has a swatch that matches its accent.
- Main: h1 "Thursday, 24 April" + mono sub. Hour rows 56px tall, 8 AM → 6 PM, border-top line. Hour label: mono 10.5 fg-3, 44px gutter.
- **Now line**: 2px oxblood with shadow glow + 10px dot on left + "NOW · 10:24" mono label on the right.
- **Event blocks** positioned absolutely:
  - Outlook meeting: steel-soft bg, steel-line border, 3px steel left bar.
  - Granola meeting: granola-soft bg/line, granola fg left bar; if ended, 55% opacity.
  - Focus slot (suggested): bronze-soft bg, dashed bronze-line border.
  - Task slot: bg-3 / line-2, dashed.
  - Urgent: override left bar to oxblood.
- Right rail (280): "Today's list" with mini tasks (draggable). Each mini task: priority bar + title + source badge + meta. Scheduled shows mono "✓ 4:30" in forest. Drafts show sparkle icon.
- Bottom: **Auto-schedule** card (bg-2, border-top) with sparkle + copy ("Fit 4 remaining tasks into 2h 15m of open slots today?") + primary **Plan my day** full-width button.

### 4. Triage inbox — `hifi-4-triage.jsx`

Gmail/Linear 3-pane for reply-heavy workflow.
- Sidebar (180): Inbox · Needs reply · Scheduled · Archived + Sources.
- **Middle list** (380, right border line): inbox rows.
  - Row: priority bar + from + source badge + time (mono) + title (13/500) + preview (11.5 fg-2). Active row: bg-2 + 2px bronze left border. Truncate with ellipsis.
- **Detail pane** (flex):
  - Header: source badge + hot chip + mono meta ("#FINANCE · THREAD · 2H AGO") + Snooze/Delegate/Done buttons. H1 title. Requester row: avatar 26 + name/role.
  - Body scroll area:
    - "Context" h3 + card with quoted message + attachment chips.
    - "AI draft reply" h3 (with sparkle, bronze). Big ai-fill panel (r3, 16 pad). Reply body 13.5/1.65. Dotted separator. Actions: **Send to #finance** (primary) · Edit · Regenerate · mono provenance on right ("USES Q2-PLAN.PDF · MARGINS.XLSX").
    - "Related" h3 + card with links to related meeting / thread / notes.

### 5. Mobile (iOS) — `hifi-5-mobile.jsx`

390×844. Rounded 36 frame.
- Status bar (44): 10:24, signal/wifi/battery SVGs.
- Header: wordmark + sparkle icon button + avatar. Mono date row. H1 "3 need reply" (28px).
- Filter pills (30px tall, radius 15): All / Hot / Today / Meetings / Personal. Active pill bg-3 border line-2.
- **Meeting card** pinned at top — full-width card with forest-ish left border, source badge, title, "2 actions extracted for you", Review (primary) / Add all buttons.
- Section label ("NOW", "TODAY") in mono micro.
- **MobileTask** card: bg-2, 14 pad, hot = 2px oxblood left. Checkbox 18, title 14/500, source badge + meta. Expanded state shows AI draft (sparkle, draft text, Send/Edit 50/50 buttons).
- **FAB** at bottom-right (56 circle, bronze gradient, + icon, glow).
- Bottom nav (84, bg-1 top border): Stream / Day / Assistant / Me — icon + 10px label. Active in bronze.

---

## Components (target shapes)

Build these as reusable components:

```
<Button variant="primary|secondary|ghost" size="xs|sm|md"/>
<Checkbox checked onChange/>
<SourceBadge kind="granola|slack|outlook|personal"/>
<PriorityBar level="normal|hot"/>
<Chip>...</Chip>
<Kbd>⌘K</Kbd>
<Avatar initial size/>
<SectionHeader label color count onAdd/>

<TaskRow task onToggle onExpand/>       // stream row
<TaskCard task draggable/>              // board card
<TaskMini task draggable/>              // day rail item

<MeetingCard meeting actions/>          // Granola extraction card
<AIDraftPanel draft onSend onEdit onSkip provenance/>
<AISuggestionCard kind label body actions/>

<TimelineBlock event/>                  // absolute-positioned on day view
<LayerToggle layer/>
<NowLine time/>

<Sidebar/>
<TopBar view search right/>
<AIRail suggestions composer/>
```

---

## State Model

```ts
type Source = 'granola' | 'slack' | 'outlook' | 'personal';

type Task = {
  id: string;
  title: string;
  status: 'open' | 'done' | 'snoozed';
  priority: 'normal' | 'hot';
  bucket: 'now' | 'today' | 'this_week' | 'scheduled';
  source: Source;
  sourceRef: {                   // deep-link back to origin
    granola?: { meetingId: string; utteranceId?: string; quote?: string };
    slack?:   { channelId: string; ts: string; threadTs?: string };
    outlook?: { messageId?: string; eventId?: string };
  };
  createdAt: Date;
  dueAt?: Date;
  scheduledBlock?: { start: Date; end: Date };
  assignee: string;              // user id, default = self
  meta?: string;                 // display-only derived string
  aiDraft?: AIDraft;
};

type AIDraft = {
  kind: 'reply' | 'email' | 'slack_message';
  target: { channelId?: string; threadTs?: string; recipient?: string };
  body: string;
  provenance: string[];          // file/thread refs the model used
  autoApprovable: boolean;       // user pre-approved this rule
  state: 'proposed' | 'sending' | 'sent' | 'skipped';
};

type Meeting = {
  id: string;
  provider: 'granola';
  title: string;
  startedAt: Date;
  endedAt: Date;
  attendees: User[];
  transcriptUrl: string;
  extractedActions: Array<{
    taskDraft: Partial<Task>;
    quote: string;               // verbatim excerpt for evidence
    speaker: string;
    confidence: number;
    accepted?: boolean;
  }>;
};

type AISuggestion = {
  id: string;
  kind: 'draft_ready' | 'batch' | 'turn_into_meeting' | 'auto_handle' | 'schedule';
  title: string;
  body: string;
  actions: Array<{ label: string; variant: 'primary'|'secondary'|'ghost'; effect: () => void }>;
  relatedTaskIds: string[];
};
```

**Server state → TanStack Query.** Mutations for send/approve/snooze/complete. Optimistic updates on toggle/complete.

---

## Interactions & Behavior

### Task row
- Click checkbox → optimistic complete, strikethrough + fg-3 + 55% opacity. 3s undo toast.
- Click anywhere else → expand row inline (or open detail pane on triage).
- Right-click / long-press → menu: Snooze · Move to… · Delegate · Done · Remove.
- Drag handle on board/day → reposition.

### AI draft
- "Send" → calls the source adapter's send API, updates draft state to `sending` → `sent`, collapses draft block, adds mono footer "SENT VIA SLACK · 10:24".
- "Edit" → inline textarea replaces body, Save/Cancel.
- "Regenerate" → spinner on button, replace body.
- "Skip" → hides draft on this task; user can ask AI for a new one from suggestion rail.
- **Nothing sends silently** unless the task's draft has `autoApprovable: true`.

### Meeting extraction flow (Granola)
1. Granola webhook: meeting ended.
2. Server pulls transcript + summary, runs extraction prompt → candidate actions for current user only (filter by speaker/assignee heuristics).
3. Push a **MeetingCard** to the top of Stream. Badge on Sidebar → Granola count.
4. User taps **Review** or adds individually. "Add all" accepts every candidate. "Skip" on one dismisses it (remembered for learning).
5. Each accepted action becomes a Task with `sourceRef.granola` linking back to the utterance/quote.

### Auto-reply approval
- Drafts live in two places: inline with the task (`HFTask`) and as a card in the AI rail (`AICard kind="draft_ready"`).
- Primary button = send. Always require an explicit click (unless auto-handle rule).
- Track approval latency for analytics.

### Day view
- Drag a mini-task onto an open slot → create a `scheduledBlock`. If overlaps a meeting, show warning toast.
- "Plan my day" calls an endpoint that returns block assignments; render them with a fade-in.
- Now line auto-scrolls into view on first mount.

### Search (`⌘K`)
- Opens a command palette (Raycast-style): tasks, meetings, AI actions ("Draft reply to…", "Schedule focus block"), nav ("Go to Board").

### Keyboard
- `j` / `k` navigate rows (stream/triage).
- `x` toggle select, `e` complete, `s` snooze, `r` reply (opens draft), `⌘⏎` send draft, `⌘K` palette.

### Animations
- Row hover: 100ms bg fade.
- Check toggle: 120ms scale + fill.
- AI draft appearance: 180ms ease-out, slide-down from top.
- Section collapse: 200ms ease.
- Now-line glow: static (no pulse — keep tone restrained).

### Responsive
- **≥ 1280:** 3-pane layout (sidebar + main + AI rail).
- **1024–1279:** AI rail collapses to a right-edge drawer with sparkle button.
- **< 1024:** sidebar becomes hamburger, single-pane main.
- **< 768:** mobile layout (see screen 5).

---

## Accessibility
- Contrast: all fg-0/1 on bg-0/1/2 passes AA. fg-3 is intentionally muted (meta only, not body text).
- Focus: 2px bronze outline offset 2px on all interactive elements.
- Checkboxes are real `<button role="checkbox" aria-checked>`.
- Source badges have `aria-label="From Slack"` etc.
- Keyboard shortcuts must not trap focus inside modals.

---

## Assets

No custom imagery. All icons are inline SVGs at the bottom of `hifi-system.jsx` under `HFIcon` (inbox, today, cal, done, flash, plus, user, settings, chev, meet) plus the sparkle (`HFSparkle`). Replace with Lucide or your existing icon set — shape is the contract, not the exact path.

Fonts are loaded from Google Fonts:
- Inter 400/500/600/700
- Space Grotesk 500/600/700
- JetBrains Mono 400/500

Self-host in production.

---

## Files in this bundle

| File | What it is |
|---|---|
| `hifi.html` | Canvas with all 5 artboards + accent Tweak. Open this first. |
| `hifi-system.jsx` | **Source of truth for tokens, primitives, icons.** Read this first. |
| `hifi-1-stream.jsx` | Flagship stream view (screen 1) |
| `hifi-2-board.jsx` | Priority board (screen 2) |
| `hifi-3-day.jsx` | Day/timeline (screen 3) |
| `hifi-4-triage.jsx` | Triage inbox (screen 4) |
| `hifi-5-mobile.jsx` | Mobile iOS (screen 5) |
| `design-canvas.jsx` | Framework scaffold for the presentation — not product code |
| `tweaks-panel.jsx` | Framework scaffold — not product code |

**Open `hifi.html` in a browser to see the live designs.** You can pan/zoom the canvas and double-click any artboard to focus.

---

## Out of Scope for v1
- Multi-user / shared lists
- Delegation workflow beyond "assign" affordance
- Notifications / mobile push
- Offline mode
- Audit log / settings screens beyond connection management
- Teams, Gmail, Notion/Linear/Jira sources (architecture should make adding them trivial)

---

## First milestone suggestion
1. Scaffold Next.js + Tailwind with tokens above, build all primitives in `hifi-system.jsx` (buttons, chips, checkbox, source badge, avatar).
2. Wire Outlook OAuth + pull today's calendar → implement Day view with real data, tasks mocked.
3. Wire Slack OAuth + build Triage inbox with real threads, AI draft mocked via a stub endpoint.
4. Wire Granola webhook + extraction prompt → MeetingCard in Stream.
5. Layer AI rail on top (suggestions + composer).
6. Build Board + Mobile.
