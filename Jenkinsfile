pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Clone your actual GitHub repository
                git branch: 'main', url: 'https://github.com/ashwithadevasani02/DevOps.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies...'
                sh 'npm install'
            }
        }

        stage('Run Server') {
            steps {
                echo 'Starting the Node.js server...'
                // Run the app (server.js is your entry point)
                sh 'node server.js &'
            }
        }

        stage('Archive Logs (Optional)') {
            steps {
                echo 'Archiving server logs (if any)...'
                // This step will only work if you save logs
                sh 'mkdir -p logs || true'
                archiveArtifacts artifacts: 'logs//*', followSymlinks: false, onlyIfSuccessful: true
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Jenkins logs.'
        }
    }
}
