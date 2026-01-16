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
  cityEServiceConfig?: {
    isEnabled: boolean;
    hasOwnEServicePortal: boolean;
    servicesPortal:{
      url: string;
      apiKey?: string;
      name?: string;
    }[];
  };
  officials?: 
    {
      name: string;
      photoUrl?: string;

      position: string;      // e.g. "Mayor", "SB Member", "Mayor’s Assistant"
      group: string;         // e.g. "Executive", "Sangguniang Bayan", "Mayor Staff"

      order?: number;        // for display sorting
      isPrimary?: boolean;   // highlight mayor / vice mayor
    }[];

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

    /* =========================
       CITY OFFICIALS
    ========================= */
    officials: {
      type: [
        {
          name: { type: String, required: true },
          photoUrl: { type: String },
          position: { type: String, required: true },
          group: { type: String, required: true },
          order: { type: Number, required: true },
          isPrimary: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    /* =========================
       CITY E-SERVICE CONFIG
    ========================= 
     */
    cityEServiceConfig: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      hasOwnEServicePortal: {
        type: Boolean,
        default: false,
      },
      servicesPortal: [
        {
          url: {
            type: String,
            required: true,
          },
          apiKey: {
            type: String,
          },
          name: {
            type: String,
            default: '',
          },
        },
      ],
    },
  },
  {
    timestamps: true,
    collection: 'city_configs',
  },
);
