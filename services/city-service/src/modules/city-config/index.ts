import mongoose from 'mongoose';
import { CityConfigSchema } from './city-config.schema';
import { CityConfigService } from './city-config.service';
import { CityConfigController } from './city-config.controller';

const CityConfig = mongoose.model('CityConfig', CityConfigSchema);
const cityConfigService = new CityConfigService(CityConfig as any);
export const cityConfigController = new CityConfigController(
  cityConfigService,
);
export { cityConfigService };
