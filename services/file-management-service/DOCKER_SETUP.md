# Docker Setup for File Management Service

## File Persistence with Docker Volumes

### Local Development Setup

Add this to `docker-compose.local.yml`:

```yaml
file-management-service:
  build: ./services/file-management-service
  container_name: file-management-service
  ports:
    - "3006:3006"
  environment:
    - NODE_ENV=local
    - MONGODB_URI=mongodb://mongodb:27017
    - STORAGE_PROVIDER=LOCAL
    - LOCAL_STORAGE_PATH=/app/uploads
  volumes:
    - file_uploads:/app/uploads  # Persistent volume for uploaded files
  depends_on:
    - mongodb
  networks:
    - gov-ph-network

volumes:
  file_uploads:  # Named volume for persistent storage
    driver: local
