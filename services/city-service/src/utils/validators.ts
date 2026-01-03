export function validateCityCode(cityCode: string): boolean {
  return /^[A-Z]{2}\d{4}$/.test(cityCode);
}

export function validateProvinceCode(provinceCode: string): boolean {
  return /^[A-Z]{2}$/.test(provinceCode);
}

export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function validateScopeLevel(scopeLevel: string): boolean {
  return ['CITY', 'PROVINCE'].includes(scopeLevel);
}

export default {
  validateCityCode,
  validateProvinceCode,
  validateCoordinates,
  validateScopeLevel,
};
