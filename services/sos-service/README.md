# SOS Service

Emergency SOS and rescue coordination microservice for the Gov-Ph platform.

## Features

- Real-time emergency request handling
- Live location tracking and map integration
- Role-based access control (Admin, Rescuer, Citizen)
- WebSocket support for real-time updates
- Message communication between parties
- Rescue dispatch and assignment

## Architecture

```
src/
├── server.ts          # Entry point
├── app.ts             # Express app setup
├── config/            # Configuration
├── modules/           # Business logic (SOS, Messages, Tracking)
├── services/          # External service clients
├── middleware/        # Express middleware
├── utils/             # Utility functions
└── errors/            # Custom error classes
```

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Validation**: Joi
- **CORS**: CORS middleware

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB 5.0+ (Local or MongoDB Atlas)

### Installation

```bash
npm install
```

### Database Setup

#### Local MongoDB
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas
- Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Set `MONGODB_URI` in your `.env`

### Development

```bash
npm run dev
```

The service will start on `http://localhost:3001` and connect to MongoDB.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017/sos-service)
- `NODE_ENV` - Environment (development, production)
- `IDENTITY_SERVICE_URL` - Identity service endpoint
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARN, ERROR)

## API Endpoints

### SOS Management
- `POST /api/sos` - Create SOS request
- `GET /api/sos` - List all requests
- `GET /api/sos/:id` - Get request details
- `PATCH /api/sos/:id` - Update request
- `DELETE /api/sos/:id` - Cancel request

### Health Check
- `GET /health` - Service health status

## WebSocket Events

### Emit (Client → Server)
- `sos:create` - New SOS request
- `location:update` - Location update
- `message:send` - Send message

### Listen (Server → Client)
- `sos:new-request` - New request received
- `sos:assigned` - Request assigned
- `location:updated` - Location update
- `message:received` - New message

## Role-Based Access

### Citizen
- Create SOS requests
- Share real-time location
- Send/receive messages

### Rescuer
- View assigned requests
- Update location
- Communicate with dispatcher and citizen

### Admin
- View all requests
- Assign rescuers
- Monitor real-time tracking
- Manage system

## Documentation

- [SOS Flow](./docs/sos-flow.md) - Request lifecycle and API details
- [Rescue UX](./docs/rescue-ux.md) - User experience documentation

## Testing

```bash
npm test
```

## Code Quality

```bash
npm run lint
npm run format
```

## Contributing

1. Create a feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request

## License

ISC
