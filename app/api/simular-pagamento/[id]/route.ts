import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { allocateTicketsForOrder } from '@/lib/ticket-allocator';

// Endpoint auxiliar para testar a aprovação do PIX no ambiente de teste/demo
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'PAID' }
    });

    await allocateTicketsForOrder(order.id);

    return NextResponse.json({ success: true, message: 'Pagamento PIX aprovado com sucesso!' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao simular pagamento' }, { status: 500 });
  }
}
