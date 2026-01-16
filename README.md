docker compose -f docker-compose.local.yml up --build
docker compose -f docker-compose.local.yml down

docker compose -f docker-compose.prod.yml up -d


sudo certbot certonly   --manual   --preferred-challenges dns   -d e-citizen.click   -d pilot.e-citizen.click   -d api.pilot.admin.e-citizen.click   -d api.pilot.citizen.e-citizen.click


# View files in the container
docker exec file-management-service ls -la /app/uploads/

# Backup files to host
docker cp file-management-service:/app/uploads ./uploads-backup