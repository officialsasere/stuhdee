export const PAYSTACK_PLANS = {
  MONTHLY: {
    planCode: process.env.PAYSTACK_MONTHLY_PLAN_CODE!,
    name: 'Monthly Plan',
    amount: 210000, // ₦2,100 in kobo
    currency: 'NGN',
    interval: 'monthly',
  },
  SEMESTER: {
    planCode: process.env.PAYSTACK_SEMESTER_PLAN_CODE!,
    name: 'Semester Plan',
    amount: 510000, // ₦5,100 in kobo
    currency: 'NGN',
    interval: 'quarterly',
  },
} as const

export type PlanType = keyof typeof PAYSTACK_PLANS