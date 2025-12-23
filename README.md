docker compose -f docker-compose.local.yml up --build
docker compose -f docker-compose.local.yml down

docker compose -f docker-compose.prod.yml up -d
