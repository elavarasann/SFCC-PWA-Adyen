import {Client, CheckoutAPI} from '@adyen/api-library'

const client = new Client({
    apiKey: process.env.ADYEN_API_KEY,
    environment: process.env.ADYEN_ENVIRONMENT || 'TEST'
})

export const checkoutAPI = new CheckoutAPI(client)
export const MERCHANT_ACCOUNT = process.env.ADYEN_MERCHANT_ACCOUNT
