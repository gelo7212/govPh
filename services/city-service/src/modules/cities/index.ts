import mongoose from 'mongoose';
import { CitySchema } from './city.schema';
import { CityService } from './city.service';
import { CityController } from './city.controller';

const City = mongoose.model('City', CitySchema);
const cityService = new CityService(City as any);
export const cityController = new CityController(cityService);
