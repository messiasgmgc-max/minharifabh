import { supabase } from './supabase';

/**
 * Aloca aleatoriamente números de cotas disponíveis para um pedido pago,
 * verificando bilhetes premiados instantâneos se ativos.
 */
export async function allocateTicketsForOrder(orderId: string) {
  const { data: order } = await supabase
    .from('Order')
    .select('*, raffle:Raffle(*)')
    .eq('id', orderId)
    .single();

  if (!order || order.status !== 'PAID') return;

  const { count: existingTicketsCount } = await supabase
    .from('Ticket')
    .select('*', { count: 'exact', head: true })
    .eq('orderId', order.id);

  if (existingTicketsCount && existingTicketsCount >= order.quantity) return;

  const { data: takenTickets } = await supabase
    .from('Ticket')
    .select('number')
    .eq('raffleId', order.raffleId);

  const takenNumbersSet = new Set((takenTickets || []).map(t => t.number));
  const availableNumbers: number[] = [];

  const totalQuotas = order.raffle?.totalQuotas || 1000;
  for (let n = 1; n <= totalQuotas; n++) {
    if (!takenNumbersSet.has(n)) {
      availableNumbers.push(n);
    }
  }

  for (let i = availableNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
  }

  const selectedNumbers = availableNumbers.slice(0, order.quantity);

  let instantPrizesMap: Record<number, string> = {};
  if (order.raffle?.hasInstantPrizes && order.raffle?.instantPrizesDetails) {
    try {
      const details = typeof order.raffle.instantPrizesDetails === 'string'
        ? JSON.parse(order.raffle.instantPrizesDetails)
        : order.raffle.instantPrizesDetails;
      if (Array.isArray(details)) {
        details.forEach((p: { number: number; prize: string }) => {
          instantPrizesMap[p.number] = p.prize;
        });
      }
    } catch (e) {
      console.error('Erro ao ler bilhetes premiados JSON:', e);
    }
  }

  const ticketsToCreate = selectedNumbers.map((num) => ({
    raffleId: order.raffleId,
    orderId: order.id,
    number: num,
    isInstantWin: Boolean(instantPrizesMap[num]),
    instantPrize: instantPrizesMap[num] || null,
  }));

  const { error } = await supabase.from('Ticket').insert(ticketsToCreate);
  if (error) {
    console.error('Erro ao inserir tickets via Supabase:', error);
  } else {
    console.log(`[Alocação de Cotas] Pedido ${order.id}: ${selectedNumbers.length} cotas atribuídas com sucesso!`);
  }
}
