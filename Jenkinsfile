pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'ashwithadevasani02'     // your DockerHub username
        APP_NAME = 'devops-app'
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
                bat 'npm ci'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo '🧪 Running UI Selenium tests...'
                bat 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🏗️ Building Docker image...'
                script {
                    // Get Git commit short hash in Windows shell
                    bat '''
                    FOR /F "tokens=* USEBACKQ" %%F IN (`git rev-parse --short HEAD`) DO (
                        SET GIT_COMMIT=%%F
                    )
                    docker build -t %DOCKERHUB_USER%/%APP_NAME%:%GIT_COMMIT% .
                    docker tag %DOCKERHUB_USER%/%APP_NAME%:%GIT_COMMIT% %DOCKERHUB_USER%/%APP_NAME%:latest
                    '''
                }
            }
        }

        stage('Push to DockerHub') {
            when {
                expression { return env.DOCKERHUB_USER?.trim() }
            }
            steps {
                echo '🚀 Pushing Docker image to DockerHub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    bat '''
                    echo Logging in to DockerHub...
                    echo %PASS% | docker login -u %USER% --password-stdin
                    docker push %DOCKERHUB_USER%/%APP_NAME%:latest
                    docker logout
                    '''
                }
            }
        }

        stage('Deploy Application') {
            steps {
                echo '🚢 Deploying container locally (optional)...'
                bat '''
                docker rm -f %APP_NAME% || exit 0
                docker run -d -p 3000:3000 --name %APP_NAME% %DOCKERHUB_USER%/%APP_NAME%:latest
                '''
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up workspace...'
            bat 'docker system prune -f || exit 0'
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed — check logs.'
        }
    }
}
