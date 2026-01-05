import { Schema, Document } from 'mongoose';

export interface ICityConfig extends Document {
  cityCode: string;
  cityId: string;
  incident: {
    allowAnonymous: boolean;
    allowOutsideCityReports: boolean;
    autoAssignDepartment: boolean;
    requireCityVerificationForResolve: boolean;
  };
  sos: {
    allowAnywhere: boolean;
    autoAssignNearestHQ: boolean;
    escalationMinutes: number;
    allowProvinceFallback: boolean;
  };
  visibility: {
    showIncidentsOnPublicMap: boolean;
    showResolvedIncidents: boolean;
  };
  setup: {
    isInitialized: boolean;
    currentStep: 'CITY_PROFILE' | 'DEPARTMENTS' | 'SOS_HQ' | 'SETTINGS' | 'COMPLETED';
    completedSteps: string[];
    initializedAt?: Date;
    initializedByUserId?: string;
  };
  isActive: boolean;
  updatedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CityConfigSchema = new Schema(
  {
    cityCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    cityId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /* =========================
       INCIDENT RULES
    ========================= */

    incident: {
      allowAnonymous: {
        type: Boolean,
        default: true,
      },

      allowOutsideCityReports: {
        type: Boolean,
        default: false, // LOCKED by default
      },

      autoAssignDepartment: {
        type: Boolean,
        default: true,
      },

      requireCityVerificationForResolve: {
        type: Boolean,
        default: true, // YOU REQUIRE THIS
      },
    },

    /* =========================
       SOS RULES
    ========================= */

    sos: {
      allowAnywhere: {
        type: Boolean,
        default: true,
      },

      autoAssignNearestHQ: {
        type: Boolean,
        default: true,
      },

      escalationMinutes: {
        type: Number,
        default: 10,
      },

      allowProvinceFallback: {
        type: Boolean,
        default: true,
      },
    },

    /* =========================
       VISIBILITY & TRANSPARENCY
    ========================= */

    visibility: {
      showIncidentsOnPublicMap: {
        type: Boolean,
        default: true,
      },

      showResolvedIncidents: {
        type: Boolean,
        default: true,
      },
    },

    /* =========================
       SETUP & INITIALIZATION
    ========================= */

    setup: {
      isInitialized: {
        type: Boolean,
        default: false,
      },

      currentStep: {
        type: String,
        enum: [
          'CITY_PROFILE',
          'DEPARTMENTS',
          'SOS_HQ',
          'SETTINGS',
          'COMPLETED',
        ],
        default: 'CITY_PROFILE',
      },

      completedSteps: {
        type: [String],
        default: [],
      },

      initializedAt: {
        type: Date,
      },

      initializedByUserId: {
        type: String,
      },
    },

    /* =========================
       META
    ========================= */

    isActive: {
      type: Boolean,
      default: true,
    },

    updatedByUserId: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'city_configs',
  },
);
