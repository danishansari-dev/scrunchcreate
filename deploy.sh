#!/bin/bash
# Deploy script for production environments
# Usage: ./deploy.sh <environment> <version>

set -e

ENVIRONMENT=${1:-development}
VERSION=${2:-latest}
DOCKER_IMAGE="danishansari/scrunchcreate:${VERSION}"
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Deploying ScrunchCreate to ${ENVIRONMENT}..."
echo "📦 Using image: ${DOCKER_IMAGE}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Pre-deployment checks
echo ""
echo "📋 Running pre-deployment checks..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_status "Docker is installed"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_status "Docker Compose is installed"

# Stop and remove old containers
echo ""
echo "🛑 Stopping old containers..."
docker-compose -f ${COMPOSE_FILE} down || true
print_status "Old containers stopped"

# Pull latest image
echo ""
echo "📥 Pulling Docker image..."
docker pull ${DOCKER_IMAGE} || {
    print_warn "Failed to pull image ${DOCKER_IMAGE}"
    print_warn "Attempting to build locally..."
    docker build -t ${DOCKER_IMAGE} .
}
print_status "Docker image ready"

# Start new containers
echo ""
echo "🚀 Starting new containers..."
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
    print_error "Application failed to become healthy"
    docker-compose logs scrunchcreate-web
    exit 1
fi

# Post-deployment checks
echo ""
echo "📊 Running post-deployment checks..."

# Check container status
echo ""
echo "Container Status:"
docker-compose ps

# Check application response
echo ""
print_status "Testing application endpoints..."
curl -s http://localhost/ > /dev/null && print_status "Main app is responding" || print_error "Main app not responding"
curl -s http://localhost/health > /dev/null && print_status "Health check endpoint is responding" || print_error "Health check not responding"

# Cleanup old images
echo ""
echo "🧹 Cleaning up old images..."
docker image prune -f --filters "dangling=true" || true
print_status "Cleanup complete"

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment to ${ENVIRONMENT} completed!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "📍 Application URL:"
echo "   Main: http://localhost"
echo "   Health: http://localhost/health"
echo "   Proxy: http://localhost:8080"
echo ""
echo "📋 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop containers:"
echo "   docker-compose down"
echo ""
