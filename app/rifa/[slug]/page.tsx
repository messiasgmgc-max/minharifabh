import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/finance';
import { notFound } from 'next/navigation';
import { RaffleCheckoutForm } from '@/components/RaffleCheckoutForm';
import { RaffleImageGallery } from '@/components/RaffleImageGallery';

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
  const takenNumbers = (raffle.tickets || []).map((t: any) => t.number);

  let imageList: string[] = [];
  if (raffle.images) {
    try {
      const parsed = typeof raffle.images === 'string' ? JSON.parse(raffle.images) : raffle.images;
      if (Array.isArray(parsed) && parsed.length > 0) imageList = parsed;
    } catch (e) {
      console.warn('Erro ao processar images JSON:', e);
    }
  }
  if (imageList.length === 0 && raffle.imageUrl) {
    imageList = [raffle.imageUrl];
  }

  const isActive = raffle.status === 'ACTIVE';

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* Aviso se a rifa estiver desativada/pausada */}
      {!isActive && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-center space-y-1 text-rose-300 shadow-xl">
          <span className="font-black text-sm block">⚠️ SORTEIO PAUSADO / DESATIVADO</span>
          <p className="text-xs text-rose-400/90">Este sorteio não está aceitando novas compras de cotas no momento.</p>
        </div>
      )}

      {/* Galeria de Fotos Multi-Imagem 16:9 / 4:3 Comportada */}
      <div className="space-y-3">
        <RaffleImageGallery images={imageList} title={raffle.title} />

        {/* Título e Valor da Cota */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
              {isActive ? '🔥 Sorteio Ativo' : '🔴 Sorteio Pausado'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {raffle.title}
            </h1>
          </div>

          <div className="bg-slate-950 border border-emerald-500/40 px-4 py-2 rounded-xl text-left sm:text-right shadow-lg self-start sm:self-auto">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Valor da Cota</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{formatCurrency(raffle.quotaPrice)}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 shadow-2xl">
        {/* Progresso de Vendas */}
        <div className="space-y-1.5 bg-slate-950 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800">
          <div className="flex justify-between text-[11px] sm:text-xs font-bold">
            <span className="text-slate-400">Progresso ({soldCount} / {raffle.totalQuotas} cotas)</span>
            <span className="text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 sm:h-3 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 text-right font-medium pt-0.5">
            {raffle.drawDate
              ? `Data do Sorteio: ${new Date(raffle.drawDate).toLocaleDateString('pt-BR')}`
              : '🎯 Sorteio ao finalizar 100% das cotas'}
          </p>
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sobre o Prêmio</h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-line">{raffle.description}</p>
        </div>

        {/* Bilhetes Premiados Instantâneos */}
        {raffle.hasInstantPrizes && (
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-amber-400 flex items-center gap-1.5 text-sm sm:text-base">
                🏆 Bilhetes Premiados na Hora
              </h3>
              <span className="text-[10px] sm:text-xs bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black">
                {raffle.instantPrizesCount} Prêmios
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Comprou suas cotas? Se você tirar um bilhete premiado, o valor cai na sua conta na hora via PIX!
            </p>

            {/* Mural de Ganhadores */}
            {instantWinners.length > 0 && (
              <div className="mt-3 space-y-2 pt-3 border-t border-amber-500/20">
                <h4 className="text-[11px] font-bold uppercase text-amber-300">Ganhadores Recentes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {instantWinners.map((w: any) => (
                    <div key={w.id} className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 text-xs flex justify-between items-center">
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

        {/* Form de Checkout Interativo se ativa */}
        {isActive ? (
          <div id="checkout-section">
            <RaffleCheckoutForm
              raffleId={raffle.id}
              quotaPrice={raffle.quotaPrice}
              availableQuotas={availableQuotas}
              totalQuotas={raffle.totalQuotas}
              selectionMode={raffle.selectionMode || 'BOTH'}
              takenNumbers={takenNumbers}
            />
          </div>
        ) : (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
            <p className="text-sm font-bold text-slate-400">As vendas para esta rifa estão pausadas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
