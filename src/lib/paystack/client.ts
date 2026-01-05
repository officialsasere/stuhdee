import type {
  PaystackResponse,
  PaystackTransactionData,
  InitializeTransactionParams,
} from './types'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export const paystackClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<PaystackResponse<T>> {
    const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok || !data.status) {
      throw new Error(data?.message ?? 'Paystack API request failed')
    }

    return data
  },

  async initializeTransaction(
    params: InitializeTransactionParams
  ): Promise<PaystackResponse<PaystackTransactionData>> {
    return this.request<PaystackTransactionData>('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  async verifyTransaction(reference: string): Promise<PaystackResponse<unknown>> {
    return this.request(`/transaction/verify/${reference}`)
  },

  async getSubscription(subscriptionCode: string): Promise<PaystackResponse<unknown>> {
    return this.request(`/subscription/${subscriptionCode}`)
  },

  async disableSubscription(code: string, token: string): Promise<PaystackResponse<unknown>> {
    return this.request('/subscription/disable', {
      method: 'POST',
      body: JSON.stringify({ code, token }),
    })
  },
}