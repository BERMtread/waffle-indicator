// =============================================================================
// AOI Data — All 55 Areas of Interest
// =============================================================================

export type AOICategory =
  | 'active_conflict'
  | 'nuclear'
  | 'maritime_chokepoint'
  | 'contested_border'
  | 'military_buildup'
  | 'launch_facility'
  | 'critical_infrastructure'
  | 'intelligence_cluster'
  | 'non_state_actor'
  | 'emerging_flashpoint';

export type PriorityTier = 1 | 2 | 3 | 4;

export interface AOIData {
  id: string;
  name: string;
  displayName: string;
  country: string;
  region: string;
  priority: PriorityTier;
  category: AOICategory;
  color: string;
  active: boolean;
  tags: string[];
  context: string;
  coverageQuality: 'excellent' | 'good' | 'marginal' | 'poor';
  boundary: [number, number][];
  centroid: { lat: number; lng: number };
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  maxExtent: number;
  hotspots?: { name: string; lat: number; lng: number; type: string }[];
}

// -----------------------------------------------------------------------------
// Utility: generate an approximate circular polygon
// -----------------------------------------------------------------------------
function circleToPolygon(
  lat: number,
  lng: number,
  radiusKm: number,
  n: number = 16,
): [number, number][] {
  const R = 6371;
  const points: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const bearing = (i / n) * 2 * Math.PI;
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const angularDist = radiusKm / R;
    const newLat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDist) +
        Math.cos(latRad) * Math.sin(angularDist) * Math.cos(bearing),
    );
    const newLng =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDist) * Math.cos(latRad),
        Math.cos(angularDist) - Math.sin(latRad) * Math.sin(newLat),
      );
    points.push([(newLat * 180) / Math.PI, (newLng * 180) / Math.PI]);
  }
  return points;
}

// -----------------------------------------------------------------------------
// Utility: compute bounding box from boundary
// -----------------------------------------------------------------------------
function computeBbox(boundary: [number, number][]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;
  for (const [lat, lng] of boundary) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return { minLat, maxLat, minLng, maxLng };
}

// -----------------------------------------------------------------------------
// Utility: compute max extent (km) from bounding box
// -----------------------------------------------------------------------------
function computeMaxExtent(bbox: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}): number {
  const latDiffKm = (bbox.maxLat - bbox.minLat) * 111.32;
  const midLat = ((bbox.maxLat + bbox.minLat) / 2) * (Math.PI / 180);
  const lngDiffKm = (bbox.maxLng - bbox.minLng) * 111.32 * Math.cos(midLat);
  return Math.max(latDiffKm, lngDiffKm);
}

// -----------------------------------------------------------------------------
// Utility: build an AOIData from a polygon (explicit boundary)
// -----------------------------------------------------------------------------
function buildAOI(
  partial: Omit<AOIData, 'bbox' | 'maxExtent'> & {
    bbox?: AOIData['bbox'];
    maxExtent?: number;
  },
): AOIData {
  const bbox = partial.bbox ?? computeBbox(partial.boundary);
  const maxExtent = partial.maxExtent ?? computeMaxExtent(bbox);
  return { ...partial, bbox, maxExtent } as AOIData;
}

// -----------------------------------------------------------------------------
// Utility: build an AOIData from a circle (generated boundary)
// -----------------------------------------------------------------------------
function buildCircleAOI(
  base: Omit<AOIData, 'boundary' | 'bbox' | 'maxExtent'>,
  radiusKm: number,
): AOIData {
  const boundary = circleToPolygon(base.centroid.lat, base.centroid.lng, radiusKm);
  const bbox = computeBbox(boundary);
  const maxExtent = computeMaxExtent(bbox);
  return { ...base, boundary, bbox, maxExtent } as AOIData;
}

// =============================================================================
// TIER 1 — with explicit polygon boundaries
// =============================================================================

const iran: AOIData = buildAOI({
  id: 'iran',
  name: 'IRAN',
  displayName: 'Iran (Central)',
  country: 'Iran',
  region: 'Middle East',
  priority: 1,
  category: 'active_conflict',
  color: '#FF0040',
  active: true,
  tags: ['nuclear', 'enrichment', 'JCPOA', 'ballistic_missile', 'IRGC'],
  context:
    'Primary nuclear proliferation concern. Enrichment facilities at Natanz and Fordow, reactor at Bushehr. Ballistic missile development and IRGC military infrastructure.',
  coverageQuality: 'excellent',
  centroid: { lat: 32.43, lng: 53.69 },
  boundary: [
    [39.78, 44.79],
    [39.40, 47.77],
    [38.85, 48.95],
    [38.43, 48.88],
    [37.60, 49.42],
    [37.12, 49.76],
    [36.65, 52.76],
    [36.90, 54.02],
    [37.47, 55.08],
    [37.33, 57.07],
    [35.82, 59.44],
    [34.42, 60.91],
    [33.69, 61.03],
    [31.38, 61.78],
    [29.87, 61.39],
    [27.20, 62.78],
    [25.26, 61.62],
    [25.66, 57.42],
    [26.35, 55.16],
    [27.18, 56.28],
    [27.75, 52.46],
    [29.31, 50.10],
    [30.00, 48.48],
    [31.60, 47.68],
    [35.14, 45.35],
  ],
  hotspots: [
    { name: 'Natanz Enrichment Facility', lat: 33.72, lng: 51.73, type: 'nuclear' },
    { name: 'Fordow (Qom)', lat: 34.88, lng: 51.59, type: 'nuclear' },
    { name: 'Isfahan Nuclear Complex', lat: 32.65, lng: 51.68, type: 'nuclear' },
    { name: 'Bushehr Nuclear Plant', lat: 28.83, lng: 50.89, type: 'nuclear' },
    { name: 'Parchin Military Complex', lat: 35.52, lng: 51.77, type: 'military' },
    { name: 'Imam Khomeini Space Center', lat: 35.23, lng: 53.92, type: 'launch' },
    { name: 'Bandar Abbas Naval Base', lat: 27.18, lng: 56.28, type: 'naval' },
    { name: 'Tehran (Government)', lat: 35.69, lng: 51.39, type: 'command' },
    { name: 'Kharg Island Oil Terminal', lat: 29.23, lng: 50.31, type: 'infrastructure' },
  ],
});

const ukraineEast: AOIData = buildAOI({
  id: 'ukraine-east',
  name: 'Eastern Ukraine Front',
  displayName: 'Eastern Ukraine',
  country: 'Ukraine',
  region: 'Europe',
  priority: 1,
  category: 'active_conflict',
  color: '#FF4400',
  active: true,
  tags: ['active_conflict', 'frontline', 'Donbas', 'Russia-Ukraine', 'artillery'],
  context:
    'Active frontline of Russia-Ukraine conflict. Encompasses Donetsk and Luhansk oblasts with continuous ground combat, artillery exchanges, and trench warfare.',
  coverageQuality: 'excellent',
  centroid: { lat: 48.5, lng: 37.8 },
  boundary: [
    [50.40, 35.50],
    [50.20, 40.20],
    [48.80, 40.20],
    [47.10, 38.60],
    [46.80, 37.00],
    [47.00, 35.80],
    [48.20, 35.00],
    [49.60, 35.20],
  ],
});

const ukraineSouth: AOIData = buildAOI({
  id: 'ukraine-south',
  name: 'Southern Ukraine / Crimea',
  displayName: 'Southern Ukraine',
  country: 'Ukraine',
  region: 'Europe',
  priority: 1,
  category: 'active_conflict',
  color: '#FF4400',
  active: true,
  tags: ['active_conflict', 'Crimea', 'Black_Sea', 'amphibious', 'Kherson'],
  context:
    'Southern theater including Crimea, Kherson front, and Black Sea naval operations. Critical for Black Sea Fleet basing, Crimean bridge, and grain corridor.',
  coverageQuality: 'excellent',
  centroid: { lat: 45.5, lng: 34.0 },
  boundary: [
    [47.00, 31.00],
    [47.20, 36.80],
    [46.60, 37.80],
    [45.40, 36.80],
    [44.40, 36.00],
    [44.20, 33.00],
    [44.80, 32.00],
    [45.50, 31.00],
    [46.20, 30.50],
  ],
});

const taiwanStrait: AOIData = buildAOI({
  id: 'taiwan-strait',
  name: 'Taiwan Strait',
  displayName: 'Taiwan Strait',
  country: 'Taiwan / China',
  region: 'East Asia',
  priority: 1,
  category: 'contested_border',
  color: '#FF6600',
  active: true,
  tags: ['Taiwan', 'PLA', 'maritime', 'air_defense', 'semiconductor'],
  context:
    'Critical flashpoint between PRC and Taiwan. Frequent PLA air and naval incursions into Taiwan ADIZ. Center of semiconductor supply chain risk.',
  coverageQuality: 'good',
  centroid: { lat: 24.0, lng: 120.5 },
  boundary: [
    [26.50, 118.50],
    [26.50, 122.50],
    [25.00, 123.00],
    [22.50, 121.50],
    [21.50, 121.00],
    [21.50, 118.00],
    [23.00, 117.50],
    [25.50, 118.00],
  ],
});

const gaza: AOIData = buildAOI({
  id: 'gaza',
  name: 'Gaza Strip',
  displayName: 'Gaza',
  country: 'Palestine / Israel',
  region: 'Middle East',
  priority: 1,
  category: 'active_conflict',
  color: '#FF0000',
  active: true,
  tags: ['active_conflict', 'urban_warfare', 'humanitarian', 'Hamas', 'IDF'],
  context:
    'Ongoing Israeli military operations in Gaza. Dense urban combat, humanitarian crisis, and intense international attention. Critical for regional escalation monitoring.',
  coverageQuality: 'excellent',
  centroid: { lat: 31.4, lng: 34.4 },
  boundary: [
    [31.60, 34.22],
    [31.60, 34.56],
    [31.40, 34.56],
    [31.22, 34.38],
    [31.22, 34.22],
    [31.40, 34.22],
  ],
});

const redSea: AOIData = buildAOI({
  id: 'red-sea',
  name: 'Red Sea / Bab el-Mandeb',
  displayName: 'Red Sea',
  country: 'Yemen / Djibouti / Eritrea',
  region: 'Middle East',
  priority: 1,
  category: 'maritime_chokepoint',
  color: '#FF8800',
  active: true,
  tags: ['Houthi', 'maritime_chokepoint', 'shipping', 'anti-ship_missile', 'USN'],
  context:
    'Houthi attacks on international shipping through Bab el-Mandeb strait and southern Red Sea. Disrupting global trade routes, prompting US/UK naval operations.',
  coverageQuality: 'good',
  centroid: { lat: 15.0, lng: 42.0 },
  boundary: [
    [19.50, 37.00],
    [19.00, 41.50],
    [16.00, 42.80],
    [12.50, 45.00],
    [11.50, 43.50],
    [12.00, 43.00],
    [12.80, 42.50],
    [13.50, 41.50],
    [15.50, 38.50],
    [17.50, 37.00],
  ],
});

const sudan: AOIData = buildAOI({
  id: 'sudan',
  name: 'Sudan Civil War',
  displayName: 'Sudan',
  country: 'Sudan',
  region: 'Africa',
  priority: 1,
  category: 'active_conflict',
  color: '#FF2200',
  active: true,
  tags: ['civil_war', 'RSF', 'SAF', 'humanitarian', 'Darfur', 'Khartoum'],
  context:
    'Civil war between Sudanese Armed Forces and Rapid Support Forces. Mass displacement, humanitarian catastrophe, and regional destabilization risk.',
  coverageQuality: 'marginal',
  centroid: { lat: 15.5, lng: 30.0 },
  boundary: [
    [22.00, 24.00],
    [22.00, 37.00],
    [18.50, 38.60],
    [17.80, 37.00],
    [15.60, 36.50],
    [12.50, 36.00],
    [10.00, 34.00],
    [9.50, 31.00],
    [10.00, 27.00],
    [14.50, 23.50],
    [19.50, 24.00],
  ],
});

const southChinaSea: AOIData = buildAOI({
  id: 'south-china-sea',
  name: 'South China Sea',
  displayName: 'South China Sea',
  country: 'China / Philippines / Vietnam / Malaysia',
  region: 'East Asia',
  priority: 1,
  category: 'contested_border',
  color: '#FF6600',
  active: true,
  tags: ['nine_dash_line', 'island_building', 'PLA_Navy', 'Spratly', 'Paracel', 'freedom_of_navigation'],
  context:
    'Contested waters with overlapping territorial claims. Chinese island militarization, frequent naval confrontations, and freedom-of-navigation operations.',
  coverageQuality: 'good',
  centroid: { lat: 12.0, lng: 114.0 },
  boundary: [
    [22.00, 110.00],
    [21.00, 117.00],
    [18.00, 118.50],
    [14.50, 121.00],
    [10.00, 119.00],
    [6.00, 116.00],
    [4.00, 112.00],
    [4.50, 108.00],
    [8.00, 106.00],
    [15.50, 108.00],
    [18.50, 108.50],
  ],
});

// =============================================================================
// TIER 1 — circle-based (sub-regions of Iran)
// =============================================================================

const iranBushehr: AOIData = buildCircleAOI(
  {
    id: 'iran-bushehr',
    name: 'Bushehr Nuclear Plant',
    displayName: 'Bushehr',
    country: 'Iran',
    region: 'Middle East',
    priority: 1,
    category: 'nuclear',
    color: '#FF0000',
    active: true,
    tags: ['nuclear', 'reactor', 'Bushehr', 'plutonium'],
    context:
      'Iran\'s only operational nuclear power plant. Russian-built VVER-1000 reactor. Monitored for spent fuel management and potential weapons-grade material diversion.',
    coverageQuality: 'excellent',
    centroid: { lat: 28.92, lng: 50.82 },
  },
  200,
);

const iranNatanz: AOIData = buildCircleAOI(
  {
    id: 'iran-natanz',
    name: 'Natanz Enrichment Facility',
    displayName: 'Natanz',
    country: 'Iran',
    region: 'Middle East',
    priority: 1,
    category: 'nuclear',
    color: '#FF0000',
    active: true,
    tags: ['nuclear', 'enrichment', 'centrifuge', 'underground'],
    context:
      'Primary uranium enrichment facility. Underground halls with advanced centrifuge cascades. Key indicator site for breakout timeline assessment.',
    coverageQuality: 'excellent',
    centroid: { lat: 33.72, lng: 51.73 },
  },
  100,
);

const iranFordow: AOIData = buildCircleAOI(
  {
    id: 'iran-fordow',
    name: 'Fordow Enrichment Facility',
    displayName: 'Fordow',
    country: 'Iran',
    region: 'Middle East',
    priority: 1,
    category: 'nuclear',
    color: '#FF0000',
    active: true,
    tags: ['nuclear', 'enrichment', 'underground', 'hardened'],
    context:
      'Deep underground enrichment facility near Qom. Hardened against aerial attack. Enriching to 60% U-235 levels, approaching weapons-grade threshold.',
    coverageQuality: 'excellent',
    centroid: { lat: 34.88, lng: 51.59 },
  },
  50,
);

// =============================================================================
// TIER 2 — with explicit polygon boundaries
// =============================================================================

const northKorea: AOIData = buildAOI({
  id: 'north-korea',
  name: 'North Korea Nuclear/Missile Complex',
  displayName: 'North Korea',
  country: 'North Korea',
  region: 'East Asia',
  priority: 2,
  category: 'nuclear',
  color: '#DD0000',
  active: true,
  tags: ['nuclear', 'ICBM', 'Kim_regime', 'Yongbyon', 'sanctions'],
  context:
    'Nuclear weapons state with advancing ICBM capability. Yongbyon nuclear complex, multiple launch sites, and underground facilities. Active missile testing program.',
  coverageQuality: 'good',
  centroid: { lat: 40.0, lng: 127.0 },
  boundary: [
    [43.00, 124.20],
    [42.40, 130.70],
    [41.50, 131.00],
    [39.80, 128.40],
    [38.30, 128.30],
    [38.00, 126.00],
    [38.50, 124.40],
    [40.00, 124.00],
  ],
  hotspots: [
    { name: 'Yongbyon Nuclear Complex', lat: 39.80, lng: 125.75, type: 'nuclear' },
    { name: 'Punggye-ri Test Site', lat: 41.28, lng: 129.08, type: 'nuclear' },
    { name: 'Sohae Launch Facility', lat: 39.66, lng: 124.71, type: 'launch' },
    { name: 'Tongchang-ri', lat: 39.66, lng: 124.70, type: 'launch' },
    { name: 'Pyongyang (Government)', lat: 39.02, lng: 125.75, type: 'command' },
    { name: 'Sinpo Submarine Base', lat: 40.02, lng: 128.17, type: 'naval' },
  ],
});

const hormuz: AOIData = buildAOI({
  id: 'hormuz',
  name: 'Strait of Hormuz',
  displayName: 'Strait of Hormuz',
  country: 'Iran / Oman / UAE',
  region: 'Middle East',
  priority: 2,
  category: 'maritime_chokepoint',
  color: '#FF8800',
  active: true,
  tags: ['chokepoint', 'oil_transit', 'IRGCN', 'tanker', 'Persian_Gulf'],
  context:
    'World\'s most critical oil chokepoint. ~21% of global petroleum passes through. IRGC Navy fast-attack craft and mine-laying capability threaten passage.',
  coverageQuality: 'good',
  centroid: { lat: 26.5, lng: 56.3 },
  boundary: [
    [27.20, 55.00],
    [27.20, 57.50],
    [26.40, 57.50],
    [25.50, 57.00],
    [25.00, 56.50],
    [25.30, 55.00],
    [26.00, 54.50],
    [26.80, 54.80],
  ],
  hotspots: [
    { name: 'Bandar Abbas', lat: 27.18, lng: 56.28, type: 'naval' },
    { name: 'Qeshm Island', lat: 26.85, lng: 56.00, type: 'military' },
    { name: 'Abu Musa Island', lat: 25.87, lng: 55.03, type: 'military' },
    { name: 'Jask Naval Base', lat: 25.65, lng: 57.77, type: 'naval' },
  ],
});

const chinaFujian: AOIData = buildAOI({
  id: 'china-fujian',
  name: 'China Fujian Coast (Taiwan Staging)',
  displayName: 'Fujian Coast',
  country: 'China',
  region: 'East Asia',
  priority: 2,
  category: 'military_buildup',
  color: '#DD4400',
  active: true,
  tags: ['PLA', 'amphibious', 'rocket_force', 'staging_area', 'Taiwan_contingency'],
  context:
    'PLA Eastern Theater Command staging areas opposite Taiwan. Amphibious assault ship concentrations, rocket force brigades, and air bases monitored for invasion indicators.',
  coverageQuality: 'good',
  centroid: { lat: 25.0, lng: 119.0 },
  boundary: [
    [27.50, 117.50],
    [27.50, 120.50],
    [26.00, 120.50],
    [24.00, 119.50],
    [23.00, 118.50],
    [23.00, 117.00],
    [24.50, 117.00],
    [26.50, 117.50],
  ],
  hotspots: [
    { name: 'Fuzhou Air Base', lat: 26.00, lng: 119.31, type: 'airbase' },
    { name: 'Xiamen Naval District', lat: 24.48, lng: 118.09, type: 'naval' },
    { name: 'Longtian Air Base', lat: 25.67, lng: 119.64, type: 'airbase' },
    { name: 'Huian Rocket Force', lat: 25.12, lng: 118.63, type: 'military' },
  ],
});

const pakistanNuclear: AOIData = buildAOI({
  id: 'pakistan-nuclear',
  name: 'Pakistan Nuclear Complex',
  displayName: 'Pakistan Nuclear',
  country: 'Pakistan',
  region: 'South Asia',
  priority: 2,
  category: 'nuclear',
  color: '#DD0000',
  active: true,
  tags: ['nuclear', 'Kahuta', 'plutonium', 'ballistic_missile', 'instability'],
  context:
    'Nuclear weapons state with growing arsenal. Enrichment at Kahuta, plutonium at Khushab. Tactical nuclear weapons development raises escalation concerns.',
  coverageQuality: 'marginal',
  centroid: { lat: 33.0, lng: 72.0 },
  boundary: [
    [36.90, 71.00],
    [36.50, 75.50],
    [34.00, 77.00],
    [30.50, 73.00],
    [29.00, 71.00],
    [30.00, 67.50],
    [31.50, 66.00],
    [34.50, 69.00],
  ],
  hotspots: [
    { name: 'Kahuta Enrichment', lat: 33.59, lng: 73.39, type: 'nuclear' },
    { name: 'Khushab Plutonium Reactors', lat: 32.02, lng: 72.22, type: 'nuclear' },
    { name: 'Kamra Air Base', lat: 33.87, lng: 72.40, type: 'airbase' },
    { name: 'Islamabad (Government)', lat: 33.69, lng: 73.04, type: 'command' },
  ],
});

const suez: AOIData = buildAOI({
  id: 'suez',
  name: 'Suez Canal',
  displayName: 'Suez Canal',
  country: 'Egypt',
  region: 'Middle East',
  priority: 2,
  category: 'maritime_chokepoint',
  color: '#FF8800',
  active: true,
  tags: ['chokepoint', 'canal', 'global_trade', 'container_shipping', 'Egypt'],
  context:
    'Critical waterway connecting Mediterranean and Red Sea. ~12% of global trade. Vulnerable to disruption from Red Sea conflict spillover.',
  coverageQuality: 'good',
  centroid: { lat: 30.5, lng: 32.3 },
  boundary: [
    [31.30, 31.80],
    [31.30, 33.00],
    [30.80, 33.00],
    [29.90, 32.80],
    [29.80, 32.50],
    [30.00, 31.80],
    [30.50, 31.50],
  ],
  hotspots: [
    { name: 'Port Said (North Entrance)', lat: 31.26, lng: 32.31, type: 'infrastructure' },
    { name: 'Suez (South Entrance)', lat: 29.97, lng: 32.55, type: 'infrastructure' },
    { name: 'Ismailia', lat: 30.60, lng: 32.27, type: 'infrastructure' },
  ],
});

const malacca: AOIData = buildAOI({
  id: 'malacca',
  name: 'Strait of Malacca',
  displayName: 'Strait of Malacca',
  country: 'Malaysia / Indonesia / Singapore',
  region: 'Southeast Asia',
  priority: 2,
  category: 'maritime_chokepoint',
  color: '#FF8800',
  active: true,
  tags: ['chokepoint', 'shipping', 'piracy', 'LNG', 'container', 'Singapore'],
  context:
    'Busiest shipping lane in the world. ~25% of global trade passes through. Critical for energy shipments to East Asia. Piracy and sovereignty concerns.',
  coverageQuality: 'good',
  centroid: { lat: 3.0, lng: 101.0 },
  boundary: [
    [6.50, 97.00],
    [5.50, 100.00],
    [4.00, 103.50],
    [1.20, 104.00],
    [1.00, 103.50],
    [2.00, 101.00],
    [4.50, 97.50],
    [5.80, 95.50],
  ],
  hotspots: [
    { name: 'Singapore Strait', lat: 1.25, lng: 103.80, type: 'infrastructure' },
    { name: 'Port Klang', lat: 3.00, lng: 101.39, type: 'infrastructure' },
    { name: 'Penang', lat: 5.41, lng: 100.33, type: 'infrastructure' },
  ],
});

const hainan: AOIData = buildAOI({
  id: 'hainan',
  name: 'Hainan Island / Yulin Naval Base',
  displayName: 'Hainan',
  country: 'China',
  region: 'East Asia',
  priority: 2,
  category: 'military_buildup',
  color: '#DD4400',
  active: true,
  tags: ['PLAN', 'submarine', 'Yulin', 'SSBN', 'South_China_Sea', 'signals_intelligence'],
  context:
    'Major PLA Navy base complex. Underground submarine pens at Yulin for SSBN fleet. SIGINT facilities and air base supporting South China Sea operations.',
  coverageQuality: 'good',
  centroid: { lat: 18.2, lng: 109.5 },
  boundary: [
    [20.00, 108.60],
    [19.90, 111.00],
    [18.80, 111.10],
    [18.10, 110.50],
    [18.00, 109.50],
    [18.20, 108.60],
    [18.80, 108.50],
    [19.50, 108.40],
  ],
  hotspots: [
    { name: 'Yulin Naval Base', lat: 18.23, lng: 109.55, type: 'naval' },
    { name: 'Sanya Underground Sub Pens', lat: 18.22, lng: 109.52, type: 'naval' },
    { name: 'Lingshui Air Base', lat: 18.51, lng: 110.03, type: 'airbase' },
  ],
});

const syria: AOIData = buildAOI({
  id: 'syria',
  name: 'Syria (Russian/Iranian Presence)',
  displayName: 'Syria',
  country: 'Syria',
  region: 'Middle East',
  priority: 2,
  category: 'active_conflict',
  color: '#DD2200',
  active: true,
  tags: ['Russian_base', 'Iranian_proxy', 'Hezbollah', 'Tartus', 'Hmeimim', 'SDF'],
  context:
    'Multi-party conflict zone with Russian (Hmeimim, Tartus) and Iranian military presence. Proxy forces, Israeli strikes on Iranian targets, and Kurdish autonomy zone.',
  coverageQuality: 'good',
  centroid: { lat: 35.0, lng: 38.5 },
  boundary: [
    [37.20, 35.80],
    [37.30, 42.40],
    [35.80, 42.40],
    [34.60, 41.00],
    [33.00, 36.30],
    [32.70, 35.90],
    [33.80, 35.60],
    [35.80, 35.60],
  ],
  hotspots: [
    { name: 'Hmeimim Air Base (Russia)', lat: 35.41, lng: 35.95, type: 'airbase' },
    { name: 'Tartus Naval Facility (Russia)', lat: 34.89, lng: 35.87, type: 'naval' },
    { name: 'Damascus', lat: 33.51, lng: 36.29, type: 'command' },
    { name: 'Deir ez-Zor (US presence)', lat: 35.34, lng: 40.14, type: 'military' },
  ],
});

const kaliningrad: AOIData = buildAOI({
  id: 'kaliningrad',
  name: 'Kaliningrad Exclave',
  displayName: 'Kaliningrad',
  country: 'Russia',
  region: 'Europe',
  priority: 2,
  category: 'military_buildup',
  color: '#DD4400',
  active: true,
  tags: ['A2AD', 'Iskander', 'Baltic_Fleet', 'nuclear_capable', 'NATO_flank'],
  context:
    'Russian exclave between NATO members. Heavy A2/AD capability with Iskander missiles, S-400 systems, and Baltic Fleet headquarters. Nuclear-capable forces.',
  coverageQuality: 'good',
  centroid: { lat: 54.7, lng: 20.5 },
  boundary: [
    [55.30, 19.60],
    [55.30, 22.10],
    [54.90, 22.80],
    [54.35, 22.80],
    [54.30, 19.90],
    [54.50, 19.60],
    [54.90, 19.50],
  ],
  hotspots: [
    { name: 'Kaliningrad (Baltiysk Naval Base)', lat: 54.65, lng: 19.89, type: 'naval' },
    { name: 'Chernyakhovsk Air Base', lat: 54.60, lng: 21.80, type: 'airbase' },
    { name: 'Iskander Battery Sites', lat: 54.70, lng: 20.50, type: 'military' },
  ],
});

// =============================================================================
// TIER 2 — circle-based
// =============================================================================

const koreaDmz: AOIData = buildCircleAOI(
  {
    id: 'korea-dmz',
    name: 'Korean DMZ',
    displayName: 'Korean DMZ',
    country: 'South Korea / North Korea',
    region: 'East Asia',
    priority: 2,
    category: 'contested_border',
    color: '#DD6600',
    active: true,
    tags: ['DMZ', 'artillery', 'fortification', 'USFK', 'forward_deployed'],
    context:
      'Most heavily fortified border in the world. Massive forward-deployed artillery on both sides. US Forces Korea and combined deterrence posture.',
    coverageQuality: 'good',
    centroid: { lat: 38.0, lng: 127.0 },
    hotspots: [
      { name: 'Panmunjom / JSA', lat: 37.96, lng: 126.68, type: 'military' },
      { name: 'Camp Humphreys (USFK)', lat: 36.96, lng: 127.03, type: 'military' },
    ],
  },
  200,
);

const indiaNuclear: AOIData = buildCircleAOI(
  {
    id: 'india-nuclear',
    name: 'India Nuclear Complex',
    displayName: 'India Nuclear',
    country: 'India',
    region: 'South Asia',
    priority: 2,
    category: 'nuclear',
    color: '#DD0000',
    active: true,
    tags: ['nuclear', 'DRDO', 'Bhabha', 'SSBN', 'ballistic_missile'],
    context:
      'Expanding nuclear arsenal and delivery capabilities. SSBN program, MIRV development, and growing fissile material production capacity.',
    coverageQuality: 'marginal',
    centroid: { lat: 21.0, lng: 79.0 },
    hotspots: [
      { name: 'Bhabha Atomic Research Centre', lat: 19.01, lng: 72.92, type: 'nuclear' },
      { name: 'Visakhapatnam SSBN Base', lat: 17.72, lng: 83.30, type: 'naval' },
      { name: 'Wheeler Island (APJ Abdul Kalam)', lat: 20.75, lng: 87.10, type: 'launch' },
    ],
  },
  500,
);

const turkishStraits: AOIData = buildCircleAOI(
  {
    id: 'turkish-straits',
    name: 'Turkish Straits (Bosphorus/Dardanelles)',
    displayName: 'Turkish Straits',
    country: 'Turkey',
    region: 'Europe',
    priority: 2,
    category: 'maritime_chokepoint',
    color: '#DD8800',
    active: true,
    tags: ['Bosphorus', 'Dardanelles', 'Montreux', 'Black_Sea_access', 'NATO'],
    context:
      'Critical straits controlling Black Sea access. Montreux Convention governs warship transit. Key to Russian naval force projection and Ukrainian grain exports.',
    coverageQuality: 'good',
    centroid: { lat: 41.1, lng: 29.05 },
    hotspots: [
      { name: 'Bosphorus Strait', lat: 41.12, lng: 29.05, type: 'infrastructure' },
      { name: 'Dardanelles Strait', lat: 40.20, lng: 26.40, type: 'infrastructure' },
    ],
  },
  100,
);

const giukGap: AOIData = buildCircleAOI(
  {
    id: 'giuk-gap',
    name: 'GIUK Gap',
    displayName: 'GIUK Gap',
    country: 'Iceland / UK / Norway',
    region: 'Europe',
    priority: 2,
    category: 'maritime_chokepoint',
    color: '#DD8800',
    active: true,
    tags: ['submarine', 'ASW', 'NATO', 'SOSUS', 'North_Atlantic'],
    context:
      'Greenland-Iceland-UK gap. Critical anti-submarine warfare chokepoint. Russian submarine transit route to North Atlantic. Revived Cold War-era monitoring.',
    coverageQuality: 'marginal',
    centroid: { lat: 63.0, lng: -15.0 },
    hotspots: [
      { name: 'Keflavik (Iceland)', lat: 64.0, lng: -22.57, type: 'military' },
      { name: 'Faslane (UK SSBN)', lat: 56.07, lng: -4.82, type: 'naval' },
    ],
  },
  600,
);

const russiaCrimea: AOIData = buildCircleAOI(
  {
    id: 'russia-crimea',
    name: 'Crimea (Russian-occupied)',
    displayName: 'Crimea',
    country: 'Ukraine (Russian-occupied)',
    region: 'Europe',
    priority: 2,
    category: 'military_buildup',
    color: '#DD4400',
    active: true,
    tags: ['Black_Sea_Fleet', 'Sevastopol', 'Crimean_Bridge', 'S-400', 'occupied'],
    context:
      'Russian-occupied peninsula. Black Sea Fleet HQ at Sevastopol (heavily degraded). Crimean Bridge logistics. Active Ukrainian drone and missile strikes.',
    coverageQuality: 'excellent',
    centroid: { lat: 44.95, lng: 34.1 },
    hotspots: [
      { name: 'Sevastopol Naval Base', lat: 44.62, lng: 33.53, type: 'naval' },
      { name: 'Crimean Bridge', lat: 45.31, lng: 36.51, type: 'infrastructure' },
      { name: 'Saky Air Base', lat: 45.09, lng: 33.60, type: 'airbase' },
    ],
  },
  200,
);

// =============================================================================
// TIER 3 — all circle-based
// =============================================================================

const indiaChinaLac: AOIData = buildCircleAOI(
  {
    id: 'india-china-lac',
    name: 'India-China Line of Actual Control',
    displayName: 'India-China LAC',
    country: 'India / China',
    region: 'South Asia',
    priority: 3,
    category: 'contested_border',
    color: '#CC6600',
    active: true,
    tags: ['LAC', 'Ladakh', 'Aksai_Chin', 'Galwan', 'PLA', 'infrastructure_buildup'],
    context:
      'Disputed Himalayan border with periodic standoffs. Both sides building roads, airfields, and forward positions. Galwan clash (2020) elevated tensions.',
    coverageQuality: 'marginal',
    centroid: { lat: 34.5, lng: 78.0 },
  },
  300,
);

const senkakuIslands: AOIData = buildCircleAOI(
  {
    id: 'senkaku-islands',
    name: 'Senkaku/Diaoyu Islands',
    displayName: 'Senkaku Islands',
    country: 'Japan / China',
    region: 'East Asia',
    priority: 3,
    category: 'contested_border',
    color: '#CC6600',
    active: true,
    tags: ['Senkaku', 'Diaoyu', 'coast_guard', 'EEZ', 'Japan-China'],
    context:
      'Disputed islands administered by Japan, claimed by China. Frequent Chinese coast guard incursions. Potential Article 5 trigger for US-Japan alliance.',
    coverageQuality: 'good',
    centroid: { lat: 25.75, lng: 123.47 },
  },
  200,
);

const philippinesScs: AOIData = buildCircleAOI(
  {
    id: 'philippines-scs',
    name: 'Philippines SCS (Second Thomas Shoal)',
    displayName: 'Philippines SCS',
    country: 'Philippines / China',
    region: 'Southeast Asia',
    priority: 3,
    category: 'contested_border',
    color: '#CC6600',
    active: true,
    tags: ['Second_Thomas_Shoal', 'BRP_Sierra_Madre', 'coast_guard', 'resupply'],
    context:
      'Flashpoint around Second Thomas Shoal. Chinese coast guard blocking Philippine resupply to BRP Sierra Madre. Escalation risk with US mutual defense treaty.',
    coverageQuality: 'good',
    centroid: { lat: 9.75, lng: 115.87 },
  },
  100,
);

const myanmar: AOIData = buildCircleAOI(
  {
    id: 'myanmar',
    name: 'Myanmar Civil War',
    displayName: 'Myanmar',
    country: 'Myanmar',
    region: 'Southeast Asia',
    priority: 3,
    category: 'active_conflict',
    color: '#CC2200',
    active: true,
    tags: ['civil_war', 'junta', 'resistance', 'ethnic_armed', 'Rohingya'],
    context:
      'Post-coup civil war with military junta facing widespread resistance. Ethnic armed organizations controlling border regions. Humanitarian crisis.',
    coverageQuality: 'poor',
    centroid: { lat: 20.0, lng: 96.0 },
  },
  500,
);

const iraq: AOIData = buildCircleAOI(
  {
    id: 'iraq',
    name: 'Iraq (Iran-backed Militias)',
    displayName: 'Iraq',
    country: 'Iraq',
    region: 'Middle East',
    priority: 3,
    category: 'active_conflict',
    color: '#CC2200',
    active: true,
    tags: ['PMF', 'Iran_proxy', 'US_bases', 'drone_attacks', 'Baghdad'],
    context:
      'Iran-backed Popular Mobilization Forces targeting US military installations. Drone and rocket attacks on bases. Political instability and sectarian tensions.',
    coverageQuality: 'good',
    centroid: { lat: 33.3, lng: 44.0 },
  },
  400,
);

const lebanonIsrael: AOIData = buildCircleAOI(
  {
    id: 'lebanon-israel',
    name: 'Lebanon-Israel Border (Hezbollah)',
    displayName: 'Lebanon-Israel',
    country: 'Lebanon / Israel',
    region: 'Middle East',
    priority: 3,
    category: 'contested_border',
    color: '#CC6600',
    active: true,
    tags: ['Hezbollah', 'Blue_Line', 'UNIFIL', 'rocket', 'cross-border'],
    context:
      'Tense border with Hezbollah military infrastructure in southern Lebanon. Cross-border exchanges escalated following Gaza conflict. UNIFIL presence.',
    coverageQuality: 'good',
    centroid: { lat: 33.3, lng: 35.5 },
  },
  150,
);

const libya: AOIData = buildCircleAOI(
  {
    id: 'libya',
    name: 'Libya (Divided State)',
    displayName: 'Libya',
    country: 'Libya',
    region: 'Africa',
    priority: 3,
    category: 'active_conflict',
    color: '#CC2200',
    active: true,
    tags: ['divided_government', 'Wagner', 'Turkey', 'oil', 'migration'],
    context:
      'Divided between Tripoli-based GNU and eastern LNA. Foreign military presence (Turkey, Russia/Wagner). Oil infrastructure as leverage. Migration corridor.',
    coverageQuality: 'poor',
    centroid: { lat: 31.0, lng: 17.0 },
  },
  500,
);

const ethiopiaEritrea: AOIData = buildCircleAOI(
  {
    id: 'ethiopia-eritrea',
    name: 'Ethiopia/Eritrea (Horn of Africa)',
    displayName: 'Ethiopia-Eritrea',
    country: 'Ethiopia / Eritrea',
    region: 'Africa',
    priority: 3,
    category: 'active_conflict',
    color: '#CC2200',
    active: true,
    tags: ['Tigray', 'Amhara', 'Oromia', 'humanitarian', 'Red_Sea_access'],
    context:
      'Post-Tigray war instability. Amhara and Oromia insurgencies. Eritrean military involvement. Ethiopia seeking Red Sea access through Somaliland deal.',
    coverageQuality: 'poor',
    centroid: { lat: 9.0, lng: 42.0 },
  },
  600,
);

const sahel: AOIData = buildCircleAOI(
  {
    id: 'sahel',
    name: 'Sahel Region (Mali/Burkina Faso/Niger)',
    displayName: 'Sahel',
    country: 'Mali / Burkina Faso / Niger',
    region: 'Africa',
    priority: 3,
    category: 'active_conflict',
    color: '#CC2200',
    active: true,
    tags: ['jihadist', 'Wagner', 'coup', 'JNIM', 'ISGS', 'France_withdrawal'],
    context:
      'Multiple jihadist insurgencies across Sahel belt. Military juntas allied with Russia (Wagner). French/Western forces withdrawn. Expanding instability.',
    coverageQuality: 'poor',
    centroid: { lat: 15.0, lng: 0.0 },
  },
  800,
);

const drcEast: AOIData = buildCircleAOI(
  {
    id: 'drc-east',
    name: 'Eastern DRC (M23/ADF)',
    displayName: 'Eastern DRC',
    country: 'DRC',
    region: 'Africa',
    priority: 3,
    category: 'active_conflict',
    color: '#CC2200',
    active: true,
    tags: ['M23', 'ADF', 'Rwanda', 'minerals', 'MONUSCO', 'Goma'],
    context:
      'M23 rebellion backed by Rwanda seizing territory in eastern DRC. ADF (ISIS-linked) attacks. Critical mineral supply chains disrupted. MONUSCO withdrawal.',
    coverageQuality: 'poor',
    centroid: { lat: -1.5, lng: 29.0 },
  },
  300,
);

const chinaXichang: AOIData = buildCircleAOI(
  {
    id: 'china-xichang',
    name: 'Xichang Satellite Launch Center',
    displayName: 'Xichang',
    country: 'China',
    region: 'East Asia',
    priority: 3,
    category: 'launch_facility',
    color: '#CC8800',
    active: true,
    tags: ['space_launch', 'Beidou', 'GEO', 'Sichuan'],
    context:
      'Major Chinese launch site in Sichuan province. Primarily GEO missions, Beidou navigation constellation. Monitored for dual-use launch vehicle development.',
    coverageQuality: 'good',
    centroid: { lat: 28.25, lng: 102.03 },
  },
  50,
);

const chinaJiuquan: AOIData = buildCircleAOI(
  {
    id: 'china-jiuquan',
    name: 'Jiuquan Satellite Launch Center',
    displayName: 'Jiuquan',
    country: 'China',
    region: 'East Asia',
    priority: 3,
    category: 'launch_facility',
    color: '#CC8800',
    active: true,
    tags: ['space_launch', 'crewed_spaceflight', 'Gobi', 'LEO'],
    context:
      'China\'s oldest launch site in Gobi Desert. Primary crewed spaceflight launch site. Shenzhou missions and Tiangong station logistics.',
    coverageQuality: 'good',
    centroid: { lat: 40.96, lng: 100.29 },
  },
  50,
);

const nkSohae: AOIData = buildCircleAOI(
  {
    id: 'nk-sohae',
    name: 'Sohae Satellite Launching Station',
    displayName: 'Sohae',
    country: 'North Korea',
    region: 'East Asia',
    priority: 3,
    category: 'launch_facility',
    color: '#CC8800',
    active: true,
    tags: ['space_launch', 'ICBM', 'Tongchang-ri', 'satellite'],
    context:
      'North Korea\'s primary satellite launch facility (Tongchang-ri). Also used for long-range ballistic missile engine testing. Key breakout indicator.',
    coverageQuality: 'good',
    centroid: { lat: 39.66, lng: 124.71 },
  },
  30,
);

const iranSemnan: AOIData = buildCircleAOI(
  {
    id: 'iran-semnan',
    name: 'Imam Khomeini Space Center (Semnan)',
    displayName: 'Iran Semnan',
    country: 'Iran',
    region: 'Middle East',
    priority: 3,
    category: 'launch_facility',
    color: '#CC8800',
    active: true,
    tags: ['space_launch', 'SLV', 'ICBM_technology', 'Semnan'],
    context:
      'Iran\'s primary space launch facility. Simorgh and Qased launch vehicles. Dual-use concern for ICBM technology development.',
    coverageQuality: 'good',
    centroid: { lat: 35.23, lng: 53.92 },
  },
  50,
);

const diegoGarcia: AOIData = buildCircleAOI(
  {
    id: 'diego-garcia',
    name: 'Diego Garcia',
    displayName: 'Diego Garcia',
    country: 'UK / US',
    region: 'Indian Ocean',
    priority: 3,
    category: 'intelligence_cluster',
    color: '#CC4488',
    active: true,
    tags: ['BIOT', 'bomber_base', 'SIGINT', 'Indian_Ocean', 'logistics'],
    context:
      'Joint US-UK military facility. Strategic bomber base, SIGINT station, and Indian Ocean logistics hub. Sovereignty dispute with Mauritius.',
    coverageQuality: 'good',
    centroid: { lat: -7.32, lng: 72.42 },
  },
  100,
);

const guam: AOIData = buildCircleAOI(
  {
    id: 'guam',
    name: 'Guam (US Pacific Hub)',
    displayName: 'Guam',
    country: 'US',
    region: 'Pacific',
    priority: 3,
    category: 'military_buildup',
    color: '#CC4400',
    active: true,
    tags: ['Andersen_AFB', 'Naval_Base_Guam', 'THAAD', 'Pacific_hub', 'INDOPACOM'],
    context:
      'Key US military hub in Western Pacific. Andersen AFB, Naval Base Guam. THAAD deployment. Targeted by Chinese DF-26 "Guam killer" missiles.',
    coverageQuality: 'good',
    centroid: { lat: 13.44, lng: 144.8 },
  },
  100,
);

const djibouti: AOIData = buildCircleAOI(
  {
    id: 'djibouti',
    name: 'Djibouti (Multi-Nation Base Complex)',
    displayName: 'Djibouti',
    country: 'Djibouti',
    region: 'Africa',
    priority: 3,
    category: 'intelligence_cluster',
    color: '#CC4488',
    active: true,
    tags: ['Camp_Lemonnier', 'PLA_base', 'multi-nation', 'Horn_of_Africa', 'Bab_el_Mandeb'],
    context:
      'Hosts military bases from US (Camp Lemonnier), China (PLA Support Base), France, Japan, and Italy. Critical for Red Sea/Horn of Africa operations.',
    coverageQuality: 'good',
    centroid: { lat: 11.55, lng: 43.15 },
  },
  50,
);

// =============================================================================
// TIER 4 — all circle-based
// =============================================================================

const venezuela: AOIData = buildCircleAOI(
  {
    id: 'venezuela',
    name: 'Venezuela',
    displayName: 'Venezuela',
    country: 'Venezuela',
    region: 'South America',
    priority: 4,
    category: 'emerging_flashpoint',
    color: '#888800',
    active: true,
    tags: ['Maduro', 'oil', 'sanctions', 'migration', 'Russia_China_ties'],
    context:
      'Authoritarian regime with contested elections. Massive refugee outflow. Russian and Chinese military cooperation. Oil sanctions leverage.',
    coverageQuality: 'poor',
    centroid: { lat: 8.0, lng: -66.0 },
  },
  500,
);

const guyanaEssequibo: AOIData = buildCircleAOI(
  {
    id: 'guyana-essequibo',
    name: 'Guyana-Venezuela Essequibo Dispute',
    displayName: 'Essequibo',
    country: 'Guyana / Venezuela',
    region: 'South America',
    priority: 4,
    category: 'contested_border',
    color: '#886600',
    active: true,
    tags: ['Essequibo', 'oil', 'territorial_claim', 'ICJ', 'ExxonMobil'],
    context:
      'Venezuelan claim to Guyana\'s Essequibo region (2/3 of Guyana). Driven by offshore oil discoveries. ICJ proceedings. Military posturing risk.',
    coverageQuality: 'poor',
    centroid: { lat: 5.5, lng: -59.0 },
  },
  300,
);

const arcticSvalbard: AOIData = buildCircleAOI(
  {
    id: 'arctic-svalbard',
    name: 'Arctic / Svalbard',
    displayName: 'Svalbard',
    country: 'Norway / International',
    region: 'Arctic',
    priority: 4,
    category: 'emerging_flashpoint',
    color: '#888800',
    active: true,
    tags: ['Arctic', 'Svalbard', 'Northern_Sea_Route', 'subsea_cables', 'Russia_NATO'],
    context:
      'Increasing Arctic militarization. Svalbard Treaty tensions. Subsea cable/pipeline vulnerability. Northern Sea Route competition.',
    coverageQuality: 'poor',
    centroid: { lat: 78.0, lng: 16.0 },
  },
  500,
);

const balticSea: AOIData = buildCircleAOI(
  {
    id: 'baltic-sea',
    name: 'Baltic Sea Infrastructure',
    displayName: 'Baltic Sea',
    country: 'NATO / Russia',
    region: 'Europe',
    priority: 4,
    category: 'critical_infrastructure',
    color: '#888844',
    active: true,
    tags: ['subsea_cables', 'Nord_Stream', 'NATO_lake', 'sabotage', 'hybrid_warfare'],
    context:
      'Critical subsea infrastructure corridor. Nord Stream sabotage precedent. Cable cuts suspected as hybrid warfare. NATO maritime security challenge.',
    coverageQuality: 'marginal',
    centroid: { lat: 55.5, lng: 18.0 },
  },
  400,
);

const kashmir: AOIData = buildCircleAOI(
  {
    id: 'kashmir',
    name: 'Kashmir',
    displayName: 'Kashmir',
    country: 'India / Pakistan',
    region: 'South Asia',
    priority: 4,
    category: 'contested_border',
    color: '#886600',
    active: true,
    tags: ['LoC', 'insurgency', 'nuclear_threshold', 'Article_370', 'ceasefire'],
    context:
      'Disputed territory between nuclear-armed India and Pakistan. Line of Control ceasefire (2021) holding but fragile. Insurgency continues in Indian-administered Kashmir.',
    coverageQuality: 'marginal',
    centroid: { lat: 34.0, lng: 75.5 },
  },
  200,
);

const southAtlantic: AOIData = buildCircleAOI(
  {
    id: 'south-atlantic',
    name: 'South Atlantic / Falklands',
    displayName: 'Falklands',
    country: 'UK / Argentina',
    region: 'South America',
    priority: 4,
    category: 'contested_border',
    color: '#886600',
    active: false,
    tags: ['Falklands', 'Malvinas', 'sovereignty', 'South_Atlantic', 'oil_exploration'],
    context:
      'Ongoing sovereignty dispute between UK and Argentina. Low current tension but periodic diplomatic flare-ups. Oil exploration potential.',
    coverageQuality: 'poor',
    centroid: { lat: -51.75, lng: -59.0 },
  },
  300,
);

const panamaCanal: AOIData = buildCircleAOI(
  {
    id: 'panama-canal',
    name: 'Panama Canal',
    displayName: 'Panama Canal',
    country: 'Panama',
    region: 'Central America',
    priority: 4,
    category: 'maritime_chokepoint',
    color: '#888800',
    active: true,
    tags: ['canal', 'drought', 'trade_route', 'container_shipping', 'water_levels'],
    context:
      'Critical interoceanic waterway. Drought-reduced transit capacity causing global shipping disruption. Chinese-operated ports at both ends.',
    coverageQuality: 'marginal',
    centroid: { lat: 9.08, lng: -79.68 },
  },
  100,
);

const capeGoodHope: AOIData = buildCircleAOI(
  {
    id: 'cape-good-hope',
    name: 'Cape of Good Hope',
    displayName: 'Cape of Good Hope',
    country: 'South Africa',
    region: 'Africa',
    priority: 4,
    category: 'maritime_chokepoint',
    color: '#888800',
    active: true,
    tags: ['shipping_route', 'Red_Sea_diversion', 'oil_tanker', 'sanctions_evasion'],
    context:
      'Alternative route to Suez/Red Sea. Increased traffic due to Houthi attacks on Red Sea shipping. Longer transit times impacting global supply chains.',
    coverageQuality: 'poor',
    centroid: { lat: -34.35, lng: 18.47 },
  },
  300,
);

const mozambiqueChannel: AOIData = buildCircleAOI(
  {
    id: 'mozambique-channel',
    name: 'Mozambique Channel',
    displayName: 'Mozambique Channel',
    country: 'Mozambique / Madagascar',
    region: 'Africa',
    priority: 4,
    category: 'active_conflict',
    color: '#882200',
    active: true,
    tags: ['insurgency', 'ISIS', 'LNG', 'Cabo_Delgado', 'Total_Energies'],
    context:
      'ISIS-affiliated insurgency in Cabo Delgado disrupting major LNG projects (TotalEnergies). Maritime security concerns in Mozambique Channel shipping lane.',
    coverageQuality: 'poor',
    centroid: { lat: -12.5, lng: 40.5 },
  },
  400,
);

const russiaPacific: AOIData = buildCircleAOI(
  {
    id: 'russia-pacific',
    name: 'Russia Pacific Fleet (Kamchatka)',
    displayName: 'Kamchatka',
    country: 'Russia',
    region: 'Pacific',
    priority: 4,
    category: 'military_buildup',
    color: '#884400',
    active: true,
    tags: ['Pacific_Fleet', 'SSBN', 'Petropavlovsk', 'Rybachiy', 'bastion'],
    context:
      'Russian Pacific Fleet SSBN bastion. Rybachiy submarine base with Borei-class SSBNs. Nuclear deterrence patrol area. Increasing activity.',
    coverageQuality: 'marginal',
    centroid: { lat: 53.0, lng: 158.0 },
  },
  500,
);

const greenland: AOIData = buildCircleAOI(
  {
    id: 'greenland',
    name: 'Greenland (Thule / Pituffik)',
    displayName: 'Greenland',
    country: 'Denmark / Greenland',
    region: 'Arctic',
    priority: 4,
    category: 'intelligence_cluster',
    color: '#884488',
    active: true,
    tags: ['Pituffik', 'Thule', 'early_warning', 'Arctic', 'rare_earth', 'sovereignty'],
    context:
      'Pituffik Space Base (formerly Thule) with ballistic missile early warning radar. Strategic Arctic position. Rare earth mineral resources. Sovereignty debate.',
    coverageQuality: 'poor',
    centroid: { lat: 76.53, lng: -68.75 },
  },
  200,
);

const cuba: AOIData = buildCircleAOI(
  {
    id: 'cuba',
    name: 'Cuba (Intelligence/Signal Stations)',
    displayName: 'Cuba',
    country: 'Cuba',
    region: 'Caribbean',
    priority: 4,
    category: 'intelligence_cluster',
    color: '#884488',
    active: true,
    tags: ['SIGINT', 'Lourdes', 'Russia_China', 'Guantanamo', 'intelligence'],
    context:
      'Chinese and Russian intelligence facilities. Lourdes SIGINT station (Russia). Reported Chinese spy base. US naval base at Guantanamo Bay.',
    coverageQuality: 'marginal',
    centroid: { lat: 22.0, lng: -79.5 },
  },
  300,
);

const solomonIslands: AOIData = buildCircleAOI(
  {
    id: 'solomon-islands',
    name: 'Solomon Islands',
    displayName: 'Solomon Islands',
    country: 'Solomon Islands',
    region: 'Pacific',
    priority: 4,
    category: 'emerging_flashpoint',
    color: '#888800',
    active: false,
    tags: ['China_security_pact', 'Pacific_Islands', 'AUKUS', 'basing_rights'],
    context:
      'China-Solomon Islands security pact raising concerns about potential PLA basing. Pacific island competition between China and Western allies.',
    coverageQuality: 'poor',
    centroid: { lat: -9.43, lng: 160.03 },
  },
  300,
);

const nigerUranium: AOIData = buildCircleAOI(
  {
    id: 'niger-uranium',
    name: 'Niger Uranium Region',
    displayName: 'Niger Uranium',
    country: 'Niger',
    region: 'Africa',
    priority: 4,
    category: 'emerging_flashpoint',
    color: '#888800',
    active: true,
    tags: ['uranium', 'Arlit', 'Orano', 'junta', 'France_withdrawal', 'Russia'],
    context:
      'Uranium mining region critical for nuclear fuel supply. Post-coup junta expelled French forces. Russian influence expanding. Supply chain implications for EU nuclear energy.',
    coverageQuality: 'poor',
    centroid: { lat: 16.97, lng: 7.99 },
  },
  300,
);

const cambodiaReam: AOIData = buildCircleAOI(
  {
    id: 'cambodia-ream',
    name: 'Ream Naval Base (Cambodia)',
    displayName: 'Ream Naval Base',
    country: 'Cambodia',
    region: 'Southeast Asia',
    priority: 4,
    category: 'military_buildup',
    color: '#884400',
    active: true,
    tags: ['PLA_Navy', 'dual_use', 'Chinese_construction', 'Gulf_of_Thailand'],
    context:
      'Chinese-funded expansion of Cambodian naval base. Suspected future PLA Navy access. Strategic position in Gulf of Thailand. Denied by both governments.',
    coverageQuality: 'marginal',
    centroid: { lat: 10.5, lng: 103.63 },
  },
  50,
);

// =============================================================================
// Master list — ALL 55 AOIs
// =============================================================================

export const ALL_AOIS: AOIData[] = [
  // Tier 1 — polygon
  iran,
  ukraineEast,
  ukraineSouth,
  taiwanStrait,
  gaza,
  redSea,
  sudan,
  southChinaSea,
  // Tier 1 — circle
  iranBushehr,
  iranNatanz,
  iranFordow,
  // Tier 2 — polygon
  northKorea,
  hormuz,
  chinaFujian,
  pakistanNuclear,
  suez,
  malacca,
  hainan,
  syria,
  kaliningrad,
  // Tier 2 — circle
  koreaDmz,
  indiaNuclear,
  turkishStraits,
  giukGap,
  russiaCrimea,
  // Tier 3 — circle
  indiaChinaLac,
  senkakuIslands,
  philippinesScs,
  myanmar,
  iraq,
  lebanonIsrael,
  libya,
  ethiopiaEritrea,
  sahel,
  drcEast,
  chinaXichang,
  chinaJiuquan,
  nkSohae,
  iranSemnan,
  diegoGarcia,
  guam,
  djibouti,
  // Tier 4 — circle
  venezuela,
  guyanaEssequibo,
  arcticSvalbard,
  balticSea,
  kashmir,
  southAtlantic,
  panamaCanal,
  capeGoodHope,
  mozambiqueChannel,
  russiaPacific,
  greenland,
  cuba,
  solomonIslands,
  nigerUranium,
  cambodiaReam,
];

// =============================================================================
// Query helpers
// =============================================================================

export const getAOIsByPriority = (tier: PriorityTier): AOIData[] =>
  ALL_AOIS.filter((a) => a.priority === tier);

export const getAOIsByCategory = (cat: AOICategory): AOIData[] =>
  ALL_AOIS.filter((a) => a.category === cat);

export const getAOIsByRegion = (region: string): AOIData[] =>
  ALL_AOIS.filter((a) => a.region === region);

export const getActiveAOIs = (): AOIData[] => ALL_AOIS.filter((a) => a.active);
