import { prisma } from './prisma';

/**
 * Aloca aleatoriamente números de cotas disponíveis para um pedido pago,
 * verificando bilhetes premiados instantâneos se ativos.
 */
export async function allocateTicketsForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { raffle: true }
  });

  if (!order || order.status !== 'PAID') return;

  // Verifica se o pedido já tem bilhetes gerados
  const existingTicketsCount = await prisma.ticket.count({
    where: { orderId: order.id }
  });

  if (existingTicketsCount >= order.quantity) return;

  // Busca todos os números já ocupados nesta rifa
  const takenTickets = await prisma.ticket.findMany({
    where: { raffleId: order.raffleId },
    select: { number: true }
  });

  const takenNumbersSet = new Set(takenTickets.map(t => t.number));
  const availableNumbers: number[] = [];

  for (let n = 1; n <= order.raffle.totalQuotas; n++) {
    if (!takenNumbersSet.has(n)) {
      availableNumbers.push(n);
    }
  }

  // Embaralha números disponíveis de forma segura
  for (let i = availableNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
  }

  const selectedNumbers = availableNumbers.slice(0, order.quantity);

  // Processa cotas premiadas se ativas
  let instantPrizesMap: Record<number, string> = {};
  if (order.raffle.hasInstantPrizes && order.raffle.instantPrizesDetails) {
    try {
      const details = JSON.parse(order.raffle.instantPrizesDetails);
      if (Array.isArray(details)) {
        details.forEach((p: { number: number; prize: string }) => {
          instantPrizesMap[p.number] = p.prize;
        });
      }
    } catch (e) {
      console.error('Erro ao ler bilhetes premiados JSON:', e);
    }
  }

  // Registra os bilhetes do pedido no banco de dados
  const ticketsToCreate = selectedNumbers.map((num) => ({
    raffleId: order.raffleId,
    orderId: order.id,
    number: num,
    isInstantWin: Boolean(instantPrizesMap[num]),
    instantPrize: instantPrizesMap[num] || null,
  }));

  await prisma.ticket.createMany({
    data: ticketsToCreate
  });

  console.log(`[Alocação de Cotas] Pedido ${order.id}: ${selectedNumbers.length} cotas atribuídas com sucesso!`);
}
