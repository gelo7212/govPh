# Dual Kong Gateway - Quick Reference

## Summary of Changes

### Architecture: Client → NGINX → Kong (Citizen/Admin) → BFF Services

## Created Files
- `gateway/kong.citizen.local.yml`
- `gateway/kong.admin.local.yml`
- `gateway/kong.citizen.pilot.yml`
- `gateway/kong.admin.pilot.yml`
- `gateway/kong.citizen.prod.yml`
- `gateway/kong.admin.prod.yml`

## Modified Files
- `docker-compose.local.yml` - Split single Kong into kong-citizen + kong-admin
- `docker-compose.pilot.yml` - Same split for pilot
- `docker-compose.prod.yml` - Same split for production
- `nginx/nginx.conf` - Routing to separate Kong upstreams
- `nginx/nginx.pilot.conf` - Updated for pilot domains
- `nginx/nginx.prod.conf` - Updated for production domains

## Local Testing
```bash
# Start all services
docker compose -f docker-compose.local.yml up -d

# Test citizen API (localhost:80)
curl -H "Host: citizen.localhost" http://localhost/api/health

# Test admin API (localhost:80)
curl -H "Host: admin.localhost" http://localhost/api/health

# WebSocket test (citizen)
curl -H "Host: citizen.localhost" http://localhost/

# WebSocket test (admin)
curl -H "Host: admin.localhost" http://localhost/
```

## Service Status
```bash
# Check Kong Citizen
docker ps | grep kong-citizen

# Check Kong Admin
docker ps | grep kong-admin

# View Kong logs
docker logs govph-kong-citizen
docker logs govph-kong-admin

# View NGINX logs
docker logs govph-nginx
```

## Routing Rules

| Path | Local | Pilot | Production |
|------|-------|-------|------------|
| Citizen API | citizen.localhost:80 | api.pilot.citizen.e-citizen.click | citizen.gov.ph |
| Admin API | admin.localhost:80 | api.pilot.admin.e-citizen.click | admin.gov.ph |
| Citizen WS | citizen.localhost:80 | api.pilot.citizen.e-citizen.click | citizen.gov.ph |
| Admin WS | admin.localhost:80 | api.pilot.admin.e-citizen.click | admin.gov.ph |

## Configuration Details

### Kong Citizen
- Upstream: `kong_citizen:8000`
- Backend: `govph-bff-citizen:3000`
- Route paths: `/api`, `/`

### Kong Admin
- Upstream: `kong_admin:8000`
- Backend: `govph-bff-admin:3000`
- Route paths: `/api`, `/`

### NGINX
- Listens on port 80 (HTTP) and 443 (HTTPS)
- Routes based on `server_name` (hostname)
- Proxies to appropriate Kong based on domain
- Handles WebSocket upgrade automatically

## Plugin Configuration (Both Kong Instances)

### CORS
- Origins: `*`
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: All (`*`)
- Credentials: Disabled

### Rate Limiting
- Local: 100 r/s API, 50 r/s WebSocket
- Pilot: 100 r/s API, 50 r/s WebSocket
- Production: 50 r/s API, 30 r/s WebSocket

## Common Issues & Solutions

### Kong Won't Start
- Check volume mounts in docker-compose
- Verify configuration file syntax
- Check Docker disk space

### NGINX Can't Reach Kong
- Verify Kong containers are running
- Check network connectivity: `docker network inspect govph-network`
- Ensure upstream addresses match container names

### WebSocket Not Working
- Verify `proxy_http_version 1.1` is set
- Check `Upgrade` and `Connection` headers are proxied
- Ensure WebSocket port (80/443) matches NGINX listener

## Rollback (If Needed)
1. Stop services: `docker compose down`
2. Restore old Kong configuration
3. Update docker-compose to use single Kong
4. Update nginx config to single upstream
5. Restart: `docker compose up -d`

## Next Steps
1. Test all endpoints locally
2. Deploy to pilot environment
3. Verify SSL certificates are configured
4. Test pilot endpoints
5. Deploy to production
6. Monitor Kong logs for any issues

## Monitoring Commands
```bash
# Watch Kong logs in real-time
docker logs -f govph-kong-citizen

# Count requests to Kong
docker logs govph-kong-citizen | grep "POST\|GET\|PUT\|DELETE" | wc -l

# Check NGINX upstream status
docker exec govph-nginx curl http://localhost:8000/status

# View Kong routes
docker exec govph-kong-citizen kong config db export /tmp/kong.yml
```

## Performance Notes
- Each Kong instance uses separate process (no shared state)
- Rate limiting is per-instance (not global)
- Both Kong instances can run on same machine or different machines
- Recommended: 2-4 Kong instances per BFF in production
