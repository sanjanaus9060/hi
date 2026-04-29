pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                echo "Checking Node and NPM versions..."
                node -v
                npm -v

                echo "Installing dependencies..."
                npm install
                '''
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