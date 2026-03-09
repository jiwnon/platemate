import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';

type Params = { params: Promise<{ restaurantId: string; tableId: string }> };

const DEFAULT_LOCALE = 'ko';
const DEFAULT_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000';

/** 테이블 주문 URL용 QR 코드 PNG 반환 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { restaurantId, tableId } = await params;
    if (!restaurantId || !tableId) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const baseUrl = request.nextUrl.searchParams.get('baseUrl')?.replace(/\/$/, '') || DEFAULT_BASE;
    const locale = request.nextUrl.searchParams.get('locale') || DEFAULT_LOCALE;
    const orderUrl = `${baseUrl}/${locale}/order/${restaurantId}/${tableId}`;

    const png = await QRCode.toBuffer(orderUrl, {
      type: 'png',
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
    });

    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-table-${tableId}.png"`,
      },
    });
  } catch (err) {
    console.error('[tables QR]', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
