pipeline {
    agent any

    environment {
        IMAGE_NAME = 'fresh-nest'
        EC2_IP = '16.171.137.210'
    }

    stages {

        stage('Clone Code') {
            steps {
                git branch: 'main', url: 'https://github.com/sanjanaus9060/fresh-nest.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %IMAGE_NAME% ."
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-key']) {
                    bat """
                    ssh -o StrictHostKeyChecking=no ubuntu@%EC2_IP% ^
                    "docker stop %IMAGE_NAME% || true && docker rm %IMAGE_NAME% || true && docker run -d -p 3000:3000 --name %IMAGE_NAME% %IMAGE_NAME%"
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful!'
        }
        failure {
            echo '❌ Deployment Failed!'
        }
    }
}
