pipeline {
    agent any

    stages {

        stage('Clone') {
            steps {
                git 'https://github.com/sanjanaus9060/hi.git'
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Backend') {
            steps {
                sh '''
                pkill node || true
                nohup node server.js > output.log 2>&1 &
                '''
            }
        }
    }
}