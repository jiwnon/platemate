import { NextResponse } from 'next/server';
import { getCurrentUser, getOwnedRestaurantIds } from '@/lib/auth/server';
import { scanMenuFromImage } from '@/lib/openai/client';

type Params = { params: Promise<{ restaurantId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { restaurantId } = await params;
    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const owned = await getOwnedRestaurantIds();
    if (!owned.includes(restaurantId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'image required' }, { status: 400 });
    }

    const mimeType = file.type || 'image/jpeg';
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const imageBase64 = btoa(binary);

    const items = await scanMenuFromImage(imageBase64, mimeType);
    return NextResponse.json({ items });
  } catch (err) {
    console.error('[menu/scan POST]', err);
    return NextResponse.json({ error: 'Failed to parse menu from image' }, { status: 500 });
  }
}
