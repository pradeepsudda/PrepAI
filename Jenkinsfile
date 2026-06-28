pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            steps {
                sh '''
                    export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
                    export MAVEN_OPTS="-Dhttps.protocols=TLSv1.2 -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true"
                    chmod +x mvnw
                    ./mvnw clean verify -DskipTests=true
                '''
            }
            post {
                always {
                    junit testResults: '**/target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
                        export MAVEN_OPTS="-Dhttps.protocols=TLSv1.2 -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true"
                        ./mvnw sonar:sonar
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }
    }

    post {
        success {
            echo 'Build and SonarQube analysis completed successfully!'
        }
        failure {
            echo 'Build failed. Check the logs for details.'
        }
    }
}
