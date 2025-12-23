export interface CreateProvinceDto {
  code: string;
  name: string;
  region: string;
}

export interface CreateMunicipalityDto {
  code: string;
  name: string;
  type: string;
  district: string;
  zip_code: string;
  region: string;
  province: string;
}

export interface CreateBarangayDto {
  code: string;
  name: string;
  municipalityCode: string;
}

export interface GetMunicipalitiesByProvinceQueryDto {
  province: string;
}

export interface GetBarangaysQueryDto {
  municipalityCode: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}
