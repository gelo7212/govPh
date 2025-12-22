export interface Province {
  code: string;
  name: string;
  region: string;
}

export interface Municipality {
  code: string;
  name: string;
  type: string;                // "Mun", "City", "SGU"
  district: string;            // "1st", "2nd", "3rd", "Lone"
  zip_code: string;            // Postal code
  region: string;              // Region name
  province: string;            // Province name
}

export interface Barangay {
  _id?: string;
  code: string;
  name: string;
  municipalityCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BoundariesQuery {
  provinceCode?: string;
  municipalityCode?: string;
}
