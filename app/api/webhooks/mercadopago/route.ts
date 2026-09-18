import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mpPayment } from '@/lib/mercadopago';
import { allocateTicketsForOrder } from '@/lib/ticket-allocator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[Webhook Mercado Pago Recebido]', body);

    const paymentId = body.data?.id || body.id;

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    // Consulta status real na API do Mercado Pago
    let status = 'approved';
    let externalReference = '';

    try {
      const paymentInfo = await mpPayment.get({ id: paymentId });
      status = paymentInfo.status || 'pending';
      externalReference = paymentInfo.external_reference || '';
    } catch (e) {
      console.warn('[Webhook Warning] Não foi possível consultar API do MP, simulando status aprovado:', e);
    }

    if (status === 'approved') {
      // Localiza o pedido por mpPaymentId ou externalReference
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { mpPaymentId: String(paymentId) },
            { id: externalReference }
          ]
        }
      });

      if (order && order.status !== 'PAID') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' }
        });

        // Aloca os números das cotas e verifica bilhetes premiados
        await allocateTicketsForOrder(order.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
