# SFCC PWA Kit + Adyen Drop-in

Educational local integration of Adyen Web Drop-in with Salesforce B2C Commerce PWA Kit.

## What this demo creates

- A real **Adyen Test payment**: authorised by Adyen and visible in Adyen Customer Area.
- A real **B2C Commerce/PWA Kit order**: created through the Commerce API after Adyen authorisation.

## Workflow

1. PWA Kit sends the basket amount to the server to create an Adyen Checkout Session.
2. The shopper enters an Adyen test card in Drop-in.
3. Adyen authorises the test payment.
4. The demo adds a masked test payment instrument to the basket and saves the billing address.
5. The Commerce API creates the B2C Commerce order and opens the order-confirmation page.

## Important demo limitation

The Adyen payment and Commerce order are real test/demo records. Their connection is a local demo bridge: the B2C order uses a masked `CREDIT_CARD` instrument and does not persist the Adyen PSP reference as an SFCC payment transaction.

For production, use an SFCC Adyen payment processor or cartridge that persists the PSP reference and authorisation state, validates trusted order amounts, and handles captures, refunds, cancellations, signed webhooks, and reconciliation.

## Main code changes

- Server-side Adyen session, configuration, payment-details, and webhook routes.
- Adyen Web v6 Drop-in with Card registration and PWA Kit styling fixes.
- Default PWA Kit credit-card form and Review Order path hidden.
- Adyen-only checkout with automatic demo order creation after authorisation.

Never commit API keys, HMAC keys, real card data, or a local `.env` file.
