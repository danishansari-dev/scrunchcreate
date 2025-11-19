# CI/CD Pipeline Setup Guide for ScrunchCreate

This guide explains the automated CI/CD pipeline setup using Jenkins and Docker for the ScrunchCreate e-commerce application.

## 📋 Overview

The pipeline includes:
- **Continuous Integration**: Automated code checkout, linting, building
- **Docker Containerization**: Multi-stage builds for optimized production images
- **Automated Testing**: Code quality checks and health verification
- **Container Registry**: Push to Docker Hub
- **Automated Deployment**: Development environment deployment with health checks
- **Production Readiness**: Tag-based production deployments

## 🏗️ Architecture

```
GitHub Repository
    ↓
Jenkins (CI/CD Orchestrator)
    ├── Build & Test
    ├── Docker Build & Push
    └── Deploy to Environment
        ├── Development (docker-compose)
        └── Production (SSH Deploy)
```

## 📦 Files Included

### 1. **Dockerfile**
**Location:** `devops/docker/Dockerfile`
Multi-stage build that:
- Builds React app with Node 20 Alpine
- Serves with Nginx Alpine (lightweight production image)
- Includes health checks
- ~150MB final image size

### 2. **docker-compose.yml**
**Location:** `devops/docker/docker-compose.yml`
Orchestrates:
- `scrunchcreate-web`: Main React application
- `nginx-proxy`: Reverse proxy for multiple services
- Networking and volume management
- Health checks and auto-restart policies

### 3. **nginx.conf**
**Location:** `devops/docker/nginx.conf`
Primary Nginx config with:
- Single-page app routing (SPA)
- Gzip compression
- Caching strategies
- Security headers
- Health endpoint

### 4. **nginx-proxy.conf**
**Location:** `devops/docker/nginx-proxy.conf`
Reverse proxy configuration:
- Upstream routing
- Logging
- Websocket support
- Security headers

### 5. **Jenkinsfile**
**Location:** `devops/Jenkinsfile`
Complete CI/CD pipeline with stages:
- Checkout
- Environment Setup
- Install Dependencies
- Lint (ESLint)
- Build (Vite)
- Test
- Docker Build
- Security Scanning
- Registry Push
- Development Deployment
- Health Checks
- Production Deployment
- Cleanup

## 🚀 Getting Started

### Prerequisites
- Jenkins server with Docker plugin installed
- Docker and Docker Compose
- GitHub repository access
- (Optional) Docker Hub account for image registry

### Step 1: Jenkins Setup

1. **Install Required Plugins:**
   - Docker Pipeline
   - GitHub
   - SSH Agent
   - Docker Scout (for vulnerability scanning)

2. **Configure Credentials in Jenkins:**
   ```
   Dashboard → Manage Jenkins → Manage Credentials
   ```
   
   Add the following:
   - **docker-username**: Your Docker Hub username
   - **docker-password**: Your Docker Hub password (use token for security)
   - **production-user**: SSH user for production server
   - **production-password**: SSH private key or password

3. **Create Jenkins Job:**
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

Test the Docker setup locally:

```bash
# Build and start containers
docker-compose -f devops/docker/docker-compose.yml up -d

# Check status
docker-compose -f devops/docker/docker-compose.yml ps

# View logs
docker-compose -f devops/docker/docker-compose.yml logs -f scrunchcreate-web

# Stop containers
docker-compose -f devops/docker/docker-compose.yml down

# Build image without compose
docker build -f devops/docker/Dockerfile -t scrunchcreate:latest .

# Run image
docker run -p 80:80 scrunchcreate:latest
```

## 📊 Pipeline Stages Explained

### 1. **Checkout**
Pulls latest code from GitHub main branch

### 2. **Environment Setup**
Verifies Node.js, npm, and Docker versions

### 3. **Install Dependencies**
Runs `npm install` to get all packages

### 4. **Lint**
ESLint checks code quality (non-blocking, errors logged)

### 5. **Build**
Compiles React app using Vite: `npm run build`

### 6. **Test**
Placeholder for test suite (uncomment when tests added)

### 7. **Build Docker Image**
Creates optimized Docker image with tags:
- `danishansari/scrunchcreate:${BUILD_NUMBER}`
- `danishansari/scrunchcreate:latest`

### 8. **Docker Security Scan**
Scans image for vulnerabilities using Docker Scout

### 9. **Push to Registry**
Pushes image to Docker Hub (main branch only)

### 10. **Deploy Development**
- Stops old containers
- Pulls latest image
- Starts new containers with docker-compose

### 11. **Health Check**
Verifies application is responding (10 attempts, 5s intervals)

### 12. **Deploy Production**
Triggered by version tags (v1.0.0, etc.)
Deploys to production server via SSH

## 🔧 Environment Variables

### Jenkins Credentials (Configure these first!)
- `docker-username`: Docker Hub username
- `docker-password`: Docker Hub password/token
- `production-user`: Production server SSH user
- `production-password`: SSH private key

### Pipeline Variables (Edit in Jenkinsfile)
```groovy
DOCKER_REGISTRY = "docker.io"              // Docker registry
DOCKER_IMAGE_NAME = "danishansari/scrunchcreate"  // Image name
PRODUCTION_SERVER = "your-production-server.com"  // Production host
PRODUCTION_USER = credentials('production-user')  // SSH user
```

## 📱 Accessing the Application

### Development (after docker-compose)
- **Main App**: http://localhost
- **Health Check**: http://localhost/health
- **Proxy**: http://localhost:8080

### Docker Container Names
- `scrunchcreate-web`: Main application
- `scrunchcreate-proxy`: Nginx reverse proxy

## 🛡️ Security Features

1. **Multi-stage Docker build**: Reduces image size and attack surface
2. **Nginx security headers**: XSS, Clickjacking, MIME-type protections
3. **Health checks**: Automatic container restart if unhealthy
4. **Vulnerability scanning**: Docker Scout security analysis
5. **Gzip compression**: Reduces network exposure
6. **CSP headers**: Content Security Policy enforcement

## 📈 Scaling Considerations

### For Higher Traffic
1. Increase nginx worker processes in `nginx.conf`
2. Add load balancing in `nginx-proxy.conf`
3. Use Kubernetes instead of docker-compose

### For CI/CD Speed
1. Enable Docker layer caching
2. Use Jenkins executors pool
3. Parallel build stages

## 🚨 Troubleshooting

### Docker Build Fails
```bash
# Check Docker daemon
docker ps

# Review build logs
docker build -f devops/docker/Dockerfile -t scrunchcreate:latest . --no-cache
```

### Application Won't Start
```bash
# Check logs
docker-compose -f devops/docker/docker-compose.yml logs scrunchcreate-web

# Verify health endpoint
curl http://localhost/health

# Inspect container
docker inspect scrunchcreate-web
```

### Jenkins Can't Find Docker
```bash
# Ensure Jenkins user has Docker permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### GitHub Webhook Not Triggering
1. Verify webhook URL is accessible
2. Check Jenkins GitHub plugin configuration
3. Test payload delivery in GitHub webhook settings

## 📚 Next Steps

1. **Enable Tests**: Add Jest/Vitest configuration to `package.json`
2. **Add Monitoring**: Integrate Prometheus/Grafana
3. **Database**: Add PostgreSQL/MongoDB to `devops/docker/docker-compose.yml`
4. **SSL/TLS**: Configure Let's Encrypt certificates
5. **Notifications**: Add Slack/Email notifications to Jenkins

## 🔗 Useful Resources

- [Vite Documentation](https://vitejs.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [React Documentation](https://react.dev/)

## 💡 Tips

1. Always use semantic versioning for tags: `v1.0.0`
2. Keep Docker images under 500MB for faster deploys
3. Use `.dockerignore` to exclude unnecessary files
4. Test locally with `docker-compose -f devops/docker/docker-compose.yml` before Jenkins
5. Monitor production deployments in real-time

## 📞 Support

For issues or questions:
1. Check Jenkins logs: Jenkins Dashboard → Build history
2. Check container logs: `docker-compose -f devops/docker/docker-compose.yml logs`
3. Review GitHub issues and discussions
4. Consult the documentation files included

---

**Last Updated**: November 13, 2025
**Version**: 1.0.0
