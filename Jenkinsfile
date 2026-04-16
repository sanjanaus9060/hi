pipeline {
    agent any

    stages {

        stage('Cleanup') {
            steps {
                bat '''
                for /f "tokens=*" %%i in ('docker ps -aq') do docker rm -f %%i
                '''
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
