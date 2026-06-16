// app.js — Sensos Demo: Navigation, state, interactions
// Dependencies: data.js (loaded first)

/* ─────────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────── */
const state = {
  screen: 'title',          // 'title' | 'main' | 'lane' | 'agents' | 'products' | 'product'
  mode: 'quiet',            // 'quiet' | 'active'
  currentLane: null,
  currentProduct: null,
  activeTab: 'live',        // 'live' | 'history' | 'outlook'
  activityFilter: 'all',    // 'all' | 'agents' | 'humans'
  selectedAgent: null,
  exceptionResolved: false,
  expandedRows: new Set(),
  openTraces: new Set(),
  stageExpanded: null,
  popupQueue: [...POPUP_SCENARIOS],
  popupIndex: 0,
  overviewTab: 'live',      // 'live' | 'status'
  mapMetric: 'cop',         // 'cop' | 'failure' | 'time'
  currentShipment: null,
  shipmentFilter: 'all',    // 'all' | 'live' | 'delivered'
};

/* ─────────────────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────────────────── */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + name);
  if (target) {
    target.classList.add('active');
    target.classList.add('screen-fade');
    setTimeout(() => target.classList.remove('screen-fade'), 400);
    // Inject sidebar into placeholder(s) within this screen
    target.querySelectorAll('[data-sidebar]').forEach(el => {
      el.innerHTML = renderSidebar(el.dataset.sidebar);
    });
  }
  state.screen = name;
  const ctrl = document.getElementById('demo-controls');
  if (ctrl) ctrl.classList.toggle('visible', name !== 'title');
}

function goToLane(laneId) {
  state.currentLane = laneId;
  state.activeTab = 'live';
  state.activityFilter = 'all';
  state.expandedRows.clear();
  state.openTraces.clear();
  state.stageExpanded = null;
  renderLaneDetail(laneId);
  showScreen('lane');
}

function goToMain() {
  showScreen('main');
  renderMainView();
}

function goToAgents() {
  state.selectedAgent = null;
  showScreen('agents');
  renderAgentsPage();
}

function goToProducts() {
  showScreen('products');
  renderProductsList();
}

function goToProduct(productId) {
  state.currentProduct = productId;
  renderProductDetail(productId);
  showScreen('product');
}

function goToLanes() {
  showScreen('lanes');
  renderLanesPage();
}

function goToShipments() {
  state.shipmentFilter = 'all';
  showScreen('shipments');
  renderShipmentsList();
}

function goToShipment(id) {
  state.currentShipment = id;
  renderShipmentDetail(id);
  showScreen('shipment');
}

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function agentColor(id) {
  const map = { SI: '#5B6470', RA: '#A8543A', PA: '#3A5BA8', OA: '#2C7A56', YOU: '#0A0A0B' };
  return map[id] || '#888';
}

function agentName(id) {
  return AGENTS[id] ? AGENTS[id].name : id;
}

function stageIcon(status, count) {
  if (status === 'complete') return '✓';
  if (status === 'empty')    return '—';
  if (status === 'warn')     return '⚠';
  return count || '·';
}

function makeSvgLogo(size = 22, small = false) {
  const s = size;
  const h = Math.round(s * 1.15);
  const sw = small ? 1 : 1.5;
  const sw2 = small ? 0.75 : 1;
  return `<svg width="${s}" height="${h}" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 3 L57 19 L57 51 L30 67 L3 51 L3 19 Z" stroke="white" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M30 3 L30 35 M3 19 L57 19 M3 51 L30 35 L57 51 M30 35 L30 67" stroke="white" stroke-width="${sw2}" stroke-opacity="0.35"/>
    <path d="M30 3 L57 19 L30 35 L3 19 Z" stroke="white" stroke-width="${sw}" stroke-linejoin="round"/>
  </svg>`;
}

function makeHeroSvgLogo() {
  return `<svg class="logo-hero" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="logo-path" d="M30 3 L57 19 L57 51 L30 67 L3 51 L3 19 Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
    <path class="logo-path" d="M30 3 L57 19 L30 35 L3 19 Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
    <path class="logo-path" d="M3 19 L3 51 L30 67 L30 35 Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
    <path class="logo-path" d="M57 19 L57 51 L30 67 L30 35 Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
    <line class="logo-path" x1="30" y1="35" x2="30" y2="3" stroke="white" stroke-width="0.8" stroke-opacity="0.3"/>
    <line class="logo-path" x1="3" y1="19" x2="57" y2="19" stroke="white" stroke-width="0.8" stroke-opacity="0.25"/>
  </svg>`;
}

/* ─────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────── */
function renderSidebar(activeKey) {
  const items = [
    { key: 'overview',   label: 'Overview',   icon: '<rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>',  action: 'goToMain()' },
    { key: 'shipments',  label: 'Shipments',  icon: '<path d="M8 1.5 L14 4.5 L14 11.5 L8 14.5 L2 11.5 L2 4.5 Z"/><path d="M2 4.5 L8 7.5 L14 4.5 M8 7.5 L8 14.5"/>',                                                                           action: 'goToShipments()' },
    { key: 'lanes',      label: 'Lanes',      icon: '<path d="M2 4h12M2 8h12M2 12h12"/>',                                                                                                                                                         action: 'goToLanes()' },
    { key: 'agents',    label: 'Agents',    icon: '<circle cx="5" cy="5" r="2"/><rect x="2" y="9" width="6" height="5" rx="1"/><circle cx="11" cy="5" r="2"/><rect x="8" y="9" width="6" height="5" rx="1"/>',                                    action: 'goToAgents()' },
    { key: 'products',  label: 'Products',  icon: '<path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2z"/><circle cx="11.5" cy="11.5" r="2.5"/>',                                                                                                          action: 'goToProducts()' },
    { key: 'settings',  label: 'Settings',  icon: '<path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 6v2M8 10h.01"/>',                                                                                                                                   action: '' },
  ];

  const navHtml = items.map(item => {
    const isActive = item.key === activeKey;
    const onclick = item.action ? ` onclick="${item.action}"` : '';
    return `<div class="nav-item${isActive ? ' active' : ''}"${onclick} style="${!item.action ? 'cursor:default;opacity:0.4' : ''}">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">${item.icon}</svg>
      ${item.label}
    </div>`;
  }).join('');

  return `
    <div class="sidebar-logo">
      ${makeSvgLogo(22, true)}
      <span class="sidebar-logo-text">SENSOS</span>
    </div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="user-avatar">OL</div>
        <span class="user-name">Ops Lead</span>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────────────────
   RENDER: MAIN VIEW
───────────────────────────────────────────────────────── */
function renderMainView() {
  renderBriefingBar();
  renderFleetSummary();
  renderPendingApprovals();
  renderLiveShipments();
  renderLaneStatus();
  renderWorldMap();
  applyOverviewTab();
}

function renderBriefingBar() {
  const bar = document.getElementById('main-briefing');
  if (!bar) return;

  const totalInTransit = LANES.reduce((s, l) => s + l.inTransit, 0);
  const activeLanes = LANES.length;

  if (state.mode === 'quiet') {
    bar.innerHTML = `
      <div class="briefing-text">
        <strong>${activeLanes} lanes active</strong> &middot;
        <span class="briefing-text"><span style="font-family:var(--font-mono)">${totalInTransit}</span> shipments in transit &middot; No exceptions require your attention &middot; 1 optimization recommendation ready for review</span>
      </div>
      <div class="briefing-status">
        <span class="briefing-dot"></span>
        All in range
      </div>`;
  } else {
    bar.innerHTML = `
      <div class="briefing-text">
        <strong>1 exception on Miami–NYC</strong> requires your decision:
        <span class="briefing-link" onclick="goToLane('miami-nyc')">Review on lane →</span>
      </div>
      <div class="briefing-status">
        <span class="briefing-dot warn"></span>
        Exception active
      </div>`;
  }
}

// Shared lane row template — used by both Overview attention list and Lanes screen
function laneRowHtml(lane) {
  const agentChips = lane.activeAgents.map(id =>
    `<div class="agent-chip" style="background:${agentColor(id)}" title="${agentName(id)}">${id}</div>`
  ).join('');
  const displayStatus = (state.mode === 'active' && lane.hasException) ? 'warn' : lane.status;
  return `
    <div class="lane-row" onclick="goToLane('${lane.id}')">
      <div class="lane-status-dot ${displayStatus}"></div>
      <div class="lane-name-col">
        <div class="lane-name">${lane.name}</div>
        <div class="lane-product">${lane.product}</div>
      </div>
      <div class="lane-stats-col">
        <div class="lane-in-transit">${lane.inTransit}</div>
        <div class="lane-transit-label">in transit</div>
      </div>
      <div class="lane-agents-col">${agentChips}</div>
      <div class="lane-activity-col">${lane.lastActivity}</div>
      <div class="lane-arrow">→</div>
    </div>`;
}

function renderFleetSummary() {
  const strip = document.getElementById('fleet-summary-strip');
  if (!strip) return;
  const totalInTransit = LANES.reduce((s, l) => s + l.inTransit, 0);
  const pendingCount = ACTIVITY.filter(a => a.isPending).length;
  const pendingHtml = pendingCount
    ? `<span class="fss-warn">${pendingCount} pending approval</span>`
    : `<span>0 pending</span>`;
  strip.innerHTML = `
    <span>${LANES.length} lanes</span>
    <span class="fss-sep">·</span>
    <span>${totalInTransit} in transit</span>
    <span class="fss-sep">·</span>
    <span>${Object.keys(AGENTS).filter(k => k !== 'YOU').length} agents</span>
    <span class="fss-sep">·</span>
    ${pendingHtml}`;
}

// Kept for backwards-compat; not called from renderMainView anymore.
function renderAttentionList() {
  const attentionLanes = LANES.filter(l =>
    (state.mode === 'active' && l.hasException) || l.status === 'warn'
  );
  return attentionLanes;
}

/* ─────────────────────────────────────────────────────────
   OVERVIEW TABS
───────────────────────────────────────────────────────── */
function setOverviewTab(tab) {
  state.overviewTab = tab;
  // Update tab button active classes
  document.querySelectorAll('.overview-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  applyOverviewTab();
  renderWorldMap();
}

function applyOverviewTab() {
  const livePanel   = document.getElementById('overview-live');
  const statusPanel = document.getElementById('overview-status');
  const mapCtrl     = document.getElementById('map-controls');
  if (livePanel)   livePanel.style.display   = state.overviewTab === 'live'   ? 'block' : 'none';
  if (statusPanel) statusPanel.style.display = state.overviewTab === 'status' ? 'block' : 'none';
  if (mapCtrl)     mapCtrl.style.display     = state.overviewTab === 'status' ? 'block' : 'none';
}

/* ─────────────────────────────────────────────────────────
   OVERVIEW — LIVE SHIPMENTS (summary, not full list)
───────────────────────────────────────────────────────── */
function renderLiveShipments() {
  const el = document.getElementById('overview-shipments');
  if (!el) return;

  const live      = SHIPMENTS.filter(s => s.status === 'live');
  const atRisk    = live.filter(s => s.tempStatus === 'warn');
  const inRange   = live.filter(s => s.tempStatus !== 'warn');
  const delivered = SHIPMENTS.filter(s => s.status === 'delivered');

  const statStrip = `
    <div class="overview-summary-strip">
      <div class="summary-stat"><span class="ss-val">${live.length}</span><span class="ss-key">live</span></div>
      <div class="summary-stat ok"><span class="ss-val">${inRange.length}</span><span class="ss-key">in range</span></div>
      ${atRisk.length ? `<div class="summary-stat warn"><span class="ss-val">${atRisk.length}</span><span class="ss-key">at risk</span></div>` : ''}
      <div class="summary-stat muted"><span class="ss-val">${delivered.length}</span><span class="ss-key">delivered</span></div>
    </div>`;

  const atRiskHtml = atRisk.length ? `
    <div class="section-label" style="padding:12px 20px 4px">At risk</div>
    <div class="live-ship-list">
      ${atRisk.map(s => {
        const lane = LANES.find(l => l.id === s.laneId) || {};
        return `
          <div class="live-ship-row" onclick="goToShipment('${s.id}')">
            <div class="live-ship-id">${s.id}</div>
            <div class="live-ship-lane">${lane.name || s.laneId}</div>
            <div class="live-ship-stage">${s.stage}</div>
            <div class="live-ship-temp warn">${s.temp}</div>
            <div class="live-ship-eta">ETA ${s.eta}</div>
            <div class="lane-arrow">→</div>
          </div>`;
      }).join('')}
    </div>` : '';

  const updatesHtml = SHIPMENT_UPDATES.map(u => `
    <div class="update-row">
      <div class="update-time">${u.time}</div>
      <div class="agent-chip" style="background:${agentColor(u.agentId)}">${u.agentId}</div>
      <div class="update-text">${u.text}</div>
    </div>`).join('');

  el.innerHTML = `
    ${statStrip}
    ${atRiskHtml}
    <div style="padding:12px 20px 0">
      <span class="view-all-link" onclick="goToShipments()">View all shipments →</span>
    </div>
    <div class="section-label" style="padding:16px 20px 6px">Updates</div>
    <div class="updates-feed">${updatesHtml}</div>`;
}

/* ─────────────────────────────────────────────────────────
   OVERVIEW — LANE STATUS
───────────────────────────────────────────────────────── */
function renderLaneStatus() {
  const el = document.getElementById('overview-status');
  if (!el) return;

  const rowsHtml = LANES.map(lane => {
    const displayStatus = (state.mode === 'active' && lane.hasException) ? 'warn' : lane.status;
    const actions = (lane.actions || []).filter(a => !a.activeOnly || state.mode === 'active');
    const actionsHtml = actions.length
      ? actions.map(a => {
          const kindClass = a.kind === 'approve' ? 'approve' : a.kind === 'review' ? 'review' : 'reassign';
          return `<button class="lane-status-action ${kindClass}"
            onclick="event.stopPropagation();laneStatusAction('${lane.id}','${a.id}','${a.kind}','${a.actId||''}')">${a.label}</button>`;
        }).join('')
      : `<span class="no-action">No action needed</span>`;

    return `
      <div class="lane-status-row" onclick="goToLane('${lane.id}')">
        <div class="lane-status-hd">
          <div class="lane-status-dot ${displayStatus}"></div>
          <div class="lane-status-name">${lane.name}</div>
          <div class="carrier-badge ${lane.carrierType === 'Direct' ? 'direct' : 'third'}">${lane.carrierType}</div>
        </div>
        <div class="lane-status-metrics">
          <div class="lsm-cell">
            <div class="lsm-val">$${lane.avgCOP}</div>
            <div class="lsm-key">avg COP</div>
          </div>
          <div class="lsm-cell">
            <div class="lsm-val">${lane.avgTime}</div>
            <div class="lsm-key">avg time</div>
          </div>
          <div class="lsm-cell">
            <div class="lsm-val ${lane.failureRate >= 1 ? 'warn-val' : ''}">${lane.failureRate}%</div>
            <div class="lsm-key">failure</div>
          </div>
          <div class="lsm-cell">
            <div class="lsm-val ${lane.outOfRulesRate >= 1 ? 'warn-val' : ''}">${lane.outOfRulesRate}%</div>
            <div class="lsm-key">out-of-rules</div>
          </div>
        </div>
        <div class="lane-status-actions">${actionsHtml}</div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="section-label" style="padding:12px 20px 6px">Lane status</div>
    <div class="lane-status-list">${rowsHtml}</div>`;
}

function laneStatusAction(laneId, actionId, kind, actId) {
  if (kind === 'review') {
    goToLane(laneId);
    return;
  }
  if (kind === 'reassign') {
    showToast('Carrier reassignment is disabled in this demo');
    return;
  }
  if (kind === 'approve' && actId) {
    const item = ACTIVITY.find(a => a.id === actId);
    if (item && item.isPending) {
      item.isPending = false;
      item.statusLabel = 'Approved';
      item.statusType = 'approved';
      item.approvedBy = 'Ops Lead';
      item.approvedAt = 'Just now';
      item.summary = '[Approved] ' + item.summary;
      showToast('Approved: ' + (item.projectedValue || 'optimization'));
      renderPendingApprovals();
      renderLaneStatus();
    }
    return;
  }
  showToast('Action is disabled in this demo');
}

function renderLanesPage() {
  // Briefing bar
  const briefing = document.getElementById('lanes-briefing');
  if (briefing) {
    briefing.innerHTML = `
      <div class="briefing-text"><strong>${LANES.length} lanes configured</strong> · Manage carriers, agents, and temp rules per lane</div>
      <div class="briefing-status"><span class="briefing-dot"></span>All lanes active</div>`;
  }
  // Config-oriented lane rows
  const list = document.getElementById('lanes-list');
  if (!list) return;
  list.innerHTML = LANES.map(lane => {
    const agentChips = lane.activeAgents.map(id =>
      `<div class="agent-chip" style="background:${agentColor(id)}" title="${agentName(id)}">${id}</div>`
    ).join('');
    return `
      <div class="lane-config-row" onclick="goToLane('${lane.id}')">
        <div class="lane-name-col">
          <div class="lane-name">${lane.name}</div>
          <div class="lane-product">${lane.product}</div>
        </div>
        <div class="lane-config-meta">
          <span class="carrier-badge ${lane.carrierType === 'Direct' ? 'direct' : 'third'}">${lane.carrierType}</span>
          <span class="lane-config-cop">$${lane.avgCOP} avg COP</span>
        </div>
        <div class="lane-agents-col">${agentChips}</div>
        <button class="lane-config-btn" onclick="event.stopPropagation();showToast('Lane configuration is disabled in this demo')">Configure</button>
      </div>`;
  }).join('');
}

function renderPendingApprovals() {
  const el = document.getElementById('main-approvals');
  if (!el) return;

  const pending = ACTIVITY.filter(a => a.isPending);
  if (!pending.length) { el.innerHTML = ''; return; }

  const rowsHtml = pending.map(item => {
    const agent = AGENTS[item.agentId];
    return `
      <div class="approval-row">
        <div class="activity-avatar agent" style="background:${agentColor(item.agentId)};color:${agentColor(item.agentId)};border-radius:6px;width:28px;height:28px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px;font-weight:600;color:white;position:relative">
          ${item.agentId}
          <span style="position:absolute;bottom:-2px;right:-2px;width:7px;height:7px;border-radius:50%;background:var(--surface);border:1.5px solid ${agentColor(item.agentId)};box-sizing:border-box"></span>
        </div>
        <div class="approval-content">
          <div class="approval-agent-name">${agentName(item.agentId)}</div>
          <div class="approval-summary">${item.summary}</div>
          ${item.projectedValue ? `<div class="approval-value">↑ ${item.projectedValue}</div>` : ''}
        </div>
        <div class="approval-actions">
          ${item.laneId ? `<button class="btn-review-link" onclick="goToLane('${item.laneId}')">Review →</button>` : ''}
          <button class="btn-approve" style="padding:5px 12px;font-size:11px" onclick="approvePendingOverview('${item.id}')">Approve</button>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="approvals-block">
      <div class="approvals-block-header">
        <span class="approvals-block-title">Approvals pending</span>
        <span class="approvals-block-count">${pending.length} item${pending.length > 1 ? 's' : ''}</span>
      </div>
      ${rowsHtml}
    </div>`;
}

function approvePendingOverview(id) {
  const item = ACTIVITY.find(a => a.id === id);
  if (!item) return;
  item.isPending = false;
  item.statusLabel = 'Approved';
  item.statusType = 'approved';
  item.approvedBy = 'Ops Lead';
  item.approvedAt = 'Just now';
  item.summary = '[Approved] ' + item.summary;
  renderPendingApprovals();
  renderBriefingBar();
}

/* ─────────────────────────────────────────────────────────
   RENDER: WORLD MAP
───────────────────────────────────────────────────────── */
function mapProject(lat, lon, w, h) {
  return {
    x: (lon + 180) / 360 * w,
    y: (90 - lat) / 180 * h,
  };
}

function mapArcPath(fromLatLon, toLatLon, w, h) {
  const f = mapProject(fromLatLon.lat, fromLatLon.lon, w, h);
  const t = mapProject(toLatLon.lat, toLatLon.lon, w, h);
  // Control point: midpoint lifted upward, scaled by distance
  const dist = Math.hypot(t.x - f.x, t.y - f.y);
  const lift = Math.min(dist * 0.28, 60);
  const cx = (f.x + t.x) / 2;
  const cy = (f.y + t.y) / 2 - lift;
  return `M${f.x.toFixed(1)},${f.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${t.x.toFixed(1)},${t.y.toFixed(1)}`;
}

/* ─────────────────────────────────────────────────────────
   MAP METRIC HELPERS
───────────────────────────────────────────────────────── */
function metricValue(lane, metric) {
  if (metric === 'cop')     return lane.avgCOP;
  if (metric === 'failure') return lane.failureRate;
  if (metric === 'time')    return parseFloat(lane.avgTime);
  return 0;
}

function metricLabel(lane, metric) {
  if (metric === 'cop')     return `$${lane.avgCOP}`;
  if (metric === 'failure') return `${lane.failureRate}%`;
  if (metric === 'time')    return `${lane.avgTime}`;
  return '';
}

function metricColor(lane, metric) {
  const v = metricValue(lane, metric);
  if (metric === 'cop') {
    if (v < 40)  return 'heat-ok';
    if (v < 65)  return 'heat-warn';
    return 'heat-alert';
  }
  if (metric === 'failure') {
    if (v < 0.5) return 'heat-ok';
    if (v < 2)   return 'heat-warn';
    return 'heat-alert';
  }
  if (metric === 'time') {
    if (v < 1.5) return 'heat-ok';
    if (v < 3)   return 'heat-warn';
    return 'heat-alert';
  }
  return 'heat-ok';
}

function setMapMetric(metric) {
  state.mapMetric = metric;
  // Update metric switch buttons
  document.querySelectorAll('.map-metric-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.metric === metric);
  });
  renderWorldMap();
}

/* ─────────────────────────────────────────────────────────
   WORLD MAP
───────────────────────────────────────────────────────── */
function renderWorldMap() {
  const container = document.getElementById('world-map-container');
  if (!container) return;

  // Always use the 1000x500 map coordinate space; SVG viewBox + preserveAspectRatio handles scaling
  const MW = 1000, MH = 500;

  // Collect unique cities across all lanes
  const cityMap = {};
  LANES.forEach(lane => {
    if (!lane.from || !lane.to) return;
    [lane.from, lane.to].forEach(c => {
      const key = `${c.lat},${c.lon}`;
      if (!cityMap[key]) cityMap[key] = { ...c, lanes: [] };
      if (!cityMap[key].lanes.includes(lane.id)) cityMap[key].lanes.push(lane.id);
    });
  });

  const isStatusTab = state.overviewTab === 'status';

  // Build arc paths
  const arcsSVG = LANES.filter(l => l.from && l.to).map(lane => {
    const d = mapArcPath(lane.from, lane.to, MW, MH);
    let cls, extraEl = '';

    if (isStatusTab) {
      // Heatmap: color by chosen metric
      cls = `map-arc ${metricColor(lane, state.mapMetric)}`;

      // Midpoint for label
      const f = mapProject(lane.from.lat, lane.from.lon, MW, MH);
      const t = mapProject(lane.to.lat, lane.to.lon, MW, MH);
      const dist = Math.hypot(t.x - f.x, t.y - f.y);
      const lift = Math.min(dist * 0.28, 60);
      const cx = (f.x + t.x) / 2;
      const cy = (f.y + t.y) / 2 - lift;
      // Label sits above the arc midpoint
      const lx = cx.toFixed(1), ly = (cy - 8).toFixed(1);
      const mc = metricColor(lane, state.mapMetric);
      const labelFill = mc === 'heat-ok' ? 'var(--ok)' : mc === 'heat-warn' ? 'var(--warn)' : 'var(--alert)';
      extraEl = `<text class="map-arc-label" x="${lx}" y="${ly}" text-anchor="middle" fill="${labelFill}">${metricLabel(lane, state.mapMetric)}</text>`;
    } else {
      // Live tab: status-colored arcs + animated dot
      const displayStatus = (state.mode === 'active' && lane.hasException) ? 'warn' : lane.status;
      cls = `map-arc${displayStatus === 'warn' ? ' warn' : ''}`;
      // Dot speed: proportional to distance on screen
      const f = mapProject(lane.from.lat, lane.from.lon, MW, MH);
      const t = mapProject(lane.to.lat, lane.to.lon, MW, MH);
      const dist = Math.hypot(t.x - f.x, t.y - f.y);
      const dur = Math.max(2, (dist / 120)).toFixed(1);
      const dotFill = (state.mode === 'active' && lane.hasException) ? 'var(--warn)' : 'var(--ok)';
      extraEl = `<circle class="map-ship-dot" r="4" fill="${dotFill}">
        <animateMotion dur="${dur}s" repeatCount="indefinite" path="${d}" rotate="auto"/>
      </circle>`;
    }

    return `<path class="${cls}" d="${d}" data-lane="${lane.id}" />
${extraEl}`;
  }).join('\n');

  // Build city dots
  const citiesSVG = Object.values(cityMap).map(city => {
    const p = mapProject(city.lat, city.lon, MW, MH);
    const hasWarn = city.lanes.some(id => {
      const l = LANES.find(ln => ln.id === id);
      return l && state.mode === 'active' && l.hasException;
    });
    const dotColor = hasWarn ? 'var(--warn)' : 'var(--ok)';
    const key = `${city.lat},${city.lon}`;
    const labelRight = p.x > MW * 0.7;
    const lx = labelRight ? -8 : 8;
    const anchor = labelRight ? 'end' : 'start';
    return `<g class="map-city" data-city-key="${key}">
      <circle class="map-city-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${dotColor}" stroke="var(--surface)" stroke-width="1.5"/>
      <text class="map-city-label" x="${(p.x + lx).toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="${anchor}">${city.name}</text>
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="14" fill="transparent" stroke="none" class="map-city-hit"/>
    </g>`;
  }).join('\n');

  const svgContent = `
    <svg viewBox="0 0 ${MW} ${MH}" preserveAspectRatio="xMidYMid meet"
         xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="${MW}" height="${MH}" fill="var(--paper)"/>
      ${WORLD_MAP_SVG_CONTENT}
      <g id="map-arcs">${arcsSVG}</g>
      <g id="map-cities">${citiesSVG}</g>
    </svg>`;

  container.innerHTML = svgContent + '<div class="map-attribution">Ops Intelligence · Live</div>';

  // Wire arc / city events
  container.querySelectorAll('.map-arc').forEach(el => {
    el.addEventListener('click', () => goToLane(el.dataset.lane));
    el.addEventListener('mouseenter', () => el.classList.add('hovered'));
    el.addEventListener('mouseleave', () => el.classList.remove('hovered'));
  });
  container.querySelectorAll('.map-city').forEach(el => {
    const dot = el.querySelector('.map-city-dot');
    el.addEventListener('mouseenter', () => {
      el.classList.add('hovered');
      if (dot) dot.setAttribute('r', '6');
    });
    el.addEventListener('mouseleave', () => {
      el.classList.remove('hovered');
      if (dot) dot.setAttribute('r', '4');
    });
    const key = el.dataset.cityKey;
    const city = Object.values(cityMap).find(c => `${c.lat},${c.lon}` === key);
    if (city && city.lanes.length) {
      el.addEventListener('click', () => goToLane(city.lanes[0]));
    }
  });

  // Render #map-controls for the status tab
  const mapCtrl = document.getElementById('map-controls');
  if (mapCtrl) {
    if (isStatusTab) {
      const metrics = [
        { key: 'cop',     label: 'COP' },
        { key: 'failure', label: 'Failure rate' },
        { key: 'time',    label: 'Avg time' },
      ];
      const switchHtml = metrics.map(m =>
        `<button class="map-metric-btn${state.mapMetric === m.key ? ' active' : ''}"
          data-metric="${m.key}" onclick="setMapMetric('${m.key}')">${m.label}</button>`
      ).join('');
      mapCtrl.innerHTML = `
        <div class="map-metric-row">
          <span class="map-metric-label">Color by</span>
          <div class="map-metric-switch">${switchHtml}</div>
        </div>
        <div class="map-legend">
          <span class="map-legend-stop ok"></span><span class="map-legend-text">Low</span>
          <span class="map-legend-stop warn"></span><span class="map-legend-text">Medium</span>
          <span class="map-legend-stop alert"></span><span class="map-legend-text">High</span>
        </div>`;
      mapCtrl.style.display = 'block';
    } else {
      mapCtrl.style.display = 'none';
    }
  }
}

/* ─────────────────────────────────────────────────────────
   RENDER: LANE DETAIL
───────────────────────────────────────────────────────── */
function renderLaneDetail(laneId) {
  const lane = LANES.find(l => l.id === laneId) || LANES[0];

  renderLaneHeader(lane);
  renderLaneMetrics(lane);
  renderStagePipeline();
  renderActivityFeed(lane);
  renderConfigPanel();
  switchTab('live');
}

function renderLaneMetrics(lane) {
  const el = document.getElementById('lane-metrics-strip');
  if (!el) return;

  const failWarn  = lane.failureRate >= 1;
  const oorWarn   = lane.outOfRulesRate >= 1;

  el.innerHTML = `
    <div class="lane-metric">
      <div class="lm-val">$${lane.avgCOP}</div>
      <div class="lm-key">cost per order</div>
    </div>
    <div class="lane-metric-sep"></div>
    <div class="lane-metric">
      <div class="lm-val ${failWarn ? 'lm-warn' : ''}">${lane.failureRate}%</div>
      <div class="lm-key">ship failure</div>
    </div>
    <div class="lane-metric-sep"></div>
    <div class="lane-metric">
      <div class="lm-val ${oorWarn ? 'lm-warn' : ''}">${lane.outOfRulesRate}%</div>
      <div class="lm-key">out of rules</div>
    </div>
    <div class="lane-metric-sep"></div>
    <div class="lane-metric">
      <div class="lm-val">${lane.avgTime}</div>
      <div class="lm-key">avg transit</div>
    </div>`;
}

function renderLaneHeader(lane) {
  const el = document.getElementById('lane-header-content');
  if (!el) return;

  const isWarn = state.mode === 'active' && lane.hasException;
  const healthClass = isWarn ? 'warn' : 'ok';
  const healthText  = isWarn ? 'Exception active' : 'In range';

  el.innerHTML = `
    <div class="lane-breadcrumb">
      <span onclick="goToMain()">Overview</span>
      <span class="sep">/</span>
      <span onclick="goToLanes()">Lanes</span>
      <span class="sep">/</span>
      <span style="color:var(--ink);font-weight:600">${lane.name}</span>
    </div>
    <div class="lane-header-main">
      <div>
        <div class="lane-title">${lane.name}</div>
        <div class="lane-meta">${lane.carrier} &middot; ${lane.warehouse}<br>${lane.product}</div>
      </div>
      <div style="display:flex;align-items:center;gap:20px">
        <div class="lane-header-stats">
          <div class="stat-block">
            <div class="stat-value">${lane.inTransit}</div>
            <div class="stat-label">in transit</div>
          </div>
          <div class="stat-block">
            <div class="stat-value">${lane.delivered}</div>
            <div class="stat-label">delivered</div>
          </div>
          <div class="stat-block">
            <div class="stat-value">${lane.failed}</div>
            <div class="stat-label">failed</div>
          </div>
        </div>
        <div class="health-badge ${healthClass}">
          <div class="health-badge-dot"></div>
          ${healthText}
        </div>
      </div>
    </div>`;
}

function renderStagePipeline() {
  const el = document.getElementById('stage-pipeline');
  if (!el) return;

  let html = '';
  STAGES.forEach((stage, i) => {
    // Connector before (except first)
    if (i > 0) html += `<div class="stage-connector"></div>`;

    // Structural stages keep their static status; transit stages derive status from
    // live shipments on the current lane so Middle Mile only pulses warn when there
    // are actual warn shipments here — not on every lane in the demo.
    const isStatic = ['done', 'complete', 'empty'].includes(stage.status);
    let effectiveStatus = stage.status;
    if (!isStatic && state.currentLane) {
      const liveHere = SHIPMENTS.filter(s =>
        s.laneId === state.currentLane && s.stageId === stage.id && s.status === 'live'
      );
      effectiveStatus = liveHere.some(s => s.tempStatus === 'warn') ? 'warn' : 'ok';
    }

    const icon = stageIcon(effectiveStatus, stage.count);
    const agentHtml = stage.agent
      ? `<div class="stage-agent-chip" style="background:${agentColor(stage.agent)}">${stage.agent}</div>`
      : '';

    html += `
      <div class="stage-node-wrap" onclick="toggleStage('${stage.id}')">
        <div class="stage-node ${effectiveStatus}" title="${stage.label}: ${stage.count} shipments">
          <span class="stage-count-badge">${icon}</span>
        </div>
        <div class="stage-info">
          <div class="stage-name">${stage.label}</div>
          ${stage.sub ? `<div class="stage-sub">${stage.sub}</div>` : ''}
        </div>
        <div class="stage-agent">${agentHtml}</div>
      </div>`;
  });

  el.innerHTML = html;
}

function toggleStage(stageId) {
  const wrap = document.getElementById('stage-shipments-wrap');
  if (!wrap) return;

  if (state.stageExpanded === stageId) {
    // Clicking the already-open stage closes it
    wrap.classList.remove('open');
    state.stageExpanded = null;
  } else {
    state.stageExpanded = stageId;
    renderStageDetail(stageId);
    wrap.classList.add('open');
  }
}

function renderStageDetail(stageId) {
  const el = document.getElementById('stage-shipments-inner');
  if (!el) return;

  const stage = STAGES.find(s => s.id === stageId);
  if (!stage) return;

  const liveWarnHere = SHIPMENTS.filter(s =>
    s.laneId === state.currentLane && s.stageId === stageId &&
    s.status === 'live' && s.tempStatus === 'warn'
  );
  const isWarnStage = liveWarnHere.length > 0;
  const failWarn    = stage.failureRate >= 1;

  // Metrics row
  const metricsHtml = `
    <div class="stage-detail-metrics">
      <div class="sdm-cell">
        <div class="sdm-val">$${stage.cpo}</div>
        <div class="sdm-key">CPO at stage</div>
      </div>
      <div class="sdm-sep"></div>
      <div class="sdm-cell">
        <div class="sdm-val ${failWarn ? 'sdm-warn' : ''}">${stage.failureRate}%</div>
        <div class="sdm-key">excursion rate</div>
      </div>
      <div class="sdm-sep"></div>
      <div class="sdm-cell sdm-carrier">
        <div class="sdm-val sdm-carrier-val">${stage.carrier}</div>
        <div class="sdm-key">carrier / handoff</div>
      </div>
    </div>`;

  // Shipments at this stage
  const stageShipments = SHIPMENTS.filter(s =>
    s.laneId === state.currentLane && s.stageId === stageId && s.status === 'live'
  );
  const warnCount = stageShipments.filter(s => s.tempStatus === 'warn').length;

  let shipmentsHtml = '';
  if (stageShipments.length) {
    const countLine = `${stageShipments.length} active shipment${stageShipments.length !== 1 ? 's' : ''}${warnCount ? ' · ' + warnCount + ' ⚠' : ''}`;
    shipmentsHtml = `
      <div class="shipment-list-label" style="margin-top:10px">${stage.label} · ${countLine}</div>
      ${stageShipments.map(s => `
        <div class="shipment-row-small" onclick="event.stopPropagation();goToShipment('${s.id}')">
          <span class="shipment-id">${s.id}</span>
          <span class="shipment-temp ${s.tempStatus === 'warn' ? 'warn' : ''}">${s.temp}</span>
          <span class="shipment-product">${s.product}</span>
          <span class="shipment-time">${s.eta ? 'ETA ' + s.eta : ''}</span>
          <span class="shipment-arrow">→</span>
        </div>`).join('')}`;
  } else {
    shipmentsHtml = `
      <div class="stage-no-shipments">No active shipments at ${stage.label}</div>`;
  }

  el.innerHTML = `
    <div class="shipment-list ${isWarnStage ? 'stage-expansion-warn' : ''}">
      ${metricsHtml}
      ${shipmentsHtml}
    </div>`;
}

function renderActivityFeed(lane) {
  const feedEl = document.getElementById('activity-feed');
  if (!feedEl) return;

  const filterBar = `
    <div class="activity-filter-bar">
      <button class="filter-btn${state.activityFilter === 'all' ? ' active' : ''}" onclick="setActivityFilter('all')">All</button>
      <button class="filter-btn${state.activityFilter === 'agents' ? ' active' : ''}" onclick="setActivityFilter('agents')">Agents</button>
      <button class="filter-btn${state.activityFilter === 'humans' ? ' active' : ''}" onclick="setActivityFilter('humans')">Humans</button>
    </div>`;

  let html = filterBar;

  // Exception card (active state only, not yet resolved)
  if (state.mode === 'active' && lane.hasException && !state.exceptionResolved) {
    html += renderExceptionCard();
  }

  // Filtered activity
  html += `<div class="feed-section-label">Activity</div>`;

  const filtered = ACTIVITY.filter(item => {
    if (state.activityFilter === 'agents') return item.agentId !== 'YOU';
    if (state.activityFilter === 'humans') return item.agentId === 'YOU';
    return true;
  });

  filtered.forEach(item => { html += renderActivityRow(item); });

  feedEl.innerHTML = html;
}

function renderExceptionCard() {
  const e = EXCEPTION;
  return `
    <div class="exception-card" id="exception-card">
      <div class="exception-header">
        <span class="exception-icon">⚠</span>
        <span class="exception-lane">${e.laneName} &mdash; Resolution Agent</span>
        <span class="exception-meta">${e.time} · Awaiting your decision</span>
      </div>
      <div class="exception-body">
        <div class="exception-desc">${e.description}</div>
        <div class="exception-attr">${e.attribution}</div>
        <div class="exception-proposed">Proposed: ${e.proposed}</div>
        <div class="exception-details">
          <div class="exception-detail-item">
            <span class="exception-detail-label">Confidence</span>
            <span class="exception-detail-value">${e.confidence}%</span>
          </div>
          <div class="exception-detail-item">
            <span class="exception-detail-label">Cost impact</span>
            <span class="exception-detail-value">${e.costImpact}</span>
          </div>
          <div class="exception-detail-item">
            <span class="exception-detail-label">Decision tier</span>
            <span class="exception-detail-value">${e.tier}</span>
          </div>
        </div>
        <div class="exception-actions">
          <button class="btn-approve" onclick="approveException()">Approve</button>
          <button class="btn-secondary" onclick="overrideException()">Override</button>
          <button class="btn-secondary" onclick="toggleActivityRow('act-1')">View reasoning</button>
        </div>
      </div>
    </div>`;
}

function renderActivityRow(item) {
  const agent = AGENTS[item.agentId];
  const isExpanded = state.expandedRows.has(item.id);
  const expandLabel = isExpanded ? 'Collapse ↑' : 'Expand ↓';

  let rightHtml = `
    <div class="activity-time">${item.time}</div>
    <div class="status-badge ${item.statusType}">${item.statusLabel}</div>
    ${item.hasDrilldown ? `<button class="expand-btn" onclick="toggleActivityRow('${item.id}')">${expandLabel}</button>` : ''}`;

  let pendingHtml = '';
  if (item.isPending && !isExpanded) {
    pendingHtml = `
      <div class="pending-actions">
        <button class="btn-approve" style="padding:6px 14px;font-size:11px" onclick="approvePending('${item.id}')">Approve</button>
        <button class="btn-secondary" style="padding:6px 14px;font-size:11px">Dismiss</button>
      </div>`;
  }

  let expansionHtml = '';
  if (item.hasDrilldown && item.level2 && isExpanded) {
    expansionHtml = renderLevel2(item);
  }

  const isAgent = item.agentId !== 'YOU';
  const avatarClass = isAgent ? 'agent' : 'human';
  const avatarStyle = isAgent
    ? `background:${agentColor(item.agentId)};color:${agentColor(item.agentId)};border-radius:6px;position:relative`
    : `background:${agentColor(item.agentId)}`;
  const markerHtml = isAgent
    ? `<span style="position:absolute;bottom:-2px;right:-2px;width:7px;height:7px;border-radius:50%;background:var(--paper);border:1.5px solid ${agentColor(item.agentId)};box-sizing:border-box"></span>`
    : '';

  const approvedHtml = (item.approvedBy && !item.isPending)
    ? `<div class="activity-approved-by">✓ Approved by ${item.approvedBy} · ${item.approvedAt}</div>`
    : '';

  return `
    <div class="activity-row" id="row-${item.id}">
      <div class="activity-row-main">
        <div class="activity-avatar ${avatarClass}" style="${avatarStyle}">${item.agentId}${markerHtml}</div>
        <div class="activity-content">
          <div class="activity-agent-name">${agentName(item.agentId)}</div>
          <div class="activity-summary">${item.summary}</div>
          ${approvedHtml}
        </div>
        <div class="activity-right">${rightHtml}</div>
      </div>
      ${pendingHtml}
      <div class="expansion-panel${isExpanded ? ' open' : ''}" id="exp-${item.id}">
        ${expansionHtml}
      </div>
    </div>`;
}

function renderLevel2(item) {
  const l2 = item.level2;
  const traceOpen = state.openTraces.has(item.id);

  const tasksHtml = l2.tasks.map(t =>
    `<div class="task-item"><span class="task-check">✓</span><span>${t}</span></div>`
  ).join('');

  const traceHtml = renderLevel3(item.id, l2.level3, traceOpen);

  return `
    <div class="expansion-inner">
      <div class="exp-section">
        <div class="exp-label">What happened</div>
        <div class="exp-text">${l2.whatHappened}</div>
      </div>
      <div class="exp-section">
        <div class="exp-label">What I did</div>
        <div class="task-list">${tasksHtml}</div>
      </div>
      <div class="exp-footer">
        <div class="exp-outcome">${l2.outcome}</div>
        <button class="trace-btn" onclick="toggleTrace('${item.id}')">
          ${traceOpen ? 'Hide trace ↑' : 'See full trace ↓'}
        </button>
      </div>
      <div class="trace-panel${traceOpen ? ' open' : ''}" id="trace-${item.id}">
        ${traceHtml}
      </div>
    </div>`;
}

function renderLevel3(itemId, lines, open) {
  if (!lines || !lines.length) return '';

  const linesHtml = lines.map(l => {
    const cls = l.tool ? 'trace-content tool' : l.note ? 'trace-content note' : 'trace-content';
    return `<div class="trace-line">
      <span class="trace-ts">${l.ts || ''}</span>
      <span class="${cls}">${l.line}</span>
    </div>`;
  }).join('');

  return `
    <div class="trace-inner">
      <div class="trace-header">
        <span>Reasoning trace</span>
        <span style="color:var(--muted-2);font-size:9px">Full agent log · for audit</span>
      </div>
      <div class="trace-lines">${linesHtml}</div>
    </div>`;
}

function renderConfigPanel() {
  const el = document.getElementById('config-panel-content');
  if (!el) return;

  const cfg = LANE_CONFIG;
  const rulesHtml = cfg.rules.map(r => `<div class="rule-item">${r}</div>`).join('');

  el.innerHTML = `
    <div class="config-section">
      <div class="config-label">Configuration</div>
      <div class="config-row">
        <span class="config-key">Ice config</span>
        <span class="config-value">${cfg.iceConfig}</span>
      </div>
      <div class="config-row">
        <span class="config-key">Carrier</span>
        <span class="config-value">${cfg.carrier}</span>
      </div>
      <div class="config-row">
        <span class="config-key">Dispatch</span>
        <span class="config-value">${cfg.dispatchWindow}</span>
      </div>
    </div>
    <div class="config-section">
      <div class="config-label">Active rules</div>
      <div class="rules-list">${rulesHtml}</div>
    </div>
    <div class="config-section">
      <div class="config-label">External risks</div>
      <div class="risk-badge">
        <span class="risk-icon">⚠</span>
        <span>${cfg.externalRisk}</span>
      </div>
    </div>
    <button class="btn-edit-rules" onclick="alert('Rules editor — not shown in this demo')">Edit rules →</button>`;
}

/* ─────────────────────────────────────────────────────────
   INTERACTIONS
───────────────────────────────────────────────────────── */
function toggleActivityRow(id) {
  if (state.expandedRows.has(id)) {
    state.expandedRows.delete(id);
  } else {
    state.expandedRows.add(id);
  }
  // Re-render the specific row
  const item = ACTIVITY.find(a => a.id === id);
  if (!item) return;
  const rowEl = document.getElementById('row-' + id);
  if (!rowEl) return;

  const lane = LANES.find(l => l.id === state.currentLane) || LANES[0];
  const newRow = document.createElement('div');
  newRow.innerHTML = renderActivityRow(item);
  const rendered = newRow.firstElementChild;
  rowEl.replaceWith(rendered);
}

function toggleTrace(id) {
  if (state.openTraces.has(id)) {
    state.openTraces.delete(id);
  } else {
    state.openTraces.add(id);
  }
  // Re-render the expansion panel only
  const item = ACTIVITY.find(a => a.id === id);
  if (!item || !item.level2) return;
  const expEl = document.getElementById('exp-' + id);
  if (!expEl) return;
  expEl.innerHTML = renderLevel2(item);
  // Keep open
  expEl.classList.add('open');
}

function approveException() {
  state.exceptionResolved = true;
  // Remove exception card with fade
  const card = document.getElementById('exception-card');
  if (card) {
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    card.style.opacity = '0';
    card.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      card.remove();
      // Update act-1 status
      const act1 = ACTIVITY[0];
      if (act1) {
        act1.statusLabel = 'Approved';
        act1.statusType = 'approved';
        act1.approvedBy = 'Ops Lead';
        act1.approvedAt = 'Just now';
        act1.summary = 'Ice config updated to 2 boxes for next 5 shipments.';
      }
      // Re-render feed section
      const feedSection = document.getElementById('activity-feed');
      if (feedSection) {
        const briefEl = document.getElementById('main-briefing');
        // Switch back to quiet state
        state.mode = 'quiet';
        updateToggleUI();
        renderActivityFeed(LANES[0]);
        renderBriefingBar();
      }
    }, 300);
  }
}

function overrideException() {
  const proposed = prompt('Enter your override instruction:');
  if (proposed && proposed.trim()) {
    approveException();
  }
}

function approvePending(id) {
  const item = ACTIVITY.find(a => a.id === id);
  if (!item) return;
  item.isPending = false;
  item.statusLabel = 'Approved';
  item.statusType = 'approved';
  item.approvedBy = 'Ops Lead';
  item.approvedAt = 'Just now';
  const lane = LANES.find(l => l.id === state.currentLane) || LANES[0];
  renderActivityFeed(lane);
}

/* ─────────────────────────────────────────────────────────
   TABS
───────────────────────────────────────────────────────── */
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.getElementById('tab-live').style.display     = tab === 'live'    ? 'flex' : 'none';
  document.getElementById('tab-history').style.display  = tab === 'history' ? 'block' : 'none';
  document.getElementById('tab-outlook').style.display  = tab === 'outlook' ? 'block' : 'none';
}

function setActivityFilter(filter) {
  state.activityFilter = filter;
  const lane = LANES.find(l => l.id === state.currentLane) || LANES[0];
  renderActivityFeed(lane);
}

/* ─────────────────────────────────────────────────────────
   RENDER: AGENTS PAGE
───────────────────────────────────────────────────────── */
// Org-chart positions: x as % of container width, y as px from top.
// Cards are compact (name + avatar only), ~120px tall.
const AGENT_POSITIONS = {
  YOU: { x: 50, y: 20  },
  SI:  { x: 28, y: 180 },
  OA:  { x: 72, y: 180 },
  RA:  { x: 16, y: 340 },
  PA:  { x: 42, y: 340 },
};

// Returns an inline SVG glyph for the given key.
// Parent avatar has color:white so currentColor = white.
function agentGlyph(key) {
  const glyphs = {
    eye:    '<circle cx="8" cy="8" r="2.8" fill="currentColor"/><ellipse cx="8" cy="8" rx="6.5" ry="4" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    shield: '<path d="M8 1.5 L14 4.5 L14 9 C14 12.5 11.2 14.8 8 15.5 C4.8 14.8 2 12.5 2 9 L2 4.5 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
    bolt:   '<path d="M10.5 1.5 L4.5 9 L8 9 L5.5 14.5 L13 7 L9 7 Z" fill="currentColor" stroke="none"/>',
    leaf:   '<path d="M8 14 C8 14 3 10.5 3 6.5 C3 4 5 2 8 2 C11 2 13 4 13 6.5 C13 10.5 8 14 8 14Z" fill="none" stroke="currentColor" stroke-width="1.4"/><line x1="8" y1="14" x2="8" y2="8" stroke="currentColor" stroke-width="1.4"/>',
    person: '<circle cx="8" cy="5" r="2.8" fill="currentColor" stroke="none"/><path d="M2.5 16 C2.5 11.5 5 9.5 8 9.5 C11 9.5 13.5 11.5 13.5 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  };
  return glyphs[key] || glyphs.person;
}

function renderAgentsPage() {
  const container = document.getElementById('agents-constellation');
  if (!container) return;

  // Render all cards (YOU + 4 agents)
  const allKeys = ['YOU', 'SI', 'OA', 'RA', 'PA'];

  const cardsHtml = allKeys.map(id => {
    const a = AGENTS[id];
    const pos = AGENT_POSITIONS[id];
    const isSelected = state.selectedAgent === id;
    const isHuman = id === 'YOU';

    return `
      <div class="agent-node-card${isSelected ? ' selected' : ''}${isHuman ? ' agent-node-you' : ''}"
           style="left:calc(${pos.x}% - 80px);top:${pos.y}px"
           onclick="selectAgent('${id}')">
        <div class="agent-node-avatar" style="background:${a.color}">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">${agentGlyph(a.glyph)}</svg>
        </div>
        <div class="agent-node-name">${a.name}</div>
        <div class="agent-node-dot${isHuman ? ' agent-node-dot-human' : ''}"></div>
      </div>`;
  }).join('');

  // "+ New agent" button — inside the constellation canvas, top-right corner
  const addAgentHtml = `
    <button class="agents-add-in-canvas"
            style="position:absolute;top:16px;right:16px"
            onclick="showToast('Agent creation is disabled in this demo')">+ New agent</button>`;

  // SVG placeholder — connectors drawn after DOM settles
  const svgPlaceholder = `
    <svg id="agents-connector-svg" class="agents-svg-connectors" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,1 L0,5 L5,3 z" fill="var(--muted-2)"/>
        </marker>
      </defs>
    </svg>`;

  container.innerHTML = svgPlaceholder + cardsHtml + addAgentHtml;

  // Draw connectors after cards are in DOM (need rects)
  requestAnimationFrame(() => drawAgentConnectors(container));
}

// Edges to draw: [fromId, toId]
const AGENT_EDGES = [
  ['YOU', 'SI'],
  ['YOU', 'OA'],
  ['SI', 'RA'],
  ['SI', 'PA'],
];

function drawAgentConnectors(container) {
  const svg = document.getElementById('agents-connector-svg');
  if (!svg) return;
  const containerRect = container.getBoundingClientRect();

  // Build a map of card elements by agent id
  const cards = {};
  container.querySelectorAll('.agent-node-card').forEach(card => {
    // Extract id from the onclick attribute
    const match = card.getAttribute('onclick').match(/selectAgent\('(\w+)'\)/);
    if (match) cards[match[1]] = card;
  });

  let paths = '';
  AGENT_EDGES.forEach(([fromId, toId]) => {
    const fromCard = cards[fromId];
    const toCard = cards[toId];
    if (!fromCard || !toCard) return;

    const fr = fromCard.getBoundingClientRect();
    const tr = toCard.getBoundingClientRect();

    // From: bottom-center of parent card (relative to container)
    const x1 = fr.left + fr.width / 2 - containerRect.left;
    const y1 = fr.bottom - containerRect.top;
    // To: top-center of child card
    const x2 = tr.left + tr.width / 2 - containerRect.left;
    const y2 = tr.top - containerRect.top;

    // Orthogonal elbow: drop vertical, then horizontal, then vertical
    const midY = (y1 + y2) / 2;
    const d = `M${x1.toFixed(1)},${y1.toFixed(1)} L${x1.toFixed(1)},${midY.toFixed(1)} L${x2.toFixed(1)},${midY.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`;

    paths += `<path d="${d}" fill="none" stroke="var(--line)" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#arrowhead)"/>\n`;
  });

  svg.innerHTML = `
    <defs>
      <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,1 L0,5 L5,3 z" fill="var(--muted-2)"/>
      </marker>
    </defs>
    ${paths}`;
}

function selectAgent(id) {
  state.selectedAgent = id;
  renderAgentsPage();
  renderAgentDetail(id);
  const panel = document.getElementById('agent-detail-panel');
  if (panel) panel.classList.add('open');
}

function closeAgentDetail() {
  state.selectedAgent = null;
  const panel = document.getElementById('agent-detail-panel');
  if (panel) { panel.classList.remove('open'); panel.innerHTML = ''; }
  renderAgentsPage();
}

function renderAgentDetail(id) {
  const panel = document.getElementById('agent-detail-panel');
  if (!panel) return;
  const a = AGENTS[id];

  const evalsHtml = a.evals.length
    ? a.evals.map(e => `<span class="agent-eval-tag">${e}</span>`).join('')
    : '<span style="font-size:11px;color:var(--muted-2);font-family:var(--font-mono)">—</span>';

  const handoffsHtml = a.handoffsTo.length
    ? a.handoffsTo.map(t => `<span class="agent-eval-tag" style="color:var(--ra);background:rgba(168,84,58,0.08);border-color:rgba(168,84,58,0.2)">${AGENTS[t].name}</span>`).join('')
    : '<span style="font-size:11px;color:var(--muted-2);font-family:var(--font-mono)">None — acts independently</span>';

  const triggersHtml = a.triggers.length
    ? a.triggers.map(t => `<span class="agent-eval-tag" style="color:var(--muted);background:transparent;border-color:var(--line)">${t}</span>`).join('')
    : '—';

  const outputsHtml = a.outputs.length
    ? a.outputs.map(o => `<span class="agent-eval-tag" style="color:var(--muted);background:transparent;border-color:var(--line)">${o}</span>`).join('')
    : '—';

  const statsHtml = a.stats.length
    ? `<div style="display:flex;gap:12px;margin-top:2px">${a.stats.map(s => `<div><div style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--ink)">${s.value}</div><div style="font-size:10px;color:var(--muted-2);margin-top:1px">${s.label}</div></div>`).join('')}</div>`
    : '';

  const recentActivity = ACTIVITY.filter(item => item.agentId === id).slice(0, 2);
  const recentHtml = recentActivity.map(item => `
    <div style="padding:8px 0;border-bottom:1px solid var(--line-light);font-size:12px;color:var(--muted);line-height:1.5">
      <span style="font-family:var(--font-mono);font-size:10px;color:var(--muted-2)">${item.time}</span><br>
      ${item.summary.substring(0, 90)}${item.summary.length > 90 ? '…' : ''}
    </div>`).join('');

  panel.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px">
      <div class="agent-node-avatar" style="background:${a.color};width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">${agentGlyph(a.glyph)}</svg>
      </div>
      <button class="agent-close-btn" onclick="closeAgentDetail()">✕</button>
    </div>
    <div class="agent-detail-name" style="margin-top:10px">${a.name}</div>
    <div class="agent-detail-role">${a.role}</div>

    ${a.stats.length ? `<div class="agent-detail-section"><div class="agent-detail-label">Stats</div>${statsHtml}</div>` : ''}

    <div class="agent-detail-section">
      <div class="agent-detail-label">Live</div>
      <div class="agent-detail-value">${a.stat || '—'}</div>
    </div>
    ${a.tier ? `<div class="agent-detail-section">
      <div class="agent-detail-label">Decision tier</div>
      <div class="agent-detail-value" style="font-size:11px">${a.tier}</div>
    </div>` : ''}
    ${a.triggers.length ? `<div class="agent-detail-section">
      <div class="agent-detail-label">Triggers</div>
      <div>${triggersHtml}</div>
    </div>` : ''}
    ${a.outputs.length ? `<div class="agent-detail-section">
      <div class="agent-detail-label">Outputs</div>
      <div>${outputsHtml}</div>
    </div>` : ''}
    <div class="agent-detail-section">
      <div class="agent-detail-label">Evaluation types</div>
      <div>${evalsHtml}</div>
    </div>
    <div class="agent-detail-section">
      <div class="agent-detail-label">Hands off to</div>
      <div>${handoffsHtml}</div>
    </div>
    ${recentActivity.length ? `
    <div class="agent-detail-section">
      <div class="agent-detail-label">Recent activity</div>
      ${recentHtml}
    </div>` : ''}
    ${id !== 'YOU' ? `
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--line-light)">
      <button class="agent-card-configure" style="width:100%" onclick="showToast('Configuration is disabled in this demo')">Configure agent</button>
    </div>` : ''}`;
}

/* ─────────────────────────────────────────────────────────
   RENDER: PRODUCTS PAGE
───────────────────────────────────────────────────────── */
function renderProductsList() {
  const list = document.getElementById('products-lane-list');
  if (!list) return;

  list.innerHTML = PRODUCTS.map(p => {
    const agentChips = p.activeAgents.map(id =>
      `<div class="agent-chip" style="background:${agentColor(id)}" title="${agentName(id)}">${id}</div>`
    ).join('');
    const pendingCount = p.optimizations.filter(o => o.status === 'pending').length;
    const lastNote = pendingCount ? `${pendingCount} optimization${pendingCount > 1 ? 's' : ''} pending approval` : `${p.optimizations.filter(o => o.status === 'applied').length} optimization${p.optimizations.filter(o => o.status === 'applied').length !== 1 ? 's' : ''} applied`;

    return `
      <div class="lane-row" onclick="goToProduct('${p.id}')">
        <div class="lane-status-dot ${p.status}"></div>
        <div class="lane-name-col">
          <div class="lane-name">${p.name}</div>
          <div class="product-category">${p.category}</div>
        </div>
        <div style="width:90px;flex-shrink:0">
          <div class="product-range">${p.range}</div>
        </div>
        <div class="lane-agents-col">${agentChips}</div>
        <div class="lane-activity-col">${lastNote}</div>
        <div class="lane-arrow">→</div>
      </div>`;
  }).join('');
}

function renderProductDetail(productId) {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];

  // Header
  const headerEl = document.getElementById('product-header-content');
  if (headerEl) {
    const pendingCount = product.optimizations.filter(o => o.status === 'pending').length;
    headerEl.innerHTML = `
      <div class="lane-breadcrumb">
        <span onclick="goToProducts()">Products</span>
        <span class="sep">/</span>
        <span style="color:var(--ink);font-weight:600">${product.name}</span>
      </div>
      <div class="lane-header-main">
        <div>
          <div class="lane-title">${product.name}</div>
          <div class="product-header-meta">${product.category} · Temp range: <span class="product-range-badge">${product.range}</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:16px">
          <div class="lane-header-stats">
            <div class="stat-block">
              <div class="stat-value">${product.optimizations.filter(o => o.status === 'applied').length}</div>
              <div class="stat-label">optimizations</div>
            </div>
            <div class="stat-block">
              <div class="stat-value">${product.rules.length}</div>
              <div class="stat-label">active rules</div>
            </div>
            <div class="stat-block">
              <div class="stat-value">${product.lanes.length}</div>
              <div class="stat-label">lanes</div>
            </div>
          </div>
          <div class="health-badge ${pendingCount ? 'warn' : 'ok'}">
            <div class="health-badge-dot"></div>
            ${pendingCount ? `${pendingCount} pending` : 'In spec'}
          </div>
        </div>
      </div>`;
  }

  // Feed (optimizations)
  const feedEl = document.getElementById('product-feed');
  if (feedEl) {
    const pendingOpts = product.optimizations.filter(o => o.status === 'pending');
    const appliedOpts = product.optimizations.filter(o => o.status === 'applied');

    let html = '';
    if (pendingOpts.length) {
      html += `<div class="feed-section-label" style="padding:16px 24px 8px">Pending approval</div>`;
      html += '<div style="padding:0 24px">' + pendingOpts.map(o => renderOptimizationRow(o)).join('') + '</div>';
    }
    if (appliedOpts.length) {
      html += `<div class="feed-section-label" style="padding:16px 24px 8px">Applied optimizations</div>`;
      html += '<div style="padding:0 24px;display:flex;flex-direction:column;gap:10px">' + appliedOpts.map(o => renderOptimizationRow(o)).join('') + '</div>';
    }
    html += `<div class="feed-section-label" style="padding:16px 24px 8px">History</div>
      <div style="padding:0 24px 20px"><div class="product-history-text">${product.history}</div></div>`;
    feedEl.innerHTML = html;
  }

  // Config panel
  const configEl = document.getElementById('product-config-panel');
  if (configEl) {
    const cfg = product.config;
    const rulesHtml = product.rules.map(r => `<div class="rule-item">${r}</div>`).join('');
    const lanesHtml = product.lanes.map(lid => {
      const lane = LANES.find(l => l.id === lid);
      return lane ? `<div class="rule-item" style="cursor:pointer" onclick="goToLane('${lid}')">${lane.name} →</div>` : '';
    }).join('');

    configEl.innerHTML = `
      <div class="config-section">
        <div class="config-label">Specification</div>
        ${cfg.iceConfig !== 'None' ? `<div class="config-row"><span class="config-key">Ice config</span><span class="config-value">${cfg.iceConfig}</span></div>` : ''}
        <div class="config-row"><span class="config-key">Transit limit</span><span class="config-value">${cfg.transitLimit}</span></div>
        <div class="config-row"><span class="config-key">Dispatch</span><span class="config-value">${cfg.dispatchWindow}</span></div>
        <div class="config-row"><span class="config-key">Packaging</span><span class="config-value">${cfg.packagingSpec}</span></div>
      </div>
      <div class="config-section">
        <div class="config-label">Active rules</div>
        <div class="rules-list">${rulesHtml}</div>
      </div>
      <div class="config-section">
        <div class="config-label">Ships on lanes</div>
        <div class="rules-list">${lanesHtml}</div>
      </div>`;
  }
}

function renderOptimizationRow(opt) {
  const isPending = opt.status === 'pending';
  const approvedHtml = opt.approvedBy
    ? `<div class="opt-approved-by">✓ Approved by ${opt.approvedBy} · ${opt.approvedAt}</div>`
    : '';
  const pendingActions = isPending ? `
    <div style="margin-top:8px;display:flex;gap:6px">
      <button class="btn-approve" style="padding:5px 12px;font-size:11px" onclick="approveProductOpt('${opt.id}')">Approve</button>
      <button class="btn-secondary" style="padding:5px 12px;font-size:11px">Dismiss</button>
    </div>` : '';

  return `
    <div class="optimization-row${isPending ? ' pending-opt' : ''}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
        <div class="optimization-label">${opt.label}</div>
        <span class="opt-tag ${opt.status}">${opt.status}</span>
      </div>
      <div class="optimization-meta">
        <span class="opt-agent-chip">${agentName(opt.agent)} · ${opt.date}</span>
        <span class="opt-saving">↑ ${opt.saving}</span>
        ${opt.confidence ? `<span style="font-family:var(--font-mono);font-size:10px;color:var(--muted-2)">${opt.confidence}% confidence</span>` : ''}
      </div>
      ${approvedHtml}
      ${pendingActions}
    </div>`;
}

function approveProductOpt(optId) {
  PRODUCTS.forEach(p => {
    const opt = p.optimizations.find(o => o.id === optId);
    if (opt) {
      opt.status = 'applied';
      opt.approvedBy = 'Ops Lead';
      opt.approvedAt = 'Just now';
    }
  });
  renderProductDetail(state.currentProduct);
}

/* ─────────────────────────────────────────────────────────
   SHIPMENTS LIST
───────────────────────────────────────────────────────── */
function setShipmentFilter(f) {
  state.shipmentFilter = f;
  document.querySelectorAll('.ship-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.f === f);
  });
  renderShipmentsList();
}

function renderShipmentsList() {
  const live      = SHIPMENTS.filter(s => s.status === 'live');
  const delivered = SHIPMENTS.filter(s => s.status === 'delivered');
  const todayDel  = delivered.filter(s => s.deliveredAt && s.deliveredAt.startsWith('Today'));

  // Briefing bar
  const briefing = document.getElementById('shipments-briefing');
  if (briefing) {
    briefing.innerHTML = `
      <div class="briefing-text"><strong>${live.length} live</strong> · ${delivered.length} delivered · ${todayDel.length} today</div>
      <div class="briefing-status"><span class="briefing-dot"></span>${live.filter(s => s.tempStatus === 'warn').length ? live.filter(s => s.tempStatus === 'warn').length + ' at risk' : 'All in range'}</div>`;
  }

  const visible = SHIPMENTS.filter(s => {
    if (state.shipmentFilter === 'live')      return s.status === 'live';
    if (state.shipmentFilter === 'delivered') return s.status === 'delivered';
    return true;
  });

  const list = document.getElementById('shipments-list');
  if (!list) return;

  list.innerHTML = visible.map(s => {
    const lane = LANES.find(l => l.id === s.laneId) || {};
    const isWarn = s.tempStatus === 'warn';
    const statusBadge = s.status === 'live'
      ? `<span class="ship-status-badge live">Live</span>`
      : `<span class="ship-status-badge delivered">Delivered</span>`;
    const rightInfo = s.status === 'live'
      ? `<span class="live-ship-temp ${isWarn ? 'warn' : ''}">${s.temp}</span><span class="live-ship-eta">ETA ${s.eta}</span>`
      : `<span class="ship-delivered-at">${s.deliveredAt}</span><span class="ship-outcome ${s.outcome.startsWith('Out') ? 'warn-text' : ''}">${s.outcome}</span>`;

    return `
      <div class="shipment-list-row" onclick="goToShipment('${s.id}')">
        <div class="slr-left">
          <div class="slr-id">${s.id}</div>
          <div class="slr-lane">${lane.name || s.laneId}</div>
        </div>
        <div class="slr-mid">
          <div class="slr-product">${s.product}</div>
          <div class="slr-stage">${s.stage}</div>
        </div>
        <div class="slr-right">
          ${statusBadge}
          ${rightInfo}
          <div class="lane-arrow">→</div>
        </div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────────────────
   SHIPMENT DETAIL
───────────────────────────────────────────────────────── */
function renderShipmentDetail(id) {
  const s    = SHIPMENTS.find(sh => sh.id === id) || SHIPMENTS[0];
  const lane = LANES.find(l => l.id === s.laneId) || {};
  const isLive = s.status === 'live';

  // Header
  const headerEl = document.getElementById('shipment-header-content');
  if (headerEl) {
    const isWarn = s.tempStatus === 'warn';
    const healthClass = isWarn ? 'warn' : 'ok';
    const healthText  = isWarn ? 'At risk' : 'In range';

    headerEl.innerHTML = `
      <div class="lane-breadcrumb">
        <span onclick="goToShipments()">Shipments</span>
        <span class="sep">/</span>
        <span onclick="goToLane('${s.laneId}')">${lane.name || s.laneId}</span>
        <span class="sep">/</span>
        <span style="color:var(--ink);font-weight:600">${s.id}</span>
      </div>
      <div class="lane-header-main">
        <div>
          <div class="lane-title">${s.id} · ${s.product}</div>
          <div class="lane-meta">${lane.name || s.laneId} &middot; ${lane.carrier || ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:20px">
          <div class="lane-header-stats">
            <div class="stat-block">
              <div class="stat-value" style="${isWarn ? 'color:var(--warn)' : ''}">${s.temp}</div>
              <div class="stat-label">temp</div>
            </div>
            <div class="stat-block">
              <div class="stat-value">${isLive ? s.stage : s.deliveredAt}</div>
              <div class="stat-label">${isLive ? 'stage' : 'delivered'}</div>
            </div>
            ${isLive ? `<div class="stat-block"><div class="stat-value">ETA ${s.eta}</div><div class="stat-label">arrival</div></div>` : `<div class="stat-block"><div class="stat-value">${s.outcome || 'In range'}</div><div class="stat-label">outcome</div></div>`}
          </div>
          <div class="health-badge ${healthClass}">
            <div class="health-badge-dot"></div>
            ${healthText}
          </div>
        </div>
      </div>`;
  }

  // Journey pipeline
  renderShipmentPipeline(s);

  // Timeline
  const timelineEl = document.getElementById('shipment-timeline');
  if (timelineEl) {
    timelineEl.innerHTML = (s.events || []).map(e => `
      <div class="update-row">
        <div class="update-time">${e.time}</div>
        <div class="agent-chip" style="background:${agentColor(e.agentId)}">${e.agentId}</div>
        <div class="update-text">${e.text}</div>
      </div>`).join('');
  }
}

function renderShipmentPipeline(shipment) {
  const el = document.getElementById('shipment-pipeline');
  if (!el) return;

  const stageOrder = ['origin','linehaul','regional-dc','middle-mile','last-mile','delivery','customer'];
  const currentIdx = stageOrder.indexOf(shipment.stageId);
  const isDone = shipment.status === 'delivered';

  let html = '';
  STAGES.forEach((stage, i) => {
    if (i > 0) html += `<div class="stage-connector"></div>`;

    let status;
    if (isDone) {
      status = 'complete';
    } else {
      const idx = stageOrder.indexOf(stage.id);
      if (idx < currentIdx)       status = 'done';
      else if (idx === currentIdx) status = stage.status === 'warn' ? 'warn' : 'current';
      else                         status = 'upcoming';
    }

    const icon = status === 'complete' ? '✓'
               : status === 'done'     ? '✓'
               : status === 'warn'     ? '⚠'
               : status === 'current'  ? '·'
               : '·';

    html += `
      <div class="stage-node-wrap">
        <div class="stage-node ${status}" title="${stage.label}">
          <span class="stage-count-badge">${icon}</span>
        </div>
        <div class="stage-info">
          <div class="stage-name">${stage.label}</div>
          ${stage.sub ? `<div class="stage-sub">${stage.sub}</div>` : ''}
        </div>
      </div>`;
  });

  el.innerHTML = html;
}

function submitShipmentCommand() {
  const input = document.getElementById('shipment-command-input');
  if (!input || !input.value.trim()) return;
  input.value = '';
  const s = SHIPMENTS.find(sh => sh.id === state.currentShipment) || {};
  showPopup({
    type: 'info',
    agentId: 'SI',
    title: 'Shipment Intelligence',
    body: `Acknowledged. Reviewing ${s.id || 'shipment'} across all active monitoring channels. Will flag any changes.`,
  });
}

/* ─────────────────────────────────────────────────────────
   DEMO CONTROLS
───────────────────────────────────────────────────────── */
function setMode(mode) {
  state.mode = mode;
  state.exceptionResolved = false;
  updateToggleUI();
  if (state.screen === 'main') {
    renderBriefingBar();
    renderFleetSummary();
    renderPendingApprovals();
    if (state.overviewTab === 'live') {
      renderLiveShipments();
    } else {
      renderLaneStatus();
    }
    renderWorldMap();
  } else if (state.screen === 'lanes') {
    renderLanesPage();
  } else if (state.screen === 'lane') {
    const lane = LANES.find(l => l.id === state.currentLane) || LANES[0];
    renderLaneHeader(lane);
    renderLaneMetrics(lane);
    renderActivityFeed(lane);
  }
}

function updateToggleUI() {
  document.querySelectorAll('.demo-toggle-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === state.mode);
  });
}

function simulateAgentUpdate() {
  const scenario = POPUP_SCENARIOS[state.popupIndex % POPUP_SCENARIOS.length];
  state.popupIndex++;
  showPopup(scenario);
}

/* ─────────────────────────────────────────────────────────
   POPUP MECHANIC
───────────────────────────────────────────────────────── */
function showPopup(scenario) {
  const container = document.getElementById('popup-container');
  if (!container) return;

  const agent = AGENTS[scenario.agentId];
  const color = agentColor(scenario.agentId);
  const isEsc = scenario.type === 'escalation';

  const id = 'popup-' + Date.now();

  const actionsHtml = isEsc ? `
    <div class="popup-actions">
      <button class="popup-btn-primary" onclick="dismissPopup('${id}')">Approve</button>
      <button class="popup-btn-link" onclick="goToLane('${scenario.lane}');dismissPopup('${id}')">Review first →</button>
    </div>` : `
    <div class="popup-actions">
      <button class="popup-btn-link" onclick="goToLane('${scenario.lane}');dismissPopup('${id}')">View on lane →</button>
    </div>`;

  const card = document.createElement('div');
  card.className = `popup-card ${scenario.type}`;
  card.id = id;
  card.innerHTML = `
    <div class="popup-header">
      <div class="popup-avatar agent" style="background:${color};color:${color};border-radius:5px;position:relative">${scenario.agentId}<span style="position:absolute;bottom:-2px;right:-2px;width:6px;height:6px;border-radius:50%;background:var(--surface);border:1.5px solid ${color};box-sizing:border-box"></span></div>
      <div class="popup-agent-name">${agent.name}</div>
      <button class="popup-close" onclick="dismissPopup('${id}')">✕</button>
    </div>
    <div class="popup-title">${scenario.title}</div>
    <div class="popup-body">${scenario.body}</div>
    ${actionsHtml}`;

  container.prepend(card);

  // Trim stack to 3
  while (container.children.length > 3) {
    container.lastElementChild.remove();
  }

  // Auto-dismiss informational
  if (!isEsc) {
    setTimeout(() => dismissPopup(id), 8000);
  }
}

function dismissPopup(id) {
  const card = document.getElementById(id);
  if (!card) return;
  card.classList.add('dismissing');
  setTimeout(() => card.remove(), 260);
}

/* ─────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────── */
function showToast(msg) {
  const container = document.getElementById('demo-toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'demo-toast';
  el.textContent = msg;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

/* ─────────────────────────────────────────────────────────
   LANE COMMAND BAR
───────────────────────────────────────────────────────── */
function submitLaneCommand() {
  const input = document.getElementById('lane-command-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  showPopup({
    agentId: 'SI',
    type: 'info',
    title: 'On it',
    body: `Shipment Intelligence is working on: "${text}"`,
    lane: state.currentLane || 'miami-nyc',
  });
}

/* ─────────────────────────────────────────────────────────
   DEMO: TITLE + RESTART
───────────────────────────────────────────────────────── */
function enterDemo() {
  const titleScreen = document.getElementById('screen-title');
  if (!titleScreen) return;
  titleScreen.style.transition = 'opacity 0.5s ease';
  titleScreen.style.opacity = '0';
  setTimeout(() => {
    renderMainView();
    showScreen('main');
  }, 480);
}

function armTitleScreen() {
  const titleScreen = document.getElementById('screen-title');
  if (!titleScreen) return;
  titleScreen.addEventListener('click', enterDemo, { once: true });
}

function restartDemo() {
  // Reset all state
  state.mode = 'quiet';
  state.exceptionResolved = false;
  state.selectedAgent = null;
  state.currentLane = null;
  state.currentProduct = null;
  state.activityFilter = 'all';
  state.expandedRows.clear();
  state.openTraces.clear();
  state.stageExpanded = null;
  state.popupIndex = 0;
  state.activeTab = 'live';
  state.overviewTab = 'live';
  state.mapMetric = 'cop';
  state.currentShipment = null;
  state.shipmentFilter = 'all';
  // Clear popups
  const popupContainer = document.getElementById('popup-container');
  if (popupContainer) popupContainer.innerHTML = '';
  // Reset toggle UI to quiet
  updateToggleUI();
  // Return to title
  const titleScreen = document.getElementById('screen-title');
  if (titleScreen) {
    titleScreen.style.transition = 'none';
    titleScreen.style.opacity = '1';
  }
  showScreen('title');
  armTitleScreen();
}

/* ─────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Title screen: click to enter
  armTitleScreen();

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Demo control buttons
  document.querySelectorAll('.demo-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  const simBtn = document.getElementById('demo-sim-btn');
  if (simBtn) simBtn.addEventListener('click', simulateAgentUpdate);

  const restartBtn = document.getElementById('demo-restart-btn');
  if (restartBtn) restartBtn.addEventListener('click', restartDemo);

  // Lane command bar
  const cmdInput = document.getElementById('lane-command-input');
  if (cmdInput) {
    cmdInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitLaneCommand();
    });
  }
  const cmdSend = document.getElementById('lane-command-send');
  if (cmdSend) cmdSend.addEventListener('click', submitLaneCommand);

  // Shipment command bar
  const shipInput = document.getElementById('shipment-command-input');
  if (shipInput) {
    shipInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitShipmentCommand();
    });
  }
  const shipSend = document.getElementById('shipment-command-send');
  if (shipSend) shipSend.addEventListener('click', submitShipmentCommand);

  // Back link in lane header breadcrumb is handled inline
});
