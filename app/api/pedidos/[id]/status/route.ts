import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { allocateTicketsForOrder } from '@/lib/ticket-allocator';
import { getPaymentStatus } from '@/lib/mercadopago';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { data: order } = await supabase
      .from('Order')
      .select('*, tickets:Ticket(*), raffle:Raffle(*)')
      .eq('id', params.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Se já está pago, garante que os tickets foram alocados
    if (order.status === 'PAID') {
      if (!order.tickets || order.tickets.length === 0) {
        await allocateTicketsForOrder(order.id);
        const { data: updatedOrder } = await supabase
          .from('Order')
          .select('*, tickets:Ticket(*), raffle:Raffle(*)')
          .eq('id', params.id)
          .single();
        return NextResponse.json(updatedOrder);
      }
      return NextResponse.json(order);
    }

    // Se ainda está pendente, verifica expiração de 5 minutos
    if (order.status === 'PENDING') {
      const now = new Date();
      const expiresAt = new Date(order.expiresAt);

      if (now > expiresAt) {
        // Marca como expirado no banco
        await supabase
          .from('Order')
          .update({ status: 'EXPIRED' })
          .eq('id', order.id);

        return NextResponse.json({ ...order, status: 'EXPIRED' });
      }

      // Consulta ativa no Mercado Pago caso tenha paymentId
      if (order.mpPaymentId) {
        const paymentInfo = await getPaymentStatus(order.mpPaymentId);

        if (paymentInfo?.status === 'approved') {
          await supabase
            .from('Order')
            .update({ status: 'PAID' })
            .eq('id', order.id);

          await allocateTicketsForOrder(order.id);

          const { data: updatedOrder } = await supabase
            .from('Order')
            .select('*, tickets:Ticket(*), raffle:Raffle(*)')
            .eq('id', params.id)
            .single();

          return NextResponse.json(updatedOrder);
        } else if (paymentInfo?.status === 'cancelled' || paymentInfo?.status === 'rejected') {
          await supabase
            .from('Order')
            .update({ status: 'CANCELLED' })
            .eq('id', order.id);

          return NextResponse.json({ ...order, status: 'CANCELLED' });
        }
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erro na verificação de status do pedido:', error);
    return NextResponse.json({ error: 'Erro ao verificar status do pedido' }, { status: 500 });
  }
}
