# CI/CD Pipeline Setup Guide - Academic Project

**Note:** This is a simplified CI/CD setup for academic/demo purposes only. Not for production use.

## Overview

Simple CI/CD pipeline for ScrunchCreate React application:
- **Continuous Integration**: Automated build and test
- **Docker Containerization**: Simple Docker setup
- **Localhost Deployment**: Runs on localhost for demo

## Architecture

```
GitHub Repository
    ↓
Jenkins (CI/CD)
    ├── Build & Test
    ├── Docker Build
    └── Deploy to Localhost
```

## Files Included

### 1. **Dockerfile**
**Location:** `devops/docker/Dockerfile`
- Simple single-stage build
- Uses Node 20 Alpine
- Serves with Vite preview server (port 4173)

### 2. **docker-compose.yml**
**Location:** `devops/docker/docker-compose.yml`
- Simple single-service setup
- Runs React app on localhost:4173

### 3. **Jenkinsfile**
**Location:** `devops/Jenkinsfile`
Pipeline stages:
- Checkout
- Environment Setup
- Install Dependencies
- Lint (ESLint)
- Build (Vite)
- Test (placeholder)
- Build Docker Image
- Deploy to Localhost

## Getting Started

### Prerequisites
- Jenkins server
- Docker and Docker Compose
- GitHub repository access

### Step 1: Jenkins Setup

1. **Install Required Plugins:**
   - GitHub Integration Plugin
   - Docker Plugin
   - Docker Compose Plugin

2. **Create Jenkins Job:**
   - New Item → Pipeline
   - Select "Pipeline script from SCM"
   - Repository URL: `https://github.com/danishansari-dev/scrunchcreate.git`
   - Script Path: `devops/Jenkinsfile`

### Step 2: GitHub Webhook Setup

1. Go to your GitHub repository
2. Settings → Webhooks → Add webhook
3. Payload URL: `http://your-jenkins-server/github-webhook/`
4. Content type: `application/json`
5. Select "Push events"

### Step 3: Local Testing

Test Docker setup locally:

```bash
# Build and start container
docker-compose -f devops/docker/docker-compose.yml up -d --build

# Check status
docker-compose -f devops/docker/docker-compose.yml ps

# View logs
docker-compose -f devops/docker/docker-compose.yml logs -f

# Access application
# Open browser: http://localhost:4173

# Stop containers
docker-compose -f devops/docker/docker-compose.yml down
```

## Pipeline Stages

1. **Checkout** - Clone code from GitHub
2. **Environment Setup** - Verify Node.js, npm, Docker versions
3. **Install Dependencies** - Run `npm install`
4. **Lint** - ESLint code quality check (non-blocking)
5. **Build** - Compile React app with Vite
6. **Test** - Placeholder for tests
7. **Build Docker Image** - Create Docker image
8. **Deploy to Localhost** - Start container on localhost:4173

## Accessing the Application

After deployment:
- **Main App**: http://localhost:4173

## Troubleshooting

### Docker Build Fails
```bash
# Check Docker daemon
docker ps

# Rebuild without cache
docker-compose -f devops/docker/docker-compose.yml build --no-cache
```

### Application Won't Start
```bash
# Check logs
docker-compose -f devops/docker/docker-compose.yml logs

# Check if port 4173 is available
netstat -an | grep 4173
```

### Jenkins Can't Find Docker
```bash
# Ensure Jenkins user has Docker permissions (Linux)
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### GitHub Webhook Not Triggering
1. Verify webhook URL is accessible
2. Check Jenkins GitHub plugin configuration
3. Test payload delivery in GitHub webhook settings

## Quick Commands

```bash
# Build image manually
docker build -f devops/docker/Dockerfile -t scrunchcreate:latest .

# Run container manually
docker run -p 4173:4173 scrunchcreate:latest

# View running containers
docker-compose -f devops/docker/docker-compose.yml ps

# Stop containers
docker-compose -f devops/docker/docker-compose.yml down
```

---

**Last Updated**: November 2025  
**Purpose**: Academic Project Demo
