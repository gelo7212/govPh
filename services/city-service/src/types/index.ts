import { Model, Document } from 'mongoose';

export interface ICity extends Document {
  cityCode: string;
  name: string;
  provinceCode: string;
  centerLocation: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartment extends Document {
  cityCode: string;
  code: string;
  name: string;
  handlesIncidentTypes: string[];
  sosCapable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISosHQ extends Document {
  scopeLevel: 'CITY' | 'PROVINCE';
  cityCode?: string;
  provinceCode?: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  coverageRadiusKm?: number;
  supportedDepartmentCodes: string[];
  isMain: boolean;
  isTemporary: boolean;
  isActive: boolean;
  activatedAt?: Date;
  deactivatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CityModel = Model<ICity>;
export type DepartmentModel = Model<IDepartment>;
export type SosHQModel = Model<ISosHQ>;
