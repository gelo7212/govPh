/**
 * Service Type Definitions
 */

export type ServiceCategory = 'health' | 'education' | 'employment' | string;

export interface ServiceFormConfig {
  formId: string;
  version?: number;
}

export interface ServiceAvailability {
  startAt?: Date;
  endAt?: Date;
}

export interface ServiceEntity {
  id?: string;
  _id?: string;
  cityId: string;
  code: string; // MED_ASSIST, SCHOLAR, JOBS, etc.
  title: string;
  shortDescription: string;
  category: ServiceCategory;
  icon?: string;
  isActive: boolean;
  
  // informational form (NO submission)
  infoForm?: ServiceFormConfig;
  
  // application form (WITH submission)
  applicationForm?: ServiceFormConfig;
  
  availability?: ServiceAvailability;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateServiceRequest {
  cityId: string;
  code: string;
  title: string;
  shortDescription: string;
  category: ServiceCategory;
  icon?: string;
  infoForm?: ServiceFormConfig;
  applicationForm?: ServiceFormConfig;
  availability?: ServiceAvailability;
}

export interface UpdateServiceRequest {
  code?: string;
  title?: string;
  shortDescription?: string;
  category?: ServiceCategory;
  icon?: string;
  infoForm?: ServiceFormConfig;
  applicationForm?: ServiceFormConfig;
  availability?: ServiceAvailability;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
  count?: number;
  pagination?: {
    total?: number;
    limit: number;
    skip: number;
  };
}
