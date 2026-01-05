import type { Tables } from '@/types/database'

export type Subscription = Tables<'subscriptions'>

export type CheckoutRequest = {
  planType: 'MONTHLY' | 'SEMESTER'
}