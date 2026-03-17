import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Body = {
  couponCode: string;
  orderId: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const { couponCode, orderId } = body;

    if (!couponCode || !orderId) {
      return NextResponse.json({ error: '쿠폰 코드와 주문 ID가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 주문 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, restaurant_id, total_amount, discount_amount, coupon_code')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (order.coupon_code) {
      return NextResponse.json({ error: '이미 쿠폰이 적용된 주문입니다.' }, { status: 400 });
    }

    // 쿠폰 조회
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('id, restaurant_id, discount_percent, is_used, expires_at')
      .eq('code', couponCode.toUpperCase())
      .single();

    if (couponError || !coupon) {
      return NextResponse.json({ error: '유효하지 않은 쿠폰 코드입니다.' }, { status: 404 });
    }

    if (coupon.is_used) {
      return NextResponse.json({ error: '이미 사용된 쿠폰입니다.' }, { status: 400 });
    }

    if (new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: '만료된 쿠폰입니다.' }, { status: 400 });
    }

    if (coupon.restaurant_id !== order.restaurant_id) {
      return NextResponse.json({ error: '이 식당에서 사용할 수 없는 쿠폰입니다.' }, { status: 400 });
    }

    const discountAmount = Math.round((order.total_amount * coupon.discount_percent) / 100);
    const finalAmount = order.total_amount - discountAmount;

    // 주문에 할인 적용
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ coupon_code: couponCode.toUpperCase(), discount_amount: discountAmount })
      .eq('id', orderId);

    if (orderUpdateError) {
      console.error('[coupons/apply] order update error', orderUpdateError);
      return NextResponse.json({ error: '쿠폰 적용에 실패했습니다.' }, { status: 500 });
    }

    // 쿠폰 사용 처리
    const { error: couponUpdateError } = await supabase
      .from('coupons')
      .update({ is_used: true, used_at: new Date().toISOString(), used_order_id: orderId })
      .eq('id', coupon.id);

    if (couponUpdateError) {
      console.error('[coupons/apply] coupon update error', couponUpdateError);
    }

    return NextResponse.json({
      ok: true,
      discountPercent: coupon.discount_percent,
      discountAmount,
      finalAmount,
    });
  } catch (err) {
    console.error('[coupons/apply]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
