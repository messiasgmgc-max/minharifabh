import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/finance';

export const revalidate = 0;

export default async function HomePage() {
  let raffles: any[] = [];
  try {
    const { data } = await supabase
      .from('Raffle')
      .select('*, tickets:Ticket(id)')
      .eq('status', 'ACTIVE')
      .order('createdAt', { ascending: false });
    raffles = data || [];
  } catch (e) {
    console.warn('Banco de dados ainda sem dados ou em migração.');
  }

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Hero Banner Mobile First de Conversão */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-12 text-center space-y-4 md:space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-1.5 bg-slate-950/90 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold text-emerald-400 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          ⚡ +18.420 COTAS ENTREGUES ESTA SEMANA
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
          Sua chance de mudar de vida na <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Rifa Milionária</span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed">
          Escolha suas cotas, pague via PIX instantâneo Mercado Pago e concorra a prêmios incríveis e PIX na hora!
        </p>

        {/* Selos de Confiança Mobile Friendly */}
        <div className="pt-1 flex flex-wrap justify-center gap-2 md:gap-4 text-[11px] md:text-xs font-bold text-slate-300">
          <span className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-xl flex items-center gap-1">
            🔒 100% Seguro PIX
          </span>
          <span className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-xl flex items-center gap-1">
            🏆 Prêmios na Hora
          </span>
          <span className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-xl flex items-center gap-1">
            ⚡ Entrega Automática
          </span>
        </div>
      </section>

      {/* Lista de Rifas */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-1.5">
            🔥 Sorteios Disponíveis
          </h2>
          <span className="text-[11px] md:text-xs font-bold text-emerald-400">Ao Vivo</span>
        </div>

        {raffles.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center space-y-4">
            <p className="text-slate-400 text-xs md:text-sm font-medium">Nenhuma rifa ativa no momento.</p>
            <Link href="/admin/rifas/nova" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
              + Criar Primeira Rifa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {raffles.map((raffle) => {
              const soldTicketsCount = raffle.tickets?.length || 0;
              const progressPercent = Math.min(Math.round((soldTicketsCount / raffle.totalQuotas) * 100), 100);

              return (
                <div key={raffle.id} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 flex flex-col group shadow-xl hover:shadow-2xl">
                  {/* Imagem do Produto com Ambient Blur adaptável a qualquer proporção (3:4, 4:3, 16:9) */}
                  <div className="relative h-52 sm:h-60 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    {/* Background Blur */}
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-xl scale-125 opacity-40 transform-gpu"
                      style={{ backgroundImage: `url(${raffle.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-slate-950/30" />

                    <img
                      src={raffle.imageUrl}
                      alt={raffle.title}
                      className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 right-2.5 z-20 bg-slate-950/90 backdrop-blur text-emerald-400 font-black text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-lg">
                      {formatCurrency(raffle.quotaPrice)} / cota
                    </div>
                    {raffle.hasInstantPrizes && (
                      <div className="absolute bottom-2.5 left-2.5 z-20 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                        🏆 Prêmios Instantâneos
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-black text-base md:text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {raffle.title}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-normal">
                        {raffle.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-1">
                      {/* Barra de Progresso Mobile */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Progresso</span>
                          <span className="text-emerald-400">{progressPercent}% vendido</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      {/* Botão de Compra em Destaque */}
                      <Link
                        href={`/rifa/${raffle.slug}`}
                        className="w-full block text-center bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 touch-manipulation"
                      >
                        GARANTIR COTAS AGORA ⚡
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
