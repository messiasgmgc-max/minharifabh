'use client';

import React, { useState } from 'react';
import { INITIAL_EXERCISE_DATABASE, calculateCaloriesBurned, ExerciseItem } from '@/lib/nutrition-db';
import { X, Dumbbell, Flame, Clock } from 'lucide-react';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWeightKg: number;
  onAddExercise: (exercise: {
    name: string;
    durationMinutes: number;
    caloriesBurned: number;
  }) => void;
}

export function AddExerciseModal({ isOpen, onClose, userWeightKg, onAddExercise }: AddExerciseModalProps) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedExercise) return;
    const burned = calculateCaloriesBurned(selectedExercise.met, userWeightKg, durationMinutes);
    onAddExercise({
      name: `${selectedExercise.icon} ${selectedExercise.name}`,
      durationMinutes,
      caloriesBurned: burned,
    });
    setSelectedExercise(null);
    setDurationMinutes(45);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              🏃 Registrador de Treino & Exercício
            </h3>
            <p className="text-xs text-slate-400">Calcule e adicione a queima calórica ao seu diário</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedExercise ? (
          <div className="bg-slate-950 border border-orange-500/30 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl mr-2">{selectedExercise.icon}</span>
                <span className="text-[10px] font-extrabold uppercase bg-orange-500/10 text-orange-400 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  {selectedExercise.category}
                </span>
                <h4 className="text-base font-black text-white mt-1">{selectedExercise.name}</h4>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 underline"
              >
                Trocar
              </button>
            </div>

            {/* Duration Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-400" /> Duração do Treino:
                </span>
                <span className="text-orange-400 font-extrabold text-sm">{durationMinutes} minutos</span>
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value) || 0))}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-xl p-3 text-center text-base font-black text-white focus:outline-none focus:border-orange-400 font-mono"
                />
                
                <div className="flex flex-wrap gap-1.5">
                  {[15, 30, 45, 60, 90].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setDurationMinutes(quick)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        durationMinutes === quick
                          ? 'bg-orange-500 text-slate-950 border-orange-400 font-black'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {quick} min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Estimated Burn Display */}
            {(() => {
              const burned = calculateCaloriesBurned(selectedExercise.met, userWeightKg, durationMinutes);
              return (
                <div className="bg-slate-900 border border-orange-500/20 p-4 rounded-xl text-center space-y-1">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Estimativa de Calorias Queimadas</span>
                  <span className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 text-orange-400" /> -{burned} kcal
                  </span>
                  <span className="text-[11px] text-slate-500">Calculado para seu peso atual de {userWeightKg}kg</span>
                </div>
              );
            })()}

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-4 h-4" /> Registrar Exercício
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[350px]">
            {INITIAL_EXERCISE_DATABASE.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/40 p-3.5 rounded-2xl cursor-pointer transition-all flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ex.icon}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors">
                      {ex.name}
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md">
                      {ex.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-orange-400 block">
                    ~{calculateCaloriesBurned(ex.met, userWeightKg, 30)} kcal / 30min
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">MET: {ex.met}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
