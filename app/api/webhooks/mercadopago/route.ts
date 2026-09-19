import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPaymentStatus } from '@/lib/mercadopago';
import { allocateTicketsForOrder } from '@/lib/ticket-allocator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[Webhook Mercado Pago Recebido]', body);

    const paymentId = body.data?.id || body.id;

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const paymentInfo = await getPaymentStatus(String(paymentId));
    const status = paymentInfo?.status || 'pending';
    const externalReference = paymentInfo?.externalReference || '';

    if (status === 'approved') {
      const { data: order } = await supabase
        .from('Order')
        .select('*')
        .or(`mpPaymentId.eq.${paymentId},id.eq.${externalReference}`)
        .maybeSingle();

      if (order && order.status !== 'PAID') {
        await supabase
          .from('Order')
          .update({ status: 'PAID' })
          .eq('id', order.id);

        await allocateTicketsForOrder(order.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
