/*
 * This project contains only PWA Kit overrides. The base storefront
 * configuration remains provided by Retail React App.
 *
 * Managed Runtime resolves application configuration from the deploying
 * project, so expose the inherited configuration at the expected location.
 */
module.exports = require('@salesforce/retail-react-app/config/default')
