/* ============================================================
   app.js — Sensos deck navigation and interactions
   ============================================================ */

'use strict';

// ── Stage scaling (fluid zoom — no letterbox) ─────────────
const stage = document.getElementById('deck-stage');
const NAV_H = 52;
const REF_H = 700;  // vertical space slides were tuned for
const REF_W = 960;  // gentle floor so very narrow panes shrink rather than squish

function scaleStage() {
  const w = window.innerWidth;
  const h = window.innerHeight - NAV_H;
  const scale = Math.min(1, h / REF_H, w / REF_W); // cap at 1 — never enlarge
  stage.style.zoom   = scale;
  stage.style.width  = (w / scale) + 'px'; // pre-zoom → fills viewport after zoom
  stage.style.height = (h / scale) + 'px';
}

// ── Slide state ───────────────────────────────────────────
const sections = Array.from(document.querySelectorAll('.deck-section'));
const visibleSections = sections.filter(s => s.id !== 'slide-speaker');
let current = 0;
let speakerOpen = false;

// ── Navigate ──────────────────────────────────────────────
function goTo(index, skipAnim) {
  if (index < 0 || index >= visibleSections.length) return;

  const prev = visibleSections[current];
  prev.classList.remove('active', 'entering');

  current = index;
  const next = visibleSections[current];
  next.classList.add('active');

  if (!skipAnim) {
    next.classList.add('entering');
    setTimeout(() => next.classList.remove('entering'), 1000);
  }

  updateNav();
  onSlideEnter(current);
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

// ── Keyboard ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
  if (e.key === 'ArrowLeft')                    { e.preventDefault(); prev(); }
  if (e.key === 's' || e.key === 'S')           { toggleSpeaker(); }
  if (e.key === 'a' || e.key === 'A')           { toggleAppendix(); }
});

// ── Navigation UI ─────────────────────────────────────────
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const counter = document.getElementById('slide-counter');
const dotsEl  = document.getElementById('progress-dots');

btnPrev.addEventListener('click', prev);
btnNext.addEventListener('click', next);

function updateNav() {
  const n = visibleSections.length;
  btnPrev.disabled = current === 0;
  btnNext.disabled = current === n - 1;
  counter.textContent = `${current + 1} / ${n}`;

  dotsEl.querySelectorAll('.progress-dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });
}

function buildDots() {
  dotsEl.innerHTML = '';
  visibleSections.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'progress-dot';
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });
}

// ── Speaker notes ─────────────────────────────────────────
const speakerPanel = document.getElementById('speaker-panel');
const speakerNotes = {
  0:  'Title slide. Let it breathe. Audience already knows you\'re Omer. Move when they\'re ready.',
  1:  'Three data sources — nothing invented. Click each node: Customer Brief first, Calibration last. The Daniel insight (98% bought) is the pivot that reframes everything.',
  2:  'Two primary personas — click each one. Close with the two "What\'s Broken" cards at the bottom. Everything in §2 follows from those two punchlines.',
  3:  'Two numbers. $22M is unmanaged exposure. $440K is money already being spent. Show the assumptions openly — don\'t hide the maths. Both from a real calibration call.',
  4:  'Impact/Effort matrix. Four dots in the focus zone — high impact, low effort. Hover each for context. The four in the cluster become the four agents. Top-right is where we start.',
  5:  'Four items. Four agents. Bridge slide — brief. Mention: all other problems are deliberate cuts, not oversights. Hit the "What we\'re not solving" button to show the excluded items.',
  6:  'The vision in one line, then the two states. Make the arrow feel significant. The CEO quote closes it — let it land. Don\'t say anything after you read it.',
  7:  'Infrastructure, not a bespoke agent. The grid shows what\'s reusable. The agent mapping below shows what this client gets. New customer = new agent config, not new tools.',
  8:  'Click each agent node for the spec card. SI first — it routes everything else. Key point: invocation authority is separate from approval authority. Any user can trigger; Decision Tier governs output.',
  9:  'Framework overview. Name all three before diving in. Permissions: who decides what. Transparency: what the human sees. Evaluation: how agents earn more autonomy over time. The thread is deliberate: autonomy only works if control is built in at every layer.',
  10: 'Three tiers. Not just "escalate" — a policy, and a configurable one. The configurable note at the bottom matters: what\'s auto for one customer might require sign-off for another.',
  11: 'Click the log levels live. Start at L1 (outcome), expand to L2 (tasks), expand to L3 (trace). Principle: outcome by default, everything expandable on demand.',
  12: 'Four loops. Cross-entity is the moat — say it clearly. No individual customer accumulates this breadth of signal. Sensos does.',
  13: 'Set the frame first: the game metaphor. Then walk the three entities. Lanes are where decisions live. Agents and humans are both participants — neither is just watching. Note that this is a simplified view.',
  14: 'Four design principles. Acts, surfaces, lets the user drive — and lives in the tools they already use. The last one matters: no new inbox. Agents reach into Slack, Monday, ServiceNow. The ops team doesn\'t change how they work.',
  15: 'Before you open the demo: set expectations. Wireframe, not everything wired. The point is the vision of how the ops team experiences this — not a production build. Then open it and walk: quiet state → active state → Miami-NYC lane → expand L2 → L3 → approve.',
  16: 'Tick the four questions. Then the expansion path. End on: approved decisions become rules, rules enable autonomy, autonomy expands as trust is earned.',
  17: 'Thank you. Open for questions. You have the content — stay in the detail wherever they push.'
};

function toggleSpeaker() {
  speakerOpen = !speakerOpen;
  speakerPanel.classList.toggle('visible', speakerOpen);
  if (speakerOpen) updateSpeakerNotes();
}

function updateSpeakerNotes() {
  speakerPanel.textContent = speakerNotes[current] || '(no notes for this slide)';
}

// ── Per-slide entry hooks ─────────────────────────────────
function onSlideEnter(index) {
  if (speakerOpen) updateSpeakerNotes();
  const slideId = visibleSections[index].id;
  if (slideId === 'slide-recap') { triggerRecapChecks(); }
}

// ══════════════════════════════════════════════════════════
// §0 DISCOVERY — node expand
// ══════════════════════════════════════════════════════════
function initDiscovery() {
  const nodes = document.querySelectorAll('.source-node');
  const panels = document.querySelectorAll('.discovery-panel');
  const emptyState = document.querySelector('.discovery-empty');

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const id = node.dataset.node;
      const wasActive = node.classList.contains('active');
      nodes.forEach(n => n.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      if (!wasActive) {
        node.classList.add('active');
        const panel = document.getElementById('panel-' + id);
        if (panel) panel.classList.add('active');
        if (emptyState) emptyState.style.display = 'none';
      } else {
        if (emptyState) emptyState.style.display = '';
      }
    });
  });
}

// ══════════════════════════════════════════════════════════
// §1 PROBLEM — persona select
// ══════════════════════════════════════════════════════════
function initPersonas() {
  const cards = document.querySelectorAll('.persona-card');
  const panels = document.querySelectorAll('.persona-detail-panel');

  if (cards.length > 0) {
    cards[0].classList.add('active');
    const firstId = cards[0].dataset.persona;
    const firstPanel = document.getElementById('detail-' + firstId);
    if (firstPanel) firstPanel.classList.add('active');
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      card.classList.add('active');
      const id = card.dataset.persona;
      const panel = document.getElementById('detail-' + id);
      if (panel) panel.classList.add('active');
    });
  });
}

// ══════════════════════════════════════════════════════════
// §2b MATRIX — SVG interactions (no build-order curve)
// ══════════════════════════════════════════════════════════
const PLOT = { x0: 80, y0: 20, w: 560, h: 340 }; // within SVG viewBox 0 0 700 400

function matrixCoords(cx, cy) {
  return {
    x: PLOT.x0 + cx * PLOT.w,
    y: PLOT.y0 + (1 - cy) * PLOT.h
  };
}

function initMatrix() {
  const svg = document.getElementById('impact-matrix');
  if (!svg) return;

  const tooltip = document.getElementById('matrix-tooltip');

  const COLORS = {
    ok:   '#2C7A56',
    warn: '#B5751A',
    muted:'#B0ADA7',
    dim:  '#D4D2CE'
  };

  // Grid lines
  const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  for (let i = 1; i < 5; i++) {
    const gy = PLOT.y0 + (i/5) * PLOT.h;
    const gx = PLOT.x0 + (i/5) * PLOT.w;

    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', PLOT.x0); hLine.setAttribute('x2', PLOT.x0 + PLOT.w);
    hLine.setAttribute('y1', gy); hLine.setAttribute('y2', gy);
    hLine.setAttribute('stroke', '#F0EEE9'); hLine.setAttribute('stroke-width', '1');
    gridG.appendChild(hLine);

    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('x1', gx); vLine.setAttribute('x2', gx);
    vLine.setAttribute('y1', PLOT.y0); vLine.setAttribute('y2', PLOT.y0 + PLOT.h);
    vLine.setAttribute('stroke', '#F0EEE9'); vLine.setAttribute('stroke-width', '1');
    gridG.appendChild(vLine);
  }
  svg.insertBefore(gridG, svg.firstChild);

  // Focus zone: high impact (top) + low effort (right)
  // cx > 0.6 → x > PLOT.x0 + 0.6*PLOT.w = 416
  // cy > 0.6 → y < PLOT.y0 + 0.4*PLOT.h = 156
  const focusZone = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  focusZone.setAttribute('x', PLOT.x0 + 0.6 * PLOT.w);
  focusZone.setAttribute('y', PLOT.y0);
  focusZone.setAttribute('width', 0.4 * PLOT.w);
  focusZone.setAttribute('height', 0.4 * PLOT.h);
  focusZone.setAttribute('fill', '#2C7A56');
  focusZone.setAttribute('fill-opacity', '0.05');
  focusZone.setAttribute('stroke', '#2C7A56');
  focusZone.setAttribute('stroke-opacity', '0.18');
  focusZone.setAttribute('stroke-width', '1');
  focusZone.setAttribute('stroke-dasharray', '4 3');
  focusZone.setAttribute('rx', '4');
  svg.appendChild(focusZone);

  const focusLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  focusLabel.setAttribute('x', PLOT.x0 + 0.62 * PLOT.w);
  focusLabel.setAttribute('y', PLOT.y0 + 12);
  focusLabel.setAttribute('font-size', '9');
  focusLabel.setAttribute('fill', '#2C7A56');
  focusLabel.setAttribute('fill-opacity', '0.55');
  focusLabel.setAttribute('font-family', 'DM Mono, monospace');
  focusLabel.setAttribute('letter-spacing', '0.06em');
  focusLabel.textContent = 'FOCUS ZONE';
  svg.appendChild(focusLabel);

  // Dots
  MATRIX_DOTS.forEach(dot => {
    const { x, y } = matrixCoords(dot.cx, dot.cy);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'matrix-dot');
    g.style.cursor = 'pointer';
    g.style.opacity = dot.color === 'dim' ? '0.35' : '1';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '7');
    circle.setAttribute('fill', COLORS[dot.color] || '#ccc');
    circle.setAttribute('stroke', '#FAFAF8');
    circle.setAttribute('stroke-width', '2');
    g.appendChild(circle);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x + 12);
    label.setAttribute('y', y + 4);
    label.setAttribute('font-size', '11');
    label.setAttribute('fill', dot.color === 'dim' ? '#B0ADA7' : '#26262C');
    label.setAttribute('font-family', 'Syne, sans-serif');
    label.textContent = dot.label;
    g.appendChild(label);

    g.addEventListener('mouseenter', (e) => { showMatrixTooltip(dot, e); });
    g.addEventListener('mousemove',  (e) => { positionTooltip(tooltip, e); });
    g.addEventListener('mouseleave', ()  => { tooltip.classList.remove('visible'); });
    g.addEventListener('click', (e) => {
      showMatrixTooltip(dot, e);
      e.stopPropagation();
    });

    svg.appendChild(g);
  });

  svg.addEventListener('click', () => tooltip.classList.remove('visible'));
}

function showMatrixTooltip(dot, e) {
  const tooltip = document.getElementById('matrix-tooltip');
  const tshirtColor = dot.color === 'ok' ? '#2C7A56' : dot.color === 'warn' ? '#B5751A' : '#888581';
  tooltip.innerHTML = `
    <div class="tooltip-title">${dot.label} <span style="font-family:var(--font-mono);font-size:11px;color:${tshirtColor}">${dot.tshirt}</span></div>
    <div class="tooltip-value">${dot.value}</div>
    <div class="tooltip-row"><strong>${dot.valueType}</strong></div>
    <div class="tooltip-rationale">${dot.rationale}</div>
  `;
  tooltip.classList.add('visible');
  positionTooltip(tooltip, e);
}

function positionTooltip(tooltip, e) {
  const x = e.clientX + 14;
  const y = e.clientY - 10;
  const rect = tooltip.getBoundingClientRect();
  const finalX = Math.min(x, window.innerWidth  - rect.width  - 10);
  const finalY = Math.max(10, Math.min(y, window.innerHeight - rect.height - 10));
  tooltip.style.left = finalX + 'px';
  tooltip.style.top  = finalY + 'px';
}

// ══════════════════════════════════════════════════════════
// §2c SOLVING — "what we're not solving" overlay
// ══════════════════════════════════════════════════════════
function initSolvingOverlay() {
  const btn     = document.getElementById('not-solving-btn');
  const overlay = document.getElementById('not-solving-overlay');
  const close   = document.getElementById('not-solving-close');

  if (!btn || !overlay) return;

  btn.addEventListener('click', () => overlay.classList.add('open'));
  close.addEventListener('click', () => overlay.classList.remove('open'));
}

// ══════════════════════════════════════════════════════════
// §3.2 PLATFORM — expand toggles
// ══════════════════════════════════════════════════════════
function initPlatform() {
  const expandBtns = document.querySelectorAll('.platform-expand-btn');
  expandBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const target = document.getElementById(targetId);
      if (!target) return;
      const isOpen = target.classList.contains('open');
      target.classList.toggle('open', !isOpen);
      btn.textContent = isOpen ? btn.dataset.more : btn.dataset.less;
    });
  });
}

// ══════════════════════════════════════════════════════════
// §3.3 ARCHITECTURE — agent spec cards
// ══════════════════════════════════════════════════════════
function initArchitecture() {
  const agentNodes = document.querySelectorAll('.agent-node');
  const panel = document.getElementById('agent-spec-panel');

  agentNodes.forEach(node => {
    node.addEventListener('click', () => {
      const agentId = node.dataset.agent;
      const spec = AGENT_SPECS[agentId];
      if (!spec) return;

      if (node.classList.contains('selected')) {
        node.classList.remove('selected');
        panel.classList.remove('visible');
        return;
      }

      agentNodes.forEach(n => n.classList.remove('selected'));
      node.classList.add('selected');
      renderSpecCard(spec);
      panel.classList.add('visible');
    });
  });

  document.getElementById('spec-close')?.addEventListener('click', () => {
    agentNodes.forEach(n => n.classList.remove('selected'));
    panel.classList.remove('visible');
  });
}

function renderSpecCard(spec) {
  const panel = document.getElementById('agent-spec-panel');
  const colorMap = { SI: 'var(--si)', RA: 'var(--ra)', PA: 'var(--pa)', OA: 'var(--oa)' };
  const color = colorMap[spec.code] || 'var(--muted)';

  const toolsHtml = spec.tools.map(t => `<li>${t}</li>`).join('');
  const noteHtml = spec.note ? `<div class="spec-note">${spec.note}</div>` : '';

  panel.innerHTML = `
    <div class="spec-panel-header">
      <div>
        <div class="spec-panel-code" style="color:${color}">${spec.code}</div>
        <div class="spec-panel-name">${spec.name}</div>
        <div class="spec-panel-tagline">${spec.tagline}</div>
      </div>
      <button class="spec-panel-close" id="spec-close">✕</button>
    </div>
    <hr class="spec-divider">
    <div>
      <div class="spec-section-label">Trigger</div>
      <div class="spec-section-body">${spec.trigger}</div>
    </div>
    <div>
      <div class="spec-section-label">JTBD</div>
      <div class="spec-section-body">${spec.jtbd}</div>
    </div>
    <div>
      <div class="spec-section-label">Tools</div>
      <ul class="spec-tool-list">${toolsHtml}</ul>
    </div>
    <div>
      <div class="spec-section-label">Memory</div>
      <div class="spec-mem-row">
        <div class="spec-mem-key">Short</div>
        <div class="spec-mem-val">${spec.memShort}</div>
      </div>
      <div class="spec-mem-row">
        <div class="spec-mem-key">Long</div>
        <div class="spec-mem-val">${spec.memLong}</div>
      </div>
    </div>
    ${noteHtml}
  `;

  document.getElementById('spec-close')?.addEventListener('click', () => {
    document.querySelectorAll('.agent-node').forEach(n => n.classList.remove('selected'));
    panel.classList.remove('visible');
  });
}

// ══════════════════════════════════════════════════════════
// §3.5 SHOW/HIDE — log level accordion
// ══════════════════════════════════════════════════════════
function initLogLevels() {
  const headers = document.querySelectorAll('.log-level-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const level = header.closest('.log-level');
      const isOpen = level.classList.contains('open');
      level.classList.toggle('open', !isOpen);
    });
  });
}

// ══════════════════════════════════════════════════════════
// §5 RECAP — staggered checkmark reveal
// ══════════════════════════════════════════════════════════
let recapTriggered = false;

function triggerRecapChecks() {
  if (recapTriggered) return;
  recapTriggered = true;
  const marks = document.querySelectorAll('.check-mark');
  marks.forEach((mark, i) => {
    setTimeout(() => mark.classList.add('revealed'), 400 + i * 250);
  });
}

// ══════════════════════════════════════════════════════════
// APPENDIX — overlay open / close / tab switching
// ══════════════════════════════════════════════════════════
let appendixOpen = false;

function toggleAppendix() {
  appendixOpen = !appendixOpen;
  const overlay = document.getElementById('appendix-overlay');
  overlay.classList.toggle('open', appendixOpen);
  if (appendixOpen) updateAppendixNotes();
  else if (speakerOpen) updateSpeakerNotes();
}

function initAppendix() {
  const closeBtn = document.getElementById('appendix-close');
  const tabs     = document.querySelectorAll('.appendix-tab');

  closeBtn.addEventListener('click', () => {
    appendixOpen = false;
    document.getElementById('appendix-overlay').classList.remove('open');
    if (speakerOpen) updateSpeakerNotes();
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.appendix-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel).classList.add('active');
      if (speakerOpen) updateAppendixNotes();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && appendixOpen) {
      appendixOpen = false;
      document.getElementById('appendix-overlay').classList.remove('open');
      if (speakerOpen) updateSpeakerNotes();
    }
  });
}

function updateAppendixNotes() {
  const activePanel = document.querySelector('.appendix-panel.active');
  if (activePanel && speakerOpen) {
    speakerPanel.textContent = activePanel.dataset.notes || '(no notes for this panel)';
  }
}

// ══════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  scaleStage();
  window.addEventListener('resize', scaleStage);

  buildDots();
  goTo(0, true);

  initDiscovery();
  initPersonas();
  initMatrix();
  initSolvingOverlay();
  initPlatform();
  initArchitecture();
  initLogLevels();
  initAppendix();
});
