import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { allocateTicketsForOrder } from '@/lib/ticket-allocator';

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

    if (order.status === 'PAID' && (!order.tickets || order.tickets.length === 0)) {
      await allocateTicketsForOrder(order.id);
      const { data: updatedOrder } = await supabase
        .from('Order')
        .select('*, tickets:Ticket(*), raffle:Raffle(*)')
        .eq('id', params.id)
        .single();
      return NextResponse.json(updatedOrder);
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 });
  }
}
