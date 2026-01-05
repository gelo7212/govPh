/**
 * City Aggregator Types
 * Specialized types for city aggregation operations
 */

import {
  CityData,
  DepartmentData,
  SosHQData,
  CityConfigData,
} from '../types/city.types';

export interface CompleteCitySetup {
  city: CityData;
  config: CityConfigData;
  departments: DepartmentData[];
  sosHQ: SosHQData[];
}

export interface CompleteCitySetupResponse {
  success: boolean;
  data?: CompleteCitySetup;
  error?: string;
}
