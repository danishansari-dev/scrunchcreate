# Docker & Jenkins Configuration Reference

## Quick Start Commands

```bash
# Build and start locally
docker-compose -f devops/docker/docker-compose.yml up -d

# View running containers
docker-compose -f devops/docker/docker-compose.yml ps

# Check application health
curl http://localhost/health

# View logs
docker-compose -f devops/docker/docker-compose.yml logs -f

# Stop containers
docker-compose -f devops/docker/docker-compose.yml down

# Build image manually
docker build -f devops/docker/Dockerfile -t scrunchcreate:latest .

# Run image directly
docker run -p 80:80 scrunchcreate:latest

# Push to Docker Hub
docker tag scrunchcreate:latest danishansari/scrunchcreate:latest
docker push danishansari/scrunchcreate:latest
```

## Jenkins Webhook Test

After setting up GitHub webhook, you can manually test:

1. Go to your GitHub repository
2. Settings → Webhooks
3. Select the webhook
4. Click "Recent Deliveries"
5. View response details

Or use curl:
```bash
curl -X POST http://your-jenkins-server/github-webhook/ \
  -H "Content-Type: application/json" \
  -d @payload.json
```

## Environment Variables

Create a `.env` file for docker-compose (optional):
```env
NODE_ENV=production
DOCKER_IMAGE=danishansari/scrunchcreate:latest
PORT=80
```

## Port Mapping

| Service | Internal | External | Purpose |
|---------|----------|----------|---------|
| Web App | 80 | 80 | Main application |
| Proxy | 8080 | 8080 | Reverse proxy |
| Nginx | 443 | 443 | SSL/TLS (future) |

## Docker Image Layers

```
FROM node:20-alpine         → ~150MB
COPY package.json          → +minimal
RUN npm install            → +300MB (dev deps)
COPY src/                  → +minimal
RUN npm run build          → ~50MB dist
---
FROM nginx:alpine          → ~40MB
COPY dist /usr/share       → ~50MB (final)
EXPOSE 80                  → final image ~150MB
```

## Health Check Details

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s    # Check every 30 seconds
  timeout: 5s      # Wait 5 seconds for response
  retries: 3       # Fail after 3 retries
  start_period: 10s # Wait 10s before first check
```

Container states:
- **starting**: Initial 10s period
- **healthy**: Passed health check
- **unhealthy**: Failed after retries
- **stopped**: Container stopped

## Network Details

```
Docker Network: scrunchcreate-network (bridge)
├── scrunchcreate-web (internal port 80)
└── scrunchcreate-proxy (internal port 8080)

Both containers can communicate via DNS:
- web container: http://scrunchcreate-web:80
- proxy container: http://scrunchcreate-proxy:8080
```

## Volume Management

```yaml
volumes:
  nginx-logs:
    driver: local
    # Location: /var/lib/docker/volumes/scrunchcreate_nginx-logs/_data
```

Mount logs for debugging:
```bash
docker-compose -f devops/docker/docker-compose.yml exec scrunchcreate-web cat /var/log/nginx/access.log
```

## Performance Tuning

### Nginx
```nginx
# In nginx.conf
worker_connections 1024;  # Increase for high traffic
keepalive_timeout 65;      # Connection timeout

# Caching
location ~* \.(js|css|png|jpg)$ {
  expires 30d;
  add_header Cache-Control "public, immutable";
}
```

### Docker
```dockerfile
# Multi-stage build reduces final image size
# Alpine images are ~5MB base vs 150MB for full Node
# 2 stage build: 450MB → 150MB final size
```

## Logging

View logs with:
```bash
# All services
docker-compose -f devops/docker/docker-compose.yml logs

# Specific service
docker-compose -f devops/docker/docker-compose.yml logs scrunchcreate-web

# Follow mode
docker-compose -f devops/docker/docker-compose.yml logs -f

# Last 100 lines
docker-compose -f devops/docker/docker-compose.yml logs --tail=100

# Timestamps
docker-compose -f devops/docker/docker-compose.yml logs -t

# Specific time range
docker-compose -f devops/docker/docker-compose.yml logs --since 2025-11-13T10:00:00
```

## Debugging

```bash
# SSH into container
docker-compose -f devops/docker/docker-compose.yml exec scrunchcreate-web sh

# Inside container, useful commands:
curl http://localhost/health
ps aux  # view running processes
cat /var/log/nginx/error.log
cat /var/log/nginx/access.log

# Check environment
printenv | grep NODE_ENV
```

## Resource Limits

Add to `devops/docker/docker-compose.yml` for production:
```yaml
services:
  scrunchcreate-web:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Production Checklist

- [ ] Change `NODE_ENV` to production
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure secret credentials in Jenkins
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation (ELK Stack)
- [ ] Enable database backups
- [ ] Set up CDN for static assets
- [ ] Configure DNS and load balancing
- [ ] Implement rate limiting in Nginx
- [ ] Set up automated security scanning
- [ ] Configure database disaster recovery
- [ ] Document runbooks for common issues
- [ ] Set up alerting for health checks
- [ ] Regular security patching schedule
- [ ] Load testing before production launch
