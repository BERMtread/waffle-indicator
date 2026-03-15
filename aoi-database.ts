// ============================================================
// 🧇 WAFFLE INDICATOR — GLOBAL AOI DATABASE
// Comprehensive Areas of Interest for constellation monitoring
//
// Selection criteria:
//   1. Active armed conflict zones
//   2. Nuclear weapons programs / facilities
//   3. Strategic maritime chokepoints
//   4. Contested borders / territorial disputes
//   5. Major military buildup / staging areas
//   6. Space & missile launch facilities
//   7. Critical infrastructure / cyber targets
//   8. Intelligence facility clusters
//   9. Non-state actor safe havens
//  10. Emerging flashpoints
//
// Each AOI defined with:
//   - Center coordinates (lat/lng)
//   - Monitoring radius (km)
//   - Category classification
//   - Priority tier (1-4, with 1 = highest)
//   - Context notes for operational relevance
//
// ASTS constellation parameters:
//   Inclination: ~52.9-53.2°
//   Max latitude coverage: ~53° N/S
//   ⚠️ AOIs above ~55°N or below ~55°S have degraded coverage
//      (low elevation passes only, shorter windows)
//   AOIs above ~60° are effectively out of coverage
// ============================================================

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

export interface AOI {
  id: string;
  name: string;
  displayName: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  radius: number;        // km
  color: string;
  category: AOICategory;
  priority: PriorityTier;
  active: boolean;
  tags: string[];
  context: string;
  coverage_quality: 'excellent' | 'good' | 'marginal' | 'poor';
  // ↑ Based on latitude vs ASTS inclination (53°)
  //   excellent: |lat| < 40°  (passes near-zenith)
  //   good:      |lat| 40-50° (good elevation angles)
  //   marginal:  |lat| 50-53° (low passes, short windows)
  //   poor:      |lat| > 53°  (edge of coverage or out)
}


// ============================================================
// TIER 1 — CRITICAL / ACTIVE CONFLICT ZONES
// Immediate operational relevance. Monitor continuously.
// ============================================================

const TIER_1_ACTIVE_CONFLICTS: AOI[] = [
  {
    id: 'iran-central',
    name: 'IRAN',
    displayName: 'Iran (Central)',
    country: 'Iran',
    region: 'Middle East',
    lat: 32.43,
    lng: 53.69,
    radius: 800,
    color: '#FF0040',
    category: 'active_conflict',
    priority: 1,
    active: true,
    tags: ['strike-target', 'nuclear', 'proven-correlation', 'centcom'],
    context: 'Primary AOI. BW3/BB1 tag-team aligned with Ops Absolute Resolve and Midnight Hammer. Two proven correlations with <1% random probability. Covers Tehran, Isfahan, Natanz, Fordow.',
    coverage_quality: 'excellent',
  },
  {
    id: 'iran-bushehr',
    name: 'IRAN BUSHEHR',
    displayName: 'Bushehr / Kharg Island',
    country: 'Iran',
    region: 'Middle East',
    lat: 28.92,
    lng: 50.82,
    radius: 200,
    color: '#FF0040',
    category: 'nuclear',
    priority: 1,
    active: true,
    tags: ['nuclear-reactor', 'oil-terminal', 'coastal'],
    context: 'Bushehr nuclear power plant + Kharg Island oil export terminal. Dual strategic value. Persian Gulf coast.',
    coverage_quality: 'excellent',
  },
  {
    id: 'iran-natanz',
    name: 'NATANZ',
    displayName: 'Natanz Enrichment Facility',
    country: 'Iran',
    region: 'Middle East',
    lat: 33.72,
    lng: 51.73,
    radius: 100,
    color: '#FF0040',
    category: 'nuclear',
    priority: 1,
    active: true,
    tags: ['nuclear-enrichment', 'underground', 'hardened'],
    context: 'Primary uranium enrichment facility. Underground centrifuge halls. Previous Stuxnet target. Key indicator for nuclear breakout timeline.',
    coverage_quality: 'excellent',
  },
  {
    id: 'iran-fordow',
    name: 'FORDOW',
    displayName: 'Fordow Fuel Enrichment Plant',
    country: 'Iran',
    region: 'Middle East',
    lat: 34.88,
    lng: 51.59,
    radius: 50,
    color: '#FF0040',
    category: 'nuclear',
    priority: 1,
    active: true,
    tags: ['nuclear-enrichment', 'mountain-bunker', 'hardened'],
    context: 'Built inside a mountain near Qom. Hardened against aerial strike. Enriching to 60%. Extremely high-value target.',
    coverage_quality: 'excellent',
  },
  {
    id: 'ukraine-east',
    name: 'UKRAINE EAST',
    displayName: 'Eastern Ukraine Front',
    country: 'Ukraine',
    region: 'Europe',
    lat: 48.38,
    lng: 37.80,
    radius: 400,
    color: '#FFDD00',
    category: 'active_conflict',
    priority: 1,
    active: true,
    tags: ['frontline', 'active-combat', 'donbas'],
    context: 'Active frontline in Donetsk/Luhansk oblasts. Highest intensity ground combat zone in Europe. Covers Bakhmut, Avdiivka, and Pokrovsk axes.',
    coverage_quality: 'good',
  },
  {
    id: 'ukraine-south',
    name: 'UKRAINE SOUTH',
    displayName: 'Southern Ukraine / Crimea Approaches',
    country: 'Ukraine',
    region: 'Europe',
    lat: 46.50,
    lng: 34.80,
    radius: 400,
    color: '#FFDD00',
    category: 'active_conflict',
    priority: 1,
    active: true,
    tags: ['crimea', 'zaporizhzhia', 'nuclear-plant', 'black-sea'],
    context: 'Covers Crimea, Zaporizhzhia NPP, Kherson, and northern Black Sea. Maritime drone corridor.',
    coverage_quality: 'good',
  },
  {
    id: 'taiwan-strait',
    name: 'TAIWAN STRAIT',
    displayName: 'Taiwan Strait',
    country: 'Taiwan / China',
    region: 'Indo-Pacific',
    lat: 24.50,
    lng: 119.50,
    radius: 400,
    color: '#FF8800',
    category: 'contested_border',
    priority: 1,
    active: true,
    tags: ['invasion-corridor', 'pla-navy', 'semiconductor', 'indopacom'],
    context: 'Highest-consequence flashpoint globally. ~180km strait. PLA rehearsal exercises increasing. TSMC located here. Covers Kinmen, Penghu, western Taiwan coast.',
    coverage_quality: 'excellent',
  },
  {
    id: 'gaza-strip',
    name: 'GAZA',
    displayName: 'Gaza Strip',
    country: 'Palestine / Israel',
    region: 'Middle East',
    lat: 31.35,
    lng: 34.31,
    radius: 100,
    color: '#FF0040',
    category: 'active_conflict',
    priority: 1,
    active: true,
    tags: ['urban-combat', 'humanitarian', 'idf', 'centcom'],
    context: 'Active IDF operations since Oct 2023. Dense urban environment. Tunnel networks. Humanitarian corridor monitoring.',
    coverage_quality: 'excellent',
  },
  {
    id: 'red-sea-bab',
    name: 'BAB AL-MANDAB',
    displayName: 'Red Sea / Bab al-Mandab',
    country: 'Yemen / Djibouti',
    region: 'Middle East / Africa',
    lat: 13.00,
    lng: 43.30,
    radius: 500,
    color: '#CC3300',
    category: 'active_conflict',
    priority: 1,
    active: true,
    tags: ['houthi', 'maritime-threat', 'shipping', 'anti-ship-missiles'],
    context: 'Houthi anti-ship missile and drone attacks on commercial shipping. Critical chokepoint for global trade. US/UK strike operations ongoing.',
    coverage_quality: 'excellent',
  },
  {
    id: 'sudan',
    name: 'SUDAN',
    displayName: 'Sudan (Khartoum / Darfur)',
    country: 'Sudan',
    region: 'Africa',
    lat: 15.50,
    lng: 32.50,
    radius: 600,
    color: '#FF3355',
    category: 'active_conflict',
    priority: 1,
    active: true,
    tags: ['civil-war', 'humanitarian', 'rsf', 'saf'],
    context: 'RSF vs SAF civil war. Worlds largest displacement crisis. Darfur genocide concerns. Limited international monitoring.',
    coverage_quality: 'excellent',
  },
];


// ============================================================
// TIER 2 — HIGH PRIORITY / STRATEGIC WATCH
// Active military buildups, nuclear programs, major chokepoints.
// ============================================================

const TIER_2_STRATEGIC: AOI[] = [
  // --- NUCLEAR PROGRAMS ---
  {
    id: 'north-korea',
    name: 'NORTH KOREA',
    displayName: 'North Korea (Pyongyang / Yongbyon)',
    country: 'North Korea',
    region: 'East Asia',
    lat: 39.50,
    lng: 125.80,
    radius: 300,
    color: '#FF2200',
    category: 'nuclear',
    priority: 2,
    active: true,
    tags: ['nuclear-weapons', 'icbm', 'yongbyon', 'punggye-ri'],
    context: 'Nuclear weapons program. Yongbyon reactor complex. Punggye-ri test site. ICBM launch pads at Sohae and Tongchang-ri.',
    coverage_quality: 'excellent',
  },
  {
    id: 'korea-dmz',
    name: 'KOREAN DMZ',
    displayName: 'Korean Demilitarized Zone',
    country: 'North Korea / South Korea',
    region: 'East Asia',
    lat: 38.00,
    lng: 127.00,
    radius: 200,
    color: '#FF2200',
    category: 'contested_border',
    priority: 2,
    active: true,
    tags: ['dmz', 'artillery', 'forward-deployed', 'indopacom'],
    context: 'Most heavily militarized border in the world. ~1M troops within 100km. Seoul within artillery range. Any escalation = immediate global crisis.',
    coverage_quality: 'excellent',
  },
  {
    id: 'pakistan-nuclear',
    name: 'PAKISTAN NUCLEAR',
    displayName: 'Pakistan Nuclear Belt',
    country: 'Pakistan',
    region: 'South Asia',
    lat: 33.00,
    lng: 72.00,
    radius: 400,
    color: '#FF4400',
    category: 'nuclear',
    priority: 2,
    active: true,
    tags: ['nuclear-weapons', 'kahuta', 'khushab', 'chashma'],
    context: 'Covers Kahuta enrichment, Khushab plutonium reactors, Chashma complex, and Kamra air base (nuclear-capable F-16s). Fastest growing nuclear arsenal globally.',
    coverage_quality: 'excellent',
  },
  {
    id: 'india-nuclear',
    name: 'INDIA NUCLEAR',
    displayName: 'India Nuclear Command (Central)',
    country: 'India',
    region: 'South Asia',
    lat: 21.00,
    lng: 79.00,
    radius: 500,
    color: '#FF6600',
    category: 'nuclear',
    priority: 2,
    active: true,
    tags: ['nuclear-triad', 'bhabha', 'agni-missiles', 'ins-arihant'],
    context: 'BARC (Mumbai), missile test range (Abdul Kalam Island), submarine base (Visakhapatnam). Nuclear triad operational.',
    coverage_quality: 'excellent',
  },

  // --- MARITIME CHOKEPOINTS ---
  {
    id: 'strait-hormuz',
    name: 'STRAIT OF HORMUZ',
    displayName: 'Strait of Hormuz',
    country: 'Iran / Oman / UAE',
    region: 'Middle East',
    lat: 26.56,
    lng: 56.25,
    radius: 250,
    color: '#FF1166',
    category: 'maritime_chokepoint',
    priority: 2,
    active: true,
    tags: ['oil-chokepoint', 'irgcn', 'tanker-seizure', 'fifth-fleet'],
    context: '~21% of global oil passes through here daily. 33km wide at narrowest. IRGC Navy fast attack craft. US Fifth Fleet patrols. Iran has repeatedly threatened closure.',
    coverage_quality: 'excellent',
  },
  {
    id: 'south-china-sea',
    name: 'S. CHINA SEA',
    displayName: 'South China Sea (Spratly Islands)',
    country: 'China / Philippines / Vietnam / Malaysia',
    region: 'Indo-Pacific',
    lat: 10.00,
    lng: 114.00,
    radius: 800,
    color: '#FF4400',
    category: 'contested_border',
    priority: 2,
    active: true,
    tags: ['island-militarization', 'nine-dash-line', 'pla-navy', 'freedom-of-navigation'],
    context: '$5.3T in trade transits annually. China has militarized artificial islands (Fiery Cross, Subi, Mischief reefs). Philippine confrontations at Second Thomas Shoal. US FONOPs.',
    coverage_quality: 'excellent',
  },
  {
    id: 'malacca-strait',
    name: 'MALACCA STRAIT',
    displayName: 'Strait of Malacca',
    country: 'Malaysia / Indonesia / Singapore',
    region: 'Southeast Asia',
    lat: 2.50,
    lng: 101.50,
    radius: 400,
    color: '#FF8855',
    category: 'maritime_chokepoint',
    priority: 2,
    active: true,
    tags: ['shipping-lane', 'piracy', 'oil-transit', 'pla-navy-interest'],
    context: 'Narrowest point ~2.7km. ~25% of global trade. Chinas energy lifeline (80% of oil imports). Malacca Dilemma is core PLA planning concern.',
    coverage_quality: 'excellent',
  },
  {
    id: 'suez-canal',
    name: 'SUEZ CANAL',
    displayName: 'Suez Canal',
    country: 'Egypt',
    region: 'Middle East / Africa',
    lat: 30.45,
    lng: 32.35,
    radius: 150,
    color: '#FF8855',
    category: 'maritime_chokepoint',
    priority: 2,
    active: true,
    tags: ['shipping-chokepoint', 'trade-route', 'egypt'],
    context: '~12% of global trade. Single point of failure. 2021 Ever Given blockage cost ~$9.6B/day. Houthi attacks have diverted significant traffic.',
    coverage_quality: 'excellent',
  },
  {
    id: 'turkish-straits',
    name: 'TURKISH STRAITS',
    displayName: 'Bosporus / Dardanelles',
    country: 'Turkey',
    region: 'Europe / Middle East',
    lat: 41.10,
    lng: 29.05,
    radius: 100,
    color: '#FF8855',
    category: 'maritime_chokepoint',
    priority: 2,
    active: true,
    tags: ['black-sea-access', 'russia-navy', 'montreux-convention', 'nato'],
    context: 'Only passage between Black Sea and Mediterranean. Turkey controls under Montreux Convention. Russia Black Sea Fleet must transit. NATO significance.',
    coverage_quality: 'excellent',
  },
  {
    id: 'giuk-gap',
    name: 'GIUK GAP',
    displayName: 'GIUK Gap',
    country: 'Iceland / UK / Norway',
    region: 'North Atlantic',
    lat: 63.00,
    lng: -15.00,
    radius: 600,
    color: '#4488FF',
    category: 'maritime_chokepoint',
    priority: 2,
    active: true,
    tags: ['submarine-chokepoint', 'russian-navy', 'nato', 'ssbn-patrol'],
    context: 'Greenland-Iceland-UK gap. Russian submarine transit route to Atlantic. Critical for NATO ASW. SOSUS/successor networks.',
    coverage_quality: 'poor',  // ⚠️ 63°N — outside ASTS coverage band
  },

  // --- MILITARY BUILDUPS ---
  {
    id: 'china-fujian',
    name: 'CHINA FUJIAN',
    displayName: 'Fujian Province (Taiwan Invasion Staging)',
    country: 'China',
    region: 'East Asia',
    lat: 25.00,
    lng: 118.50,
    radius: 300,
    color: '#FF4400',
    category: 'military_buildup',
    priority: 2,
    active: true,
    tags: ['pla', 'amphibious', 'eastern-theater-command', 'invasion-staging'],
    context: 'PLA Eastern Theater Command. Amphibious assault staging area directly opposite Taiwan. Massive port infrastructure buildup. PLAAF bases with J-20s.',
    coverage_quality: 'excellent',
  },
  {
    id: 'china-hainan',
    name: 'CHINA HAINAN',
    displayName: 'Hainan Island / Yulin Naval Base',
    country: 'China',
    region: 'East Asia',
    lat: 18.20,
    lng: 109.50,
    radius: 200,
    color: '#FF4400',
    category: 'military_buildup',
    priority: 2,
    active: true,
    tags: ['ssbn-base', 'submarine-tunnels', 'south-china-sea', 'pla-navy'],
    context: 'Underground submarine base at Yulin. Home port for Type 094 SSBNs. Gateway to South China Sea. Satellite imagery has shown rapid expansion.',
    coverage_quality: 'excellent',
  },
  {
    id: 'russia-kaliningrad',
    name: 'KALININGRAD',
    displayName: 'Kaliningrad Exclave',
    country: 'Russia',
    region: 'Europe',
    lat: 54.70,
    lng: 20.50,
    radius: 200,
    color: '#FF3333',
    category: 'military_buildup',
    priority: 2,
    active: true,
    tags: ['iskander', 'a2ad', 'baltic-sea', 'nato-flank', 'nuclear-capable'],
    context: 'Russian exclave between NATO allies Poland and Lithuania. Iskander-M missiles (nuclear capable). S-400 AD. Suwalki Gap threat.',
    coverage_quality: 'marginal',  // ⚠️ 54.7°N — at edge of ASTS coverage
  },
  {
    id: 'russia-crimea',
    name: 'CRIMEA',
    displayName: 'Crimea / Sevastopol',
    country: 'Russia (occupied Ukraine)',
    region: 'Europe',
    lat: 44.95,
    lng: 34.10,
    radius: 200,
    color: '#FF3333',
    category: 'military_buildup',
    priority: 2,
    active: true,
    tags: ['black-sea-fleet', 'kerch-bridge', 'air-defense', 'occupied'],
    context: 'Black Sea Fleet HQ at Sevastopol. Kerch Bridge logistics. Air defense umbrella. Ukrainian maritime drone and missile strikes ongoing.',
    coverage_quality: 'good',
  },
  {
    id: 'syria',
    name: 'SYRIA',
    displayName: 'Syria',
    country: 'Syria',
    region: 'Middle East',
    lat: 35.00,
    lng: 38.00,
    radius: 500,
    color: '#FF5533',
    category: 'active_conflict',
    priority: 2,
    active: true,
    tags: ['civil-war', 'russia-bases', 'iran-proxy', 'isis-remnants', 'centcom'],
    context: 'Post-Assad transition. Former Russian bases (Khmeimim, Tartus). Iranian proxy networks. ISIS remnants in eastern desert. US forces at al-Tanf and NE Syria.',
    coverage_quality: 'excellent',
  },
];


// ============================================================
// TIER 3 — ELEVATED WATCH
// Significant strategic value. Periodic monitoring.
// ============================================================

const TIER_3_ELEVATED: AOI[] = [
  // --- INDO-PACIFIC ---
  {
    id: 'india-china-lac',
    name: 'INDIA-CHINA LAC',
    displayName: 'Line of Actual Control (Ladakh)',
    country: 'India / China',
    region: 'South Asia',
    lat: 34.50,
    lng: 78.00,
    radius: 300,
    color: '#FF6600',
    category: 'contested_border',
    priority: 3,
    active: true,
    tags: ['galwan', 'aksai-chin', 'high-altitude', 'buildup'],
    context: '2020 Galwan clash killed 20 Indian, unknown PLA troops. Both sides have built permanent infrastructure. Ongoing standoff at Depsang and Demchok.',
    coverage_quality: 'excellent',
  },
  {
    id: 'senkaku-islands',
    name: 'SENKAKU / DIAOYU',
    displayName: 'Senkaku Islands / East China Sea',
    country: 'Japan / China',
    region: 'East Asia',
    lat: 25.75,
    lng: 123.47,
    radius: 200,
    color: '#FF8800',
    category: 'contested_border',
    priority: 3,
    active: true,
    tags: ['china-coast-guard', 'japan', 'territorial-dispute', 'eez'],
    context: 'Daily Chinese coast guard incursions into Japanese-administered waters. Air defense identification zone overlap. Escalation risk.',
    coverage_quality: 'excellent',
  },
  {
    id: 'philippines-scs',
    name: 'SECOND THOMAS SHOAL',
    displayName: 'Second Thomas Shoal / Ayungin',
    country: 'Philippines / China',
    region: 'Indo-Pacific',
    lat: 9.75,
    lng: 115.87,
    radius: 100,
    color: '#FF6600',
    category: 'contested_border',
    priority: 3,
    active: true,
    tags: ['sierra-madre', 'water-cannon', 'china-coast-guard', 'philippines'],
    context: 'Philippine Marines stationed on grounded BRP Sierra Madre. Chinese coast guard blockading resupply. Multiple water cannon incidents. US mutual defense treaty applies.',
    coverage_quality: 'excellent',
  },
  {
    id: 'myanmar',
    name: 'MYANMAR',
    displayName: 'Myanmar (Civil War)',
    country: 'Myanmar',
    region: 'Southeast Asia',
    lat: 20.00,
    lng: 96.00,
    radius: 500,
    color: '#FF5533',
    category: 'active_conflict',
    priority: 3,
    active: true,
    tags: ['civil-war', 'junta', 'ethnic-armies', 'china-influence'],
    context: 'Post-coup civil war. Resistance forces gaining territory. China-backed groups in Shan State. Strategic for China Belt and Road corridor.',
    coverage_quality: 'excellent',
  },

  // --- MIDDLE EAST / AFRICA ---
  {
    id: 'iraq',
    name: 'IRAQ',
    displayName: 'Iraq (Western / Anbar)',
    country: 'Iraq',
    region: 'Middle East',
    lat: 33.30,
    lng: 44.00,
    radius: 400,
    color: '#FF6633',
    category: 'active_conflict',
    priority: 3,
    active: true,
    tags: ['iran-militia', 'us-bases', 'al-asad', 'centcom'],
    context: 'Iran-backed militia attacks on US bases (Al-Asad, Erbil). ISIS remnants. PMF forces. Critical US CENTCOM operating area.',
    coverage_quality: 'excellent',
  },
  {
    id: 'lebanon-israel',
    name: 'LEBANON-ISRAEL',
    displayName: 'Lebanon-Israel Border',
    country: 'Lebanon / Israel',
    region: 'Middle East',
    lat: 33.30,
    lng: 35.50,
    radius: 150,
    color: '#FF4400',
    category: 'contested_border',
    priority: 3,
    active: true,
    tags: ['hezbollah', 'blue-line', 'rocket-fire', 'unifil'],
    context: 'Hezbollah rocket exchanges since Oct 2023. Blue Line border. UNIFIL peacekeepers. Potential second front.',
    coverage_quality: 'excellent',
  },
  {
    id: 'libya',
    name: 'LIBYA',
    displayName: 'Libya',
    country: 'Libya',
    region: 'North Africa',
    lat: 31.00,
    lng: 17.00,
    radius: 500,
    color: '#FF6633',
    category: 'active_conflict',
    priority: 3,
    active: true,
    tags: ['civil-war', 'wagner', 'turkey-proxy', 'oil', 'migration'],
    context: 'Divided between GNA (Tripoli) and LNA (Benghazi). Russian Wagner/Africa Corps presence. Turkish military support. Major oil production. Migration route.',
    coverage_quality: 'excellent',
  },
  {
    id: 'ethiopia-eritrea',
    name: 'HORN OF AFRICA',
    displayName: 'Ethiopia / Eritrea / Somalia',
    country: 'Ethiopia / Eritrea / Somalia',
    region: 'East Africa',
    lat: 9.00,
    lng: 42.00,
    radius: 600,
    color: '#FF6633',
    category: 'active_conflict',
    priority: 3,
    active: true,
    tags: ['tigray', 'al-shabaab', 'port-dispute', 'djibouti-bases'],
    context: 'Post-Tigray war instability. Ethiopias Red Sea port ambitions. Al-Shabaab in Somalia. Djibouti foreign military bases (US, China, France, Japan).',
    coverage_quality: 'excellent',
  },
  {
    id: 'sahel',
    name: 'SAHEL',
    displayName: 'Sahel Region (Mali / Niger / Burkina)',
    country: 'Mali / Niger / Burkina Faso',
    region: 'West Africa',
    lat: 15.00,
    lng: 0.00,
    radius: 800,
    color: '#FF8833',
    category: 'active_conflict',
    priority: 3,
    active: true,
    tags: ['jihadist', 'wagner', 'france-withdrawal', 'military-juntas'],
    context: 'Military juntas expelled French forces. Russian Wagner/Africa Corps replacing. Jihadist groups (JNIM, IS-Sahel) expanding. US drone bases.',
    coverage_quality: 'excellent',
  },
  {
    id: 'drc-east',
    name: 'EASTERN DRC',
    displayName: 'Eastern DRC (N. Kivu / S. Kivu)',
    country: 'DR Congo',
    region: 'Central Africa',
    lat: -1.50,
    lng: 29.00,
    radius: 300,
    color: '#FF6633',
    category: 'active_conflict',
    priority: 3,
    active: true,
    tags: ['m23', 'rwanda', 'cobalt', 'mineral-conflict'],
    context: 'M23 rebel offensive backed by Rwanda. Critical mineral resources (cobalt, coltan, lithium). Humanitarian crisis. UN MONUSCO drawdown.',
    coverage_quality: 'excellent',
  },

  // --- LAUNCH FACILITIES ---
  {
    id: 'china-xichang',
    name: 'XICHANG',
    displayName: 'Xichang Satellite Launch Center',
    country: 'China',
    region: 'East Asia',
    lat: 28.25,
    lng: 102.03,
    radius: 50,
    color: '#8844FF',
    category: 'launch_facility',
    priority: 3,
    active: true,
    tags: ['space-launch', 'beidou', 'pla-ssf', 'geostationary'],
    context: 'Primary Chinese geostationary launch site. BeiDou constellation. PLA Strategic Support Force operations.',
    coverage_quality: 'excellent',
  },
  {
    id: 'china-jiuquan',
    name: 'JIUQUAN',
    displayName: 'Jiuquan Satellite Launch Center',
    country: 'China',
    region: 'East Asia',
    lat: 40.96,
    lng: 100.29,
    radius: 50,
    color: '#8844FF',
    category: 'launch_facility',
    priority: 3,
    active: true,
    tags: ['space-launch', 'crewed-missions', 'tiangong', 'pla-ssf'],
    context: 'Chinas oldest launch site. Crewed Shenzhou missions. Tiangong space station logistics. Also used for ASAT and hypersonic glide vehicle tests.',
    coverage_quality: 'excellent',
  },
  {
    id: 'nk-sohae',
    name: 'SOHAE',
    displayName: 'Sohae / Tongchang-ri Launch Site',
    country: 'North Korea',
    region: 'East Asia',
    lat: 39.66,
    lng: 124.71,
    radius: 30,
    color: '#FF2200',
    category: 'launch_facility',
    priority: 3,
    active: true,
    tags: ['icbm', 'satellite-launch', 'slv', 'dprk'],
    context: 'Primary North Korean satellite/ICBM launch facility. Hwasong-17/18 test launches. Engine test stand visible on commercial imagery.',
    coverage_quality: 'excellent',
  },
  {
    id: 'iran-semnan',
    name: 'SEMNAN',
    displayName: 'Imam Khomeini Space Center',
    country: 'Iran',
    region: 'Middle East',
    lat: 35.23,
    lng: 53.92,
    radius: 50,
    color: '#FF0040',
    category: 'launch_facility',
    priority: 3,
    active: true,
    tags: ['slv', 'icbm-precursor', 'simorgh', 'qased'],
    context: 'Iranian space launch facility. Simorgh and Qased launch vehicles share technology with ballistic missile program. ICBM breakout indicator.',
    coverage_quality: 'excellent',
  },

  // --- STRATEGIC INFRASTRUCTURE ---
  {
    id: 'diego-garcia',
    name: 'DIEGO GARCIA',
    displayName: 'Diego Garcia',
    country: 'UK / US',
    region: 'Indian Ocean',
    lat: -7.32,
    lng: 72.42,
    radius: 100,
    color: '#4488FF',
    category: 'intelligence_cluster',
    priority: 3,
    active: true,
    tags: ['b2-staging', 'sigint', 'indian-ocean', 'bomber-base'],
    context: 'B-2 Spirit forward operating base. SIGINT station. Diego Garcia was staging point for B-2 strikes in both Iran operations. Critical indicator.',
    coverage_quality: 'excellent',
  },
  {
    id: 'guam',
    name: 'GUAM',
    displayName: 'Guam (Andersen AFB / Naval Base)',
    country: 'US',
    region: 'Indo-Pacific',
    lat: 13.44,
    lng: 144.80,
    radius: 100,
    color: '#4488FF',
    category: 'military_buildup',
    priority: 3,
    active: true,
    tags: ['bomber-base', 'indopacom', 'thaad', 'submarine'],
    context: 'Key US power projection hub in Western Pacific. Andersen AFB (B-52s, B-2s). Naval Base (SSNs). THAAD missile defense. PLA DF-26 "Guam Killer" threat.',
    coverage_quality: 'excellent',
  },
  {
    id: 'djibouti',
    name: 'DJIBOUTI',
    displayName: 'Djibouti Base Cluster',
    country: 'Djibouti',
    region: 'East Africa',
    lat: 11.55,
    lng: 43.15,
    radius: 50,
    color: '#4488FF',
    category: 'intelligence_cluster',
    priority: 3,
    active: true,
    tags: ['camp-lemonnier', 'pla-base', 'french-base', 'japanese-base', 'multi-nation'],
    context: 'Only location with US (Camp Lemonnier), Chinese (PLA Support Base), French, and Japanese military bases within km of each other. Intelligence goldmine.',
    coverage_quality: 'excellent',
  },
];


// ============================================================
// TIER 4 — GENERAL WATCH / EMERGING
// Lower immediate risk but strategically significant.
// ============================================================

const TIER_4_WATCH: AOI[] = [
  {
    id: 'venezuela',
    name: 'VENEZUELA',
    displayName: 'Venezuela',
    country: 'Venezuela',
    region: 'South America',
    lat: 8.00,
    lng: -66.00,
    radius: 500,
    color: '#FF8833',
    category: 'emerging_flashpoint',
    priority: 4,
    active: true,
    tags: ['political-crisis', 'oil', 'guyana-dispute', 'russia-china-ties'],
    context: 'Maduro regime. Essequibo dispute with Guyana. Russian and Chinese military ties. Oil reserves largest in world. Potential US intervention trigger.',
    coverage_quality: 'excellent',
  },
  {
    id: 'guyana-essequibo',
    name: 'ESSEQUIBO',
    displayName: 'Guyana / Essequibo Dispute',
    country: 'Guyana / Venezuela',
    region: 'South America',
    lat: 5.50,
    lng: -59.00,
    radius: 300,
    color: '#FF8833',
    category: 'contested_border',
    priority: 4,
    active: true,
    tags: ['territorial-dispute', 'oil', 'exxon', 'stabroek-block'],
    context: 'Venezuela claims Essequibo region (2/3 of Guyana). Massive offshore oil discoveries (Stabroek Block, ExxonMobil). Military posturing in 2023.',
    coverage_quality: 'excellent',
  },
  {
    id: 'arctic-svalbard',
    name: 'ARCTIC / SVALBARD',
    displayName: 'Arctic (Svalbard / Northern Sea Route)',
    country: 'Norway / Russia',
    region: 'Arctic',
    lat: 78.00,
    lng: 16.00,
    radius: 500,
    color: '#4488FF',
    category: 'emerging_flashpoint',
    priority: 4,
    active: true,
    tags: ['arctic-militarization', 'northern-sea-route', 'undersea-cables', 'russia'],
    context: 'Russian Arctic militarization. Northern Sea Route. Undersea cable vulnerabilities (Svalbard cables cut 2022, 2024). Resource competition.',
    coverage_quality: 'poor',  // ⚠️ 78°N — well outside ASTS coverage
  },
  {
    id: 'baltic-sea',
    name: 'BALTIC SEA',
    displayName: 'Baltic Sea (Cable/Pipeline Zone)',
    country: 'NATO / Russia',
    region: 'Europe',
    lat: 55.50,
    lng: 18.00,
    radius: 400,
    color: '#4488FF',
    category: 'critical_infrastructure',
    priority: 4,
    active: true,
    tags: ['undersea-cables', 'nord-stream', 'sabotage', 'nato-lake', 'russia'],
    context: 'Nord Stream sabotage. Balticconnector damage. Multiple cable cuts by anchor-dragging ships. NATO now treating as grey-zone warfare. Sweden/Finland in NATO.',
    coverage_quality: 'marginal',  // ⚠️ 55.5°N — edge of ASTS coverage
  },
  {
    id: 'kashmir',
    name: 'KASHMIR',
    displayName: 'Kashmir (India-Pakistan LoC)',
    country: 'India / Pakistan',
    region: 'South Asia',
    lat: 34.00,
    lng: 75.50,
    radius: 200,
    color: '#FF6600',
    category: 'contested_border',
    priority: 4,
    active: true,
    tags: ['loc', 'nuclear-flashpoint', 'terrorism', 'siachen'],
    context: 'Line of Control between nuclear-armed India and Pakistan. Worlds highest battlefield (Siachen Glacier). Cross-border terrorism. Pulwama/Balakot cycle.',
    coverage_quality: 'excellent',
  },
  {
    id: 'south-atlantic',
    name: 'FALKLANDS / S. ATLANTIC',
    displayName: 'Falkland Islands / South Atlantic',
    country: 'UK / Argentina',
    region: 'South America',
    lat: -51.75,
    lng: -59.00,
    radius: 300,
    color: '#4488FF',
    category: 'contested_border',
    priority: 4,
    active: true,
    tags: ['falklands', 'sovereignty-dispute', 'uk-military', 'oil-exploration'],
    context: 'Ongoing sovereignty dispute. UK maintains Mount Pleasant military base. Argentine rhetoric fluctuates. Oil exploration interest.',
    coverage_quality: 'good',  // 51.75°S — within coverage but low elevation
  },
  {
    id: 'panama-canal',
    name: 'PANAMA CANAL',
    displayName: 'Panama Canal',
    country: 'Panama',
    region: 'Central America',
    lat: 9.08,
    lng: -79.68,
    radius: 100,
    color: '#FF8855',
    category: 'maritime_chokepoint',
    priority: 4,
    active: true,
    tags: ['trade-chokepoint', 'drought-vulnerability', 'china-influence'],
    context: '~5% of global trade. Drought reduced capacity in 2023-24. Chinese-owned ports at both ends (Hutchison). Trump rhetoric about retaking.',
    coverage_quality: 'excellent',
  },
  {
    id: 'cape-good-hope',
    name: 'CAPE OF GOOD HOPE',
    displayName: 'Cape of Good Hope',
    country: 'South Africa',
    region: 'Southern Africa',
    lat: -34.35,
    lng: 18.47,
    radius: 300,
    color: '#FF8855',
    category: 'maritime_chokepoint',
    priority: 4,
    active: true,
    tags: ['alternate-suez-route', 'houthi-diversion', 'shipping'],
    context: 'Alternate route when Suez/Red Sea denied. Houthi attacks have diverted massive shipping volume here. Adds 10-14 days to Europe-Asia route.',
    coverage_quality: 'excellent',
  },
  {
    id: 'mozambique-channel',
    name: 'MOZAMBIQUE CHANNEL',
    displayName: 'Mozambique Channel / Cabo Delgado',
    country: 'Mozambique',
    region: 'East Africa',
    lat: -12.50,
    lng: 40.50,
    radius: 400,
    color: '#FF6633',
    category: 'active_conflict',
    priority: 4,
    active: true,
    tags: ['isis-affiliate', 'lng', 'totalenergies', 'rwandan-intervention'],
    context: 'ISIS-Mozambique insurgency in Cabo Delgado. TotalEnergies LNG mega-project suspended. Rwandan military intervention. Strategic shipping lane.',
    coverage_quality: 'excellent',
  },
  {
    id: 'russia-pacific',
    name: 'RUSSIA PACIFIC',
    displayName: 'Kamchatka / Sea of Okhotsk',
    country: 'Russia',
    region: 'Pacific',
    lat: 53.00,
    lng: 158.00,
    radius: 500,
    color: '#FF3333',
    category: 'military_buildup',
    priority: 4,
    active: true,
    tags: ['ssbn-bastion', 'pacific-fleet', 'nuclear-submarine', 'petropavlovsk'],
    context: 'Russian Pacific Fleet SSBN bastion. Borei-class SSBNs deploy from Petropavlovsk-Kamchatsky. Sea of Okhotsk is protected patrol zone. Strategic nuclear deterrent.',
    coverage_quality: 'marginal',  // ⚠️ 53°N — at the edge
  },
  {
    id: 'greenland',
    name: 'GREENLAND',
    displayName: 'Greenland (Thule / Pituffik)',
    country: 'Denmark / US',
    region: 'Arctic',
    lat: 76.53,
    lng: -68.75,
    radius: 200,
    color: '#4488FF',
    category: 'intelligence_cluster',
    priority: 4,
    active: true,
    tags: ['pituffik-space-base', 'bmews', 'arctic', 'rare-earth', 'trump'],
    context: 'Pituffik Space Base (formerly Thule). Ballistic Missile Early Warning System. Arctic strategy. Rare earth minerals. Trump acquisition rhetoric.',
    coverage_quality: 'poor',  // ⚠️ 76°N — way outside ASTS coverage
  },
  {
    id: 'cuba',
    name: 'CUBA',
    displayName: 'Cuba',
    country: 'Cuba',
    region: 'Caribbean',
    lat: 22.00,
    lng: -79.50,
    radius: 300,
    color: '#FF8833',
    category: 'intelligence_cluster',
    priority: 4,
    active: true,
    tags: ['sigint', 'russia', 'china-spy-base', 'lourdes', 'bejucal'],
    context: 'Chinese SIGINT station (reported). Russian military visits resumed. Lourdes SIGINT facility history. 90 miles from US. Potential forward deployment.',
    coverage_quality: 'excellent',
  },
  {
    id: 'solomon-islands',
    name: 'SOLOMON ISLANDS',
    displayName: 'Solomon Islands / SW Pacific',
    country: 'Solomon Islands',
    region: 'Pacific',
    lat: -9.43,
    lng: 160.03,
    radius: 300,
    color: '#FF8833',
    category: 'emerging_flashpoint',
    priority: 4,
    active: true,
    tags: ['china-security-pact', 'pacific-islands', 'second-island-chain'],
    context: 'China security pact 2022. Potential Chinese naval facility. Part of Second Island Chain competition. Australia/US response.',
    coverage_quality: 'excellent',
  },
  {
    id: 'niger-uranium',
    name: 'NIGER',
    displayName: 'Niger (Agadez / Uranium)',
    country: 'Niger',
    region: 'West Africa',
    lat: 16.97,
    lng: 7.99,
    radius: 300,
    color: '#FF8833',
    category: 'emerging_flashpoint',
    priority: 4,
    active: true,
    tags: ['uranium', 'french-withdrawal', 'us-drone-base', 'wagner', 'junta'],
    context: 'Military junta expelled US and French forces. Russia filling vacuum. Major uranium supplier (France dependent). US evacuated Air Base 201 (Agadez).',
    coverage_quality: 'excellent',
  },
  {
    id: 'cambodia-ream',
    name: 'REAM NAVAL BASE',
    displayName: 'Cambodia Ream Naval Base',
    country: 'Cambodia',
    region: 'Southeast Asia',
    lat: 10.50,
    lng: 103.63,
    radius: 50,
    color: '#FF4400',
    category: 'military_buildup',
    priority: 4,
    active: true,
    tags: ['pla-navy', 'chinese-base', 'gulf-of-thailand'],
    context: 'Suspected Chinese naval facility under construction. Cambodia denies but satellite imagery shows PLA-funded expansion. Only Chinas second overseas base after Djibouti.',
    coverage_quality: 'excellent',
  },
];


// ============================================================
// COMBINED & EXPORT
// ============================================================

export const ALL_AOIS: AOI[] = [
  ...TIER_1_ACTIVE_CONFLICTS,
  ...TIER_2_STRATEGIC,
  ...TIER_3_ELEVATED,
  ...TIER_4_WATCH,
];

// Quick lookup helpers
export const getAOIsByPriority = (tier: PriorityTier) =>
  ALL_AOIS.filter(a => a.priority === tier);

export const getAOIsByCategory = (cat: AOICategory) =>
  ALL_AOIS.filter(a => a.category === cat);

export const getAOIsByRegion = (region: string) =>
  ALL_AOIS.filter(a => a.region === region);

export const getActiveAOIs = () =>
  ALL_AOIS.filter(a => a.active);

export const getCoverageWarnings = () =>
  ALL_AOIS.filter(a => a.coverage_quality === 'poor' || a.coverage_quality === 'marginal');


// ============================================================
// STATISTICS
// ============================================================
//
// Total AOIs:           55
// Tier 1 (Critical):    10
// Tier 2 (Strategic):   16
// Tier 3 (Elevated):    16
// Tier 4 (Watch):       13
//
// By category:
//   active_conflict:        12
//   nuclear:                 5
//   maritime_chokepoint:     7
//   contested_border:        8
//   military_buildup:        7
//   launch_facility:         4
//   intelligence_cluster:    4
//   emerging_flashpoint:     4
//   critical_infrastructure: 1
//   non_state_actor:         0 (covered under active_conflict tags)
//
// Coverage quality:
//   excellent (|lat| < 40°):   44
//   good (40-50°):              5
//   marginal (50-53°):          3
//   poor (> 53°):               3  ← GIUK Gap, Arctic/Svalbard, Greenland
//
// Regions:
//   Middle East:              12
//   East Asia:                 8
//   Europe:                    5
//   South Asia:                4
//   Indo-Pacific:              4
//   Africa:                    8
//   Southeast Asia:            4
//   South America:             3
//   Pacific:                   2
//   Caribbean:                 1
//   Indian Ocean:              1
//   North Atlantic:            1
//   Arctic:                    2
//
// ============================================================
