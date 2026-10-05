'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  UserGoalProfile,
  ActivityLevel,
  DietGoal,
  Gender,
  calculateDietMetrics,
  ACTIVITY_LABELS,
  DEFAULT_USER_PROFILE,
} from '@/lib/diet-calculator';
import { getStoredProfile, saveStoredProfile } from '@/lib/storage';
import { Calculator, Save, CheckCircle2, Flame, Target, Scale, Zap, Info } from 'lucide-react';

export default function GoalsPage() {
  const [profile, setProfile] = useState<UserGoalProfile>(DEFAULT_USER_PROFILE);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const metrics = calculateDietMetrics(profile);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 md:pb-12">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            🧮 Calculadora de Metas & TDEE
          </h1>
          <p className="text-xs text-slate-400">
            Configure seu perfil físico para obter metas de calorias e macronutrientes perfeitas para seu objetivo.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2 animate-fadeIn shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Minhas metas foram calculadas e salvas com sucesso!
          </div>
        )}

        {/* Simulador / Resultados Calculados em Tempo Real */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs font-extrabold uppercase text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" /> Suas Metas Calculadas Automaticamente
            </span>
            <span className="text-xs text-slate-400 font-bold">Base: Mifflin-St Jeor</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Taxa Basal (TMB)</span>
              <span className="text-xl font-black text-white mt-1 block">{metrics.bmr} kcal</span>
              <span className="text-[10px] text-slate-500">Energia em repouso</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Gasto Total (TDEE)</span>
              <span className="text-xl font-black text-amber-400 mt-1 block">{metrics.tdee} kcal</span>
              <span className="text-[10px] text-slate-500">Com exercícios</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">Meta Diária Alvo</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{metrics.targetCalories} kcal</span>
              <span className="text-[10px] text-slate-400">
                {profile.goal === 'lose' ? 'Deficit -20%' : profile.goal === 'gain' ? 'Superavit +15%' : 'Manutenção'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/30">
              <span className="text-[10px] text-sky-400 font-bold uppercase block">Água Recomendada</span>
              <span className="text-xl font-black text-sky-400 mt-1 block">{(metrics.waterGoalMl / 1000).toFixed(1)} L</span>
              <span className="text-[10px] text-slate-500">{metrics.waterGoalMl}ml por dia</span>
            </div>
          </div>

          {/* Divisão de Macros Recomendada */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Distribuição Diária Recomendada de Macros:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-400 font-bold block">Proteínas</span>
                <span className="text-base font-black text-white">{metrics.proteinGrams}g</span>
                <span className="text-[10px] text-slate-400">({metrics.proteinGrams * 4} kcal)</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-teal-500/20">
                <span className="text-teal-300 font-bold block">Carboidratos</span>
                <span className="text-base font-black text-white">{metrics.carbsGrams}g</span>
                <span className="text-[10px] text-slate-400">({metrics.carbsGrams * 4} kcal)</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-rose-500/20">
                <span className="text-rose-400 font-bold block">Gorduras</span>
                <span className="text-base font-black text-white">{metrics.fatGrams}g</span>
                <span className="text-[10px] text-slate-400">({metrics.fatGrams * 9} kcal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Perfil */}
        <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-xl">
          <h3 className="text-base font-black text-white border-b border-slate-800 pb-2">
            ⚙️ Dados Físicos & Objetivo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gênero */}
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Gênero BIológico</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as Gender })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium"
              >
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>

            {/* Idade */}
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Idade (anos)</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Math.max(1, Number(e.target.value) || 0) })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={profile.weightKg}
                onChange={(e) => setProfile({ ...profile, weightKg: Math.max(1, Number(e.target.value) || 0) })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            {/* Altura */}
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Altura (cm)</label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={(e) => setProfile({ ...profile, heightCm: Math.max(1, Number(e.target.value) || 0) })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>

          {/* Nível de Atividade */}
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Nível de Atividade Física</label>
            <select
              value={profile.activityLevel}
              onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as ActivityLevel })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium"
            >
              {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Objetivo Principal */}
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Seu Objetivo Nutricional</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'lose', label: '🔥 Perder Peso / Deficit', desc: 'Emagrecimento' },
                { key: 'maintain', label: '⚖️ Manter Peso', desc: 'Equilíbrio' },
                { key: 'gain', label: '💪 Ganhar Massa Muscular', desc: 'Superavit' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setProfile({ ...profile, goal: opt.key as DietGoal })}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    profile.goal === opt.key
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-extrabold text-xs block">{opt.label}</span>
                  <span className="text-[10px] text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Salvar Minhas Metas Nutricionais
          </button>
        </form>
      </main>
    </div>
  );
}
