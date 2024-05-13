pipeline {
  agent any

  stages {
    stage('Build') {
      steps {
        script {
          dockerImage = docker.build("node-app")
        }
      }
    }

    stage('Test') {
      steps {
        script {
          dockerImage.inside {
            sh 'npm test'
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          docker.withRegistry('', 'aws-ecr-credentials') {
            dockerImage.push("latest")
          }
          sshagent(['ec2-instance-ssh']) {
            sh 'ssh -o StrictHostKeyChecking=no ec2-user@<EC2_PUBLIC_IP> "docker run -d -p 3000:3000 node-app:latest"'
          }
        }
      }
    }
  }
}
