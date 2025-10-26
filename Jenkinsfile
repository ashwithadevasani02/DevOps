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
          bat 'npm ci'
        }
      }
    }

    stage('Run Selenium Tests') {
      steps {
        echo '🧪 Running UI Selenium tests...'
        withEnv(["PATH+NODE=${tool 'node18'}/bin:${env.PATH}"]) {
          bat 'npm test'
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        echo '🐳 Building Docker image...'
        script {
          def commit = bat(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          bat "docker build -t ${DOCKER_IMAGE}:${commit} -t ${DOCKER_IMAGE}:latest ."
        }
      }
    }

    stage('Push to DockerHub') {
      steps {
        echo '🚀 Pushing image to Docker Hub...'
        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
          bat '''
            echo %PASS% | docker login -u %USER% --password-stdin
            docker push ${DOCKER_IMAGE}:latest
          '''
        }
      }
    }

    stage('Deploy Application') {
      steps {
        echo '🚀 Deploying app using Docker Compose...'
        bat 'docker-compose down || exit 0'
        bat 'docker-compose up -d --build'
      }
    }
  }

  post {
    always {
      echo '🧹 Cleaning up workspace....'
      script {
        try {
          deleteDir()
        } catch (err) {
          echo "⚠️ Cleanup skipped: ${err}"
        }
        bat 'docker system prune -f || exit 0'
      }
    }
    success {
      echo "✅ Pipeline executed successfully!"
    }
    failure {
      echo "❌ Pipeline failed — check Jenkins logs."
    }
  }
}
