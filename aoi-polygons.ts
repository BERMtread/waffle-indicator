// ============================================================
// 🧇 WAFFLE INDICATOR — AOI GEOMETRY ENGINE
// Polygon-based area monitoring for accurate coverage detection
//
// WHY POLYGONS MATTER:
//
// The old approach:
//   - Iran = single point (32.4°N, 53.7°E) + 800km radius circle
//   - Check: is satellite within 800km of that point?
//   - Problem: Iran is ~2,000km wide. Circle misses edges.
//              Chile is 4,300km long and 177km wide. Circle is useless.
//
// The correct approach:
//   - Iran = polygon of boundary coordinates
//   - Satellite footprint = circle on Earth's surface (function of altitude + min elevation angle)
//   - Check: does satellite footprint circle OVERLAP with country polygon?
//   - A satellite "covers" Iran if ANY point in Iran is within the satellite's footprint
//
// SATELLITE FOOTPRINT GEOMETRY:
//
//   At altitude h, with minimum usable elevation angle θ_min:
//
//   footprint_radius = R_earth × arccos(cos(ρ) / cos(ε + ρ))
//
//   where:
//     ρ = arcsin((R_earth / (R_earth + h)) × cos(θ_min))  — Earth central angle
//     ε = θ_min (minimum elevation)
//
//   For ASTS at ~510km, θ_min = 10°:
//     footprint_radius ≈ 1,580 km
//
//   For θ_min = 20° (good signal quality):
//     footprint_radius ≈ 1,180 km
//
//   For θ_min = 45° (excellent, near-overhead):
//     footprint_radius ≈ 580 km
//
// So a satellite at 510km altitude can "see" any point within
// ~1,580km of its sub-satellite point (ground track position).
//
// The check becomes: is the MINIMUM distance from the satellite's
// ground track to ANY point on the country polygon less than
// the satellite's footprint radius?
//
// This is equivalent to: does the satellite footprint circle
// intersect with the country polygon?
// ============================================================

export interface AOIPolygon {
  id: string;
  name: string;
  displayName: string;
  priority: 1 | 2 | 3 | 4;
  category: string;
  color: string;
  active: boolean;
  tags: string[];
  context: string;

  // The polygon boundary (simplified for performance)
  // Each point is [lat, lng] in degrees
  // Polygons are closed (first point = last point implied)
  boundary: [number, number][];

  // Pre-computed centroid for quick distance pre-filtering
  centroid: { lat: number; lng: number };

  // Pre-computed bounding box for fast rejection
  bbox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };

  // Maximum distance from centroid to any boundary point (km)
  // Used for quick "definitely not in range" check
  maxExtent: number;

  // Optional: sub-regions of special interest within the polygon
  // (e.g., specific military bases, nuclear facilities)
  hotspots?: {
    name: string;
    lat: number;
    lng: number;
    type: string;
  }[];
}


// ============================================================
// COVERAGE CHECK ALGORITHM
// ============================================================

/**
 * Haversine distance between two points in km
 */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Compute satellite footprint radius based on altitude and
 * minimum elevation angle.
 */
function footprintRadius(altitudeKm: number, minElevationDeg: number = 10): number {
  const R = 6371;
  const elevRad = minElevationDeg * Math.PI / 180;
  const rho = Math.asin((R / (R + altitudeKm)) * Math.cos(elevRad));
  const lambda = Math.PI / 2 - elevRad - rho;  // Earth central angle
  return R * lambda;
}

/**
 * Minimum distance from a point to a polygon boundary.
 * This checks distance to each edge segment and each vertex.
 *
 * For our purposes, we also need to check if the point is
 * INSIDE the polygon (distance = 0).
 */
function pointToPolygonMinDistance(
  lat: number, lng: number,
  polygon: [number, number][]
): number {
  // First check if point is inside polygon (ray casting)
  if (isPointInPolygon(lat, lng, polygon)) return 0;

  // Otherwise find minimum distance to any edge
  let minDist = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const d = pointToSegmentDistance(
      lat, lng,
      polygon[i][0], polygon[i][1],
      polygon[j][0], polygon[j][1]
    );
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/**
 * Ray casting algorithm for point-in-polygon
 */
function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    if (((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Approximate distance from a point to a great-circle segment.
 * Uses spherical geometry for accuracy.
 */
function pointToSegmentDistance(
  pLat: number, pLng: number,
  aLat: number, aLng: number,
  bLat: number, bLng: number
): number {
  // For simplicity, check distance to both endpoints and midpoints
  // A full great-circle cross-track distance is more accurate but
  // for simplified polygons this is sufficient
  const dA = haversine(pLat, pLng, aLat, aLng);
  const dB = haversine(pLat, pLng, bLat, bLng);

  // Sample midpoint for better approximation on long segments
  const midLat = (aLat + bLat) / 2;
  const midLng = (aLng + bLng) / 2;
  const dMid = haversine(pLat, pLng, midLat, midLng);

  return Math.min(dA, dB, dMid);
}


/**
 * PRIMARY CHECK: Does a satellite at the given position have
 * coverage over any part of the AOI polygon?
 *
 * Uses a 3-level filtering approach for performance:
 *   1. Bounding box rejection (instant)
 *   2. Centroid + maxExtent quick check (one haversine)
 *   3. Full polygon distance check (N haversines)
 */
export function satelliteCoversAOI(
  satLat: number,
  satLng: number,
  satAltKm: number,
  aoi: AOIPolygon,
  minElevationDeg: number = 10
): {
  covers: boolean;
  minDistanceKm: number;
  footprintKm: number;
  bestElevationDeg: number;
} {
  const fp = footprintRadius(satAltKm, minElevationDeg);

  // --- Level 1: Bounding box rejection ---
  // Rough lat/lng check. Expand bbox by footprint equivalent in degrees.
  const fpDeg = fp / 111; // ~111km per degree latitude
  if (satLat < aoi.bbox.minLat - fpDeg || satLat > aoi.bbox.maxLat + fpDeg ||
      satLng < aoi.bbox.minLng - fpDeg || satLng > aoi.bbox.maxLng + fpDeg) {
    return { covers: false, minDistanceKm: Infinity, footprintKm: fp, bestElevationDeg: 0 };
  }

  // --- Level 2: Centroid quick check ---
  const centroidDist = haversine(satLat, satLng, aoi.centroid.lat, aoi.centroid.lng);
  // If satellite is closer to centroid than footprint + maxExtent, it MIGHT cover
  // If farther, it definitely CANNOT cover
  if (centroidDist > fp + aoi.maxExtent) {
    return { covers: false, minDistanceKm: centroidDist - aoi.maxExtent, footprintKm: fp, bestElevationDeg: 0 };
  }

  // --- Level 3: Full polygon check ---
  const minDist = pointToPolygonMinDistance(satLat, satLng, aoi.boundary);
  const covers = minDist <= fp;

  // Compute best elevation angle (to closest point in polygon)
  // If satellite is directly over the polygon, find closest boundary point
  // or use centroid
  const closestLat = minDist === 0 ? satLat : aoi.centroid.lat; // approximate
  const closestLng = minDist === 0 ? satLng : aoi.centroid.lng;
  const R = 6371;
  const gamma = minDist / R;
  const bestElev = Math.atan2(
    Math.cos(gamma) - R / (R + satAltKm),
    Math.sin(gamma)
  ) * 180 / Math.PI;

  return {
    covers,
    minDistanceKm: minDist,
    footprintKm: fp,
    bestElevationDeg: Math.max(0, bestElev),
  };
}


// ============================================================
// AOI POLYGON DEFINITIONS
// Simplified boundaries (~15-40 points per country)
// Sufficient for footprint-level accuracy (~100km resolution)
//
// These are deliberately simplified from full country borders.
// We don't need coastline detail — we need the rough shape
// so the overlap check is correct to within ~50km.
//
// For sub-country AOIs (e.g., Taiwan Strait), boundaries
// define the specific zone of interest, not the full country.
// ============================================================


// --- TIER 1: CRITICAL ---

const IRAN: AOIPolygon = {
  id: 'iran',
  name: 'IRAN',
  displayName: 'Iran',
  priority: 1,
  category: 'active_conflict',
  color: '#FF0040',
  active: true,
  tags: ['strike-target', 'nuclear', 'proven-correlation', 'centcom'],
  context: 'Primary AOI. BW3/BB1 tag-team correlated with Ops Absolute Resolve and Midnight Hammer.',
  centroid: { lat: 32.43, lng: 53.69 },
  bbox: { minLat: 25.0, maxLat: 39.8, minLng: 44.0, maxLng: 63.3 },
  maxExtent: 1100,
  boundary: [
    [39.78, 44.79], // NW corner (Turkey/Armenia border)
    [39.40, 45.50], // Armenia border
    [39.20, 47.00], // Azerbaijan
    [38.85, 48.85], // Caspian coast north
    [37.50, 49.90], // Caspian coast
    [36.70, 53.80], // Caspian coast east
    [37.35, 55.40], // Turkmenistan border west
    [37.40, 57.20], // Turkmenistan border
    [35.80, 61.20], // Turkmenistan border east
    [34.30, 62.00], // Afghanistan border north
    [31.00, 61.70], // Afghanistan border
    [29.40, 60.85], // Afghanistan/Pakistan tripoint
    [27.20, 62.80], // Pakistan border
    [25.25, 61.50], // SE coast (Balochistan)
    [25.40, 58.90], // Gulf of Oman coast
    [26.30, 56.20], // Strait of Hormuz
    [27.10, 54.70], // Persian Gulf coast
    [28.90, 50.80], // Bushehr
    [29.90, 49.50], // Persian Gulf coast
    [30.50, 48.30], // Shatt al-Arab
    [31.50, 47.70], // Iraq border south
    [33.00, 46.10], // Iraq border
    [34.60, 45.60], // Iraq border
    [36.40, 45.20], // Iraq/Turkey tripoint
    [37.00, 44.50], // Turkey border
    [39.78, 44.79], // close polygon
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
    { name: 'Kharg Island (Oil Terminal)', lat: 29.23, lng: 50.31, type: 'infrastructure' },
  ],
};

const UKRAINE_EAST: AOIPolygon = {
  id: 'ukraine-east',
  name: 'UKRAINE EAST',
  displayName: 'Eastern Ukraine Front',
  priority: 1,
  category: 'active_conflict',
  color: '#FFDD00',
  active: true,
  tags: ['frontline', 'active-combat', 'donbas'],
  context: 'Active frontline Donetsk/Luhansk. Highest intensity ground combat in Europe.',
  centroid: { lat: 48.50, lng: 37.80 },
  bbox: { minLat: 46.5, maxLat: 50.5, minLng: 34.0, maxLng: 40.5 },
  maxExtent: 400,
  boundary: [
    [50.40, 34.00], // NW — north of Kharkiv
    [50.40, 38.00], // NE — Luhansk oblast north
    [49.50, 40.20], // Russian border east
    [48.00, 40.00], // Donbas east
    [47.00, 38.50], // Mariupol area
    [46.60, 36.80], // Sea of Azov coast
    [46.80, 35.00], // Zaporizhzhia south
    [48.00, 34.20], // Dnipro area
    [50.40, 34.00], // close
  ],
  hotspots: [
    { name: 'Bakhmut', lat: 48.60, lng: 38.00, type: 'frontline' },
    { name: 'Avdiivka', lat: 48.14, lng: 37.75, type: 'frontline' },
    { name: 'Pokrovsk', lat: 48.28, lng: 37.18, type: 'frontline' },
    { name: 'Kharkiv', lat: 49.99, lng: 36.23, type: 'city' },
    { name: 'Zaporizhzhia NPP', lat: 47.51, lng: 34.58, type: 'nuclear' },
  ],
};

const UKRAINE_SOUTH: AOIPolygon = {
  id: 'ukraine-south',
  name: 'UKRAINE SOUTH',
  displayName: 'Southern Ukraine / Crimea',
  priority: 1,
  category: 'active_conflict',
  color: '#FFDD00',
  active: true,
  tags: ['crimea', 'black-sea', 'maritime-drones'],
  context: 'Crimea, Kherson, northern Black Sea. Maritime drone corridor.',
  centroid: { lat: 45.50, lng: 34.00 },
  bbox: { minLat: 44.0, maxLat: 47.5, minLng: 31.0, maxLng: 37.0 },
  maxExtent: 350,
  boundary: [
    [47.00, 31.50], // Odesa oblast
    [47.00, 35.00], // Zaporizhzhia
    [46.20, 36.50], // Azov coast
    [45.50, 36.80], // Kerch Strait
    [45.00, 36.50], // Eastern Crimea
    [44.40, 34.00], // Southern Crimea
    [44.50, 32.50], // Western Crimea
    [45.50, 31.50], // NW Crimea
    [46.50, 31.00], // Odesa coast
    [47.00, 31.50], // close
  ],
  hotspots: [
    { name: 'Sevastopol (Black Sea Fleet HQ)', lat: 44.62, lng: 33.53, type: 'naval' },
    { name: 'Kerch Bridge', lat: 45.31, lng: 36.51, type: 'infrastructure' },
    { name: 'Saki Airbase', lat: 45.09, lng: 33.59, type: 'airbase' },
  ],
};

const TAIWAN_STRAIT: AOIPolygon = {
  id: 'taiwan-strait',
  name: 'TAIWAN STRAIT',
  displayName: 'Taiwan Strait + Taiwan',
  priority: 1,
  category: 'contested_border',
  color: '#FF8800',
  active: true,
  tags: ['invasion-corridor', 'semiconductor', 'pla-navy', 'indopacom'],
  context: 'Highest-consequence flashpoint. 180km strait. PLA exercises increasing. TSMC.',
  centroid: { lat: 24.00, lng: 120.50 },
  bbox: { minLat: 21.5, maxLat: 26.5, minLng: 117.0, maxLng: 122.5 },
  maxExtent: 400,
  boundary: [
    // Includes Taiwan + strait + Fujian landing beaches
    [26.20, 117.50], // Fujian north coast
    [26.20, 122.00], // NE of Taiwan
    [25.00, 122.00], // East coast Taiwan
    [23.50, 121.50], // SE Taiwan
    [21.90, 120.80], // Southern tip
    [22.50, 118.00], // Strait south
    [23.50, 117.00], // Fujian south
    [25.00, 117.50], // Fujian coast
    [26.20, 117.50], // close
  ],
  hotspots: [
    { name: 'TSMC Fabs (Hsinchu)', lat: 24.78, lng: 120.98, type: 'semiconductor' },
    { name: 'Taipei', lat: 25.03, lng: 121.57, type: 'capital' },
    { name: 'Kinmen Islands', lat: 24.45, lng: 118.38, type: 'frontline' },
    { name: 'Penghu Islands', lat: 23.57, lng: 119.58, type: 'military' },
    { name: 'Suao Naval Base', lat: 24.60, lng: 121.87, type: 'naval' },
  ],
};

const GAZA: AOIPolygon = {
  id: 'gaza',
  name: 'GAZA',
  displayName: 'Gaza Strip + Southern Israel',
  priority: 1,
  category: 'active_conflict',
  color: '#FF0040',
  active: true,
  tags: ['urban-combat', 'humanitarian', 'idf', 'centcom'],
  context: 'Active IDF operations since Oct 2023. Includes buffer zone and Negev staging.',
  centroid: { lat: 31.40, lng: 34.40 },
  bbox: { minLat: 30.8, maxLat: 31.8, minLng: 34.0, maxLng: 34.9 },
  maxExtent: 80,
  boundary: [
    [31.60, 34.20], // Northern Gaza + Israel border
    [31.60, 34.60], // NE buffer
    [31.80, 34.80], // Sderot/Ashkelon area
    [31.20, 34.90], // Negev staging
    [30.80, 34.50], // South — Kerem Shalom crossing
    [31.20, 34.10], // Rafah
    [31.60, 34.20], // close
  ],
  hotspots: [
    { name: 'Gaza City', lat: 31.50, lng: 34.47, type: 'urban' },
    { name: 'Khan Younis', lat: 31.35, lng: 34.30, type: 'urban' },
    { name: 'Rafah Crossing', lat: 31.25, lng: 34.25, type: 'border' },
    { name: 'Netzarim Corridor', lat: 31.40, lng: 34.38, type: 'military' },
  ],
};

const RED_SEA: AOIPolygon = {
  id: 'red-sea',
  name: 'RED SEA / BAB AL-MANDAB',
  displayName: 'Red Sea Shipping Corridor',
  priority: 1,
  category: 'active_conflict',
  color: '#CC3300',
  active: true,
  tags: ['houthi', 'anti-ship', 'shipping', 'centcom'],
  context: 'Houthi anti-ship attacks. US/UK strikes. Covers Bab al-Mandab to central Red Sea.',
  centroid: { lat: 15.00, lng: 42.00 },
  bbox: { minLat: 12.0, maxLat: 20.0, minLng: 38.0, maxLng: 45.0 },
  maxExtent: 600,
  boundary: [
    // Red Sea shipping lane from Bab al-Mandab to ~Port Sudan
    [20.00, 38.00], // Port Sudan area
    [20.00, 40.00], // Saudi coast
    [17.00, 42.00], // Central Red Sea
    [14.00, 43.00], // Yemen coast approach
    [12.50, 43.50], // Bab al-Mandab south
    [12.00, 44.50], // Gulf of Aden entrance
    [12.50, 45.00], // Djibouti
    [13.00, 43.00], // Yemen side
    [15.00, 42.50], // Houthi-controlled coast
    [18.00, 39.50], // Eritrea coast
    [20.00, 38.00], // close
  ],
  hotspots: [
    { name: 'Bab al-Mandab Strait', lat: 12.58, lng: 43.33, type: 'chokepoint' },
    { name: 'Hodeidah (Houthi naval)', lat: 14.80, lng: 42.95, type: 'threat' },
    { name: 'Djibouti / Camp Lemonnier', lat: 11.55, lng: 43.15, type: 'base' },
  ],
};

const SUDAN: AOIPolygon = {
  id: 'sudan',
  name: 'SUDAN',
  displayName: 'Sudan',
  priority: 1,
  category: 'active_conflict',
  color: '#FF3355',
  active: true,
  tags: ['civil-war', 'humanitarian', 'rsf', 'saf'],
  context: 'RSF vs SAF civil war. Worlds largest displacement crisis.',
  centroid: { lat: 15.50, lng: 30.00 },
  bbox: { minLat: 8.5, maxLat: 22.0, minLng: 21.8, maxLng: 38.6 },
  maxExtent: 1000,
  boundary: [
    [22.00, 24.00], // NW — Libya border
    [22.00, 31.40], // Egypt border (22nd parallel)
    [22.00, 36.90], // Red Sea coast north
    [18.00, 38.50], // Red Sea coast
    [15.60, 39.50], // Eritrea border
    [14.00, 36.50], // Ethiopia border
    [12.00, 34.00], // South Sudan border
    [10.00, 32.00], // South
    [9.00, 28.00], // SW — CAR border
    [10.00, 24.00], // Chad border
    [15.00, 22.00], // Libya border south
    [22.00, 24.00], // close
  ],
  hotspots: [
    { name: 'Khartoum', lat: 15.60, lng: 32.53, type: 'capital-combat' },
    { name: 'El Fasher (N. Darfur)', lat: 13.63, lng: 25.35, type: 'siege' },
    { name: 'Port Sudan (temp capital)', lat: 19.62, lng: 37.22, type: 'government' },
  ],
};

const SOUTH_CHINA_SEA: AOIPolygon = {
  id: 'south-china-sea',
  name: 'S. CHINA SEA',
  displayName: 'South China Sea',
  priority: 1,
  category: 'contested_border',
  color: '#FF4400',
  active: true,
  tags: ['island-militarization', 'nine-dash-line', 'freedom-of-navigation'],
  context: '$5.3T annual trade. Militarized artificial islands. Philippine confrontations.',
  centroid: { lat: 12.00, lng: 114.00 },
  bbox: { minLat: 3.0, maxLat: 23.0, minLng: 105.0, maxLng: 121.0 },
  maxExtent: 1200,
  boundary: [
    // Covers the contested area including Spratlys, Paracels, Scarborough
    [23.00, 110.00], // Hainan
    [22.00, 115.00], // HK approach
    [18.00, 120.00], // Luzon west coast
    [14.00, 121.00], // Philippine coast
    [10.00, 119.00], // Palawan
    [5.00, 115.00], // Borneo north
    [3.00, 108.00], // Malay coast
    [5.00, 105.00], // Vietnam south
    [10.00, 107.00], // Vietnam coast
    [16.00, 108.00], // Paracels
    [20.00, 109.00], // Hainan south
    [23.00, 110.00], // close
  ],
  hotspots: [
    { name: 'Fiery Cross Reef (CN base)', lat: 9.55, lng: 112.89, type: 'militarized-island' },
    { name: 'Subi Reef (CN base)', lat: 10.92, lng: 114.08, type: 'militarized-island' },
    { name: 'Mischief Reef (CN base)', lat: 9.90, lng: 115.53, type: 'militarized-island' },
    { name: 'Second Thomas Shoal', lat: 9.75, lng: 115.87, type: 'flashpoint' },
    { name: 'Scarborough Shoal', lat: 15.23, lng: 117.76, type: 'disputed' },
    { name: 'Woody Island (Paracels)', lat: 16.83, lng: 112.33, type: 'militarized-island' },
  ],
};


// --- TIER 2: STRATEGIC ---

const NORTH_KOREA: AOIPolygon = {
  id: 'north-korea',
  name: 'NORTH KOREA',
  displayName: 'North Korea',
  priority: 2,
  category: 'nuclear',
  color: '#FF2200',
  active: true,
  tags: ['nuclear', 'icbm', 'yongbyon', 'regime'],
  context: 'Nuclear weapons program. ICBM development. Worlds most isolated state.',
  centroid: { lat: 40.00, lng: 127.00 },
  bbox: { minLat: 37.7, maxLat: 43.0, minLng: 124.0, maxLng: 131.0 },
  maxExtent: 450,
  boundary: [
    [43.00, 129.50], // NE — Tumen River
    [42.00, 130.70], // East coast north
    [40.00, 128.50], // East coast
    [38.50, 128.30], // East coast south
    [38.00, 127.50], // DMZ east
    [37.80, 126.50], // DMZ west
    [37.70, 125.00], // West coast south
    [39.00, 124.50], // West coast
    [40.00, 124.20], // Yalu River
    [41.50, 126.00], // China border
    [42.50, 128.00], // China border north
    [43.00, 129.50], // close
  ],
  hotspots: [
    { name: 'Yongbyon Nuclear Complex', lat: 39.80, lng: 125.76, type: 'nuclear' },
    { name: 'Punggye-ri Test Site', lat: 41.28, lng: 129.09, type: 'nuclear-test' },
    { name: 'Sohae Launch Facility', lat: 39.66, lng: 124.71, type: 'icbm' },
    { name: 'Pyongyang', lat: 39.04, lng: 125.75, type: 'capital' },
    { name: 'Sinpo Naval Shipyard (SLBM)', lat: 40.02, lng: 128.17, type: 'submarine' },
  ],
};

const STRAIT_OF_HORMUZ: AOIPolygon = {
  id: 'hormuz',
  name: 'STRAIT OF HORMUZ',
  displayName: 'Strait of Hormuz',
  priority: 2,
  category: 'maritime_chokepoint',
  color: '#FF1166',
  active: true,
  tags: ['oil-chokepoint', 'irgcn', 'fifth-fleet'],
  context: '21% of global oil. 33km wide. IRGC Navy fast boats. Iran has threatened closure.',
  centroid: { lat: 26.50, lng: 56.30 },
  bbox: { minLat: 24.5, maxLat: 27.5, minLng: 54.0, maxLng: 58.0 },
  maxExtent: 250,
  boundary: [
    [27.20, 54.00], // Persian Gulf approach (Iran side)
    [27.00, 56.50], // Strait entrance
    [26.00, 57.00], // Strait center
    [25.00, 57.50], // Oman side
    [24.50, 57.00], // Gulf of Oman
    [25.00, 55.50], // UAE coast
    [26.00, 54.50], // Dubai approach
    [27.20, 54.00], // close
  ],
  hotspots: [
    { name: 'Strait narrowest point', lat: 26.60, lng: 56.25, type: 'chokepoint' },
    { name: 'Bandar Abbas (IRIN)', lat: 27.18, lng: 56.28, type: 'naval' },
    { name: 'Qeshm Island (IRGCN)', lat: 26.85, lng: 55.90, type: 'threat' },
    { name: 'Fujairah (oil terminal)', lat: 25.12, lng: 56.33, type: 'infrastructure' },
  ],
};

const CHINA_FUJIAN: AOIPolygon = {
  id: 'china-fujian',
  name: 'CHINA FUJIAN',
  displayName: 'Fujian Province (Invasion Staging)',
  priority: 2,
  category: 'military_buildup',
  color: '#FF4400',
  active: true,
  tags: ['pla', 'amphibious', 'eastern-theater-command'],
  context: 'PLA Eastern Theater Command. Amphibious staging opposite Taiwan. PLAAF J-20 bases.',
  centroid: { lat: 25.50, lng: 118.00 },
  bbox: { minLat: 23.5, maxLat: 28.0, minLng: 116.0, maxLng: 120.5 },
  maxExtent: 350,
  boundary: [
    [28.00, 116.50], // NW Fujian
    [28.00, 120.00], // NE coast
    [26.00, 120.00], // Coast
    [24.50, 119.00], // Xiamen area
    [23.50, 117.50], // Guangdong border
    [24.50, 116.00], // Inland
    [28.00, 116.50], // close
  ],
  hotspots: [
    { name: 'Xiamen (amphibious staging)', lat: 24.48, lng: 118.09, type: 'staging' },
    { name: 'Fuzhou (theater HQ)', lat: 26.07, lng: 119.30, type: 'command' },
    { name: 'Longtian Airbase (J-20)', lat: 25.67, lng: 119.62, type: 'airbase' },
    { name: 'Pingtan Island (closest to Taiwan)', lat: 25.50, lng: 119.78, type: 'staging' },
  ],
};

const PAKISTAN_NUCLEAR: AOIPolygon = {
  id: 'pakistan-nuclear',
  name: 'PAKISTAN NUCLEAR',
  displayName: 'Pakistan Nuclear Belt',
  priority: 2,
  category: 'nuclear',
  color: '#FF4400',
  active: true,
  tags: ['nuclear-weapons', 'fastest-growing-arsenal'],
  context: 'Fastest growing nuclear arsenal. Covers Kahuta, Khushab, Kamra, Islamabad.',
  centroid: { lat: 33.00, lng: 72.00 },
  bbox: { minLat: 30.0, maxLat: 36.0, minLng: 69.0, maxLng: 75.0 },
  maxExtent: 450,
  boundary: [
    [36.00, 71.00], // Northern areas
    [35.50, 75.00], // Kashmir LoC
    [33.00, 74.50], // Lahore approach
    [30.00, 73.00], // Punjab south
    [30.00, 69.50], // Balochistan
    [33.00, 69.00], // FATA/KPK
    [36.00, 71.00], // close
  ],
  hotspots: [
    { name: 'Kahuta (enrichment)', lat: 33.59, lng: 73.39, type: 'nuclear' },
    { name: 'Khushab (plutonium reactors)', lat: 32.02, lng: 72.22, type: 'nuclear' },
    { name: 'Kamra Air Base (F-16 nuclear)', lat: 33.87, lng: 72.40, type: 'delivery' },
    { name: 'Islamabad (NCA)', lat: 33.69, lng: 73.04, type: 'command' },
    { name: 'Chashma Nuclear Complex', lat: 32.38, lng: 71.46, type: 'nuclear' },
  ],
};

const SUEZ_CANAL: AOIPolygon = {
  id: 'suez',
  name: 'SUEZ CANAL',
  displayName: 'Suez Canal Zone',
  priority: 2,
  category: 'maritime_chokepoint',
  color: '#FF8855',
  active: true,
  tags: ['trade-chokepoint', '12pct-global-trade'],
  context: '12% of global trade. Single point of failure. Houthi-related diversion.',
  centroid: { lat: 30.50, lng: 32.35 },
  bbox: { minLat: 29.8, maxLat: 31.3, minLng: 32.0, maxLng: 33.0 },
  maxExtent: 100,
  boundary: [
    [31.25, 32.20], // Port Said north
    [31.25, 32.60], // Mediterranean entrance
    [30.50, 32.60], // Canal midpoint
    [29.90, 32.60], // Suez south
    [29.90, 32.50], // Gulf of Suez entrance
    [30.00, 32.20], // West bank
    [31.25, 32.20], // close
  ],
  hotspots: [
    { name: 'Port Said (north entrance)', lat: 31.26, lng: 32.30, type: 'chokepoint' },
    { name: 'Ismailia (midpoint)', lat: 30.60, lng: 32.27, type: 'infrastructure' },
    { name: 'Suez (south entrance)', lat: 29.97, lng: 32.55, type: 'chokepoint' },
  ],
};

const MALACCA_STRAIT: AOIPolygon = {
  id: 'malacca',
  name: 'MALACCA STRAIT',
  displayName: 'Strait of Malacca',
  priority: 2,
  category: 'maritime_chokepoint',
  color: '#FF8855',
  active: true,
  tags: ['shipping-lane', 'china-energy-lifeline', '25pct-global-trade'],
  context: '25% of global trade. Chinas energy lifeline (80% oil imports). Narrowest 2.7km.',
  centroid: { lat: 3.00, lng: 101.00 },
  bbox: { minLat: 1.0, maxLat: 6.0, minLng: 97.0, maxLng: 104.5 },
  maxExtent: 500,
  boundary: [
    [5.50, 97.00], // Andaman Sea entrance
    [5.80, 100.00], // Malay coast north
    [3.00, 104.00], // Singapore approach
    [1.20, 104.00], // Singapore
    [1.00, 103.50], // South
    [2.00, 100.50], // Sumatra coast
    [4.00, 97.50], // Sumatra north
    [5.50, 97.00], // close
  ],
  hotspots: [
    { name: 'Singapore Strait (narrows)', lat: 1.25, lng: 103.85, type: 'chokepoint' },
    { name: 'Port Klang', lat: 3.00, lng: 101.40, type: 'port' },
    { name: 'One Fathom Bank (narrowest)', lat: 2.90, lng: 101.00, type: 'chokepoint' },
  ],
};

const HAINAN_YULIN: AOIPolygon = {
  id: 'hainan',
  name: 'HAINAN / YULIN',
  displayName: 'Hainan Island',
  priority: 2,
  category: 'military_buildup',
  color: '#FF4400',
  active: true,
  tags: ['ssbn-base', 'submarine-tunnels', 'pla-navy'],
  context: 'Underground submarine base at Yulin. Type 094 SSBNs. Gateway to SCS.',
  centroid: { lat: 19.00, lng: 109.70 },
  bbox: { minLat: 18.0, maxLat: 20.2, minLng: 108.5, maxLng: 111.0 },
  maxExtent: 150,
  boundary: [
    [20.00, 110.30], // North coast
    [19.50, 111.00], // NE
    [18.20, 110.50], // SE
    [18.10, 109.50], // Yulin area south
    [18.50, 108.60], // SW
    [19.50, 108.60], // NW
    [20.00, 110.30], // close
  ],
  hotspots: [
    { name: 'Yulin Naval Base (submarine pens)', lat: 18.22, lng: 109.56, type: 'ssbn-base' },
    { name: 'Sanya (PLAN South Sea Fleet)', lat: 18.25, lng: 109.50, type: 'naval' },
    { name: 'Lingshui PLAAF Base', lat: 18.51, lng: 110.03, type: 'airbase' },
  ],
};

const SYRIA: AOIPolygon = {
  id: 'syria',
  name: 'SYRIA',
  displayName: 'Syria',
  priority: 2,
  category: 'active_conflict',
  color: '#FF5533',
  active: true,
  tags: ['post-assad', 'russia-bases', 'iran-proxy', 'isis', 'centcom'],
  context: 'Post-Assad transition. Former Russian bases. Iranian proxies. ISIS remnants. US forces NE.',
  centroid: { lat: 35.00, lng: 38.50 },
  bbox: { minLat: 32.3, maxLat: 37.3, minLng: 35.7, maxLng: 42.4 },
  maxExtent: 400,
  boundary: [
    [37.30, 36.80], // Turkey border west
    [37.10, 42.00], // Turkey border east
    [37.00, 42.40], // Iraq tripoint
    [35.00, 42.00], // Iraq border
    [33.30, 41.00], // Iraq border south
    [32.30, 39.00], // Jordan border
    [33.00, 36.00], // Golan
    [34.70, 35.80], // Lebanon border
    [35.80, 36.00], // Mediterranean coast
    [37.30, 36.80], // close
  ],
  hotspots: [
    { name: 'Khmeimim Air Base (Russian)', lat: 35.41, lng: 35.95, type: 'foreign-base' },
    { name: 'Tartus Naval Facility (Russian)', lat: 34.89, lng: 35.89, type: 'foreign-base' },
    { name: 'Al-Tanf (US garrison)', lat: 33.50, lng: 38.70, type: 'us-base' },
    { name: 'Damascus', lat: 33.51, lng: 36.29, type: 'capital' },
    { name: 'Deir ez-Zor (SDF/US)', lat: 35.34, lng: 40.14, type: 'contested' },
  ],
};

const KALININGRAD: AOIPolygon = {
  id: 'kaliningrad',
  name: 'KALININGRAD',
  displayName: 'Kaliningrad Exclave',
  priority: 2,
  category: 'military_buildup',
  color: '#FF3333',
  active: true,
  tags: ['iskander', 'a2ad', 'nato-flank', 'suwalki-gap'],
  context: 'Russian exclave. Iskander-M (nuclear capable). S-400. Suwalki Gap threat.',
  centroid: { lat: 54.70, lng: 20.50 },
  bbox: { minLat: 54.3, maxLat: 55.3, minLng: 19.6, maxLng: 22.9 },
  maxExtent: 120,
  boundary: [
    [55.30, 20.60], // Baltic coast north
    [55.10, 22.80], // Lithuania border east
    [54.40, 22.80], // Lithuania/Poland corner
    [54.35, 19.60], // Baltic coast south
    [55.30, 20.60], // close
  ],
  hotspots: [
    { name: 'Kaliningrad (Baltic Fleet HQ)', lat: 54.71, lng: 20.51, type: 'naval' },
    { name: 'Chernyakhovsk (Iskander base)', lat: 54.63, lng: 21.81, type: 'missile' },
    { name: 'Suwalki Gap (NATO chokepoint)', lat: 54.10, lng: 22.93, type: 'chokepoint' },
  ],
};


// ============================================================
// FULL EXPORT — All polygons
// (Tier 3 & 4 follow same pattern — abbreviated below
// with key entries. Full implementation would include all 55.)
// ============================================================

export const AOI_POLYGONS: AOIPolygon[] = [
  // Tier 1
  IRAN,
  UKRAINE_EAST,
  UKRAINE_SOUTH,
  TAIWAN_STRAIT,
  GAZA,
  RED_SEA,
  SUDAN,
  SOUTH_CHINA_SEA,

  // Tier 2
  NORTH_KOREA,
  STRAIT_OF_HORMUZ,
  CHINA_FUJIAN,
  PAKISTAN_NUCLEAR,
  SUEZ_CANAL,
  MALACCA_STRAIT,
  HAINAN_YULIN,
  SYRIA,
  KALININGRAD,

  // Tier 3 & 4: Use same polygon structure.
  // Remaining AOIs (India-China LAC, Senkaku, Myanmar, Iraq,
  // Lebanon-Israel, Libya, Horn of Africa, Sahel, DRC,
  // launch facilities, Diego Garcia, Guam, Djibouti,
  // Venezuela, Kashmir, Falklands, Panama Canal, etc.)
  // would be defined with the same level of detail.
];


// ============================================================
// HELPER: Convert old circle-based AOI to polygon approximation
// Useful for quickly bootstrapping AOIs that don't have
// hand-drawn boundaries yet.
// ============================================================

export function circleToPolygon(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  numPoints: number = 24
): [number, number][] {
  const points: [number, number][] = [];
  const R = 6371;
  for (let i = 0; i < numPoints; i++) {
    const bearing = (i / numPoints) * 2 * Math.PI;
    const latRad = centerLat * Math.PI / 180;
    const lngRad = centerLng * Math.PI / 180;
    const angularDist = radiusKm / R;

    const newLat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDist) +
      Math.cos(latRad) * Math.sin(angularDist) * Math.cos(bearing)
    );
    const newLng = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDist) * Math.cos(latRad),
      Math.cos(angularDist) - Math.sin(latRad) * Math.sin(newLat)
    );

    points.push([newLat * 180 / Math.PI, newLng * 180 / Math.PI]);
  }
  return points;
}


// ============================================================
// HELPER: Get Natural Earth simplified country borders
//
// For production, use Natural Earth GeoJSON data:
//   https://github.com/nvkelso/natural-earth-vector
//   ne_110m_admin_0_countries.json  (~800KB, very simplified)
//   ne_50m_admin_0_countries.json   (~5MB, moderate detail)
//
// Load at build time, filter to countries of interest,
// simplify with Turf.js if needed, and use as AOI boundaries.
// This gives you pixel-perfect country borders for free.
//
// npm install @turf/simplify @turf/boolean-intersects
//
// Example:
//   import countries from './ne_110m_countries.json';
//   const iran = countries.features.find(f => f.properties.ISO_A3 === 'IRN');
//   const simplified = turf.simplify(iran, { tolerance: 0.5 });
//
// Then check satellite footprint intersection:
//   import { booleanIntersects, circle } from '@turf/turf';
//   const footprint = circle([satLng, satLat], footprintRadiusKm, { units: 'kilometers' });
//   const coversIran = booleanIntersects(footprint, iran);
// ============================================================
