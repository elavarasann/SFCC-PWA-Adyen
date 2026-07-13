pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'MRT_TARGET',
            choices: ['production'],
            description: 'Managed Runtime environment to deploy to. Add staging here after it is created in Runtime Admin.'
        )
        booleanParam(
            name: 'DEPLOY_TO_MRT',
            defaultValue: false,
            description: 'When selected, deploy the newly uploaded bundle to the selected environment.'
        )
    }

    environment {
        MRT_API_ORIGIN = 'https://cloud.mobify.com'
        MRT_PROJECT = 'pwt-kit-adyen-test'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci --ignore-scripts'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build and upload bundle') {
            steps {
                withCredentials([
                    string(credentialsId: 'mrt-api-key', variable: 'MRT_API_KEY'),
                    string(credentialsId: 'mrt-user-email', variable: 'MRT_USER_EMAIL')
                ]) {
                    sh '''#!/bin/sh
                        set -eu
                        npm run build
                        ./node_modules/.bin/pwa-kit-dev push \
                          --user "$MRT_USER_EMAIL" \
                          --key "$MRT_API_KEY"
                    '''
                }
            }
        }

        stage('Deploy to Managed Runtime') {
            when {
                expression { return params.DEPLOY_TO_MRT }
            }
            steps {
                input message: "Deploy the newly uploaded bundle to ${params.MRT_TARGET}?", ok: 'Deploy'
                withCredentials([
                    string(credentialsId: 'mrt-api-key', variable: 'MRT_API_KEY')
                ]) {
                    sh '''#!/bin/sh
                        set -eu
                        bundles_json=$(curl --fail --silent --show-error \
                          --header "Authorization: Bearer $MRT_API_KEY" \
                          "$MRT_API_ORIGIN/api/projects/$MRT_PROJECT/bundles/?ordering=-created_at&limit=1")
                        bundle_id=$(printf '%s' "$bundles_json" | node -e '
                          let body = "";
                          process.stdin.on("data", (chunk) => body += chunk);
                          process.stdin.on("end", () => {
                            const result = JSON.parse(body).results?.[0];
                            if (!result?.id) process.exit(1);
                            process.stdout.write(String(result.id));
                          });
                        ')
                        test -n "$bundle_id"
                        curl --fail --silent --show-error \
                          --request POST \
                          --header "Authorization: Bearer $MRT_API_KEY" \
                          --header 'Content-Type: application/json' \
                          --data "{\\"bundle_id\\":$bundle_id}" \
                          "$MRT_API_ORIGIN/api/projects/$MRT_PROJECT/target/$MRT_TARGET/deploy/"
                        echo "Deployment queued for bundle $bundle_id on $MRT_TARGET."
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'rm -f "$HOME/.mobify"'
        }
    }
}
