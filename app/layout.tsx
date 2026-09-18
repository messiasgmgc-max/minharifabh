import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'minharifabh | Sua Rifa de Prêmios Incríveis em BH',
  description: 'Compre cotas online na minharifabh com PIX automático Mercado Pago e premiação instantânea!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans selection:bg-emerald-500 selection:text-slate-950">
        {/* Header Rebranded */}
        <header className="border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-white group">
              <span className="bg-gradient-to-tr from-emerald-500 to-teal-300 text-slate-950 px-2.5 py-1 rounded-2xl font-black text-base shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                BH
              </span>
              <span className="text-white">minha<span className="text-emerald-400">rifa</span><span className="text-amber-400">bh</span></span>
            </Link>

            <nav className="flex items-center gap-4 text-xs md:text-sm font-bold">
              <Link href="/" className="text-slate-300 hover:text-emerald-400 transition-colors">
                🔥 Rifas Ativas
              </Link>
              <Link href="/meus-numeros" className="text-slate-300 hover:text-emerald-400 transition-colors">
                🔍 Meus Números
              </Link>
              <Link href="/admin" className="bg-slate-900 hover:bg-slate-800 text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-500/30 transition-all text-xs font-extrabold shadow-sm">
                ⚙️ Admin
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-xs text-slate-500 space-y-2">
          <p className="font-extrabold text-slate-400">minharifabh • Todos os direitos reservados</p>
          <p className="text-[11px] text-slate-600">Pagamentos 100% Seguros via Mercado Pago PIX • Entrega Garantida</p>
        </footer>
      </body>
    </html>
  );
}
