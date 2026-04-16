pipeline {
    agent any

    stages {
        stage('Clone Code') {
            steps {
                git 'https://github.com/sanjanaus9060/fresh-nest.git'
            }
        }

        stage('Build') {
            steps {
                echo "Building the application..."
            }
        }

        stage('Test') {
            steps {
                echo "Running tests..."
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying application..."
            }
        }
    }
}
