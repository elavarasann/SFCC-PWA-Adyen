# SFCC PWA Kit + Adyen Drop-in

Educational local integration of Adyen Web Drop-in with Salesforce B2C Commerce PWA Kit.

## Repository layout

This repository contains the Adyen-specific PWA Kit override files, rather than a full copy of the Salesforce Retail React App:

- `overrides/app/api/adyen-client.js` – server-side Adyen API client.
- `overrides/app/ssr.js` – Adyen configuration, Sessions, payment-details, and webhook endpoints.
- `overrides/app/components/adyen-checkout/index.jsx` – Drop-in and card-field styling.
- `overrides/app/pages/checkout/partials/payment.jsx` – Adyen-only checkout and demo order bridge.
- `package.json` and `package-lock.json` – required Adyen SDK dependencies.

Copy these files into a compatible Retail React App project, install dependencies, and create `.env` from `.env.example`. Do not commit `.env`.

## What this demo creates

- A real **Adyen Test payment**: authorised by Adyen and visible in Adyen Customer Area.
- A real **B2C Commerce/PWA Kit order**: created through the Commerce API after Adyen authorisation.

## Workflow

```text
PWA Kit basket amount
        ↓
Server creates Adyen Checkout Session
        ↓
Customer enters test card in Adyen Drop-in
        ↓
Adyen authorises the Test payment
        ↓
Payment appears in Adyen Customer Area
        ↓
PWA Kit adds masked demo payment data to basket
        ↓
PWA Kit saves billing address
        ↓
Commerce API creates the B2C Commerce order
        ↓
Customer sees order confirmation
```

## Important demo limitation

The Adyen payment and Commerce order are real test/demo records. Their connection is a local demo bridge: the B2C order uses a masked `CREDIT_CARD` instrument and does not persist the Adyen PSP reference as an SFCC payment transaction.

For production, use an SFCC Adyen payment processor or cartridge that persists the PSP reference and authorisation state, validates trusted order amounts, and handles captures, refunds, cancellations, signed webhooks, and reconciliation.

## Main code changes

- Server-side Adyen session, configuration, payment-details, and webhook routes.
- Adyen Web v6 Drop-in with Card registration and PWA Kit styling fixes.
- Default PWA Kit credit-card form and Review Order path hidden.
- Adyen-only checkout with automatic demo order creation after authorisation.

Never commit API keys, HMAC keys, real card data, or a local `.env` file.

## Jenkins CI/CD

`Jenkinsfile` provides a local Jenkins pipeline for this Managed Runtime project:

```text
GitHub source
        ↓
Jenkins: npm ci → lint → build
        ↓
PWA Kit uploads an immutable Managed Runtime bundle
        ↓
Optional approval in Jenkins
        ↓
Managed Runtime deploys that same bundle to production
```

In Jenkins, create two **Secret text** credentials (do not place either value in Git):

- `mrt-api-key` — Managed Runtime API key.
- `mrt-user-email` — email address associated with that key.

The pipeline passes these secrets directly to PWA Kit during bundle upload; it does not commit or retain a Managed Runtime credentials file.

Create a Pipeline job using this repository, branch `main`, and script path `Jenkinsfile`. The default build normalizes the override source with Prettier, builds, and uploads a bundle. Select `DEPLOY_TO_MRT` only when you want Jenkins to deploy the newly uploaded bundle; Jenkins will then pause for approval.

The pipeline currently exposes the existing `production` target. Once a `staging` target exists in Runtime Admin, add it to the `MRT_TARGET` choices in `Jenkinsfile` and use it for normal validation before production.
