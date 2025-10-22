pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                git branch: 'main', url: 'https://github.com/ashwithadevasani02/DevOps.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                // Use Windows batch instead of sh to avoid WSL issues
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                // Run tests using npm (replace "test" if your script name differs)
                bat 'npm test'
            }
        }

        stage('Build') {
            steps {
                echo 'Building project...'
                // Run build command (adjust if you use something like "npm run build")
                bat 'npm run build'
            }
        }

        stage('Archive Project Files') {
            steps {
                echo 'Archiving build artifacts...'
                archiveArtifacts artifacts: '**/build/**', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ Build succeeded!'
        }
        failure {
            echo '❌ Build failed. Check logs for details.'
        }
    }
}
