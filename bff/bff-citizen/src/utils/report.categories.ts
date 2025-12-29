/**
 * Report Categories Configuration
 * Contains all available report types with keywords for categorization
 */

import { REPORT_CATEGORY_NAME } from './report.category.names';

export interface ReportCategory {
  emoji: string;
  title: string;
  category: string;
  keywords: string[];
  suggestion?: boolean;
  icon?: string;
  color?: string;
}

export const REPORT_CATEGORIES: ReportCategory[] = [
  {
    emoji: '🚧',
    title: REPORT_CATEGORY_NAME.INFRASTRUCTURE_ROAD_BLOCKED,
    category: 'Infrastructure / Public Works',
    keywords: [
      'road',
      'blocked',
      'road blocked',
      'fallen tree',
      'tree fell',
      'debris',
      'road block',
      'obstruction',
      'blocked street',
      'daan sarado',
      'may harang',
      'may puno',
      'road closed',
      'cannot pass',
      'impassable',
    ],
    icon: 'block',
    color: '#F59E0B',
  },
  {
    emoji: '💡',
    title: REPORT_CATEGORY_NAME.INFRASTRUCTURE_BROKEN_STREET_LIGHTS,
    category: 'Infrastructure / Public Works',
    keywords: [
      'streetlight',
      'street light',
      'lamp',
      'post light',
      'light not working',
      'no light',
      'patay ilaw',
      'sirang ilaw',
      'madilim',
      'dark street',
    ],
    suggestion: true,
    icon: 'light_mode',
    color: '#FCD34D',
  },
  {
    emoji: '🕳️',
    title: REPORT_CATEGORY_NAME.INFRASTRUCTURE_OPEN_OR_DAMAGED_MANHOLE,
    category: 'Infrastructure / Public Works',
    keywords: ['manhole', 'open manhole', 'damaged manhole', 'open hole', 'road hole', 'butas sa kalsada', 'walang takip', 'dangerous hole'],
    icon: 'warning_amber',
    color: '#EF4444',
  },
  {
    emoji: '🧱',
    title: REPORT_CATEGORY_NAME.INFRASTRUCTURE_DAMAGED_OR_OBSTRUCTED_SIDEWALKS,
    category: 'Infrastructure / Public Works',
    keywords: ['sidewalk', 'pavement', 'broken sidewalk', 'cracked pavement', 'sira sidewalk', 'uneven pavement', 'walkway damage', 'trip hazard'],
    suggestion: true,
    icon: 'add_road_sharp',
    color: '#3B82F6',
  },
  {
    emoji: '🌊',
    title: REPORT_CATEGORY_NAME.INFRASTRUCTURE_FLOODED_ROAD,
    category: 'Infrastructure / Public Works',
    keywords: ['flood', 'flooded', 'flooding', 'road flooding', 'water on road', 'baha', 'may baha', 'passable flood', 'knee deep', 'ankle deep'],
    icon: 'water',
    color: '#0EA5E9',
  },
  {
    emoji: '🚫🚗',
    title: REPORT_CATEGORY_NAME.TRAFFIC_ILLEGAL_PARKING,
    category: 'Traffic / Transport',
    keywords: ['illegal parking', 'parked vehicle', 'double parking', 'no parking', 'harang', 'nakaharang', 'blocked driveway', 'parking violation'],
    icon: 'no_parking',
    color: '#DC2626',
  },
  {
    emoji: '🚦',
    title: REPORT_CATEGORY_NAME.TRAFFIC_LIGHT_NOT_WORKING,
    category: 'Traffic / Transport',
    keywords: ['traffic light', 'signal light', 'stop light', 'traffic signal', 'patay signal', 'blinking light', 'not working signal'],
    icon: 'traffic',
    color: '#DC2626',
  },
  {
    emoji: '🚧',
    title: REPORT_CATEGORY_NAME.TRAFFIC_ROAD_OBSTRUCTION,
    category: 'Traffic / Transport',
    keywords: [
      'road obstruction',
      'traffic block',
      'blocked traffic',
      'road blocked',
      'one lane only',
      'traffic jam',
      'slow traffic',
      'may harang sa daan',
    ],
    icon: 'block',
    color: '#F59E0B',
  },
  {
    emoji: '🚗💥',
    title: REPORT_CATEGORY_NAME.TRAFFIC_VEHICLE_ACCIDENT,
    category: 'Traffic / Transport',
    keywords: ['accident', 'vehicle accident', 'car crash', 'collision', 'banggaan', 'minor accident', 'no injury', 'fender bender'],
    icon: 'priority_high',
    color: '#DC2626',
  },
  {
    emoji: '🚗',
    title: REPORT_CATEGORY_NAME.TRAFFIC_VEHICLE_STALLED,
    category: 'Traffic / Transport',
    keywords: ['stalled vehicle', 'broken car', 'engine failure', 'vehicle stopped', 'hazard', 'nakatigil sasakyan', 'flat tire', 'overheated'],
    icon: 'build',
    color: '#F97316',
  },
  {
    emoji: '⚡',
    title: REPORT_CATEGORY_NAME.UTILITIES_LOCALIZED_POWER_OUTAGE,
    category: 'Utilities',
    keywords: ['power outage', 'blackout', 'no electricity', 'brownout', 'walang kuryente', 'power failure', 'line down'],
    icon: 'power_off',
    color: '#64748B',
  },
  {
    emoji: '🌃',
    title: REPORT_CATEGORY_NAME.UTILITIES_DARK_STREET,
    category: 'Utilities',
    keywords: ['no street lighting', 'dark area', 'street dark', 'madilim', 'lamp off', 'unsafe at night'],
    suggestion: true,
    icon: 'dark_mode',
    color: '#06B6D4',
  },
  {
    emoji: '🚰',
    title: REPORT_CATEGORY_NAME.UTILITIES_WATER_SUPPLY_INTERRUPTION,
    category: 'Utilities',
    keywords: ['water interruption', 'no water', 'water outage', 'walang tubig', 'water supply issue', 'dry faucet'],
    icon: 'water_drop',
    color: '#06B6D4',
  },
  {
    emoji: '🔌',
    title: REPORT_CATEGORY_NAME.UTILITIES_DANGLING_WIRES,
    category: 'Utilities',
    keywords: ['exposed wire', 'live wire', 'dangling wire', 'electrical hazard', 'kable', 'nakalaylay na wire', 'dangerous wiring'],
    suggestion: true,
    icon: 'electrical_services',
    color: '#EF4444',
  },
  {
    emoji: '🗑️',
    title: REPORT_CATEGORY_NAME.SANITATION_UNCOLLECTED_GARBAGE,
    category: 'Sanitation / Environment',
    keywords: ['garbage', 'trash', 'waste', 'not collected', 'basura', 'overflowing trash', 'missed pickup'],
    suggestion: true,
    icon: 'delete_outline',
    color: '#8B5CF6',
  },
  {
    emoji: '🕳️🌧️',
    title: REPORT_CATEGORY_NAME.SANITATION_DAMAGE_OR_OPEN_DRAINAGE,
    category: 'Sanitation / Environment',
    keywords: ['clogged drainage', 'blocked drain', 'canal', 'baradong kanal', 'water not draining', 'overflowing canal'],
    suggestion: true,
    icon: 'water_damage',
    color: '#F59E0B',
  },
  {
    emoji: '🚯',
    title: REPORT_CATEGORY_NAME.SANITATION_ILLEGAL_DUMPING,
    category: 'Sanitation / Environment',
    keywords: ['illegal dumping', 'trash dumping', 'waste dumping', 'tinapon basura', 'open dumping', 'unauthorized dumping'],
    icon: 'delete_sweep',
    color: '#8B5CF6',
  },
  {
    emoji: '🔥',
    title: REPORT_CATEGORY_NAME.SANITATION_SMOKE_SMALL_BURNING,
    category: 'Sanitation / Environment',
    keywords: ['smoke', 'burning', 'small fire', 'burning trash', 'usok', 'minor fire', 'controlled burn'],
    icon: 'local_fire_department',
    color: '#DC2626',
  },
  {
    emoji: '🏫',
    title: REPORT_CATEGORY_NAME.FACILITIES_SCHOOL_DAMAGE,
    category: 'City / Public Facilities',
    keywords: ['school', 'school damage', 'classroom damage', 'broken chairs', 'leaking roof', 'unsafe school'],
    icon: 'school',
    color: '#0EA5E9',
  },
  {
    emoji: '🏢',
    title: REPORT_CATEGORY_NAME.FACILITIES_BARANGAY_HALL_ISSUE,
    category: 'City / Public Facilities',
    keywords: ['barangay hall', 'barangay office', 'public office issue', 'sirang opisina', 'facility problem'],
    icon: 'location_city',
    color: '#0EA5E9',
  },
  {
    emoji: '🏕️',
    title: REPORT_CATEGORY_NAME.FACILITIES_EVACUATION_CENTER_ISSUE,
    category: 'City / Public Facilities',
    keywords: ['evacuation center', 'shelter issue', 'maintenance issue', 'leaking shelter', 'damaged evacuation center'],
    icon: 'domain',
    color: '#F59E0B',
  },
  {
    emoji: '⚠️🏛️',
    title: REPORT_CATEGORY_NAME.FACILITIES_SAFETY_CONCERN,
    category: 'City / Public Facilities',
    keywords: ['public facility', 'unsafe building', 'safety concern', 'structural issue', 'delikado', 'unsafe area'],
    icon: 'safety_check',
    color: '#DC2626',
  },
  {
    emoji: '👵',
    title: REPORT_CATEGORY_NAME.SOCIAL_ELDERLY_ASSISTANCE,
    category: 'Social / Public Assistance',
    keywords: ['elderly', 'senior citizen', 'old person', 'needs help', 'lola', 'lolo', 'cannot walk'],
    icon: 'accessibility_new',
    color: '#EC4899',
  },
  {
    emoji: '♿',
    title: REPORT_CATEGORY_NAME.SOCIAL_PERSON_WITH_DISABILITY,
    category: 'Social / Public Assistance',
    keywords: ['pwd', 'disabled', 'person with disability', 'wheelchair', 'needs assistance'],
    icon: 'accessibility',
    color: '#EC4899',
  },
  {
    emoji: '🧒',
    title: REPORT_CATEGORY_NAME.SOCIAL_LOST_CHILD,
    category: 'Social / Public Assistance',
    keywords: ['lost child', 'missing child', 'found child', 'naligaw na bata', 'child safe'],
    icon: 'person_search',
    color: '#10B981',
  },
  {
    emoji: '🚏',
    title: REPORT_CATEGORY_NAME.SOCIAL_STRANDED_COMMUTER,
    category: 'Social / Public Assistance',
    keywords: ['stranded', 'commuter', 'passenger', 'walang masakyan', 'needs ride', 'stuck commuter'],
    icon: 'directions_walk',
    color: '#3B82F6',
  },
  {
    emoji: '🤲',
    title: REPORT_CATEGORY_NAME.SOCIAL_PERSON_ASKING_AID,
    category: 'Social / Public Assistance',
    keywords: ['asking for aid', 'food assistance', 'shelter', 'help needed', 'nagugutom', 'needs support'],
    icon: 'volunteer_activism',
    color: '#F59E0B',
  },
  {
    emoji: '🔥',
    title: REPORT_CATEGORY_NAME.WITNESS_SMALL_FIRE_OBSERVED,
    category: 'Fire & Accident (Witness Mode)',
    keywords: ['fire', 'small fire', 'flames', 'burning', 'nakikitang sunog', 'may apoy'],
    icon: 'local_fire_department',
    color: '#DC2626',
  },
  {
    emoji: '🔥🧯',
    title: REPORT_CATEGORY_NAME.WITNESS_FIRE_JUST_STARTED,
    category: 'Fire & Accident (Witness Mode)',
    keywords: ['fire started', 'contained fire', 'small blaze', 'naagapan', 'controlled fire'],
    icon: 'fire_extinguisher',
    color: '#DC2626',
  },
  {
    emoji: '🚗',
    title: REPORT_CATEGORY_NAME.WITNESS_ROAD_ACCIDENT_OBSERVED,
    category: 'Fire & Accident (Witness Mode)',
    keywords: ['road accident', 'car crash', 'collision', 'banggaan', 'injuries unknown'],
    icon: 'directions_car',
    color: '#DC2626',
  },
  {
    emoji: '🤕',
    title: REPORT_CATEGORY_NAME.WITNESS_PERSON_INJURED_CONSCIOUS,
    category: 'Fire & Accident (Witness Mode)',
    keywords: ['injured person', 'conscious', 'hurt', 'may sugat', 'bleeding', 'needs first aid'],
    icon: 'healing',
    color: '#DC2626',
  },
  {
    emoji: '🚑⚠️',
    title: REPORT_CATEGORY_NAME.WITNESS_PERSON_COLLAPSED,
    category: 'Fire & Accident (Witness Mode)',
    keywords: ['collapsed', 'needs help', 'medical assistance', 'nahimatay', 'unconscious', 'emergency'],
    icon: 'emergency',
    color: '#DC2626',
  },
  {
    emoji: '🚴',
    title: REPORT_CATEGORY_NAME.TRAFFIC_BLOCKED_BIKE_LANES,
    category: 'Traffic / Transport',
    keywords: ['bike lane', 'blocked bike lane', 'bicycle lane', 'bike obstruction', 'blocked for bikes'],
    suggestion: true,
    icon: 'directions_bike',
    color: '#EC4899',
  },
  {
    emoji: '🚌',
    title: REPORT_CATEGORY_NAME.TRAFFIC_PUBLIC_TRANSPORT,
    category: 'Traffic / Transport',
    keywords: ['public transport', 'bus', 'jeepney', 'transportation', 'commute', 'transport issue'],
    suggestion: true,
    icon: 'directions_bus',
    color: '#2563EB',
  },
  {
    emoji: '👤',
    title: REPORT_CATEGORY_NAME.SOCIAL_DISRESPECTFUL_SERVICE_STAFF,
    category: 'Social / Public Assistance',
    keywords: ['disrespectful', 'rude staff', 'bad service', 'staff attitude', 'impolite', 'rude'],
    suggestion: true,
    icon: 'person',
    color: '#D97706',
  },
  {
    emoji: '⏱️',
    title: REPORT_CATEGORY_NAME.OTHER_BUREAUCRATIC_DELAYS,
    category: 'City / Public Facilities',
    keywords: ['delays', 'bureaucratic', 'slow service', 'red tape', 'long waiting'],
    suggestion: true,
    icon: 'hourglass_bottom',
    color: '#10B981',
  },
  {
    emoji: '⚖️',
    title: REPORT_CATEGORY_NAME.SOCIAL_UNFAIR_TREATMENT,
    category: 'Social / Public Assistance',
    keywords: ['unfair', 'unfair treatment', 'discrimination', 'injustice'],
    suggestion: true,
    icon: 'gavel',
    color: '#8B5CF6',
  },
  {
    emoji: '🔊',
    title: REPORT_CATEGORY_NAME.SANITATION_LOUD_NOISE,
    category: 'Sanitation / Environment',
    keywords: ['noise', 'loud noise', 'loud speaker', 'noisy', 'sound pollution', 'usok'],
    suggestion: true,
    icon: 'volume_up',
    color: '#DC2626',
  },
  {
    emoji: '⚠️',
    title: REPORT_CATEGORY_NAME.WITNESS_ROWDY_RECKLESS_BEHAVIOR,
    category: 'Fire & Accident (Witness Mode)',
    keywords: ['rowdy', 'reckless', 'unruly', 'disorderly', 'aggressive behavior'],
    suggestion: true,
    icon: 'warning',
    color: '#EA580C',
  },
  {
    emoji: '🚗💨',
    title: REPORT_CATEGORY_NAME.TRAFFIC_SPEEDING_RECKLESS_DRIVING,
    category: 'Traffic / Transport',
    keywords: ['speeding', 'reckless driving', 'fast driver', 'dangerous driving'],
    suggestion: true,
    icon: 'speed',
    color: '#F97316',
  },
  {
    emoji: '📱',
    title: REPORT_CATEGORY_NAME.OTHER_OTHERS,
    category: 'Other Issues',
    keywords: ['other', 'misc', 'miscellaneous', 'other issue', 'different', 'iba pa'],
    suggestion: true,
    icon: 'apps',
    color: '#A78BFA',
  },
];

/**
 * Get all report categories
 */
export function getAllReportCategories(): ReportCategory[] {
  return REPORT_CATEGORIES;
}

/**
 * Get report categories by category type
 */
export function getReportCategoriesByType(categoryType: string): ReportCategory[] {
  return REPORT_CATEGORIES.filter((report) => report.category.toLowerCase() === categoryType.toLowerCase());
}

/**
 * Get unique category types
 */
export function getUniqueCategoryTypes(): string[] {
  return [...new Set(REPORT_CATEGORIES.map((report) => report.category))];
}
