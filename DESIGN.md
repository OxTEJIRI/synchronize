# SYNCHRONIZE — Design & Implementation Spec

**Status:** Ready to build  
**Product type:** Single-page interactive workshop / civic-OS explainer  
**Purpose:** Society Protocol Creator Contest submission  
**Tracks covered:**
1. Philosophical & historical context on human coordination and SP  
2. Hopeful visions of how SP changes the world  
3. Honest, critical analysis of SP’s trade-offs and flaws  

**North-star sentence:**  
*Society Protocol is a clock that learned how to be a state — and every clock can be captured.*

**Session length:** 6–8 minutes. One sitting. No account. No wallet.

**Live URL target:** `https://<user>.github.io/synchronize/` (static)

---

## 1. What this is

SYNCHRONIZE is not a marketing site and not a full protocol simulator. It is a guided ritual with four beats:

| Beat | Contest track | User verb |
|---|---|---|
| Threshold | — | Name yourself (Birth Event) |
| Act I · Clock | Historical / philosophical | Scrub eras, fail then succeed at coordination |
| Act II · Society | Hopeful vision | Instantiate a state, watch Energy flow |
| Act III · Break | Critical analysis | Arm failure modes against your own society |
| Coda · Lifeline | Artifact | Leave a record; download a card |

The session itself becomes a **Lifeline** — a local “Timeline” of Events. That card is the shareable contest artifact.

---

## 2. Product principles

1. **One primary verb per screen.** Enter / Scrub / Mint / Act / Toggle / Seal.
2. **Show, don’t glossary.** Terms (Energy, Timeline, SSC, Actor, Value Function) appear only after the user has done the thing they name.
3. **Gold is Energy.** Never use gold for errors, alerts, or decoration-only chrome.
4. **The Timeline is always on** after Act I. A ticker at the bottom writes every action as an Event.
5. **Critique is first-class.** Act III is not a disclaimer. It is half the argument.
6. **No wallet, no signup, no backend.** All state lives in memory + `localStorage` for resume.
7. **Quiet luxury, not crypto-neon.** Black field, cream serif, one gold accent, clock-hand motion.
8. **Mobile is a first-class stack**, not a squeezed desktop.

---

## 3. Narrative & copy voice

- Editorial, short, slightly oracular. Not startup-chipper. Not whitepaper-dense.
- Sentence case for body. Small-caps / tracked uppercase for labels.
- Avoid “Web3 revolution” language. Prefer: coordinate, record, bind, leak, capture, tick.
- When teaching, prefer one concrete image over three abstractions.

Canonical lines (use verbatim):

- “A civic operating system you can feel.”
- “What should we call you in this instance?”
- “The SSC is the ruleset every Actor implicitly accepts.”
- “Energy is not money as you’ve known it. It is what this society thinks you are worth *right now*.”
- “Every clock can be captured.”
- “The clock learned to be a state.” (default Lifeline note)

---

## 4. Information architecture

```
/                       → Threshold (name)
/#clock                 → Act I
/#society               → Act II setup (instantiate)
/#energy                → Act II live simulation
/#break                 → Act III
/#lifeline              → Coda
/about                  → optional 1-pager: what this is, sources, contest
```

Hash routing is enough. No framework router required.

Persistent chrome (all screens except Threshold):

```
[ SYNCHRONIZE ]     I Clock · II Society · III Break · Lifeline     [ clock HH:MM:SS ]
                                                                      [ sound toggle ]
```

Bottom (from Act I onward):

```
[ ticker: t+14  NIA curated the flood map  +2.1E ]  ← scrolls
```

Acts in the nav are clickable **only for already-visited beats**, plus the current beat. Do not let a first-time user skip Act I.

---

## 5. Visual design system

### 5.1 Color tokens

```css
--bg:            #070706;
--bg-elevated:   #10100E;
--bg-card:       #16140F;
--line:          rgba(232, 220, 186, 0.12);
--line-strong:   rgba(232, 220, 186, 0.28);

--cream:         #E8DCBA;
--cream-dim:     rgba(232, 220, 186, 0.62);
--cream-mute:    rgba(232, 220, 186, 0.38);

--gold:          #C4A35A;
--gold-hot:      #E0C57A;
--gold-dim:      rgba(196, 163, 90, 0.35);

--danger:        #B56A3A;          /* capture / fork — warm oxide, not neon red */
--danger-dim:    rgba(181, 106, 58, 0.25);

--idle:          #3A372F;
--node-idle:     #2A271F;
--node-active:   #C4A35A;
--you:           #E0C57A;
```

Background is not flat black: a radial vignette + 2–3 extremely faint concentric clock rings (opacity 0.06–0.12), centered.

### 5.2 Type

Load via Google Fonts or self-host:

- **Display / titles:** `Cormorant Garamond` (or `EB Garamond`) — 400 / 500 / 600  
- **UI / labels / ticker:** `IBM Plex Sans` — 400 / 500  
- **Mono / timestamps:** `IBM Plex Mono` — 400

Scale (desktop):

| Role | Font | Size | Tracking | Weight |
|---|---|---|---|---|
| Hero title | Cormorant | 72–96px | 0.04em | 500 |
| Screen title | Cormorant | 36–44px | 0.02em | 500 |
| Section label | Plex Sans | 11px | 0.22em | 500 | uppercase |
| Body | Plex Sans | 15–16px | 0.01em | 400 |
| Ticker | Plex Mono | 12px | 0.04em | 400 |
| Button | Plex Sans | 13px | 0.16em | 500 | uppercase |

Line-height body: 1.55. Titles: 1.1.

### 5.3 Spacing & layout

- Max content width: 1120px. Energy screen can go 1280px.
- Page padding: 32px desktop, 20px mobile.
- 8px grid. Card radius: **2px** (almost none — plaques, not bubbles).
- Buttons: height 44–48px, hairline 1px cream/gold border, transparent fill. Primary may fill gold with `#070706` text.
- Focus ring: 1px gold, 3px offset.

### 5.4 Motion

- Default easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Screen enter: fade + 8px rise, 480ms
- Clock rings: rotate 120s linear infinite (very slow)
- Energy particles: 40–80 dots, 2–6s travel
- Ticker items: slide in from right, hold 4s
- Respect `prefers-reduced-motion`: kill particles and ring rotation; keep fades.

### 5.5 Sound (optional, off by default)

A single soft tick on Timeslot advance, a warmer chime on user Event. Mute control in chrome. Never autoplay music.

### 5.6 Imagery

No photography. No 3D humans. No crypto-coin icons. UI is typography, hairlines, nodes, rings, bars.

Icon language: 1px stroke, 20–24px, gold or cream. Lucide or custom SVG. Do not use filled colorful icon sets.

---

## 6. Screen-by-screen spec

### 6.0 Threshold — `/`

**Job:** Birth Event. Collect the Actor name.

**Layout**
- Full viewport, centered column, max 560px.
- Faint concentric gold rings behind type (CSS or canvas).
- Eyebrow, 11px tracked gold: `A CIVIC OPERATING SYSTEM YOU CAN FEEL`
- Hero: `SYNCHRONIZE` in Cormorant ~92px cream.
- Input, full width, hairline cream border, placeholder: `What should we call you in this instance?`
- Button: `Enter the Timeline →`
- Ghost text under button: `or continue as Anonymous Actor`
- Footer pinned: `Society Protocol  ·  Creator Contest`

**Behavior**
- Enter / click submits. Trim whitespace. Max 24 chars. Allow letters, numbers, hyphen, space.
- Empty submit → name becomes `Anonymous Actor`.
- Persist `{ actorName, bornAt: ISO string }` to `localStorage` key `synchronize.session`.
- Write Event: `t+0  {name} entered the instance.`
- Route to `/#clock`.

**Clock in chrome:** start ticking on this screen even before name (local time).

---

### 6.1 Act I — Clock of Coordination — `/#clock`

**Job:** Make synchronization *felt* by failing under old rules, then succeeding under SP.

**Layout**
```
NAV
────────────────────────────────────────
          ACT I
     [ circular era dial ]

  TRIBE   NATION STATE   WEB3   SOCIETY PROTOCOL
           (one selected, gold arc)

     [ trial canvas — 7 generals / nodes ]

     [ era caption + failure line ]

[ 1 Tribe ]——[ 2 Nation ]——[ 3 Web3 ]——[ 4 SP ]   ← scrubber
────────────────────────────────────────
TICKER
[ Continue to Act II → ]   (enabled after user has visited SP era AND attempted one trial)
```

**Eras (data)**

| id | label | what syncs | trial rule | failure copy |
|---|---|---|---|---|
| tribe | Tribe | One place, one sky | Only nodes inside a small circle receive the signal. Drag the circle. Outer nodes stay dark. | Coordination dies at the horizon. |
| nation | Nation State | Double-entry books, borders | Signal crosses a border only after a 4-second “ministry” delay bar. Two nodes sit behind a border line. | The state updates next fiscal year. |
| web3 | Web3 | A shared ledger of *things* | Nodes can pass gold squares (tokens). The people-dots stay dim, outside the squares. | The objects synchronized. The people did not. |
| sp | Society Protocol | People + value + events | One click: every node lights, lines draw, ticker writes a single shared Event. Instant. | Failure of this era: none yet. Shared reality is one Timeline. |

**Trial mechanic (keep simple)**
- 7 nodes arranged loosely on a world-map silhouette or blank field.
- A primary button in the canvas: `Send the order` / `File the request` / `Mint the token` / `Write the Event` — label changes per era.
- Success = all 7 nodes “aware” (lit). Tribe and Nation cannot fully succeed without the user noticing the constraint. Web3 lights the tokens, not the people. SP lights everything in 400ms.

**Copy block (right or below, 240–280px)**
- Era title
- One sentence “what syncs”
- Failure / insight line from table
- Small “dimension” tag: `1D clock` / `2D ledger` / `3D objects` / `4D society`

**Continue rules**
- User must open all four eras at least once (scrubber or dial).
- User must fire the trial at least once in Nation State and once in SP.
- Then gold button: `Continue to Act II →`

**Events written**
- `t+n  Studied the {era} era.`
- `t+n  Sent an order under {era} rules.`

---

### 6.2 Act II-A — Instantiate — `/#society`

**Job:** The user writes a Synchronized Social Contract by choosing what the society values.

**Layout**
```
NAV
ACT II · SPIN A SOCIETY
Instantiate a Synchronized State

[ Society name field ]

VALUE FUNCTIONS                          PARAMETERS
[ 3×3 chip grid ]                        Energy decay     [slider 0–1]
                                         Hunt pressure    [slider 0–1]

[ MINT THIS SYNCHRONIZED STATE → ]

The SSC is the ruleset every Actor implicitly accepts.
```

**Society name**
- Default: generate something like `AURORA-7`, `KEPLER-3`, `HELIX-12` (constellation/space + number).
- Editable, max 20 chars.

**Value Functions (exactly these 9, selectable chips)**

| id | label | one-line helper (tooltip / subtitle) |
|---|---|---|
| parenting | Parenting | Invite a new Actor. Spend Energy now; harvest later if they thrive. |
| hunting | Hunting | Each Timeslot, idle Energy can be taken by the active. |
| property | Property | Own programmable objects inside the instance. |
| curation | Curation | Stake Energy on what is worth seeing. |
| governance | Governance | Risk Energy to change the rules. |
| organizations | Organizations | Bind Actors into a named body. |
| communication | Communication | Publish Events visible to the whole Timeline. |
| farming | Farming | Slow, compounding Energy from tending shared goods. |
| portal | Portal | Bridge value to another instance. |

**Selection rules**
- Toggle chips. Selected = gold fill, dark text. Unselected = hairline, cream text.
- Minimum 3, maximum 6. If user tries 7th, shake the chip and show `A society that values everything values nothing.`
- Default pre-selected: `parenting`, `hunting`, `curation`, `governance`.

**Parameters**
- `energyDecay` default 0.35  
- `huntPressure` default 0.45  
- Labels under sliders: `Idle Energy leaks this fast` / `How hard the Hunt bites`

**Mint**
- Disabled until 3–6 VFs selected and name non-empty.
- On mint: persist SSC to session. Write Event `t+n  Minted {name}. SSC binds {vf list}.`
- Route to `/#energy`.

---

### 6.3 Act II-B — Energy live — `/#energy`

**Job:** Make Energy visible. The user is one Actor among ~16–20.

**Layout**
```
NAV
{SOCIETY NAME}  ·  Energy is flowing          [ Pause ] [ ? ]

[ node field  ~70% ]                 [ Energy distribution ]
                                     pyramid / stacked bars
                                     YOU highlighted

[ Parent ] [ Hunt ] [ Curate ] [ Govern ] [ Idle ]
only show buttons for VFs the user selected
(+ Idle always)

TICKER
[ Stress this society → ]   /* goes to Act III */
```

**Actors**
- 16 NPCs + YOU.
- Each: `{ id, name, energy, activity }`
- Names: short invented (Kade, Orin, Sela, Voss, Amara, Quin…).
- Start Energy: YOU = 8.0, others sampled 2.0–7.0. Total Energy is **fixed** (zero-sum). Normalize so sum is always `TOTAL_E = 100`.

**Node field**
- Force-lite or precomputed ring + jitter. YOU at center or slightly off-center, larger ring, label `YOU / {NAME}`.
- Node radius scales with `sqrt(energy)`.
- Active nodes gold; idle dim.
- Particles travel along edges from loser → winner on each transfer. Cap particles at 80.

**Timeslot loop**
- One Timeslot = 1800ms (pauseable).
- Each Timeslot:
  1. NPCs pick an action from available VFs with weighted randomness. Idle chance rises if `activity` is low.
  2. Apply decay: every Actor loses `energy * energyDecay * 0.02`. Pool the leaked Energy into `reserve`.
  3. If `hunting` is in SSC: pick 1 hunter (weighted by activity) and 1 hunted (weighted by *inverse* activity × huntPressure). Transfer `min(hunted.energy * 0.08, 1.4)` hunter ← hunted.
  4. Farming (if selected): active farmers receive a drip from reserve.
  5. Write 0–2 NPC Events to ticker.
  6. Re-render pyramid.

**User actions** (buttons)

| Action | Energy effect | Event copy |
|---|---|---|
| Parent | YOU −0.8 to reserve; spawn a dim child node with 0.8 from reserve next tick (cap 22 nodes) | `{you} parented a new Actor` |
| Hunt | Instant: same hunt math with YOU as hunter | `{you} hunted {target}` |
| Curate | YOU −0.3; +0.6 from reserve if “quality” roll > 0.4 else −0.1 more (curation can miss) | `{you} curated the flood map` / `{you} curated a hollow claim` |
| Govern | YOU −1.0 locked 3 ticks; then +1.6 from reserve *or* −0.4 slash (coin flip weighted by current capture flag) | `{you} risked Energy on a rule` |
| Idle | Sets your activity to 0 until another action. Decay hits you harder. | `{you} went idle` |

After each user action set `you.activity = 1` and decay it by 0.15 per Timeslot.

**Pyramid panel**
- Sort Actors by Energy desc.
- Stack as 5 tiers (slice the sorted list), gold bars.
- Label tiers: Core / Catalysts / Contributors / Participants / Observers — or simply show top 5 names + YOU rank.
- Show `YOU  {energy.toFixed(1)}E   rank {n}/n`.

**Help `?`**
- Slide-over, 320px: the Energy paragraph from §3 plus “Total Energy cannot be created or destroyed.”

**Continue:** `Stress this society →` enabled after ≥3 Timeslots and ≥1 user action.

---

### 6.4 Act III — Break It — `/#break`

**Job:** Turn the hopeful toy against itself. Honest trade-offs.

**Layout**
```
NAV
ACT III · BREAK IT
The same instance. Worse assumptions.

[ toggles 260px ]     [ node field, now reactive ]     [ critique card ]

TICKER (may split into two rows if fork is on)

[ Seal the Lifeline → ]
```

**Toggles** (all off by default)

| id | label | simulation effect | critique card copy |
|---|---|---|---|
| capture | Governor capture | Top 3 Actors absorb 1.2% of everyone else’s Energy per tick. Pyramid pinches. | Energy is no longer a map of value. It is a map of who set the Functions. |
| predation | Hunt as predation | Hunt transfer × 2.2. Activity farming: random NPCs click-Hunt every tick. | The Hunt stops sorting the idle. It starts farming the quiet. |
| sybil | Sybil crack | 3 ghost nodes spawn glued to YOU, siphoning 0.3E/tick from neighbors into a hidden pool. | Identity was the pillar. If it cracks, every other pillar lies. |
| flatten | Culture flatten | Lock VF chips visually. Node labels become identical marks. Saturation drops. | One SSC, many peoples. The contract can erase the local. |
| fork | Shared-reality fork | Duplicate the ticker. 30% of Events appear only on track B. Nodes desync tint. | Two clocks. Two histories. The bind is the thing that broke. |
| architects | Who writes the VFs? | Reveal a hidden slider `Architect bias` that reroutes 2% of Energy to a named “Founding set.” | Governance of the Functions is the real throne. |

**Rules**
- Toggles can stack.
- Turning a toggle ON writes an Event in oxide color: `STRESS  Governor capture armed.`
- Critique card shows the **last armed** toggle’s copy, plus a stacked list of active stresses.
- Node field reuses Act II canvas; do not remount if possible.

**Seal**
- Always enabled (user may seal a healthy society — that’s a valid Lifeline).
- Route to `/#lifeline`.
- Write `t+n  Lifeline sealed.`

---

### 6.5 Coda — Lifeline — `/#lifeline`

**Job:** Turn the session into a record the user can submit / share.

**Layout**
- Centered plaque card, max 520px, charcoal `#16140F`, 1px gold border, 2px radius, generous padding 36px.
- Watermark: faint clock rings behind the card.

**Card fields**

```
LIFELINE
{ACTOR NAME}

INSTANCE          {society name}
BIRTH             {bornAt formatted, include timezone if possible}
FUNCTIONS         {selected VFs joined with · }
STRESS TESTS      {armed toggles or “None armed”}
NOTE              {editable one-liner, default “The clock learned to be a state.”}
```

**Buttons**
- `Download PNG` — render the card to canvas (`html2canvas` or hand-drawn canvas) at 1600×1000, dark, download `lifeline-{name}.png`.
- `Copy summary` — clipboard a 6-line plaintext.
- `Write a last Event` — opens an input. On submit, append to ticker and to the card note if note still default.
- `Begin another instance` — clears session except a `pastLifelines[]` archive; back to Threshold.

**About link** under the card: `What is Society Protocol?` → `/about`

---

### 6.6 About — `/about`

Short, sourced, not a blog.

Sections:
- What you just used
- The three contest tracks and which act mapped to which
- Key terms in one sentence each (Actor, Energy, Timeline, SSC, Value Function, Synchronized State)
- Links: https://societyprotocol.io · whitepaper · glossary
- Credit: “Unofficial workshop. Not affiliated as a core-team product. Built for the Creator Contest.”
- GitHub repo link

---

## 7. Application state

Single store. Suggested shape:

```ts
type VF =
  | "parenting" | "hunting" | "property" | "curation"
  | "governance" | "organizations" | "communication"
  | "farming" | "portal";

type Era = "tribe" | "nation" | "web3" | "sp";

type Stress =
  | "capture" | "predation" | "sybil" | "flatten" | "fork" | "architects";

interface Event {
  t: number;            // timeslot index
  text: string;
  kind: "user" | "world" | "stress" | "system";
  track?: "A" | "B";    // used when fork is on
}

interface Actor {
  id: string;
  name: string;
  energy: number;
  activity: number;     // 0–1
  isYou?: boolean;
  isGhost?: boolean;
}

interface Session {
  actorName: string;
  bornAt: string;
  societyName: string;
  vfs: VF[];
  energyDecay: number;
  huntPressure: number;
  erasVisited: Era[];
  trialsFired: Era[];
  stresses: Record<Stress, boolean>;
  architectBias: number;
  actors: Actor[];
  reserve: number;
  tick: number;
  events: Event[];
  paused: boolean;
  note: string;
}
```

Persist to `localStorage` on every route change and every 5 ticks. Schema version key `synchronize.v1`.

---

## 8. Component inventory

Build these and almost nothing else:

| Component | Notes |
|---|---|
| `AppShell` | nav, clock, ticker slot, sound toggle |
| `ClockFace` | live analog + digital in nav |
| `RingBackdrop` | CSS concentric rings |
| `TypeLockup` | SYNCHRONIZE wordmark |
| `HairlineButton` | primary / ghost / gold-fill |
| `TextField` | threshold + society name + last event |
| `EraDial` | circular 4-arc control |
| `EraScrubber` | linear 4-point |
| `TrialCanvas` | 7 nodes + era-specific overlay |
| `VFChip` | selectable |
| `Knob` | labeled slider |
| `NodeField` | actors + particles (canvas preferred) |
| `Pyramid` | ranked energy |
| `ActionBar` | VF actions |
| `Ticker` | dual-track capable |
| `StressToggle` | switch + label |
| `CritiqueCard` | oxide rule + copy |
| `LifelineCard` | plaque |
| `AboutPage` | static |

Canvas vs SVG: use **canvas** for NodeField particles (perf). SVG is fine for EraDial and Pyramid.

---

## 9. Responsive

**≥960px** — layouts as specified.

**<960px**
- Nav collapses acts into `I · II · III · L` 
- Act I: dial shrinks to 280px; scrubber full width; copy below
- Act II-A: chips 2 columns; sliders under chips
- Act II-B / III: pyramid and critique **below** the node field, not beside
- Action bar: 2×2 + Idle
- Lifeline card full width minus 20px
- Minimum touch target 44px

---

## 10. Tech stack (recommended for Claude Code)

Keep it boring and shippable:

- **Vite + vanilla TypeScript** *or* Vite + React + TypeScript. Either is fine. Prefer **React + TS** if the agent is stronger there.
- **No Next.js.** Static export only.
- **CSS:** one `styles.css` with tokens, plus module-level files if React. No Tailwind required; Tailwind is acceptable if it does not flatten the luxury look into generic gray-purple.
- **Routing:** `hashchange`.
- **Canvas** for nodes.
- **html2canvas** or a dedicated canvas renderer for PNG export.
- **Fonts:** Google Fonts link in `index.html`.
- **Hosting:** GitHub Pages from `/docs` or `gh-pages` on `main`.
- **No** wallet libs, no analytics required. Optional: Plausible later.

Scripts:

```
npm run dev
npm run build
npm run preview
```

---

## 11. Repository layout

```
synchronize/
├── README.md
├── CLAUDE.md                 ← agent instructions
├── DESIGN.md                 ← this file
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── public/
│   └── og.png                ← 1200×630, dark lockup, for social
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles.css
│   ├── state/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   ├── persist.ts
│   │   └── simulation.ts     ← timeslot + stresses
│   ├── copy/
│   │   └── content.ts        ← ALL user-facing strings
│   ├── components/
│   │   └── ...
│   └── screens/
│       ├── Threshold.tsx
│       ├── ActClock.tsx
│       ├── ActSociety.tsx
│       ├── ActEnergy.tsx
│       ├── ActBreak.tsx
│       ├── Lifeline.tsx
│       └── About.tsx
└── .github/
    └── workflows/
        └── pages.yml         ← optional
```

**Hard rule for the agent:** all user-facing copy lives in `src/copy/content.ts`. Do not scatter strings.

---

## 12. GitHub setup (human)

```bash
gh repo create synchronize --public --source=. --remote=origin
git add .
git commit -m "Initial spec: SYNCHRONIZE workshop for Society Protocol"
git push -u origin main
```

Enable Pages: Settings → Pages → Deploy from GitHub Actions or `/docs`.

README badges: none. Keep the README as quiet as the product.

Suggested README sections: one-paragraph pitch, `npm i && npm run dev`, contest mapping, link to DESIGN.md, unlicensed-or-MIT.

`.gitignore`: `node_modules`, `dist`, `.DS_Store`.

Commit style: conventional, present tense. `feat: act I trial canvas`, `fix: keep total Energy at 100`.

---

## 13. Definition of done

A reviewer can, without a walkthrough:

1. Open the site on phone and desktop.
2. Finish all acts in under 8 minutes without reading DESIGN.md.
3. See Energy move after they press Curate.
4. Arm two stresses and watch the pyramid / ticker change.
5. Download a PNG Lifeline that contains their name and stresses.
6. Refresh mid-Act II and resume.
7. Hear nothing unless they unmute.
8. Lighthouse accessibility: no critical contrast fails on cream-on-black text (cream on `#070706` is fine; dim cream on elevated must stay ≥ 4.5:1 for body).
9. No console errors in a clean Chrome profile.

---

## 14. What not to build (scope lock)

- Accounts, wallets, tokens, leaderboards
- Multiplayer / networked Timeline
- Real Society Protocol node / SPEC integration
- Blog CMS
- Animated founder manifesto video
- More than 9 Value Functions
- A settings kitchen sink
- Confetti

If time is short, cut in this order: sound → particle density → About page polish → PNG export fallback to “copy summary only.”

Do **not** cut Act III.

---

## 15. Prompt the agent should obey while coding

> Implement SYNCHRONIZE exactly as DESIGN.md. Visuals: black #070706, cream #E8DCBA, gold #C4A35A, Cormorant + Plex. Do not invent a different palette or a dashboard IA. One verb per screen. Put copy in content.ts. Simulation is zero-sum Energy. Act III stresses must change the sim, not just the text. Ship static.

---

## 16. Contest submission kit (after it runs)

Post in Discord `#content-creators`:

1. URL  
2. 3 screenshots: Act I SP era, Energy flowing, Lifeline card  
3. 400 words: which act maps to which track, what the user does, the thesis sentence  
4. Optional 60s screen recording: Threshold → Mint → Curate → arm Capture + Fork → Seal  

Thesis to lead with:

> Most explainers tell you Society Protocol is a Synchronized State. SYNCHRONIZE lets you mint one, live inside its Energy, then break the bind on purpose.

---

## 17. Content source of truth (for About + tooltips)

Keep claims humble. This is an unofficial interpretive workshop of public SP concepts:

- Society Protocol = framework for Synchronized Network States  
- Energy = zero-sum explicit social value / monetary layer of an instance  
- Timeline = the ordered public record of state  
- SSC = Synchronized Social Contract, the explicit ruleset  
- Value Functions = modular ways Energy redistributes (Parenting, Hunting, Property, Curation, Governance, Organizations, Communication, Farming, Portal)  
- Eight pillars of coordination (identity, monetary system, state tracking, synchronization of time, shared reality of events, governance, cultural artifacts, value system)  
- Historical stack: tribe / sundial → nation state / double-entry → Bitcoin & Web3 as synchronized *states* → SP as a Synchronized *State*

Do not claim the app *is* the protocol. Do not invent tokenomics. Do not promise dates from the official roadmap as product features.

Official references to link:
- https://societyprotocol.io/
- https://societyprotocol.io/whitepaper/
- https://societyprotocol.io/glossary/

---

*End of spec. If a decision is not in this file, choose the quieter option.*
