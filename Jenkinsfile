pipeline {
    agent any

    environment {
        EC2_IP = "16.171.137.210"
    }

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/sanjanaus9060/fresh-nest.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t fresh-nest .'
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-key']) {
                    bat """
                    ssh -o StrictHostKeyChecking=no ubuntu@%EC2_IP% "
                    docker stop fresh-nest || true &&
                    docker rm fresh-nest || true &&
                    docker pull sanjanaus9060/fresh-nest || true &&
                    docker run -d -p 3000:3000 --name fresh-nest sanjanaus9060/fresh-nest
                    "
                    """
                }
            }
        }
    }
}
