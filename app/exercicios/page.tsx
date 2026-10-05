'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { INITIAL_EXERCISE_DATABASE, calculateCaloriesBurned } from '@/lib/nutrition-db';
import { getStoredProfile, addExerciseLog } from '@/lib/storage';
import { Dumbbell, Flame, Plus, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function ExercisesPage() {
  const [profile, setProfile] = useState(getStoredProfile());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [durations, setDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const categories = ['all', 'Força', 'Cardio', 'Esporte'];

  const filteredExercises = INITIAL_EXERCISE_DATABASE.filter(e =>
    selectedCategory === 'all' || e.category === selectedCategory
  );

  const handleQuickAdd = (ex: typeof INITIAL_EXERCISE_DATABASE[0]) => {
    const duration = durations[ex.id] || 45;
    const burned = calculateCaloriesBurned(ex.met, profile.weightKg, duration);
    const today = new Date().toISOString().split('T')[0];

    addExerciseLog({
      name: `${ex.icon} ${ex.name}`,
      durationMinutes: duration,
      caloriesBurned: burned,
      date: today,
    });

    setSuccessMsg(`Treino "${ex.name}" (${duration} min, -${burned} kcal) adicionado ao diário de hoje!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 md:pb-12">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            🏃 Atividades & Gastos Calóricos
          </h1>
          <p className="text-xs text-slate-400">
            Veja estimativas de queima calórica baseadas no seu peso atual de <strong className="text-emerald-400">{profile.weightKg} kg</strong>.
          </p>
        </div>

        {successMsg && (
          <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl text-xs font-bold text-orange-400 flex items-center gap-2 shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-5 h-5" /> {successMsg}
          </div>
        )}

        {/* Categorias */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-slate-950 border-orange-400 font-black'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Todas Atividades' : cat}
            </button>
          ))}
        </div>

        {/* Lista de Exercícios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExercises.map((ex) => {
            const currentDuration = durations[ex.id] || 45;
            const burned = calculateCaloriesBurned(ex.met, profile.weightKg, currentDuration);

            return (
              <div
                key={ex.id}
                className="bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-3xl p-5 space-y-4 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ex.icon}</span>
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors">
                        {ex.name}
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase bg-slate-950 text-orange-400 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                        {ex.category} • MET {ex.met}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seleção de Duração */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                    <Clock className="w-4 h-4 text-orange-400" /> Duração:
                    <select
                      value={currentDuration}
                      onChange={(e) => setDurations({ ...durations, [ex.id]: Number(e.target.value) })}
                      className="bg-slate-900 border border-slate-700 text-white font-mono rounded-xl p-1.5 text-xs font-bold"
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-bold">Queima estimada:</span>
                    <span className="text-lg font-black text-orange-400 flex items-center justify-end gap-0.5">
                      <Flame className="w-4 h-4" /> -{burned} kcal
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickAdd(ex)}
                  className="w-full bg-slate-800 hover:bg-orange-500 hover:text-slate-950 text-orange-400 font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all border border-orange-500/30 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Adicionar ao Diário de Hoje
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
