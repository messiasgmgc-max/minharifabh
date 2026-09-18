import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { allocateTicketsForOrder } from '@/lib/ticket-allocator';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        tickets: true,
        raffle: true,
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Se estiver pago mas ainda sem cotas alocadas, executa a alocação
    if (order.status === 'PAID' && order.tickets.length === 0) {
      await allocateTicketsForOrder(order.id);
      const updatedOrder = await prisma.order.findUnique({
        where: { id: params.id },
        include: { tickets: true, raffle: true }
      });
      return NextResponse.json(updatedOrder);
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 });
  }
}
