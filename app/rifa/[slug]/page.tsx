import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/finance';
import { notFound } from 'next/navigation';
import { RaffleCheckoutForm } from '@/components/RaffleCheckoutForm';

export const revalidate = 0;

export default async function RaffleDetailPage({ params }: { params: { slug: string } }) {
  let raffle: any = null;
  try {
    const { data } = await supabase
      .from('Raffle')
      .select('*, tickets:Ticket(*, order:Order(*))')
      .eq('slug', params.slug)
      .single();
    raffle = data;
  } catch (e) {
    console.error(e);
  }

  if (!raffle) notFound();

  const soldCount = raffle.tickets?.length || 0;
  const availableQuotas = Math.max(0, raffle.totalQuotas - soldCount);
  const progressPercent = Math.min(Math.round((soldCount / raffle.totalQuotas) * 100), 100);

  const instantWinners = (raffle.tickets || []).filter((t: any) => t.isInstantWin && t.order);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Banner Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative h-72 md:h-96 w-full bg-slate-950">
          <img src={raffle.imageUrl} alt={raffle.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                🔥 Sorteio Ativo minharifabh
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-white mt-2">{raffle.title}</h1>
            </div>
            <div className="bg-slate-950/90 backdrop-blur border border-emerald-500/40 px-5 py-2.5 rounded-2xl text-left md:text-right shadow-xl">
              <span className="text-[11px] text-slate-400 block font-bold uppercase">Valor da Cota</span>
              <span className="text-2xl font-black text-emerald-400">{formatCurrency(raffle.quotaPrice)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Progresso de Vendas */}
          <div className="space-y-2 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Progresso ({soldCount} / {raffle.totalQuotas} cotas vendidas)</span>
              <span className="text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-xs text-slate-500 text-right font-medium">
              Data Prevista do Sorteio: {new Date(raffle.drawDate).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sobre o Prêmio</h3>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">{raffle.description}</p>
          </div>

          {/* Bilhetes Premiados Instantâneos */}
          {raffle.hasInstantPrizes && (
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-amber-400 flex items-center gap-2 text-base">
                  🏆 Bilhetes Premiados Instantâneos
                </h3>
                <span className="text-xs bg-amber-400 text-slate-950 px-3 py-1 rounded-full font-black">
                  {raffle.instantPrizesCount} Prêmios Liberados
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Comprou suas cotas? Se você tirar um bilhete premiado, o valor cai na sua conta na hora via PIX!
              </p>

              {/* Mural de Ganhadores */}
              {instantWinners.length > 0 && (
                <div className="mt-4 space-y-2 pt-4 border-t border-amber-500/20">
                  <h4 className="text-xs font-bold uppercase text-amber-300">Ganhadores da Sorte (Quem tirou bilhete premiado):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {instantWinners.map((w: any) => (
                      <div key={w.id} className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">{w.order?.buyerName}</span>
                          <span className="text-slate-400 text-[10px]">Cota #{String(w.number).padStart(4, '0')}</span>
                        </div>
                        <span className="text-amber-400 font-extrabold">{w.instantPrize}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form de Checkout Interativo (Client Component) */}
          <RaffleCheckoutForm
            raffleId={raffle.id}
            quotaPrice={raffle.quotaPrice}
            availableQuotas={availableQuotas}
          />
        </div>
      </div>
    </div>
  );
}
