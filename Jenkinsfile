pipeline {
    agent any

    tools {
        jdk 'JDK17'
        maven 'Maven3'
        nodejs 'Node20'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Backend Build & Test') {
            steps {
                dir('backend') {
                    sh 'mvn clean test package -DskipTests=false'
                }
            }
        }
        stage('Frontend Build') {
            steps {
                dir('frontend/airbook-ui') {
                    sh 'npm ci'
                    sh 'npm run build -- --configuration production'
                }
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }
    }

    post {
        success { echo 'iRetail AirBook pipeline succeeded' }
        failure { echo 'Pipeline failed — check logs' }
    }
}
