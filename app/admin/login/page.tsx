import React from 'react';
import { loginAdminAction } from '@/app/actions';

export const revalidate = 0;

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const isError = searchParams?.error === 'invalid';

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-2xl text-emerald-400 mb-2">
            🔐
          </div>
          <h1 className="text-2xl font-black text-white">Painel Administrativo</h1>
          <p className="text-xs text-slate-400">
            Digite a senha de administrador da <span className="text-emerald-400 font-bold">minharifabh</span> para acessar.
          </p>
        </div>

        {isError && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-xs font-bold text-rose-400 text-center animate-shake">
            ⚠️ Senha incorreta. Tente novamente.
          </div>
        )}

        <form action={loginAdminAction} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">
              Senha de Acesso
            </label>
            <input
              type="password"
              name="password"
              placeholder="Digite a senha admin..."
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            Entrar no Painel 🚀
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[11px] text-slate-600">
            Acesso Restrito • minharifabh Security System
          </span>
        </div>
      </div>
    </div>
  );
}
