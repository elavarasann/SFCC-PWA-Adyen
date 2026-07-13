# Jenkins CI/CD for Salesforce PWA Kit Managed Runtime

## Purpose

This document explains the Jenkins CI/CD setup used to build, upload, and optionally deploy the Salesforce PWA Kit application to Managed Runtime (MRT).

The setup is intended for learning and testing deployments with Jenkins, GitHub, Docker, and MRT.

## Architecture

```text
GitHub repository
        ↓
Jenkins pipeline
        ↓
Install dependencies and validate code
        ↓
Build PWA Kit bundle
        ↓
Upload bundle to Managed Runtime
        ↓
Optional approval
        ↓
Deploy bundle to selected MRT environment
```

## Repository

- Repository: `SFCC-PWA-Adyen`
- Source control: GitHub
- Pipeline definition: `Jenkinsfile`
- Application: Salesforce PWA Kit Retail React App with Adyen demo integration

The repository contains PWA Kit override files rather than a complete copied version of the PWA Kit source. During build, the base Retail React App package supplies the standard application files and the repository overrides customize the application.

## Jenkins Setup

Jenkins is running locally in Docker and is accessible at:

```text
http://localhost:8081/
```

The Jenkins job is:

```text
sfcc-pwa-adyen-mrt
```

Jenkins checks out the GitHub repository and reads the `Jenkinsfile` from the selected branch.

## Jenkins Credentials

Two Jenkins **Secret text** credentials are configured:

| Credential ID | Purpose |
| --- | --- |
| `mrt-user-email` | Managed Runtime account email |
| `mrt-api-key` | Managed Runtime API key |

The pipeline injects these values only while uploading the bundle. The API key must never be committed to GitHub, added to `.env` files, or printed in Jenkins logs.

If an API key is ever exposed, revoke it in Managed Runtime and create a replacement key.

## Managed Runtime Targets

The Jenkins job supports these MRT targets:

| Jenkins value | Purpose |
| --- | --- |
| `pwt` | Staging / learning environment |
| `production` | Production Managed Runtime environment |

The selected target is sent to the PWA Kit MRT command during deployment.

## Pipeline Stages

### 1. Checkout

Jenkins downloads the selected branch from GitHub.

### 2. Install dependencies

Jenkins installs Node.js dependencies using:

```text
npm ci --ignore-scripts
```

This gives Jenkins a clean and repeatable dependency installation.

### 3. Validate formatting

Jenkins checks formatting of the custom override files using Prettier. This detects formatting issues before a bundle is uploaded.

### 4. Build

Jenkins runs the PWA Kit production build:

```text
npm run build
```

The build ensures the application and its override files compile before upload.

### 5. Upload to Managed Runtime

Jenkins authenticates using the stored MRT email and API key, then pushes the PWA Kit bundle. The upload creates a new bundle in the selected MRT project. An upload alone does not necessarily make that bundle live.

### 6. Optional deployment approval

The Jenkins parameter `DEPLOY_TO_MRT` controls deployment:

| `DEPLOY_TO_MRT` value | Result |
| --- | --- |
| Not selected | Build and upload only |
| Selected | Jenkins pauses for approval, then deploys the uploaded bundle |

The approval step protects the live target from accidental deployment.

### 7. Deploy

After approval, Jenkins calls the Managed Runtime deployment endpoint for the selected target. The deployed bundle becomes the active version for that MRT environment.

## Recreate Managed Runtime Configuration

Use this section if Managed Runtime access is reset, the account is recreated, API keys are revoked, or a new MRT project must be created.

### Prerequisites

You need access to the Salesforce Commerce Cloud Account Manager with a role that includes:

- **Managed Runtime User** — required to access Runtime Admin and manage deployments.
- **B2C Commerce Instance access** — needed only when connecting an MRT environment to a B2C instance.
- **Business Manager Administrator** — needed only for B2C Commerce configuration; it is not required to practice MRT upload and deployment.

If the Managed Runtime option is missing, ask the account administrator to assign the **Managed Runtime User** role.

### 1. Open Managed Runtime Admin

1. Open [Managed Runtime Admin](https://runtime.commercecloud.com/).
2. Sign in with the Salesforce Commerce Cloud account.
3. Select the organization when it is shown.
4. Open the required tenant or create a project.

The exact menus can differ slightly depending on account permissions.

### 2. Create the MRT Project

1. Select **Create Project**.
2. Use a project name, for example:

   ```text
   pwt-kit-adyen-test
   ```

3. Save the project.

A project is the top-level MRT container. It stores application bundles and deployment environments.

```text
Managed Runtime
└── Project: pwt-kit-adyen-test
    ├── Environment: pwt
    └── Environment: production
```

### 3. Create the Staging Environment

1. Open the project.
2. Select **Create Environment**.
3. Enter:

   | Field | Example value |
   | --- | --- |
   | Environment name | `pwt` |
   | Purpose | Staging / learning |
   | Node.js version | Use the PWA Kit-supported Node.js version shown by MRT |

4. Save the environment.
5. Note the generated environment hostname.

Use `pwt` as the target name in Jenkins:

```text
MRT_TARGET=pwt
```

### 4. Create the Production Environment

1. In the same MRT project, select **Create Environment** again.
2. Enter:

   | Field | Example value |
   | --- | --- |
   | Environment name | `production` |
   | Purpose | Production |
   | Node.js version | Same compatible version used for staging |

3. Save the environment.
4. Note the generated production hostname.

Use `production` as the target name in Jenkins:

```text
MRT_TARGET=production
```

### 5. Create an MRT API Key

1. In Managed Runtime Admin, open the user profile or API access area.
2. Create a new Managed Runtime API key.
3. Copy the key immediately and store it in a password manager.

The key is normally displayed only once. If it is lost, create a new key and revoke the old one.

### 6. Add the New Credentials to Jenkins

After creating a new API key:

1. Open Jenkins.
2. Go to:

   ```text
   Manage Jenkins → Credentials → System → Global credentials
   ```

3. Add or update these **Secret text** credentials:

   | Credential ID | Secret value |
   | --- | --- |
   | `mrt-user-email` | The email used for Managed Runtime |
   | `mrt-api-key` | The newly created MRT API key |

4. Keep the credential IDs exactly the same because the `Jenkinsfile` refers to these names.

If the key is replaced in MRT, update Jenkins before running another pipeline.

### 7. Connect a B2C Commerce Instance — Optional

This step is optional for CI/CD learning.

If you need the deployed storefront to work with a B2C Commerce instance:

1. Open the MRT environment, for example `pwt`.
2. Open the B2C Commerce instance setting.
3. Select the required instance.
4. Save the configuration.
5. Repeat for `production` if required.

For a learning setup, both environments can point to the same B2C instance. This does not provide separate B2C data.

### 8. Configure Proxy Routes — Optional

Proxy routes are not required to upload or deploy a PWA Kit bundle. They are required only if the deployed application must route browser requests to B2C Commerce APIs through MRT.

For each environment separately:

1. Open the MRT project.
2. Open the environment, such as `pwt`.
3. Go to:

   ```text
   Environment Settings → Advanced → Proxy Configs
   ```

4. Create the required routes.

Typical PWA Kit paths are:

```text
/mobify/proxy/api/*
/mobify/proxy/ocapi/*
```

5. Set the destination URL to the relevant B2C Commerce API or OCAPI host.
6. Save the proxy configuration.
7. Repeat the proxy setup in `production` when needed.

Proxy settings are isolated per environment. Creating a proxy in `production` does not automatically create it in `pwt`.

### 9. Update the Jenkins Pipeline Targets

The `Jenkinsfile` must use the same target IDs created in Runtime Admin:

```text
pwt
production
```

If an MRT environment is renamed or recreated with another ID, update the `MRT_TARGET` choices in the `Jenkinsfile`, commit the change, and run Jenkins once to refresh its parameters.

### 10. Test the Recreated Configuration

1. Run Jenkins with `MRT_TARGET=pwt`.
2. Leave `DEPLOY_TO_MRT` unselected for an upload-only test.
3. Confirm that a new bundle appears in the MRT `pwt` environment.
4. Run again with `DEPLOY_TO_MRT` selected.
5. Approve the deployment.
6. Open the staging hostname and confirm the newly deployed version is active.
7. Repeat the same steps for `production` only when required.

### Recovery Checklist

```text
1. Obtain Managed Runtime User access
2. Sign in to Runtime Admin
3. Create the MRT project
4. Create pwt and production environments
5. Create a new MRT API key
6. Update Jenkins credentials
7. Confirm Jenkins MRT target names
8. Optionally connect B2C instances
9. Optionally configure proxies
10. Run upload and deployment tests
```

## How to Run a Staging Deployment

1. Open Jenkins: `http://localhost:8081/`.
2. Open the `sfcc-pwa-adyen-mrt` job.
3. Select **Build with Parameters**.
4. Set `MRT_TARGET` to `pwt`.
5. Select `DEPLOY_TO_MRT` if you want Jenkins to deploy after upload.
6. Start the build.
7. When Jenkins pauses for approval, approve the deployment.
8. Open the `pwt` MRT URL and verify that the new bundle is active.

## How to Run a Production Deployment

1. Open **Build with Parameters** in the Jenkins job.
2. Set `MRT_TARGET` to `production`.
3. Select `DEPLOY_TO_MRT`.
4. Start the build.
5. Review the build output and approve the deployment when Jenkins requests it.
6. Verify the production MRT URL.

Use production only after validating the same bundle in `pwt`.

## Troubleshooting

### Jenkins cannot find `pwt`

Run one Jenkins build after the updated `Jenkinsfile` is pushed. Jenkins reloads the parameter list from the pipeline definition during a build. After that, `pwt` appears under `MRT_TARGET`.

### Bundle uploads but is not live

Upload and deployment are separate actions. Select `DEPLOY_TO_MRT` and approve the deployment stage to make the bundle active.

### Jenkins build fails during validation

Review the stage that failed:

- Formatting failure: run Prettier and commit the formatting fix.
- Build failure: correct the application or override code, test locally, commit, and rerun Jenkins.
- MRT authentication failure: confirm the Jenkins credential IDs and replace an expired or revoked API key.

### Storefront shows only static content or no products

This normally indicates that B2C Commerce API access is not configured. Configure the required B2C API authentication and MRT proxy settings when you are ready to test the complete storefront.

## Security Notes

- Keep the MRT API key only in Jenkins credentials.
- Do not place the API key in GitHub, screenshots, terminal history, or source files.
- Rotate the API key if it is accidentally exposed.
- Keep the Jenkins approval stage enabled for production deployments.

## Result

The pipeline provides a practical Salesforce PWA Kit DevOps flow:

```text
Code change
→ GitHub push
→ Jenkins build and validation
→ MRT bundle upload
→ Approval
→ Staging or production deployment
```
