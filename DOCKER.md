# Running APHRDI backend with Docker (development)

This project supports running locally with Docker Compose. The container reads environment variables from a `.env` file in the project root (do NOT commit that file).

Quick steps (PowerShell):

```powershell
# Build & start in detached mode
docker-compose up --build -d

# Check container status
docker ps --filter "name=aphrdi-backend-api"

# Verify the health endpoint (this repo exposes /health)
Invoke-WebRequest -Uri http://localhost:5000/health -UseBasicParsing | Select-Object -ExpandProperty Content

# Tail logs
docker-compose logs --tail=100 -f api

# Stop containers
docker-compose down
```

Notes
- Keep your `.env` out of version control. For production, use your cloud provider's secrets manager.
- `docker-compose.yml` now includes a `restart: unless-stopped` policy for the `api` service.
- If you change server code, re-run `docker-compose up --build -d` to rebuild the image.
