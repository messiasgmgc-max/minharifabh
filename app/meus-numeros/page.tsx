import { supabase } from '@/lib/supabase';
import { formatCurrency, formatTicketNumber } from '@/lib/finance';

export const revalidate = 0;

export default async function MyNumbersPage({ searchParams }: { searchParams: { phone?: string } }) {
  const rawPhoneQuery = searchParams.phone || '';
  const cleanPhone = rawPhoneQuery.replace(/\D/g, '');

  let orders: any[] = [];
  if (cleanPhone || rawPhoneQuery) {
    try {
      let query = supabase
        .from('Order')
        .select('*, raffle:Raffle(*), tickets:Ticket(*)')
        .eq('status', 'PAID')
        .order('createdAt', { ascending: false });

      if (cleanPhone) {
        query = query.or(`buyerPhone.ilike.%${cleanPhone}%,buyerPhone.ilike.%${rawPhoneQuery}%`);
      } else {
        query = query.ilike('buyerPhone', `%${rawPhoneQuery}%`);
      }

      const { data } = await query;
      orders = data || [];
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-2 sm:py-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          🔍 Consultar Meus Números
        </h1>
        <p className="text-xs text-slate-400">
          Digite seu telefone ou WhatsApp para ver seus números comprados.
        </p>
      </div>

      <form className="flex flex-col sm:flex-row gap-2 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl">
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          name="phone"
          defaultValue={rawPhoneQuery}
          placeholder="DDD + Telefone (ex: 31999999999)"
          required
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
        />
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-emerald-500/20"
        >
          Buscar Números
        </button>
      </form>

      {rawPhoneQuery && (
        <div className="space-y-3 pt-2">
          {orders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <p className="text-sm font-bold text-white">Nenhuma cota paga encontrada.</p>
              <p className="text-xs text-slate-500">Verifique se digitou o mesmo número de telefone usado no momento do pagamento.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-black text-white text-sm sm:text-base line-clamp-1">{order.raffle?.title}</h3>
                    <span className="text-[11px] text-slate-400 font-medium">{order.quantity} cotas • Total: {formatCurrency(order.totalAmount)}</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                    PAGO ✓
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Suas Cotas:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-0.5">
                    {order.tickets?.map((t: any) => (
                      <span key={t.id} className="bg-slate-950 text-emerald-400 border border-slate-800 text-xs px-2.5 py-1 rounded-lg font-mono font-black">
                        #{formatTicketNumber(t.number, order?.raffle?.totalQuotas)}
                        {t.isInstantWin && ' 🏆'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
