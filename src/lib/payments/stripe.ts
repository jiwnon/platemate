/**
 * Stripe 연동 (외국인 결제)
 */
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export function getStripePublishableKey() {
  return STRIPE_PUBLISHABLE_KEY ?? '';
}

export function getStripeSecretKey() {
  return STRIPE_SECRET_KEY ?? '';
}
