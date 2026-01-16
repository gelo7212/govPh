/**
 * City Service Types
 */

export interface CityLocation {
  lat: number;
  lng: number;
}

export interface CityData {
  cityCode: string;
  cityId: string;
  name: string;
  provinceCode: string;
  centerLocation: CityLocation;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityRequest {
  cityCode: string;
  cityId: string;
  name: string;
  provinceCode: string;
  centerLocation: CityLocation;
}

export interface UpdateCityRequest extends Partial<CreateCityRequest> {
  isActive?: boolean;
}

export interface DepartmentData {
  _id?: string;
  cityCode: string;
  cityId: string;
  code: string;
  name: string;
  handlesIncidentTypes: string[];
  sosCapable: boolean;
  isActive: boolean;
  contactNumber: string;
  address: string;
  location: CityLocation;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  cityCode: string;
  cityId: string;
  code: string;
  name: string;
  handlesIncidentTypes?: string[];
  sosCapable?: boolean;
  contactNumber?: string;
  address?: string;
  location?: CityLocation;
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  isActive?: boolean;
}

export interface SosHQLocation {
  lat: number;
  lng: number;
}

export interface SosHQData {
  _id?: string;
  scopeLevel: 'CITY' | 'PROVINCE';
  cityCode?: string;
  cityId?: string;
  provinceCode?: string;
  name: string;
  location: SosHQLocation;
  coverageRadiusKm?: number;
  supportedDepartment: {
    id: string;
    name: string;
    code: string;
  }[];
  isMain: boolean;
  isTemporary: boolean;
  contactNumber: string;
  address: string;
  isActive: boolean;
  activatedAt?: string;
  deactivatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSosHQRequest {
  scopeLevel: 'CITY' | 'PROVINCE';
  cityCode?: string;
  cityId?: string;
  provinceCode?: string;
  name: string;
  location: SosHQLocation;
  coverageRadiusKm?: number;
  supportedDepartment?: {
    id: string;
    name: string;
    code: string;
  }[] ;
  isMain?: boolean;
  isTemporary?: boolean;
  contactNumber?: string;
  address?: string;
}

export interface UpdateSosHQRequest extends Partial<CreateSosHQRequest> {
  isActive?: boolean;
}

export interface CityConfigIncidentRules {
  allowAnonymous: boolean;
  allowOutsideCityReports: boolean;
  autoAssignDepartment: boolean;
  requireCityVerificationForResolve: boolean;
}

export interface CityConfigSosRules {
  allowAnywhere: boolean;
  autoAssignNearestHQ: boolean;
  escalationMinutes: number;
  allowProvinceFallback: boolean;
}

export interface CityConfigVisibilityRules {
  showIncidentsOnPublicMap: boolean;
  showResolvedIncidents: boolean;
}

export interface CityConfigSetup {
  isInitialized: boolean;
  currentStep: 'CITY_PROFILE' | 'DEPARTMENTS' | 'SOS_HQ' | 'SETTINGS' | 'COMPLETED';
  completedSteps: string[];
  initializedAt?: string;
  initializedByUserId?: string;
}

export interface CityConfigData {
  cityCode: string;
  cityId: string;
  incident?: CityConfigIncidentRules;
  sos?: CityConfigSosRules;
  visibility?: CityConfigVisibilityRules;
  setup?: CityConfigSetup;
  isActive: boolean;
  updatedByUserId?: string;
  createdAt: string;
  updatedAt: string;
  cityEServiceConfig?: {
    isEnabled: boolean;
    hasOwnEServicePortal: boolean;
    servicesPortal:{
      url: string;
      apiKey?: string;
      name?: string;
    }[];
  };
}

export interface CreateCityConfigRequest {
  cityCode: string;
  cityId: string;
  incident?: Partial<CityConfigIncidentRules>;
  sos?: Partial<CityConfigSosRules>;
  visibility?: Partial<CityConfigVisibilityRules>;
  cityEServiceConfig?: {
    isEnabled: boolean;
    hasOwnEServicePortal: boolean;
    servicesPortal:{
      url: string;
      apiKey?: string;
      name?: string;
    }[];
  };
}

export interface UpdateCityConfigRequest extends Partial<CreateCityConfigRequest> {
  isActive?: boolean;
  updatedByUserId?: string;
}

// API Response Envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

export interface CityResponse<T = CityData> extends ApiResponse<T> {}
export interface DepartmentResponse<T = DepartmentData> extends ApiResponse<T> {}
export interface SosHQResponse<T = SosHQData> extends ApiResponse<T> {}
export interface CityConfigResponse<T = CityConfigData> extends ApiResponse<T> {}
