// map-data.js — Simplified world map continent outlines
// Projection: equirectangular (x = (lon+180)/360*1000, y = (90-lat)/180*500)
// Coordinates are hand-calculated for a 1000×500 viewBox.
// Land shapes are approximate — sufficient for a demo overlay.
// Public domain approximation; no external dependency.

// Helper to convert lon/lat array pairs to SVG polygon points string
function latlonToPoints(pairs, w, h) {
  return pairs.map(([lat, lon]) => {
    const x = ((lon + 180) / 360 * w).toFixed(1);
    const y = ((90 - lat) / 180 * h).toFixed(1);
    return `${x},${y}`;
  }).join(' ');
}

const MAP_W = 1000;
const MAP_H = 500;

// Each continent: array of [lat, lon] pairs (roughly clockwise)
const CONTINENTS = {
  northAmerica: [
    [71,-168],[60,-141],[49,-125],[32,-117],[20,-100],[16,-88],[10,-83],
    [24,-80],[27,-80],[42,-70],[47,-56],[71,-50],[75,-60],[80,-100],[71,-168]
  ],
  greenland: [
    [83,-44],[83,-17],[70,-18],[60,-44],[70,-57],[83,-44]
  ],
  centralAmerica: [
    [16,-88],[10,-83],[8,-77],[11,-85],[16,-88]
  ],
  southAmerica: [
    [12,-72],[8,-60],[0,-50],[2,-50],[-8,-35],[-23,-43],[-34,-53],[-55,-65],[-55,-68],[-50,-75],
    [-35,-73],[-21,-41],[-5,-35],[0,-50],[4,-52],[10,-60],[12,-72]
  ],
  europe: [
    [71,28],[71,20],[62,5],[58,-5],[44,-8],[36,-9],[36,2],[38,28],[42,35],[55,22],[70,28],[71,28]
  ],
  iberia: [
    [44,-8],[36,-9],[36,2],[44,3],[44,-8]
  ],
  scandinavia: [
    [71,28],[71,20],[62,5],[58,5],[57,8],[58,12],[70,28],[71,28]
  ],
  britain: [
    [51,-5],[58,-5],[58,0],[51,0],[51,-5]
  ],
  africa: [
    [16,-17],[5,-5],[5,10],[12,42],[12,51],[-12,44],[-35,28],[-35,18],[-4,8],
    [16,-17]
  ],
  madagascar: [
    [-12,44],[-25,44],[-26,47],[-16,50],[-12,44]
  ],
  asia: [
    [42,40],[55,40],[77,60],[73,100],[55,90],[40,60],[22,90],[5,100],[4,115],[10,130],
    [30,130],[46,141],[70,145],[73,100],[77,60],[77,100],[70,145],[70,180],[65,178],
    [60,140],[46,141],[30,130],[10,130],[4,115],[0,104],[-8,115],[4,115],[10,130],
    [42,40]
  ],
  asiaMain: [
    [70,28],[71,35],[77,60],[73,100],[42,140],[30,130],[10,130],[4,115],[0,103],
    [5,100],[22,90],[40,60],[45,45],[42,40],[70,28]
  ],
  japanHonshu: [
    [41,140],[35,136],[33,130],[34,132],[40,140],[41,140]
  ],
  indiaSubcontinent: [
    [22,68],[22,90],[8,77],[8,76],[22,68]
  ],
  sriLanka: [
    [7,80],[8,81],[6,81],[6,80],[7,80]
  ],
  australia: [
    [-22,115],[-16,130],[-15,145],[-24,152],[-38,151],[-40,146],[-38,140],
    [-32,130],[-34,116],[-26,113],[-22,115]
  ],
  newZealandNorth: [
    [-36,174],[-41,174],[-41,176],[-36,176],[-36,174]
  ],
  newZealandSouth: [
    [-44,168],[-46,168],[-46,170],[-44,171],[-44,168]
  ],
  borneo: [
    [4,115],[4,118],[-4,117],[-4,115],[4,115]
  ],
  sumatra: [
    [5,96],[5,106],[-6,106],[-6,96],[5,96]
  ],
  java: [
    [-6,106],[-6,111],[-8,114],[-8,106],[-6,106]
  ],
  philippines: [
    [18,120],[18,122],[10,122],[10,120],[18,120]
  ],
  antarcticaLine: [
    [-70,-180],[-70,180]
  ]
};

// Build SVG group string
function buildWorldSVG() {
  const fills = {
    northAmerica: true, greenland: true, centralAmerica: true, southAmerica: true,
    europe: true, iberia: false, scandinavia: false, britain: true, africa: true,
    madagascar: true, asiaMain: true, japanHonshu: true, indiaSubcontinent: false,
    sriLanka: true, australia: true, newZealandNorth: true, newZealandSouth: true,
    borneo: true, sumatra: true, java: true, philippines: true
  };

  let paths = '';
  for (const [name, coords] of Object.entries(CONTINENTS)) {
    if (name === 'antarcticaLine') continue;
    if (name === 'asia') continue; // use asiaMain instead
    if (name === 'iberia') continue; // included in europe
    if (name === 'scandinavia') continue; // included in europe
    if (name === 'centralAmerica') continue; // included in northAmerica

    const pts = latlonToPoints(coords, MAP_W, MAP_H);
    paths += `<polygon points="${pts}" />\n`;
  }

  // Antarctica strip
  paths += `<rect x="0" y="${((90-(-70))/180*MAP_H).toFixed(0)}" width="${MAP_W}" height="22" />\n`;

  return `<g id="world-land" fill="var(--line-light)" stroke="var(--line)" stroke-width="0.6" stroke-linejoin="round">\n${paths}</g>`;
}

const WORLD_MAP_SVG_CONTENT = buildWorldSVG();
