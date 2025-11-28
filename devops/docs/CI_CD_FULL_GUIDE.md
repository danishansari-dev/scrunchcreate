# ScrunchCreate End-to-End CI/CD Guide

This guide walks a complete beginner through setting up, wiring, and testing the ScrunchCreate CI/CD pipeline using **GitHub**, **Jenkins**, **ngrok**, and **Docker**. Every step is opinionated and includes the exact commands, UI clicks, and file samples you need.

---

## 1. Prerequisites & Secrets

| What | Why | Where to store |
|------|-----|----------------|
| GitHub personal access token (classic, repo scope) | Jenkins pulls private branches/tags | Jenkins Credentials → `github-token` |
| Jenkins user API token | Webhooks & CLI automation | GitHub (for webhook auth) & your notes |
| ngrok auth token | HTTPS tunnel for webhooks | `~/.ngrok2/ngrok.yml` |
| Docker Hub username/password or PAT | Push built images | Jenkins Credentials → `docker-username` / `docker-password` |
| GitHub Webhook URL (auto-generated) | Sends push/tag events | Saved in `repo → Settings → Webhooks` |

> ✅ Tip: Record everything in a password manager. We will reference these names verbatim inside Jenkins and scripts.

---

## 2. Local Environment Setup

| Tool | Windows Install |
|------|-----------------|
| Git | [Download](https://git-scm.com/download/win) (select “Git from command line & 3rd party software”) |
| Node.js 20 LTS + npm | [Download](https://nodejs.org/en/download) |
| Docker Desktop | [Download](https://www.docker.com/products/docker-desktop/). Enable “Use WSL 2 backend”. |
| Jenkins LTS | `choco install jenkins-lts -y` (requires [Chocolatey](https://chocolatey.org/install)) |
| ngrok | `choco install ngrok -y` |

Verify versions:

```powershell
git --version
node --version
npm --version
docker --version
jenkins --version
ngrok version
```

---

## 3. Jenkins Setup (First Run)

1. **Start Jenkins**
   ```powershell
   net start jenkins
   ```
   Visit `http://localhost:8080` and unlock Jenkins with the admin password printed in `C:\Program Files\Jenkins\secrets\initialAdminPassword`.

2. **Install Plugins**  
   `Dashboard → Manage Jenkins → Plugins → Available`  
   Search & install:
   - `GitHub`
   - `Docker Pipeline`
   - `Credentials Binding`
   - `SSH Agent`
   - `Blue Ocean` (optional UI)

3. **Create Jenkins User + API Token**
   - `Dashboard → Manage Jenkins → Manage Users → Create User`
   - Generate token: `User → Configure → API Token → Generate`. Copy it.

4. **Add Credentials** (`Dashboard → Manage Jenkins → Credentials → System → Global`):
   | ID | Kind | Notes |
   |----|------|-------|
   | `github-token` | Secret text | GitHub PAT with repo scope |
   | `docker-username` | Username with password | Docker Hub username/password (token preferred) |
   | `docker-password` | Secret text | Only needed if you prefer separate id |
   | `production-user` | Username with password or SSH key | Remote deploy account |
   | `production-password` | Secret text / SSH private key passphrase |

5. **Install Docker inside Jenkins host**
   ```powershell
   wsl --install
   winget install Docker.DockerDesktop
   ```
   Add Jenkins service account to Docker group (Linux) or allow Docker Desktop to expose daemon to `localhost:2375` (Windows). Restart Jenkins afterwards.

---

## 4. Exposing Jenkins with ngrok (Webhook Bridge)

GitHub needs an HTTPS endpoint reachable from the internet. ngrok provides it.

1. Authenticate ngrok:
   ```powershell
   ngrok config add-authtoken YOUR_NGROK_TOKEN
   ```
2. Start tunnel (keep terminal open):
   ```powershell
   ngrok http 8080
   ```
3. Copy the **Forwarding** HTTPS URL, e.g. `https://a1b2-34-56-78-90.ngrok-free.app`.

4. Jenkins webhook endpoint = `https://<ngrok-url>/github-webhook/`. We will paste this into GitHub shortly.

> ⚠️ Free ngrok URLs change when you restart the tunnel. Update the webhook if the URL changes.

---

## 5. GitHub → Jenkins Webhook Setup

1. Go to your repository `Settings → Webhooks → Add webhook`.
2. **Payload URL**: `https://<ngrok-url>/github-webhook/`
3. **Content type**: `application/json`
4. **Secret**: paste your Jenkins API token (kept private; Jenkins validates signatures).
5. **Events**: “Just the push event” (add “Let me select → Pushes + Create” if you want tag triggers).
6. Click **Add webhook**. GitHub immediately sends a test ping—confirm it shows ✅.

---

## 6. Creating the Jenkins Pipeline Job

1. `Dashboard → New Item → Pipeline`
2. Name it `scrunchcreate-ci-cd`
3. Definition: **Pipeline script from SCM**
4. SCM: **Git**
   - Repository URL: `https://github.com/danishansari-dev/scrunchcreate.git`
   - Credentials: add new using `github-token`
   - Branches to build: `*/main`
5. Script Path: `devops/Jenkinsfile`
6. Save. Click **Build Now** once to pull dependencies and ensure Docker works.

---

## 7. Docker Build & Push Pipeline Explained

The Jenkinsfile already lives at `devops/Jenkinsfile`. Key stages:

1. **Checkout** – clones repo using stored credentials.
2. **Environment Setup** – prints Node/npm/Docker versions (fast sanity check).
3. **Install Dependencies** – `npm install`.
4. **Lint / Build / Test** – uses Vite + ESLint. Tests are scaffolded (`npm test`) and can be enabled once present.
5. **Build Docker Image** – runs:
   ```bash
   docker build -f devops/docker/Dockerfile -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} .
   docker tag ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} ${DOCKER_IMAGE_NAME}:latest
   ```
6. **Docker Security Scan** – optional `docker scout cves`.
7. **Push to Registry** – `docker login`, `docker push` tagged + latest (only on `main`).
8. **Deploy Development** – `docker-compose -f devops/docker/docker-compose.yml up -d`.
9. **Health Check** – curls `http://localhost/health` up to 10 times.
10. **Deploy Production** – gated by tags matching `v*.*.*`. Commands are commented as placeholders; replace with real SSH deploy.
11. **Cleanup** – removes dangling images, archives `dist/`.

Full pipeline source (already in repo):

```
devops/Jenkinsfile
```

You can view/modify directly in your IDE; Jenkins always reads the latest committed version.

---

## 8. Integrating `deploy.sh` and `rollback.sh`

- `devops/scripts/deploy.sh` – opinionated deployment helper. Jenkins’ **Deploy Development** stage effectively reproduces it, but you can call the script explicitly for clarity:

  ```groovy
  stage('Deploy Development Scripted') {
      steps {
          sh 'bash devops/scripts/deploy.sh development ${DOCKER_IMAGE_TAG}'
      }
  }
  ```

  Manual usage:
  ```bash
  bash devops/scripts/deploy.sh development latest
  bash devops/scripts/deploy.sh staging 123   # use BUILD_NUMBER or Git tag
  ```

- `devops/scripts/rollback.sh` – run when a deploy fails:

  ```bash
  bash devops/scripts/rollback.sh 122  # revert to build 122
  ```

  You can add a Jenkins input stage:

  ```groovy
  stage('Manual Rollback') {
      when { triggeredBy 'UserIdCause' }
      steps {
          script {
              def version = input message: 'Rollback?', parameters: [string(name: 'IMAGE_TAG', defaultValue: 'latest')]
              sh "bash devops/scripts/rollback.sh ${version}"
          }
      }
  }
  ```

---

## 9. Best Practices & Environment Hardening

- **Least privilege credentials** – PATs scoped to the single repo, Docker tokens limited to push/pull.
- **Secret rotation** – update Jenkins credentials quarterly; revoke old tokens.
- **Branch protections** – require PR reviews/tests before merging to `main`.
- **Tag-based releases** – production deploy only when pushing `vMAJOR.MINOR.PATCH`.
- **Resource isolation** – run Jenkins inside a dedicated VM or container with limited sudo.
- **Monitoring** – enable Docker Desktop “Resource usage” and add external monitoring (e.g., UptimeRobot hitting `/health`).
- **Backups** – snapshot Jenkins `JENKINS_HOME`, and use Docker image tags as immutable backups.

Environment variables you may tweak in `devops/Jenkinsfile`:

```
PROJECT_NAME = "scrunchcreate"
DOCKER_REGISTRY = "docker.io"
DOCKER_IMAGE_NAME = "danishansari/scrunchcreate"
PRODUCTION_SERVER = "your-production-server.com"
```

---

## 10. End-to-End Testing Checklist

| Step | Command / Action | Expected Result |
|------|------------------|-----------------|
| 1 | `npm run lint && npm run build` | Local build passes |
| 2 | `docker build -f devops/docker/Dockerfile -t scrunchcreate:test .` | Image builds locally |
| 3 | `docker-compose -f devops/docker/docker-compose.yml up -d` | Containers healthy (`docker ps`) |
| 4 | Open ngrok tunnel | HTTPS URL displayed |
| 5 | Push commit to `main` | GitHub webhook delivery shows `200` |
| 6 | Jenkins job runs all stages green | Docker image pushed to Hub |
| 7 | `docker pull danishansari/scrunchcreate:<build>` | Image exists remotely |
| 8 | Visit deployment URL (`http://localhost`) | App loads + `/health` returns ✅ |
| 9 | (Optional) Push tag `git tag v1.2.3 && git push origin v1.2.3` | Production stage triggers |
| 10 | Force failure, run `bash devops/scripts/rollback.sh <tag>` | Previous version restored |

---

## 11. Troubleshooting

- **Webhook 403** → Secret mismatch. Update webhook secret to match Jenkins API token.
- **`docker: command not found` in Jenkins** → Ensure Jenkins user has Docker permissions or enable Docker-in-Docker agent.
- **ngrok tunnel closes** → Use `ngrok config` + `ngrok start --all` or paid static URLs.
- **Docker push fails** → Check credential IDs and verify PAT scope includes `write:packages`.
- **Health check timeout** → Inspect containers:  
  ```bash
  docker-compose -f devops/docker/docker-compose.yml logs scrunchcreate-web
  ```

---

## 12. Next Steps

- Add automated tests (Vitest/Cypress) and uncomment the Jenkins test stage.
- Wire Slack/Teams notifications via Jenkins `post { success { ... } }`.
- Promote to Kubernetes when scaling requirements grow.

---

**You’re done!** Every push to `main` now flows automatically from GitHub → Jenkins (via ngrok) → Docker build/push → scripted deployment with rollback safety nets. Keep the ngrok tunnel running during development, and move to a static domain/SSL when you host Jenkins publicly.

