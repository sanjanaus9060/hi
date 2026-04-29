pipeline {
    agent any

    tools {
        nodejs 'node'   // make sure NodeJS is configured in Jenkins
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm   // uses repo + branch from Jenkins job (main)
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Backend') {
            steps {
                sh '''
                echo "Stopping existing node process (if any)..."
                pkill -f node || true

                echo "Starting server..."
                nohup node server.js > output.log 2>&1 &
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline executed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
    }
}