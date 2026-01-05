import { Model } from 'mongoose';
import { ICity } from '../modules/cities/city.schema';
import { IDepartment } from '../modules/departments/department.schema';
import { ISosHQ } from '../modules/sos-hq/sos-hq.schema';
import { ICityConfig } from '../modules/city-config/city-config.schema';

export { ICity, IDepartment, ISosHQ, ICityConfig };

export type CityModel = Model<ICity>;
export type DepartmentModel = Model<IDepartment>;
export type SosHQModel = Model<ISosHQ>;
export type CityConfigModel = Model<ICityConfig>;
