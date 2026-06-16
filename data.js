// data.js — all hardcoded content for the Sensos case-study deck

const SOURCE_NODES = [
  {
    id: 'brief',
    label: 'Customer Brief',
    title: 'CUSTOMER BRIEF',
    quotes: [
      '"Every week, two of our people spend about an hour a day each pulling temperature data off individual devices into Excel..."',
      '"We only find out about a temperature problem when a patient complains — we\'re blind to everything that arrived warm and never got reported."',
      '"That decision logic basically lives in his head."'
    ],
    insights: [
      'Ops process is person-dependent, not system-dependent',
      'Failure signal lags by days to weeks',
      'No structured remediation loop'
    ]
  },
  {
    id: 'telemetry',
    label: 'Telemetry Spec',
    title: 'TELEMETRY SPEC',
    quotes: [
      '"Smart labels: temperature, GPS, tamper, shock. Continuous telemetry, not USB download."',
      '"5% monitored sample today — 300 out of 6,000 shipments per day."',
      '"Labels transmit in real time. Arrival events and delivery confirmations included."'
    ],
    insights: [
      'Real-time data available — nobody is reading it systematically',
      'Sample is representative: patterns on 5% apply across all 6,000',
      'Sensor data is already there; the intelligence layer is what\'s missing'
    ]
  },
  {
    id: 'calibration',
    label: 'Industry Calibration',
    subtitle: 'Call with Daniel, Head of Ops, D2C Rx fulfillment (UK)',
    title: 'INDUSTRY CALIBRATION',
    quotes: [
      '"6,000 packages per day, direct to patients. About 1,000 employees."',
      '"98% delivery success — that\'s the industry standard. We buy our way there."',
      '"Ice is about 40% of our COP. We use 2 boxes because we don\'t know which routes need less."'
    ],
    insights: [
      '2% out-of-range rate (98% success is the industry standard)',
      '$500 avg package value (Daniel\'s range: £150-500, conservative midpoint)',
      '$1 COP — ice is ~40% of this ($0.40/package)',
      '6,000/day as realistic D2C pharma scale'
    ],
    keyInsight: '"98% success is BOUGHT, not engineered." Visibility would enable safe reduction — same performance, less spend.'
  }
];

const PERSONAS = [
  {
    id: 'ops-lead',
    label: 'Ops Lead',
    badge: 'PRIMARY',
    jtbd: 'Get temperature-sensitive medications to the patient in spec, at scale, without living inside the process.',
    subjobs: ['Monitor', 'Detect', 'Attribute', 'Remediate', 'Optimize'],
    pains: [
      'Blind to in-transit failures until a patient complains',
      'Decision logic lives in his head — not documented, not transferable, not auditable',
      'Remediates by emailing warehouses — no confirmation, no feedback loop',
      'Patterns catch him too late (Friday review = week of damage already done)',
      'Over-provisions because he can\'t see what\'s needed. Hits 98% by spending more, not by knowing more.'
    ]
  },
  {
    id: 'ops-team',
    label: 'Ops Team ×2',
    badge: 'PRIMARY',
    jtbd: 'Keep the ops lead informed and the operation moving.',
    subjobs: ['Data collection', 'Weekly reporting', 'Ad-hoc lookups'],
    pains: [
      '1 hour/day each pulling USB logger data into Excel',
      'Compile a weekly sheet for the ops lead\'s Friday review',
      'Their entire value is manual data wrangling — no analysis, no action authority',
      'At 15× scale: this process doesn\'t stretch. It breaks. 300 shipments/day from USB loggers is not physically possible.'
    ]
  },
  {
    id: 'warehouse',
    label: 'Warehouse Team',
    badge: 'DOWNSTREAM',
    jtbd: 'Pack and dispatch shipments correctly, respond to ops lead instructions.',
    subjobs: ['Packing', 'Ice config', 'Dispatch'],
    pains: [
      'Receives instructions by email — no structured confirmation back',
      'No visibility on whether changes actually worked',
      'At scale: email chains break under volume of concurrent exceptions'
    ]
  },
  {
    id: 'patient',
    label: 'Patient',
    badge: 'END USER',
    jtbd: 'Receive medication in spec, on time, without having to think about logistics.',
    subjobs: ['Receive delivery', 'Confirm receipt'],
    pains: [
      'Current failure signal: their complaint — after the product has already failed',
      'No proactive notification when a delivery is at risk',
      'On direct-ship lanes: a missed delivery means out-of-range product sitting in a warm van'
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance Officer',
    badge: 'INFERRED',
    jtbd: 'Demonstrate regulatory adherence at scale.',
    subjobs: ['Audit readiness', 'Reporting', 'Incident documentation'],
    pains: [
      'No structured audit trail for temperature excursions today',
      'At scale: manual incident reporting becomes a liability',
      'Compliance is a readiness play — becomes urgent when volumes grow or regulators audit'
    ]
  }
];

const MATRIX_DOTS = [
  {
    id: 'detect',
    label: 'Detect',
    cx: 0.86, cy: 0.84,
    color: 'ok',
    tshirt: 'XL',
    value: 'Foundation — enables all other savings',
    valueType: 'Risk — necessary foundation',
    rationale: 'Nothing else works without real-time detection. Replace patient complaints with minutes-level signal.',
    inCurve: true
  },
  {
    id: 'prevention',
    label: 'Prevention',
    cx: 0.80, cy: 0.90,
    color: 'ok',
    tshirt: 'XL',
    value: '~$330K/yr direct (monitored 5%)',
    valueType: 'Risk — prevent before failure completes',
    rationale: 'Proactive weather adjustments and mid-transit intervention. Scales with coverage.',
    inCurve: true
  },
  {
    id: 'attribute',
    label: 'Attribute + Remediate',
    cx: 0.70, cy: 0.88,
    color: 'ok',
    tshirt: 'XL',
    value: 'Reduces $22M exposure on covered shipments',
    valueType: 'Risk enabler + Scale',
    rationale: 'Closes the loop. Structured attribution and action. Manual process breaks at scale.',
    inCurve: true
  },
  {
    id: 'cop',
    label: 'COP Optimization',
    cx: 0.76, cy: 0.73,
    color: 'warn',
    tshirt: 'L',
    value: '~$440K/yr',
    valueType: 'Efficiency at scale',
    rationale: 'Right-provision once you can see what\'s needed. 2 boxes to 1 box on proven lanes.',
    inCurve: true
  },
  {
    id: 'lane',
    label: 'Lane Optimization',
    cx: 0.63, cy: 0.58,
    color: 'muted',
    tshirt: 'L',
    value: 'Illustrative (prior calc superseded)',
    valueType: 'Efficiency at scale',
    rationale: 'Direct vs. hub routing. Client raised this last — lower urgency.',
    inCurve: false
  },
  {
    id: 'monitor',
    label: 'Monitor',
    cx: 0.83, cy: 0.26,
    color: 'dim',
    tshirt: 'S',
    value: '~$26K/yr',
    valueType: 'Efficiency (mostly solved by device adoption)',
    rationale: 'USB-logger labor goes away through Sensos adoption, not through an agent.',
    inCurve: false
  },
  {
    id: 'report',
    label: 'Report',
    cx: 0.73, cy: 0.20,
    color: 'dim',
    tshirt: 'S',
    value: '~$5,200/yr',
    valueType: 'Efficiency (byproduct of automation)',
    rationale: 'Eliminated as a byproduct of automated data collection.',
    inCurve: false
  },
  {
    id: 'pareto',
    label: 'High-Value Pareto',
    cx: 0.22, cy: 0.44,
    color: 'dim',
    tshirt: 'out of scope',
    value: 'Out of scope',
    valueType: 'Could solve; won\'t in this case',
    rationale: 'Top 20% packages by value (~$2K each). Real problem, not what we\'re building here.',
    inCurve: false
  },
  {
    id: 'compliance',
    label: 'Compliance',
    cx: 0.15, cy: 0.78,
    color: 'dim',
    tshirt: 'out of scope',
    value: 'Out of scope — this build',
    valueType: 'High impact — readiness play',
    rationale: 'High impact when it matters. Requires regulatory approval. Not part of this build — becomes critical when volumes grow or regulators audit. Audit trail is a byproduct of the agents we are building.',
    inCurve: false
  }
];

const AGENT_SPECS = {
  si: {
    code: 'SI',
    name: 'Shipment Intelligence Agent',
    tagline: 'The sensor. Watches everything, routes what matters.',
    trigger: 'Continuous — fires on every telemetry event from Sensos labels. Also scheduled poll for weather and carrier tracking updates. Manual invocation available to any authenticated user.',
    jtbd: 'Monitor all active shipments in real time. Classify each as normal / at-risk / failed. Route to the right agent.',
    tools: [
      'Sensos telemetry stream',
      'Weather forecast API',
      'Carrier tracking API',
      'Threshold evaluator',
      'Anomaly scorer',
      'Platform API (push alert to orchestrator)'
    ],
    memShort: 'Current state of every active shipment; active alert queue; recent telemetry windows per shipment',
    memLong: 'Historical baselines per lane, carrier, season; normal temperature curves by route; pattern library of what "trending toward failure" looks like before threshold crossing'
  },
  ra: {
    code: 'RA',
    name: 'Resolution Agent',
    tagline: 'The problem-solver. Figures out what went wrong and fixes it.',
    trigger: 'Handoff from Intelligence Agent when shipment is confirmed failed or out of range. Manual invocation by any authenticated user.',
    jtbd: 'Attribute root cause. Select the right remediation action. Execute it. Confirm outcome on subsequent shipments from the same lane.',
    tools: [
      'Carrier tracking API',
      'Weather forecast API',
      'Shipment data store',
      'Shipping matrix (read/write)',
      'Cost calculator',
      'Carrier instruction dispatch',
      'Confidence scorer'
    ],
    memShort: 'Current exception context; shipment history; prior actions attempted; ops lead decisions on similar recent cases',
    memLong: 'Root cause pattern library by lane/carrier/season; remediation effectiveness history; history of human decisions — learns what the ops lead approves'
  },
  pa: {
    code: 'PA',
    name: 'Prevention Agent',
    tagline: 'The forward-looker. Acts before the failure starts.',
    trigger: 'Two tracks: (1) Scheduled daily review of upcoming shipments vs. weather forecasts; (2) Event-driven handoff from Intelligence Agent when a live shipment is trending at-risk.',
    jtbd: 'Prevent failures before they complete. Two levers: proactive weather-based config adjustment; reactive mid-transit intervention.',
    tools: [
      'Sensos telemetry stream',
      'Weather forecast API',
      'Shipment data store',
      'Shipping matrix (read/write)',
      'Carrier instruction dispatch',
      'Customer notification SMS/email (direct shipments only)',
      'Cost calculator'
    ],
    memShort: 'Active weather advisories and affected lanes; customers contacted today; pending delivery confirmations',
    memLong: 'Weather-failure correlation by region and season; customer response rates by message type; which lanes are most temperature-sensitive; chronic not-home delivery patterns'
  },
  oa: {
    code: 'OA',
    name: 'Optimization Agent',
    tagline: 'The cost-cutter. Continuously hunts for safer, cheaper ways to ship.',
    trigger: 'Scheduled — runs as a batch process over accumulated data. Daily or weekly cycle. Not per-shipment.',
    jtbd: 'Identify safe opportunities to reduce cost across product, lane, and network dimensions without degrading delivery performance.',
    tools: [
      'Shipment data store (full historical)',
      'Cost / pricing database',
      'Weather forecast API',
      'Carrier tracking API',
      'Shipping matrix (read/write)',
      'Cost calculator',
      'Confidence scorer'
    ],
    memShort: 'Current analysis cycle findings; pending recommendations awaiting approval',
    memLong: 'Full historical performance data across product x lane x season x carrier; approved optimization history and measured outcomes; temporal patterns. Richest memory of any agent.',
    note: 'Never auto-executes. All recommendations are structural changes — always require at least Medium approval.'
  }
};

const RECAP_CHECKS = [
  {
    q: 'Do you expose the agent\'s reasoning, or just the outcome?',
    a: 'Outcome by default. Reasoning on demand. Three zoom levels.',
    ref: '§3.5'
  },
  {
    q: 'Do you show every action or only the ones that need a human?',
    a: 'Pre-approval for routine. Escalation by type for the rest.',
    ref: '§3.4'
  },
  {
    q: 'Is each service its own page, one surface, or something else?',
    a: 'One surface. Organized by Lane, not by service.',
    ref: '§4'
  },
  {
    q: 'How does the surface avoid being a dashboard?',
    a: 'It speaks first. Agent as author. Ops lead as editor.',
    ref: '§4'
  }
];
