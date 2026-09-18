import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { allocateTicketsForOrder } from '@/lib/ticket-allocator';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { data: order, error } = await supabase
      .from('Order')
      .update({ status: 'PAID' })
      .eq('id', params.id)
      .select()
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 404 });
    }

    await allocateTicketsForOrder(order.id);

    return NextResponse.json({ success: true, message: 'Pagamento PIX aprovado com sucesso!' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao simular pagamento' }, { status: 500 });
  }
}
