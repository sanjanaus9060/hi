pipeline {   
agent any   
stages {   
stage('Build Docker Image') {   
steps { sh 'docker build -t devops-demo:v1 .' }   
}   
stage('Deploy Container') {   
steps { sh '''   
docker ps -q | xargs -r docker stop   
docker ps -aq | xargs -r docker rm   
docker run -d -p 80:3000 devops-demo:v1   
''' }   
}   
}  }
