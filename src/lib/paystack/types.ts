export interface PaystackResponse<T = unknown> {
  status: boolean
  message: string
  data: T
}

export interface PaystackTransactionData {
  authorization_url: string
  access_code: string
  reference: string
}

export interface PaystackCustomer {
  customer_code: string
  email: string
  id: number
}

export interface PaystackSubscription {
  subscription_code: string
  customer: PaystackCustomer
  plan: {
    plan_code: string
    interval: string
  }
  status: string
  next_payment_date?: string
}

export interface PaystackWebhookEvent {
  event: string
  data: {
    reference?: string
    status?: string
    amount?: number
    customer?: PaystackCustomer
    subscription?: PaystackSubscription
    subscription_code?: string
    metadata?: {
      user_id?: string
      plan_type?: string
    }
  }
}

export interface InitializeTransactionParams {
  email: string
  amount: number
  plan?: string
  callback_url?: string
  metadata?: Record<string, unknown>
}