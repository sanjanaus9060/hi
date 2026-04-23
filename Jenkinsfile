pipeline {
    agent any

    stages {
        stage('Build React App') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t my-react-app .'
            }
        }

        stage('Docker Run') {
            steps {
                sh '''
                docker rm -f myapp || true
                docker run -d -p 80:80 --name myapp my-react-app
                '''
            }
        }
    }
}