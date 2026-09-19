import './globals.css';
import Link from 'next/link';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Rifa Milionária | Sorteios Exclusivos e Prêmios Milionários',
  description: 'Compre cotas online na Rifa Milionária (rifamilionaria.com) com PIX automático Mercado Pago e premiação instantânea!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Rifa Milionária',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#030712',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans selection:bg-emerald-500 selection:text-slate-950">
        {/* Header Mobile First com Efeito Glassmorphism */}
        <header className="border-b border-emerald-500/20 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-black tracking-tight text-white group">
              <span className="bg-gradient-to-tr from-emerald-400 via-teal-300 to-amber-300 text-slate-950 px-2 py-0.5 md:px-2.5 md:py-1 rounded-xl font-black text-xs md:text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                RM
              </span>
              <span className="text-white tracking-tight text-lg md:text-2xl">
                Rifa <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Milionária</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4 text-sm font-bold">
              <Link href="/" className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                🔥 Sorteios Ativos
              </Link>
              <Link href="/meus-numeros" className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                🔍 Meus Números
              </Link>
              <Link href="/admin" className="text-slate-500 hover:text-slate-300 transition-colors text-xs">
                ⚙️ Admin
              </Link>
            </nav>

            {/* Mobile Quick Action Pill */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/meus-numeros"
                className="bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform"
              >
                <span>🔍</span> Meus Números
              </Link>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal com compensação de padding para barra inferior mobile */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-8">
          {children}
        </main>

        {/* Barra de Navegação Inferior Fixa (Mobile Bottom Bar) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-6 py-2.5 flex justify-around items-center md:hidden pb-safe shadow-2xl">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 active:scale-90 transition-transform"
          >
            <span className="text-lg">🔥</span>
            <span className="text-[10px] font-bold tracking-tight">Sorteios</span>
          </Link>
          <Link
            href="/meus-numeros"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 active:scale-90 transition-transform"
          >
            <span className="text-lg">🔍</span>
            <span className="text-[10px] font-bold tracking-tight">Meus Números</span>
          </Link>
          <Link
            href="/admin"
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 active:scale-90 transition-transform"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] font-bold tracking-tight">Admin</span>
          </Link>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 space-y-2 mb-14 md:mb-0">
          <p className="font-extrabold text-slate-400">Rifa Milionária (rifamilionaria.com) • Todos os direitos reservados</p>
          <p className="text-[11px] text-slate-600">Pagamentos 100% Seguros via Mercado Pago PIX • Entrega Garantida</p>
        </footer>
      </body>
    </html>
  );
}
