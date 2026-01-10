export const MESSAGE_INTENDED_FOR = {
  CITIZEN: 'CITIZEN',
  RESCUER: 'RESCUER',
  ADMIN: 'ADMIN',
  SOS_HQ: 'SOS_HQ',
} as const;

const INPUT_TYPES = {
  TEXT: 'TEXT',
  PHONE_NUMBER: 'PHONE_NUMBER',
  EMAIL: 'EMAIL',
} as const;

const PROMPT_TYPES = {
  CONSENT_CONFIRMATION: 'CONSENT_CONFIRMATION',
  INPUT_REQUEST: 'INPUT_REQUEST',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
} as const;
// systemMessages.ts

type SystemMessage = {
  content: string | ((params: { sosId: string }) => string);
  contentType: 'text' | 'system';
    options?: {
    intendedFor: keyof typeof MESSAGE_INTENDED_FOR;
    promptType: keyof typeof PROMPT_TYPES;
    promptKey: string;
    inputType?: keyof typeof INPUT_TYPES;
    suggestions?: string[];
  };
};

export const SYSTEM_MESSAGES : Record<string, SystemMessage> = {
  SOS_CREATED: {
    content: ({ sosId }: { sosId: string }) =>
      [
        '🚨 New SOS created successfully.',
        '',
        `🆔 SOS ID: ${sosId}`,
        '',
        '📞 For faster communication, you can share your mobile number.',
        '',
        'ℹ️ Tips to help us assist you quicker:',
        '• Clearly describe your situation and urgency',
        '• Stay active in the chat for updates',
        '• Follow any instructions given by the rescue team',
        '',
        'Our support team has been notified and will reach out as soon as possible.'
      ].join('\n'),

    contentType: 'text'
  },

  SHARE_PHONE_NUMBER_CONSENT: {
    content:
      'Would you like to share your phone number with the rescuer?',

    contentType: 'text',

    options: {
      intendedFor: 'CITIZEN',
      promptType: 'CONSENT_CONFIRMATION',
      promptKey: 'SHARE_PHONE_NUMBER',
      suggestions: [
        'Share saved number',
        'Use another number',
        'Cancel'
      ]
    }
  },

  REQUEST_PHONE_NUMBER: {
    content:
      'Please enter the phone number you want to share with the rescuer.',

    contentType: 'text',

    options: {
      intendedFor: 'CITIZEN',
      promptType: 'INPUT_REQUEST',
      inputType: 'PHONE_NUMBER',
      promptKey: 'REQUEST_PHONE_NUMBER'
    }
  },

  CITIZEN_ACTION_REQUIRED: {
    content:
      'Have you been contacted by the rescuer?',

    contentType: 'text',

    options: {
      intendedFor: 'CITIZEN',
      promptType: 'SINGLE_CHOICE',
      promptKey: 'CITIZEN_ACTION_REQUIRED',
      suggestions: ['Yes', 'No']
    }
  },

  CITIZEN_URGENCY_CHECK: {
    content:
      'Are you in immediate danger right now?',

    contentType: 'text',

    options: {
      intendedFor: 'CITIZEN',
      promptType: 'SINGLE_CHOICE',
      promptKey: 'CITIZEN_URGENCY',
      suggestions: [
        'No',
        'Can wait',
        'Immediately need help'
      ]
    }
  }
} as const;
