import { supabase } from './supabase';

/**
 * Aloca os números de cotas para um pedido pago.
 * Se o comprador escolheu números manualmente (order.selectedNumbers), aloca esses números específicos.
 * Caso contrário, aloca aleatoriamente cotas disponíveis.
 * Também verifica e atribui prêmios instantâneos configurados.
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

  const takenNumbersSet = new Set((takenTickets || []).map((t: any) => t.number));

  let finalNumbers: number[] = [];

  // Se o pedido possui números manuais escolhidos pelo cliente
  if (order.selectedNumbers) {
    try {
      const parsed = typeof order.selectedNumbers === 'string'
        ? JSON.parse(order.selectedNumbers)
        : order.selectedNumbers;

      if (Array.isArray(parsed)) {
        // Pega apenas números válidos e que ainda não foram pegos
        for (const num of parsed) {
          const n = parseInt(num);
          if (!isNaN(n) && !takenNumbersSet.has(n)) {
            finalNumbers.push(n);
            takenNumbersSet.add(n);
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao processar order.selectedNumbers:', e);
    }
  }

  // Se faltar cotas para completar a quantidade total comprada, preenche com aleatórias
  if (finalNumbers.length < order.quantity) {
    const totalQuotas = order.raffle?.totalQuotas || 1000;
    const availableNumbers: number[] = [];

    for (let n = 1; n <= totalQuotas; n++) {
      if (!takenNumbersSet.has(n)) {
        availableNumbers.push(n);
      }
    }

    // Fisher-Yates shuffle
    for (let i = availableNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
    }

    const needed = order.quantity - finalNumbers.length;
    const additionalNumbers = availableNumbers.slice(0, needed);
    finalNumbers.push(...additionalNumbers);
  }

  // Mapeamento de Bilhetes Premiados Instantâneos
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

  const ticketsToCreate = finalNumbers.map((num) => ({
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
    console.log(`[Alocação de Cotas] Pedido ${order.id}: ${finalNumbers.length} cotas atribuídas com sucesso!`);
  }
}
