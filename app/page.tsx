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
      .order('createdAt', { ascending: false });
    raffles = data || [];
  } catch (e) {
    console.warn('Banco de dados ainda sem dados ou em migração.');
  }

  return (
    <div className="space-y-10">
      {/* Hero Banner de Conversão & Gatilhos Mentais */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-3xl p-6 md:p-12 text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 bg-slate-950/80 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-400 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          ⚡ +18.420 BILHETES ENTREGUES ESTA SEMANA
        </div>

        <h1 className="text-3xl md:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Sua chance de mudar de vida na <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Rifa Milionária</span>
        </h1>

        <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto font-medium">
          Escolha suas cotas, pague via PIX instantâneo Mercado Pago e concorra a prêmios incríveis e PIX na hora!
        </p>

        {/* Selos de Confiança */}
        <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-extrabold text-slate-300">
          <span className="bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5">
            🔒 100% Seguro PIX
          </span>
          <span className="bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5">
            🏆 Prêmios Instantâneos
          </span>
          <span className="bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5">
            ⚡ Entrega Automática
          </span>
        </div>
      </section>

      {/* Rifa List */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🔥 Sorteios Ativos
          </h2>
          <span className="text-xs font-bold text-slate-400">Escolha sua sorte abaixo</span>
        </div>

        {raffles.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <p className="text-slate-400 text-sm font-medium">Nenhuma rifa ativa no momento.</p>
            <Link href="/admin/rifas/nova" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20">
              + Criar Primeira Rifa no Admin
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => {
              const soldTicketsCount = raffle.tickets?.length || 0;
              const progressPercent = Math.min(Math.round((soldTicketsCount / raffle.totalQuotas) * 100), 100);

              return (
                <div key={raffle.id} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col group shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10">
                  <div className="relative h-56 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={raffle.imageUrl}
                      alt={raffle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur text-emerald-400 font-black text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-lg">
                      {formatCurrency(raffle.quotaPrice)} / cota
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {raffle.title}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {raffle.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Progresso de Cotas */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">Progresso</span>
                          <span className="text-emerald-400">{progressPercent}% vendido</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      <Link
                        href={`/rifa/${raffle.slug}`}
                        className="w-full block text-center bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 transform active:scale-95"
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
