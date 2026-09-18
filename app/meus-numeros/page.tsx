import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/finance';

export const revalidate = 0;

export default async function MyNumbersPage({ searchParams }: { searchParams: { phone?: string } }) {
  const phoneQuery = searchParams.phone || '';

  const orders = phoneQuery ? await prisma.order.findMany({
    where: {
      buyerPhone: { contains: phoneQuery },
      status: 'PAID'
    },
    include: {
      raffle: true,
      tickets: true,
    },
    orderBy: { createdAt: 'desc' }
  }) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white">Consultar Meus Números</h1>
        <p className="text-xs text-slate-400">Digite seu telefone cadastrado para visualizar suas cotas compradas.</p>
      </div>

      <form className="flex gap-2">
        <input
          type="tel"
          name="phone"
          defaultValue={phoneQuery}
          placeholder="Digite seu Telefone (ex: 11999999999)"
          required
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm transition-all"
        >
          Buscar
        </button>
      </form>

      {phoneQuery && (
        <div className="space-y-4 pt-4">
          {orders.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhuma cota paga encontrada para este número.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-base">{order.raffle.title}</h3>
                    <span className="text-xs text-slate-400">{order.quantity} cotas • {formatCurrency(order.totalAmount)}</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs px-2.5 py-0.5 rounded">
                    PAID
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {order.tickets.map(t => (
                    <span key={t.id} className="bg-slate-950 text-slate-200 border border-slate-800 text-xs px-2.5 py-1 rounded font-mono font-bold">
                      #{String(t.number).padStart(4, '0')}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
