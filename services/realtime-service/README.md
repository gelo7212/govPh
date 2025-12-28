# Realtime Service

Real-time communication microservice for managing SOS requests. Provides WebSocket connections for live location tracking, status updates, and messaging between citizens and rescuers.

## Overview

The Realtime Service handles:
- **Real-time SOS coordination** via Socket.IO
- **Location streaming** with throttling
- **Status updates** and state management
- **Presence tracking** via Redis
- **Internal HTTP API** for SOS MS integration

## Architecture

### Module Structure

```
src/
├── config/           # Configuration (Redis, Socket.IO, env)
├── errors/           # Error definitions
├── middleware/       # Express & Socket.IO middleware
├── modules/
│   └── sos/         # SOS realtime context
├── socket/          # Socket.IO managers & events
├── services/        # Redis, token, SOS MS client
├── types/           # TypeScript definitions
└── utils/           # Logger, validators, constants
```

## Features

### ✅ WebSocket Events

#### SOS Events
- `sos:init` - Initialize SOS real-time context
- `sos:close` - Close SOS room
- `sos:status:update` - Update SOS status
- `sos:status:broadcast` - Broadcast status change

#### Location Events
- `location:update` - Send location update (throttled to 1s)
- `location:broadcast` - Broadcast location to room

#### System Events
- `ping` / `pong` - Connection health check
- `heartbeat` - Client heartbeat
- `heartbeat:ack` - Server acknowledgment

### ✅ Internal HTTP API

All endpoints protected by `X-Internal-Token` header.

```http
POST   /internal/realtime/sos/init           # Initialize SOS
POST   /internal/realtime/sos/:sosId/close   # Close SOS
POST   /internal/realtime/sos/:sosId/status  # Update status
GET    /internal/realtime/sos/:sosId/state   # Get SOS state
```

### ✅ Redis State Management

- `sos:state:{sosId}` - SOS state (24h TTL)
- `user:presence:{userId}` - User presence (1h TTL)
- `sos:rooms` - Active SOS rooms

## Configuration

### Environment Variables

```env
NODE_ENV=development
PORT=3000

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

INTERNAL_AUTH_TOKEN=your-internal-secret-key
SOS_MS_URL=http://localhost:3001

CORS_ORIGIN=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

## Development

### Setup

```bash
npm install
```

### Run

```bash
# Development
npm run dev

# Build
npm run build

# Start
npm start
```

### Test

```bash
npm test
```

## Socket.IO Authentication

Clients must provide a JWT token in the handshake:

```javascript
// Client
const socket = io('http://localhost:3000', {
  auth: {
    token: jwtToken
  }
});
```

Token payload must include:
```json
{
  "userId": "citizen-123",
  "sosId": "sos-456",
  "role": "citizen"
}
```

## Integration with SOS MS

The Realtime Service calls the SOS MS for:
- Verifying SOS existence
- Retrieving SOS details
- Notifying of realtime events

### Internal Communication

SOS MS → Realtime Service:
```http
POST /internal/realtime/sos/init
POST /internal/realtime/sos/:sosId/close
POST /internal/realtime/sos/:sosId/status
```

Realtime Service → SOS MS:
```http
GET /internal/sos/{sosId}
POST /internal/realtime/event
```

## Performance Considerations

### Throttling
- Location updates: 1 second throttle
- Prevents excessive broadcast traffic

### Presence Expiration
- User presence auto-expires after 1 hour inactivity
- Cleanup on disconnect

### Redis TTL
- SOS state: 24 hours (reduced to 1h after closure)
- User presence: 1 hour
- Auto-cleanup via Redis expiration

## Deployment

### Docker

```bash
# Build
docker build -t realtime-service:latest .

# Run
docker run \
  -p 3000:3000 \
  -e REDIS_HOST=redis \
  -e INTERNAL_AUTH_TOKEN=secret \
  realtime-service:latest
```

### Health Checks

```http
GET /health    # Service status
GET /ready     # Readiness probe
```

## Troubleshooting

### Socket Connection Issues
1. Check auth token is valid
2. Verify CORS origin configuration
3. Check Socket.IO logs

### Redis Connection
1. Verify Redis is running
2. Check host/port configuration
3. Review Redis logs

### Location Updates Not Broadcasting
1. Verify socket is in correct room (`sos:{sosId}`)
2. Check throttle isn't blocking events
3. Verify user role permissions

## Future Enhancements

- [ ] Message history in Redis
- [ ] User activity analytics
- [ ] Automatic room cleanup
- [ ] Socket.IO adapter for clustering
- [ ] WebRTC for voice/video signaling
- [ ] Persistent message queue (e.g., RabbitMQ)
