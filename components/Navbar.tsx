'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, Calculator, Apple, Dumbbell, TrendingUp, Sparkles } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Diário', icon: Utensils },
    { href: '/metas', label: 'Minhas Metas', icon: Calculator },
    { href: '/alimentos', label: 'Alimentos', icon: Apple },
    { href: '/exercicios', label: 'Exercícios', icon: Dumbbell },
    { href: '/evolucao', label: 'Evolução Peso', icon: TrendingUp },
  ];

  return (
    <header className="border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-300 text-slate-950 p-2 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 font-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white leading-tight">
              Nutri<span className="text-emerald-400">Track</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Dieta & Calorias
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Nav Button */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href="/metas"
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
          >
            <Calculator className="w-3.5 h-3.5" /> Metas
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-emerald-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-400' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
