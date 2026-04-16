pipeline {
    agent any

    stages {
        stage('Clone Code') {
            steps {
                git branch: 'main', url: 'https://github.com/sanjanaus9060/fresh-nest.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t fresh-nest .'
            }
        }

        stage('Run Container') {
            steps {
                bat 'docker run -d -p 3000:3000 fresh-nest'
            }
        }
    }
}
