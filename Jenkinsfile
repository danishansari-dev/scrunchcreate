pipeline {
    agent any

    environment {
        // Optional: define any environment variables you want here
        PROJECT_NAME = "scrunchcreate"
        GIT_REPO = "https://github.com/danishansari-dev/scrunchcreate.git"
        BRANCH_NAME = "main"
    }

    triggers {
        // Automatically trigger build when webhook is received from GitHub
        githubPush()
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📦 Checking out source code from GitHub..."
                git branch: "${BRANCH_NAME}", url: "${GIT_REPO}"
            }
        }

        stage('Build') {
            steps {
                echo "🔨 Building the project..."
                // Add your build command below (customize for your tech stack)
                // Example for Node.js:
                // sh 'npm install'
                // Example for Python:
                // sh 'pip install -r requirements.txt'
            }
        }

        stage('Test') {
            steps {
                echo "🧪 Running tests..."
                // Example: Node.js test command
                // sh 'npm test'
                // Example: Python test
                // sh 'pytest'
            }
        }

        stage('Code Quality') {
            steps {
                echo "🧹 Checking code quality..."
                // Add linting/static analysis commands here if needed
                // Example:
                // sh 'npm run lint'
            }
        }

        stage('Deploy') {
            steps {
                echo "🚀 Deployment step (optional)"
                // Add deployment or packaging commands if applicable
            }
        }
    }

    post {
        always {
            echo "📜 Build finished. Cleaning up workspace..."
            cleanWs()
        }

        success {
            echo "✅ SUCCESS: ${PROJECT_NAME} pipeline completed successfully!"
        }

        failure {
            echo "❌ FAILURE: ${PROJECT_NAME} pipeline failed. Check logs for details."
        }
    }
}
