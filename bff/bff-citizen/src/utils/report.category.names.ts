/**
 * Shared collection of report category names
 * Used across report-categories.ts and reportTypeIdentifier.ts
 */
export const REPORT_CATEGORY_NAME = {
  // Infrastructure / Public Works
  INFRASTRUCTURE_ROAD_BLOCKED: 'Road blocked (fallen tree, debris)',
  INFRASTRUCTURE_BROKEN_STREET_LIGHTS: 'Broken Street Lights',
  INFRASTRUCTURE_OPEN_OR_DAMAGED_MANHOLE: 'Open or damaged manhole',
  INFRASTRUCTURE_DAMAGED_OR_OBSTRUCTED_SIDEWALKS: 'Damaged or Obstructed Sidewalks',
  INFRASTRUCTURE_FLOODED_ROAD: 'Flooded road (passable, no one trapped)',

  // Traffic / Transport
  TRAFFIC_ILLEGAL_PARKING: 'Illegal parking',
  TRAFFIC_LIGHT_NOT_WORKING: 'Traffic light not working',
  TRAFFIC_ROAD_OBSTRUCTION: 'Road obstruction affecting traffic',
  TRAFFIC_VEHICLE_ACCIDENT: 'Vehicle accident (no visible injuries)',
  TRAFFIC_VEHICLE_STALLED: 'Vehicle stalled in dangerous area',
  TRAFFIC_BLOCKED_BIKE_LANES: 'Blocked Bike Lanes',
  TRAFFIC_PUBLIC_TRANSPORT: 'Public Transport',
  TRAFFIC_SPEEDING_RECKLESS_DRIVING: 'Speeding/Reckless Driving',

  // Utilities
  UTILITIES_LOCALIZED_POWER_OUTAGE: 'Localized power outage',
  UTILITIES_DARK_STREET: 'Dark Street',
  UTILITIES_WATER_SUPPLY_INTERRUPTION: 'Water supply interruption',
  UTILITIES_DANGLING_WIRES: 'Dangling Wires',

  // Sanitation / Environment
  SANITATION_UNCOLLECTED_GARBAGE: 'Uncollected Garbage',
  SANITATION_DAMAGE_OR_OPEN_DRAINAGE: 'Damage or Open Drainage',
  SANITATION_ILLEGAL_DUMPING: 'Illegal dumping',
  SANITATION_SMOKE_SMALL_BURNING: 'Smoke / small burning (no spread, no victims)',
  SANITATION_LOUD_NOISE: 'Loud Noise/Speaker',

  // City / Public Facilities
  FACILITIES_SCHOOL_DAMAGE: 'School facility damage',
  FACILITIES_BARANGAY_HALL_ISSUE: 'Barangay hall or office issue',
  FACILITIES_EVACUATION_CENTER_ISSUE: 'Evacuation center maintenance issue',
  FACILITIES_SAFETY_CONCERN: 'Public facility safety concern',

  // Social / Public Assistance
  SOCIAL_ELDERLY_ASSISTANCE: 'Elderly person needing assistance',
  SOCIAL_PERSON_WITH_DISABILITY: 'Person with disability needing help',
  SOCIAL_LOST_CHILD: 'Lost child (found and safe)',
  SOCIAL_STRANDED_COMMUTER: 'Stranded commuter (safe location)',
  SOCIAL_PERSON_ASKING_AID: 'Person asking for aid (food, shelter, basic help)',
  SOCIAL_DISRESPECTFUL_SERVICE_STAFF: 'Disrespectful Service Staff',
  SOCIAL_UNFAIR_TREATMENT: 'Unfair Treatment',

  // Fire & Accident (Witness Mode)
  WITNESS_SMALL_FIRE_OBSERVED: 'Small fire observed (witness report)',
  WITNESS_FIRE_JUST_STARTED: 'Fire just started / contained',
  WITNESS_ROAD_ACCIDENT_OBSERVED: 'Road accident observed (injuries unknown)',
  WITNESS_PERSON_INJURED_CONSCIOUS: 'Person injured but conscious (witness report)',
  WITNESS_PERSON_COLLAPSED: 'Person collapsed, help needed',
  WITNESS_ROWDY_RECKLESS_BEHAVIOR: 'Rowdy/Reckless Behavior',

  // Other
  OTHER_BUREAUCRATIC_DELAYS: 'Bureaucratic Delays',
  OTHER_OTHERS: 'Others',
} as const;