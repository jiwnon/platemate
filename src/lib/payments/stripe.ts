/**
 * Stripe 연동 (외국인 결제)
 */
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export function getStripePublishableKey() {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('[stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  }
  return STRIPE_PUBLISHABLE_KEY ?? '';
}

export function getStripeSecretKey() {
  if (!STRIPE_SECRET_KEY) {
    console.warn('[stripe] STRIPE_SECRET_KEY is not set');
  }
  return STRIPE_SECRET_KEY ?? '';
}

export function getStripeWebhookSecret() {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('[stripe] STRIPE_WEBHOOK_SECRET is not set');
  }
  return STRIPE_WEBHOOK_SECRET ?? '';
}
