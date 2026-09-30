/**
 * Seed file — place at src/copy/content.ts
 * All user-facing copy. Claude Code should expand, not replace, this contract.
 */

export const brand = {
  name: "SYNCHRONIZE",
  eyebrow: "A civic operating system you can feel",
  footer: "Society Protocol  ·  Creator Contest",
  thesis:
    "Society Protocol is a clock that learned how to be a state — and every clock can be captured.",
};

export const threshold = {
  placeholder: "What should we call you in this instance?",
  enter: "Enter the Timeline",
  nameLabel: "Actor name",
  anonymous: "or continue as Anonymous Actor",
  defaultName: "Anonymous Actor",
};

export const nav = {
  clock: "I Clock",
  society: "II Society",
  break: "III Break",
  lifeline: "Lifeline",
};

export const actI = {
  kicker: "Act I",
  continue: "Continue to Act II",
  send: {
    tribe: "Send the order",
    nation: "File the request",
    web3: "Mint the token",
    sp: "Write the Event",
  },
  eras: {
    tribe: {
      label: "Tribe",
      what: "One place, one sky.",
      failure: "Coordination dies at the horizon.",
      dim: "1D clock",
    },
    nation: {
      label: "Nation State",
      what: "Double-entry books, borders, delayed law.",
      failure: "The state updates next fiscal year.",
      dim: "2D ledger",
    },
    web3: {
      label: "Web3",
      what: "A shared ledger of things.",
      failure: "The objects synchronized. The people did not.",
      dim: "3D objects",
    },
    sp: {
      label: "Society Protocol",
      what: "People, value, and events on one Timeline.",
      failure: "Failure of this era: none yet. Shared reality is one Timeline.",
      dim: "4D society",
    },
  },
};

export const actII = {
  kicker: "Act II · Spin a Society",
  title: "Instantiate a Synchronized State",
  nameLabel: "Society name",
  vfLabel: "Value Functions",
  paramsLabel: "Parameters",
  decayLabel: "Energy decay",
  decayHelp: "Idle Energy leaks this fast",
  huntLabel: "Hunt pressure",
  huntHelp: "How hard the Hunt bites",
  mint: "Mint this Synchronized State",
  ssc: "The SSC is the ruleset every Actor implicitly accepts.",
  tooMany: "A society that values everything values nothing.",
  energyTitle: "Energy is flowing",
  energyHelp:
    "Energy is not money as you’ve known it. It is what this society thinks you are worth right now. It cannot be created or destroyed — only moved.",
  stressCta: "Stress this society",
  actions: {
    parenting: { label: "Parent", hint: "Invite a new Actor" },
    hunting: { label: "Hunt", hint: "Take from the idle" },
    curation: { label: "Curate", hint: "Stake on what matters" },
    governance: { label: "Govern", hint: "Risk Energy on a rule" },
    idle: { label: "Idle", hint: "Conserve — and leak" },
  },
};

export const vfs: Record<
  string,
  { label: string; help: string }
> = {
  parenting: {
    label: "Parenting",
    help: "Invite a new Actor. Spend Energy now; harvest later if they thrive.",
  },
  hunting: {
    label: "Hunting",
    help: "Each Timeslot, idle Energy can be taken by the active.",
  },
  property: {
    label: "Property",
    help: "Own programmable objects inside the instance.",
  },
  curation: {
    label: "Curation",
    help: "Stake Energy on what is worth seeing.",
  },
  governance: {
    label: "Governance",
    help: "Risk Energy to change the rules.",
  },
  organizations: {
    label: "Organizations",
    help: "Bind Actors into a named body.",
  },
  communication: {
    label: "Communication",
    help: "Publish Events visible to the whole Timeline.",
  },
  farming: {
    label: "Farming",
    help: "Slow, compounding Energy from tending shared goods.",
  },
  portal: {
    label: "Portal",
    help: "Bridge value to another instance.",
  },
};

export const actIII = {
  kicker: "Act III · Break It",
  title: "The same instance. Worse assumptions.",
  seal: "Seal the Lifeline",
  stresses: {
    capture: {
      label: "Governor capture",
      card: "Energy is no longer a map of value. It is a map of who set the Functions.",
    },
    predation: {
      label: "Hunt as predation",
      card: "The Hunt stops sorting the idle. It starts farming the quiet.",
    },
    sybil: {
      label: "Sybil crack",
      card: "Identity was the pillar. If it cracks, every other pillar lies.",
    },
    flatten: {
      label: "Culture flatten",
      card: "One SSC, many peoples. The contract can erase the local.",
    },
    fork: {
      label: "Shared-reality fork",
      card: "Two clocks. Two histories. The bind is the thing that broke.",
    },
    architects: {
      label: "Who writes the VFs?",
      card: "Governance of the Functions is the real throne.",
    },
  },
};

export const lifeline = {
  kicker: "Lifeline",
  defaultNote: "The clock learned to be a state.",
  download: "Download PNG",
  copy: "Copy summary",
  lastEvent: "Write a last Event",
  again: "Begin another instance",
  none: "None armed",
  about: "What is Society Protocol?",
  title: "Lifeline",
  fields: {
    instance: "Instance",
    birth: "Birth",
    functions: "Functions",
    stress: "Stress tests",
    note: "Note",
  },
  noteLabel: "Edit note",
  copied: "Copied",
  copyFailed: "Copy failed",
  eventPlaceholder: "One last line for the Timeline",
  eventSubmit: "Write",
  eventCancel: "Cancel",
  sealed: "Lifeline sealed.",
  summaryHeader: (name: string) => `LIFELINE — ${name}`,
  imageAlt: "Lifeline card preview",
};

export const about = {
  title: "About this workshop",
  unofficial:
    "Unofficial workshop. Not affiliated as a core-team product. Built for the Society Protocol Creator Contest.",
  links: {
    home: "https://societyprotocol.io/",
    whitepaper: "https://societyprotocol.io/whitepaper/",
    glossary: "https://societyprotocol.io/glossary/",
    repo: "https://github.com/OxTEJIRI/synchronize",
  },
  linkLabels: {
    home: "societyprotocol.io",
    whitepaper: "Whitepaper",
    glossary: "Glossary",
    repo: "GitHub repository",
  },
  whatTitle: "What you just used",
  what: "A short interpretive workshop. You named an Actor, walked four eras of human coordination, minted a Synchronized State, watched Energy move, broke it on purpose, and left a Lifeline. It is a toy built from public concepts. It is not the protocol.",
  tracksTitle: "Three tracks, three acts",
  tracks: [
    { act: "Act I · Clock", track: "Philosophical and historical context on human coordination" },
    { act: "Act II · Society and Energy", track: "A hopeful vision of what Society Protocol could change" },
    { act: "Act III · Break", track: "An honest look at its trade-offs and flaws" },
  ],
  termsTitle: "Terms, one sentence each",
  terms: [
    { term: "Actor", def: "A participant in an instance, named at its Birth Event." },
    { term: "Energy", def: "The zero-sum, explicit measure of social value inside an instance." },
    { term: "Timeline", def: "The ordered public record of everything that happened." },
    { term: "SSC", def: "The Synchronized Social Contract: the explicit ruleset every Actor implicitly accepts." },
    { term: "Value Function", def: "A modular way Energy redistributes, such as Hunting or Curation." },
    { term: "Synchronized State", def: "A society whose Actors share one identity, value system and record of events." },
  ],
  linksTitle: "Sources",
  simplification:
    "The simulation is a simplification. Its numbers are invented for illustration, and no dates or tokenomics here come from the official roadmap.",
};

export const common = {
  arrow: "→",
  loading: "…",
};

export const shell = {
  skip: "Skip to content",
  navLabel: "Acts",
  navShort: { clock: "I", society: "II", break: "III", lifeline: "L" },
  clockLabel: "Local time",
  tickerLabel: "Timeline",
  tickerEmpty: "The Timeline is quiet.",
};

export const events = {
  entered: (name: string) => `${name} entered the instance.`,
  studied: (era: string) => `Studied the ${era} era.`,
  sentOrder: (era: string) => `Sent an order under ${era} rules.`,
  sharedEvent: "One Event, written once, read by all seven.",
};

export const actIStrings = {
  title: "The Clock of Coordination",
  dialLabel: "Era",
  scrubberLabel: "Eras",
  trialLabel: "Coordination trial",
  aware: (n: number, total: number) => `${n} of ${total} aware`,
  gate: "Open every era. File a request under the Nation State. Write the Event under Society Protocol.",
  gateDone: "The clock is set.",
  ministry: "Ministry",
  ministryHint: "Waiting on the ministry…",
  border: "Border",
  dragHint: "Drag the circle.",
  tokenHint: "Tokens moved. People did not.",
  resendHint: "Sent. Try again, or move on.",
};


export const notFound = {
  title: "Nothing on the Timeline here.",
  back: "Return to the Threshold",
};

export const resume = {
  as: (name: string) => `Resume as ${name}`,
};

export const societyCopy = {
  namePrefixes: ["AURORA", "KEPLER", "HELIX", "ORION", "LYRA", "VEGA", "NOVA", "CASSINI", "TYCHO", "ARGO"],
  chooseRange: "Choose three to six.",
  selected: (n: number) => `${n} of 6 bound`,
  reroll: "New name",
};

export const energyCopy = {
  pause: "Pause",
  resume: "Resume",
  help: "What is Energy?",
  close: "Close",
  fieldLabel: "Actors and Energy",
  you: (name: string) => `YOU / ${name}`,
  reserveShort: (n: number) => `Reserve ${n.toFixed(1)}E`,
  total: (n: number) => `Total ${n.toFixed(1)}E`,
  youLine: (e: number, rank: number, n: number) =>
    `YOU  ${e.toFixed(1)}E   rank ${rank}/${n}`,
  pyramidLabel: "Energy distribution",
  tiers: ["Core", "Catalysts", "Contributors", "Participants", "Observers"],
  actionsLabel: "Actions",
  gate: "Let three Timeslots pass and take one action.",
  locked: (n: number) => `${n.toFixed(1)}E locked in a rule`,
  npcNames: ["Kade", "Orin", "Sela", "Voss", "Amara", "Quin", "Nia", "Tavi", "Lior", "Mero", "Bram", "Ilse", "Joss", "Rhea", "Sol", "Dara"],
  childNames: ["Wren", "Pike", "Odel", "Fen", "Yara", "Cato"],
};

export const simEvents = {
  minted: (name: string, vfs: string) => `Minted ${name}. SSC binds ${vfs}.`,
  delta: (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}E`,
  parented: (who: string) => `${who} parented a new Actor`,
  born: (who: string) => `${who} joined the Timeline`,
  hunted: (a: string, b: string) => `${a} hunted ${b}`,
  curatedWell: (who: string) => `${who} curated the flood map`,
  curatedHollow: (who: string) => `${who} curated a hollow claim`,
  governed: (who: string) => `${who} risked Energy on a rule`,
  governWon: (who: string) => `${who}'s rule held`,
  governLost: (who: string) => `${who}'s rule was slashed`,
  idle: (who: string) => `${who} went idle`,
};

export const stressCopy = {
  idle: "Arm a stress to read what it breaks.",
  activeLabel: "Armed",
  togglesLabel: "Stress tests",
  sscLabel: "SSC",
  architectBias: "Architect bias",
  architectHelp: "Share of the 2% skim rerouted to the Founding set",
  trackA: "A",
  trackB: "B",
  ghostNote: "Hidden pool",
  foundingSet: "Founding set",
  battery: "The Core",
};

export const stressEvents = {
  armed: (label: string) => `STRESS  ${label} armed.`,
  disarmed: (label: string) => `${label} disarmed.`,
  captureDraw: (n: number) => `STRESS  The Core drew ${n.toFixed(1)}E from everyone else.`,
  foundingDraw: (n: number) => `STRESS  The Founding set drew ${n.toFixed(1)}E.`,
  farmed: (a: string, b: string) => `${a} farmed ${b}`,
  unbound: "unbound",
};
