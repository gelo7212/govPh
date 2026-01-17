# Dual Kong Gateway Architecture - Implementation Guide

## Overview
This document describes the enhanced nginx and Kong configuration that implements a dual-gateway architecture with separate Kong instances for Citizen and Admin services.

## Architecture Diagram
```
Client (HTTP/HTTPS)
  ↓
NGINX (Reverse Proxy & Router)
  ├─→ Kong Citizen (Port 8000)  ─→ BFF Citizen Service
  │
  └─→ Kong Admin (Port 8000)    ─→ BFF Admin Service
```

## Files Modified/Created

### New Kong Configuration Files

#### Local Environment
- **gateway/kong.citizen.local.yml** - Kong configuration for Citizen service (local)
- **gateway/kong.admin.local.yml** - Kong configuration for Admin service (local)

#### Pilot Environment
- **gateway/kong.citizen.pilot.yml** - Kong configuration for Citizen service (pilot)
- **gateway/kong.admin.pilot.yml** - Kong configuration for Admin service (pilot)

#### Production Environment
- **gateway/kong.citizen.prod.yml** - Kong configuration for Citizen service (production)
- **gateway/kong.admin.prod.yml** - Kong configuration for Admin service (production)

### Updated Docker Compose Files

#### docker-compose.local.yml
- Replaced single `kong` service with `kong-citizen` and `kong-admin`
- Updated nginx dependencies to reference both Kong services
- Each Kong instance mounts its respective configuration file

#### docker-compose.pilot.yml
- Similar changes for pilot environment with appropriate container naming

#### docker-compose.prod.yml
- Similar changes for production environment with appropriate container naming

### Updated Nginx Configuration Files

#### nginx/nginx.conf (Local)
- Added separate upstream blocks for `kong_citizen` and `kong_admin`
- Updated citizen HTTP/HTTPS server blocks to use `kong_citizen` upstream
- Updated admin HTTP/HTTPS server blocks to use `kong_admin` upstream
- Both route through their respective domains (citizen.localhost, admin.localhost)

#### nginx/nginx.pilot.conf (Pilot)
- Added separate upstream blocks for `kong_citizen` and `kong_admin`
- Created separate server blocks for:
  - `api.pilot.citizen.e-citizen.click` → Kong Citizen
  - `api.pilot.admin.e-citizen.click` → Kong Admin
- Configured both HTTP and HTTPS variants

#### nginx/nginx.prod.conf (Production)
- Added separate upstream blocks for `kong_citizen` and `kong_admin`
- Created separate server blocks for:
  - `citizen.gov.ph` / `www-citizen.gov.ph` → Kong Citizen
  - `admin.gov.ph` / `www-admin.gov.ph` → Kong Admin
- Configured SSL with Let's Encrypt certificates for each domain
- Implemented strong security headers and HSTS

## Service Isolation

### Kong Citizen Gateway
- **Container Name**: govph-kong-citizen (or with env suffix)
- **Port**: 8000 (internal, accessed via nginx)
- **Backend**: BFF Citizen Service
- **Configuration**: Routes based on hostname (citizen.localhost for local)

### Kong Admin Gateway
- **Container Name**: govph-kong-admin (or with env suffix)
- **Port**: 8000 (internal, accessed via nginx)
- **Backend**: BFF Admin Service
- **Configuration**: Routes based on hostname (admin.localhost for local)

## Nginx Routing Logic

### Local Environment
- **citizen.localhost/api/** → Kong Citizen → BFF Citizen
- **admin.localhost/api/** → Kong Admin → BFF Admin
- **Both** support WebSocket connections to realtime-service

### Pilot Environment
- **api.pilot.citizen.e-citizen.click/api/** → Kong Citizen → BFF Citizen
- **api.pilot.admin.e-citizen.click/api/** → Kong Admin → BFF Admin

### Production Environment
- **citizen.gov.ph/api/** → Kong Citizen → BFF Citizen
- **admin.gov.ph/api/** → Kong Admin → BFF Admin
- SSL certificates required for each domain

## Deployment Instructions

### Local Development
```bash
# Start services with new dual-Kong setup
docker compose -f docker-compose.local.yml up -d

# Verify Kong instances are running
docker ps | grep kong

# Test citizen endpoint
curl -H "Host: citizen.localhost" http://localhost/api/health

# Test admin endpoint
curl -H "Host: admin.localhost" http://localhost/api/health
```

### Pilot Environment
```bash
# Update and start pilot services
docker compose -f docker-compose.pilot.yml up -d

# Verify routing
curl -H "Host: api.pilot.citizen.e-citizen.click" https://localhost/api/health
curl -H "Host: api.pilot.admin.e-citizen.click" https://localhost/api/health
```

### Production Environment
```bash
# Ensure SSL certificates are properly configured
# Update domain names in nginx.prod.conf if different

docker compose -f docker-compose.prod.yml up -d

# Verify HTTPS endpoints
curl https://citizen.gov.ph/api/health
curl https://admin.gov.ph/api/health
```

## Rate Limiting Configuration

Both Kong instances have identical rate-limiting configurations:
- **Default**: 10,000 requests per minute per IP
- **API Limit**: 100 r/s (local), 50 r/s (production)
- **WebSocket Limit**: 50 r/s (local), 30 r/s (production)

## CORS Configuration

Both Kong instances allow:
- **Origins**: `*` (all origins)
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: All headers (`*`)
- **Credentials**: False (can be enabled per environment)

## Health Checks

### Nginx Health Check
- **Endpoint**: `/health`
- **Response**: Plain text "healthy"
- **Interval**: 30 seconds

### Kong Health Check (Declarative Config)
- Each Kong instance monitors its backend BFF service
- Automatic service discovery and failover

## Benefits of This Architecture

1. **Isolation**: Separate Kong instances prevent cross-contamination between citizen and admin traffic
2. **Scalability**: Each gateway can be scaled independently
3. **Security**: Dedicated rate limiting and CORS policies per service
4. **Maintainability**: Clearer separation of concerns
5. **Routing**: NGINX efficiently routes based on hostname/domain
6. **WebSocket Support**: Both citizen and admin support real-time connections

## Troubleshooting

### Kong Container Not Starting
```bash
# Check logs
docker logs govph-kong-citizen
docker logs govph-kong-admin

# Verify configuration syntax
docker run --rm -v $(pwd)/gateway:/kong kong:3.6 kong config parse /kong/kong.citizen.local.yml
```

### Nginx Routing Issues
```bash
# Test upstream connectivity
docker exec govph-nginx curl -I http://govph-kong-citizen:8000

# Check nginx error logs
docker logs govph-nginx
```

### Certificate Issues (Production)
```bash
# Verify certificate files exist
ls -la /etc/letsencrypt/live/citizen.gov.ph/
ls -la /etc/letsencrypt/live/admin.gov.ph/

# Test SSL connection
curl -I https://citizen.gov.ph
curl -I https://admin.gov.ph
```

## Future Enhancements

1. **API Versioning**: Implement separate routes for different API versions
2. **Request Logging**: Add centralized logging to Kong plugins
3. **Circuit Breaker**: Implement circuit breaker patterns in Kong
4. **Service Mesh**: Consider migrating to Istio for advanced traffic management
5. **Load Balancing**: Implement active-active failover between Kong instances
6. **Metrics**: Add Prometheus metrics collection from Kong

## Notes

- WebSocket connections are properly proxied to realtime-service on both citizen and admin paths
- Each Kong instance has its own declarative configuration and does not share state
- The architecture supports horizontal scaling of Kong and BFF services
- Both services use the same realtime-service for real-time features
