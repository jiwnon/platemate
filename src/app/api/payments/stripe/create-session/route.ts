import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getStripeSecretKey } from '@/lib/payments/stripe';

/** KRW → USD (결제용, 대략 1300원 = 1달러) */
const KRW_TO_USD = 1 / 1300;

type Body = {
  orderId: string;
  successUrl: string;
  cancelUrl: string;
};

export async function POST(request: Request) {
  try {
    const secret = getStripeSecretKey();
    if (!secret) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Body;
    const { orderId, successUrl, cancelUrl } = body;

    if (!orderId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'orderId, successUrl, cancelUrl required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total_amount, payment_status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
    }

    const amountKrw = Number(order.total_amount);
    const amountUsdCents = Math.round((amountKrw * KRW_TO_USD) * 100);

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'alipay', 'wechat_pay'],
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountUsdCents,
            product_data: {
              name: `Order ${orderId.slice(0, 8)}`,
              description: 'Platemate restaurant order',
            },
          },
        },
      ],
      metadata: { orderId },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create session URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[payments/stripe/create-session]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
