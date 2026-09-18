import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Rifa Milionária | Sorteios Exclusivos e Prêmios Milionários',
  description: 'Compre cotas online na Rifa Milionária (rifamilionaria.com) com PIX automático Mercado Pago e premiação instantânea!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans selection:bg-emerald-500 selection:text-slate-950">
        {/* Header Rebranded */}
        <header className="border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-white group">
              <span className="bg-gradient-to-tr from-emerald-400 via-teal-300 to-amber-300 text-slate-950 px-2.5 py-1 rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                RM
              </span>
              <span className="text-white tracking-tight">
                Rifa <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Milionária</span>
              </span>
            </Link>

            <nav className="flex items-center gap-4 text-xs md:text-sm font-bold">
              <Link href="/" className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                🔥 Sorteios Ativos
              </Link>
              <Link href="/meus-numeros" className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                🔍 Meus Números
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
          <p className="font-extrabold text-slate-400">Rifa Milionária (rifamilionaria.com) • Todos os direitos reservados</p>
          <p className="text-[11px] text-slate-600">Pagamentos 100% Seguros via Mercado Pago PIX • Entrega Garantida</p>
        </footer>
      </body>
    </html>
  );
}
