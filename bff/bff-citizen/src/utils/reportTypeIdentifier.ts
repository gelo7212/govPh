/**
 * Report Type and Severity Identifier Utility
 * Maps report categories to incident types and severity levels
 */

import { REPORT_CATEGORY_NAME } from './report.category.names';

export type IncidentType = 'emergency' | 'disaster' | 'accident' | 'crime' | 'medical' | 'other';
export type Severity = 'low' | 'medium' | 'high';

interface ReportTypeMapping {
  reportCategory: string;
  incidentType: IncidentType;
  severity: Severity;
}

// Mapping of report categories to incident types and severity levels
const REPORT_TYPE_MAPPINGS: ReportTypeMapping[] = [
  // Infrastructure / Public Works - Low to Medium
  { reportCategory: REPORT_CATEGORY_NAME.INFRASTRUCTURE_ROAD_BLOCKED, incidentType: 'accident', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.INFRASTRUCTURE_BROKEN_STREET_LIGHTS, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.INFRASTRUCTURE_OPEN_OR_DAMAGED_MANHOLE, incidentType: 'accident', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.INFRASTRUCTURE_DAMAGED_OR_OBSTRUCTED_SIDEWALKS, incidentType: 'accident', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.INFRASTRUCTURE_FLOODED_ROAD, incidentType: 'disaster', severity: 'medium' },

  // Traffic / Transport - Low to Medium
  { reportCategory: REPORT_CATEGORY_NAME.TRAFFIC_ILLEGAL_PARKING, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.TRAFFIC_LIGHT_NOT_WORKING, incidentType: 'accident', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.TRAFFIC_ROAD_OBSTRUCTION, incidentType: 'accident', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.TRAFFIC_VEHICLE_ACCIDENT, incidentType: 'accident', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.TRAFFIC_VEHICLE_STALLED, incidentType: 'accident', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.TRAFFIC_BLOCKED_BIKE_LANES, incidentType: 'accident', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.TRAFFIC_PUBLIC_TRANSPORT, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.TRAFFIC_SPEEDING_RECKLESS_DRIVING, incidentType: 'accident', severity: 'high' },

  // Utilities - Medium
  { reportCategory: REPORT_CATEGORY_NAME.UTILITIES_LOCALIZED_POWER_OUTAGE, incidentType: 'other', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.UTILITIES_DARK_STREET, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.UTILITIES_WATER_SUPPLY_INTERRUPTION, incidentType: 'other', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.UTILITIES_DANGLING_WIRES, incidentType: 'emergency', severity: 'high' },

  // Sanitation / Environment - Low to Medium
  { reportCategory: REPORT_CATEGORY_NAME.SANITATION_UNCOLLECTED_GARBAGE, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.SANITATION_DAMAGE_OR_OPEN_DRAINAGE, incidentType: 'accident', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.SANITATION_ILLEGAL_DUMPING, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.SANITATION_SMOKE_SMALL_BURNING, incidentType: 'accident', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.SANITATION_LOUD_NOISE, incidentType: 'other', severity: 'low' },

  // City / Public Facilities - Low to Medium
  { reportCategory: REPORT_CATEGORY_NAME.FACILITIES_SCHOOL_DAMAGE, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.FACILITIES_BARANGAY_HALL_ISSUE, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.FACILITIES_EVACUATION_CENTER_ISSUE, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.FACILITIES_SAFETY_CONCERN, incidentType: 'accident', severity: 'high' },

  // Social / Public Assistance - Low to Medium
  { reportCategory: REPORT_CATEGORY_NAME.SOCIAL_ELDERLY_ASSISTANCE, incidentType: 'other', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.SOCIAL_PERSON_WITH_DISABILITY, incidentType: 'other', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.SOCIAL_LOST_CHILD, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.SOCIAL_STRANDED_COMMUTER, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.SOCIAL_PERSON_ASKING_AID, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.SOCIAL_DISRESPECTFUL_SERVICE_STAFF, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.SOCIAL_UNFAIR_TREATMENT, incidentType: 'other', severity: 'low' },

  // Fire & Accident (Witness Mode) - Medium to High
  { reportCategory: REPORT_CATEGORY_NAME.WITNESS_SMALL_FIRE_OBSERVED, incidentType: 'emergency', severity: 'high' },
  { reportCategory: REPORT_CATEGORY_NAME.WITNESS_FIRE_JUST_STARTED, incidentType: 'emergency', severity: 'high' },
  { reportCategory: REPORT_CATEGORY_NAME.WITNESS_ROAD_ACCIDENT_OBSERVED, incidentType: 'accident', severity: 'medium' },
  { reportCategory: REPORT_CATEGORY_NAME.WITNESS_PERSON_INJURED_CONSCIOUS, incidentType: 'medical', severity: 'high' },
  { reportCategory: REPORT_CATEGORY_NAME.WITNESS_PERSON_COLLAPSED, incidentType: 'medical', severity: 'high' },
  { reportCategory: REPORT_CATEGORY_NAME.WITNESS_ROWDY_RECKLESS_BEHAVIOR, incidentType: 'other', severity: 'medium' },

  // Other
  { reportCategory: REPORT_CATEGORY_NAME.OTHER_BUREAUCRATIC_DELAYS, incidentType: 'other', severity: 'low' },
  { reportCategory: REPORT_CATEGORY_NAME.OTHER_OTHERS, incidentType: 'other', severity: 'low' },
];

/**
 * Identifies incident type and severity based on report category
 * @param reportCategory - The report category title
 * @returns Object with incidentType and severity, or null if not found
 */
export function identifyReportTypeAndSeverity(reportCategory: string): { incidentType: IncidentType; severity: Severity } | null {
  const mapping = REPORT_TYPE_MAPPINGS.find(
    (m) => m.reportCategory.toLowerCase() === reportCategory.toLowerCase()
  );

  return mapping ? { incidentType: mapping.incidentType, severity: mapping.severity } : null;
}

/**
 * Identifies incident type and severity based on keyword matching
 * @param keywords - Array of keywords from the report
 * @param category - Optional category hint
 * @returns Object with incidentType and severity, or default if not confidently identified
 */
export function identifyByKeywords(
  keywords: string[],
  category?: string
): { incidentType: IncidentType; severity: Severity } {
  const keywordLower = keywords.map((k) => k.toLowerCase());

  // High severity keywords
  const highSeverityKeywords = [
    'fire', 'sunog', 'apoy', 'injured', 'sugat', 'bleeding', 'unconscious', 'collapsed',
    'nahimatay', 'emergency', 'dangling wire', 'live wire', 'electrical hazard', 'dangerous',
    'speeding', 'reckless', 'unsafe', 'delikado', 'exposed wire'
  ];

  // Medical keywords
  const medicalKeywords = [
    'injured', 'collapsed', 'unconscious', 'medical', 'help needed', 'emergency assistance',
    'sugat', 'nahimatay', 'first aid', 'bleeding', 'accident', 'emergency'
  ];

  // Fire/Emergency keywords
  const fireKeywords = [
    'fire', 'burning', 'flames', 'sunog', 'apoy', 'smoke', 'usok'
  ];

  // Disaster keywords
  const disasterKeywords = [
    'flood', 'baha', 'natural disaster', 'typhoon', 'earthquake', 'landslide'
  ];

  // Crime keywords
  const crimeKeywords = [
    'crime', 'theft', 'robbery', 'illegal', 'theft', 'holdup', 'assault'
  ];

  // Check for high severity
  const hasHighSeverity = keywordLower.some((k) =>
    highSeverityKeywords.some((h) => k.includes(h))
  );

  // Determine incident type
  let incidentType: IncidentType = 'other';

  if (keywordLower.some((k) => medicalKeywords.some((m) => k.includes(m)))) {
    incidentType = 'medical';
  } else if (keywordLower.some((k) => fireKeywords.some((f) => k.includes(f)))) {
    incidentType = 'emergency';
  } else if (keywordLower.some((k) => disasterKeywords.some((d) => k.includes(d)))) {
    incidentType = 'disaster';
  } else if (keywordLower.some((k) => crimeKeywords.some((c) => k.includes(c)))) {
    incidentType = 'crime';
  } else if (category) {
    // Use category as fallback hint
    if (category.toLowerCase().includes('medical') || category.toLowerCase().includes('accident')) {
      incidentType = 'accident';
    }
  }

  // Determine severity
  const severity: Severity = hasHighSeverity ? 'high' : 'medium';

  return { incidentType, severity };
}

/**
 * Gets all available incident types
 */
export function getIncidentTypes(): IncidentType[] {
  return ['emergency', 'disaster', 'accident', 'crime', 'medical', 'other'];
}

/**
 * Gets all available severity levels
 */
export function getSeverityLevels(): Severity[] {
  return ['low', 'medium', 'high'];
}

/**
 * Validates if a type is a valid incident type
 */
export function isValidIncidentType(type: string): type is IncidentType {
  return getIncidentTypes().includes(type as IncidentType);
}

/**
 * Validates if a severity is valid
 */
export function isValidSeverity(severity: string): severity is Severity {
  return getSeverityLevels().includes(severity as Severity);
}

/**
 * Gets all report categories with their mappings
 */
export function getAllReportMappings(): ReportTypeMapping[] {
  return REPORT_TYPE_MAPPINGS;
}
