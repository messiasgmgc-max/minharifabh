'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { WeightEntry, getWeightHistory, addWeightEntry, getStoredProfile, saveStoredProfile } from '@/lib/storage';
import { TrendingUp, Plus, Calendar, Scale, Award, CheckCircle2 } from 'lucide-react';

export default function ProgressPage() {
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [profile, setProfile] = useState(getStoredProfile());
  const [newWeight, setNewWeight] = useState<number>(75);
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const refreshHistory = () => {
    const list = getWeightHistory();
    setHistory(list);
    const prof = getStoredProfile();
    setProfile(prof);
    setNewWeight(prof.weightKg);
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    addWeightEntry({
      weightKg: newWeight,
      date: entryDate,
      notes: notes || undefined,
    });

    // Atualiza o perfil também com o peso atualizado
    const updatedProfile = { ...profile, weightKg: newWeight };
    saveStoredProfile(updatedProfile);

    refreshHistory();
    setNotes('');
    setSuccessMsg(`Peso de ${newWeight}kg registrado para o dia ${entryDate}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const currentWeight = history.length > 0 ? history[history.length - 1].weightKg : profile.weightKg;
  const initialWeight = history.length > 0 ? history[0].weightKg : profile.weightKg;
  const diff = Number((currentWeight - initialWeight).toFixed(1));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 md:pb-12">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            📈 Evolução & Histórico de Peso
          </h1>
          <p className="text-xs text-slate-400">
            Acompanhe seu progresso ao longo do tempo e registre pesagens periódicas.
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {successMsg}
          </div>
        )}

        {/* Cards de Métricas de Progresso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold block">Peso Inicial Registrado</span>
            <span className="text-2xl font-black text-white">{initialWeight} kg</span>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-1 shadow-xl">
            <span className="text-xs text-emerald-400 font-semibold block">Peso Atual</span>
            <span className="text-2xl font-black text-emerald-400">{currentWeight} kg</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold block">Variação Total</span>
            <span className={`text-2xl font-black ${diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {diff > 0 ? `+${diff}` : diff} kg
            </span>
          </div>
        </div>

        {/* Form para Registrar Novo Peso */}
        <form onSubmit={handleAddWeight} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
          <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            ⚖️ Registrar Nova Pesagem
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Data da Pesagem</label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Peso Medido (kg)</label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-emerald-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Observações (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Em jejum, pós-treino..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Salvar Pesagem
          </button>
        </form>

        {/* Histórico de Pesagens */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            📅 Histórico de Pesagens
          </h3>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              Nenhuma pesagem registrada no histórico ainda. Preencha o formulário acima para iniciar seu registro.
            </p>
          ) : (
            <div className="divide-y divide-slate-800">
              {history.slice().reverse().map((entry) => (
                <div key={entry.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-sm text-white block">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                      {entry.notes && (
                        <span className="text-xs text-slate-400 font-medium">{entry.notes}</span>
                      )}
                    </div>
                  </div>

                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {entry.weightKg} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
