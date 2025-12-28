# Nginx Reverse Proxy Configuration

This directory contains the Nginx reverse proxy setup for the Gov-PH SOS system.

## Architecture

```
┌─────────────────────────────────────┐
│      Mobile/Web Client              │
│   (HTTPS/WSS - port 443)            │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │      NGINX      │
        │  (Reverse Proxy)│
        │  (port 80, 443) │
        └────────┬────────┘
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   /socket.io        /api/*
        │                 │
        ▼                 ▼
   Realtime Service    Kong
   (port 3000)      (port 8000)
   (Socket.IO)      (REST API)
        │                 │
        ▼                 ▼
     Redis            BFF Services
```

## Features

✅ **TLS/SSL Termination** - Handles HTTPS encryption
✅ **WebSocket Proxy** - Routes `/socket.io` traffic to Realtime Service  
✅ **REST API Proxy** - Routes `/api/*` traffic to Kong Gateway  
✅ **Rate Limiting** - Prevents abuse (100r/s for API, 50r/s for WebSocket)  
✅ **Security Headers** - X-Frame-Options, CSP, HSTS, etc.  
✅ **Compression** - Gzip compression for faster responses  
✅ **Health Checks** - Monitors upstream services  
✅ **Load Balancing** - Least connections algorithm  
✅ **HTTP/2 & HTTP/1.1** - Modern protocol support  

## Setup

### Local Development

1. **Build the image:**
   ```bash
   docker build -f nginx/Dockerfile -t govph-nginx:latest ./nginx
   ```

2. **Update docker-compose.yml:**
   ```yaml
   services:
     nginx:
       build:
         context: ./nginx
         dockerfile: Dockerfile
       container_name: govph-nginx
       ports:
         - "80:80"
         - "443:443"
       depends_on:
         - kong
         - realtime-service
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Access:**
   - HTTPS: `https://localhost` (self-signed cert warning is normal)
   - REST API: `https://localhost/api/...`
   - WebSocket: `wss://localhost/socket.io`

### Production Setup

#### Option 1: Let's Encrypt with Certbot

1. **Install Certbot:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Generate certificate:**
   ```bash
   certbot certonly --standalone -d yourdomain.com
   ```

3. **Update docker-compose.yml:**
   ```yaml
   nginx:
     volumes:
       - /etc/letsencrypt:/etc/nginx/ssl:ro
       - /var/www/certbot:/var/www/certbot:ro
   ```

4. **Auto-renewal:**
   ```bash
   # Add to crontab
   0 0 1 * * certbot renew --quiet
   ```

#### Option 2: AWS ACM + ALB

Use AWS Application Load Balancer with ACM certificates instead of Nginx for TLS.

#### Option 3: Cloud Provider Managed Certificates

Use managed certificate services (Google Cloud, Azure, DigitalOcean, etc.)

## Configuration Files

| File | Purpose |
|------|---------|
| `nginx.conf` | Main Nginx configuration |
| `Dockerfile` | Container image definition |
| `docker-compose.example.yml` | Docker Compose integration example |

## Rate Limiting

**API Endpoints** (`/api/*`)
- Limit: 100 requests/second per IP
- Burst: 50 additional requests allowed
- Zone: `api_limit`

**WebSocket** (`/socket.io`)
- Limit: 50 connections/second per IP
- Burst: 20 additional allowed
- Zone: `ws_limit`

Adjust in `nginx.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req_zone $binary_remote_addr zone=ws_limit:10m rate=50r/s;
```

## Security Headers

The following headers are automatically added:

```
X-Frame-Options: SAMEORIGIN          # Prevent clickjacking
X-Content-Type-Options: nosniff       # Prevent MIME sniffing
X-XSS-Protection: 1; mode=block       # XSS protection
Referrer-Policy: no-referrer-when-downgrade
```

For production, enable HSTS:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## WebSocket Configuration

Critical WebSocket settings in nginx.conf:

```nginx
# Upgrade connection to WebSocket protocol
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

# High timeouts for persistent connections
proxy_connect_timeout 7d;
proxy_send_timeout 7d;
proxy_read_timeout 7d;

# No buffering for real-time data
proxy_buffering off;
```

## Upstream Service Health

Nginx monitors upstream services:

```nginx
upstream realtime_backend {
    least_conn;
    server govph-realtime:3000 max_fails=3 fail_timeout=30s;
}
```

- Marks server as down after 3 failed requests
- Attempts recovery after 30 seconds
- Uses least connections load balancing

## Monitoring

### Access Logs
```bash
docker logs govph-nginx
# Or
docker exec govph-nginx tail -f /var/log/nginx/access.log
```

### Error Logs
```bash
docker exec govph-nginx tail -f /var/log/nginx/error.log
```

### Health Check
```bash
curl -k https://localhost/health
# Response: healthy
```

## Troubleshooting

### Self-signed Certificate Warning
In local development, browsers warn about self-signed certificates. This is normal.

**Bypass for testing:**
```bash
curl -k -X GET https://localhost/health
```

### 502 Bad Gateway
Upstream service is down. Check:
```bash
docker ps | grep govph
docker logs govph-kong
docker logs govph-realtime
```

### WebSocket Connection Refused
- Ensure realtime-service is running
- Check firewall rules for port 443
- Verify client is using `wss://` (not `ws://`)

### Rate Limiting Too Strict
Adjust limits in `nginx.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=200r/s;  # Increase
```

## Performance Tuning

### Worker Processes
```nginx
worker_processes auto;  # Uses CPU count
```

### Connection Limits
```nginx
events {
    worker_connections 1024;  # Per worker
    use epoll;  # Linux optimized
}
```

### Buffer Sizes
```nginx
client_max_body_size 20M;  # Max upload size
```

### Compression
Already enabled for:
- text/plain, text/css, text/xml
- application/json, application/javascript
- Images, fonts

## Client Usage

### JavaScript/Web
```javascript
import io from 'socket.io-client';

const socket = io('https://yourdomain.com', {
  secure: true,
  rejectUnauthorized: false, // Only for self-signed certs in dev
});

socket.on('connect', () => console.log('Connected!'));
socket.emit('sos:init', { sosId: '...', userId: '...' });
```

### REST API
```javascript
const response = await fetch('https://yourdomain.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: '...', password: '...' })
});
```

## References

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Socket.IO Behind a Reverse Proxy](https://socket.io/docs/v4/reverse-proxy/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Security Headers](https://securityheaders.com/)
