pipeline {
  agent any

  environment {
    NODE_HOME = tool name: 'node18', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
    DOCKER_IMAGE = "ashwithadevasani02/devops-app"
    DOCKERHUB_CREDENTIALS = 'dockerhub-creds'
  }

  stages {

    stage('Checkout Code') {
      steps {
        echo '🔄 Pulling latest code from GitHub...'
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        echo '📦 Installing npm dependencies...'
        withEnv(["PATH+NODE=${tool 'node18'}/bin:${env.PATH}"]) {
          sh 'npm ci'
        }
      }
    }

    stage('Run Selenium Tests') {
      steps {
        echo '🧪 Running UI Selenium tests...'
        withEnv(["PATH+NODE=${tool 'node18'}/bin:${env.PATH}"]) {
          sh 'npm test'
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        echo '🐳 Building Docker image...'
        script {
          def commit = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
          sh "docker build -t ${DOCKER_IMAGE}:${commit} -t ${DOCKER_IMAGE}:latest ."
        }
      }
    }

    stage('Push to DockerHub') {
      steps {
        echo '🚀 Pushing image to Docker Hub...'
        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
          sh '''
            echo "$PASS" | docker login -u "$USER" --password-stdin
            docker push ${DOCKER_IMAGE}:latest
          '''
        }
      }
    }

    stage('Deploy Application') {
      steps {
        echo '🚀 Deploying app using Docker Compose...'
        sh 'docker-compose down || true'
        sh 'docker-compose up -d --build'
      }
    }
  }

  post {
    success {
      echo "✅ Pipeline executed successfully!"
    }
    failure {
      echo "❌ Pipeline failed — check Jenkins logs."
    }
  }
}
