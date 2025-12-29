import * as mongoose from 'mongoose';

const IncidentTimelineSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },

        incidentId: {
            type: String,
            required: true,
            index: true,
        },

        eventType: {
            type: String,
            enum: [
                'created',
                'status_changed',
                'assigned',
                'unassigned',
                'acknowledged',
                'comment_added',
                'attachment_added',
                'location_updated',
                'severity_updated',
                'responder_arrived',
                'responder_departed',
                'resolved',
                'rejected',
                'cancelled',
                'other',
            ],
            required: true,
            index: true,
        },

        actor: {
            actorType: {
                type: String,
                enum: ['citizen', 'guest', 'admin', 'rescuer', 'system'],
                required: true,
            },
            actorId: { type: String, sparse: true },
        },

        payload: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        collection: 'incident_timelines',
        timestamps: false,
    }
);

IncidentTimelineSchema.index({ incidentId: 1, createdAt: 1 });

export { IncidentTimelineSchema };
