#!/bin/bash
# Rollback script for production environments
# Usage: ./rollback.sh <previous-version>

set -e

VERSION=${1:-latest}
DOCKER_IMAGE="danishansari/scrunchcreate:${VERSION}"
COMPOSE_FILE="docker-compose.yml"

echo "🔄 Rolling back ScrunchCreate to version ${VERSION}..."
echo "📦 Using image: ${DOCKER_IMAGE}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Backup current version
echo ""
echo "💾 Backing up current version..."
CURRENT_IMAGE=$(docker-compose -f ${COMPOSE_FILE} images -q scrunchcreate-web)
if [ -n "$CURRENT_IMAGE" ]; then
    BACKUP_TAG=$(date +%Y%m%d-%H%M%S)
    docker tag ${CURRENT_IMAGE} danishansari/scrunchcreate:backup-${BACKUP_TAG}
    print_status "Current version backed up as backup-${BACKUP_TAG}"
else
    print_status "No current image to backup"
fi

# Stop current containers
echo ""
echo "🛑 Stopping current containers..."
docker-compose -f ${COMPOSE_FILE} down || true
print_status "Containers stopped"

# Pull rollback image
echo ""
echo "📥 Pulling rollback image..."
docker pull ${DOCKER_IMAGE}
print_status "Rollback image ready"

# Start with rollback image
echo ""
echo "🚀 Starting containers with rollback version..."
docker-compose -f ${COMPOSE_FILE} up -d
print_status "Containers started"

# Wait for application to be ready
echo ""
echo "⏳ Waiting for application to become healthy..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost/health 2>/dev/null; then
        print_status "Application is healthy!"
        break
    fi
    attempt=$((attempt + 1))
    echo "⏳ Health check attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Application failed to become healthy after rollback"
    docker-compose logs scrunchcreate-web
    exit 1
fi

# Verify rollback
echo ""
echo "📊 Verifying rollback..."
docker-compose ps
print_status "Rollback verified"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "🔙 Rolled back to version: ${VERSION}"
echo "💾 Previous version backed up"
echo ""
