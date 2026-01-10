/**
 * Application-wide constants
 */

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Location events
  LOCATION_UPDATE: 'location:update',
  LOCATION_BROADCAST: 'location:broadcast',

  // Rescuer location events
  RESCUER_LOCATION: 'rescuer:location',
  RESCUER_LOCATION_BROADCAST: 'rescuer:location:broadcast',

  // SOS events
  SOS_INIT: 'sos:init',
  SOS_CLOSE: 'sos:close',
  SOS_STATUS_UPDATE: 'sos:status:update',
  SOS_STATUS_BROADCAST: 'sos:status:broadcast',

  // Message events
  MESSAGE_SEND: 'message:send',
  MESSAGE_BROADCAST: 'message:broadcast',

  // Participant events
  PARTICIPANT_JOINED: 'participant:joined',
  PARTICIPANT_LEFT: 'participant:left',

  // System events
  RECONNECT_ATTEMPT: 'reconnect:attempt',
  ERROR: 'error',
};

export const REDIS_KEYS = {
  SOCKET_SESSIONS: 'socket:sessions',
  SOS_ROOMS: 'sos:rooms',
  USER_PRESENCE: 'user:presence',
  SOS_STATE: 'sos:state',
  RESCUER_LOCATION: 'rescuer:location',
};

export const HTTP_HEADERS = {
  INTERNAL_AUTH: 'x-internal-token',
  REQUEST_ID: 'x-request-id',
};

export const SOCKET_NAMESPACES = {
  ROOT: '/',
  SOS: '/sos',
};

export default {
  SOCKET_EVENTS,
  REDIS_KEYS,
  HTTP_HEADERS,
  SOCKET_NAMESPACES,
};
