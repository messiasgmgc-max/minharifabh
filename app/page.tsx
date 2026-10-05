'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { FoodSearchModal } from '@/components/FoodSearchModal';
import { AddExerciseModal } from '@/components/AddExerciseModal';
import {
  getStoredProfile,
  getStoredFoodLogs,
  addFoodLog,
  deleteFoodLog,
  getStoredExerciseLogs,
  addExerciseLog,
  deleteExerciseLog,
  getWaterLog,
  addWaterLog,
  LoggedFoodItem,
  LoggedExercise,
  MealType,
} from '@/lib/storage';
import { calculateDietMetrics } from '@/lib/diet-calculator';
import {
  Flame,
  Plus,
  Trash2,
  Calendar,
  Droplet,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Dumbbell,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Target,
  CheckCircle2,
} from 'lucide-react';

export default function DailyDiaryPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [profile, setProfile] = useState(getStoredProfile());
  const [foodLogs, setFoodLogs] = useState<LoggedFoodItem[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<LoggedExercise[]>([]);
  const [waterMl, setWaterMl] = useState<number>(0);

  // Modal State
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  const refreshLogs = () => {
    setFoodLogs(getStoredFoodLogs(selectedDate));
    setExerciseLogs(getStoredExerciseLogs(selectedDate));
    setWaterMl(getWaterLog(selectedDate));
    setProfile(getStoredProfile());
  };

  useEffect(() => {
    refreshLogs();
  }, [selectedDate]);

  const metrics = calculateDietMetrics(profile);

  // Totais Consumidos
  const totalCaloriesConsumed = foodLogs.reduce((acc, item) => acc + item.calories, 0);
  const totalProteinConsumed = Number(foodLogs.reduce((acc, item) => acc + item.protein, 0).toFixed(1));
  const totalCarbsConsumed = Number(foodLogs.reduce((acc, item) => acc + item.carbs, 0).toFixed(1));
  const totalFatConsumed = Number(foodLogs.reduce((acc, item) => acc + item.fat, 0).toFixed(1));

  // Queima por exercícios
  const totalCaloriesBurned = exerciseLogs.reduce((acc, item) => acc + item.caloriesBurned, 0);

  // Saldo Calórico Líquido
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
  const remainingCalories = metrics.targetCalories - netCalories;

  const handleAddFood = (newItem: Omit<LoggedFoodItem, 'id' | 'date'>) => {
    addFoodLog({
      ...newItem,
      date: selectedDate,
    });
    refreshLogs();
  };

  const handleDeleteFood = (id: string) => {
    deleteFoodLog(id);
    refreshLogs();
  };

  const handleAddExercise = (newEx: Omit<LoggedExercise, 'id' | 'date'>) => {
    addExerciseLog({
      ...newEx,
      date: selectedDate,
    });
    refreshLogs();
  };

  const handleDeleteExercise = (id: string) => {
    deleteExerciseLog(id);
    refreshLogs();
  };

  const handleWaterAdd = (amount: number) => {
    const updated = addWaterLog(selectedDate, amount);
    setWaterMl(updated);
  };

  // Funções de alteração de data
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    if (isToday) return 'Hoje, ' + dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    return dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  const MEALS_CONFIG: { type: MealType; label: string; icon: any; bg: string }[] = [
    { type: 'breakfast', label: 'Café da Manhã', icon: Coffee, bg: 'from-amber-500/10 to-amber-500/5 border-amber-500/20' },
    { type: 'lunch', label: 'Almoço', icon: Sun, bg: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' },
    { type: 'dinner', label: 'Jantar', icon: Moon, bg: 'from-teal-500/10 to-teal-500/5 border-teal-500/20' },
    { type: 'snack', label: 'Lanches & Snacks', icon: Cookie, bg: 'from-rose-500/10 to-rose-500/5 border-rose-500/20' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 md:pb-12">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Date Selector Bar */}
        <div className="flex justify-between items-center bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-xl shadow-lg">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 font-black text-sm text-white">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{formatDisplayDate(selectedDate)}</span>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold ml-1 hover:bg-emerald-500/30"
              >
                Voltar p/ Hoje
              </button>
            )}
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Balanço Calórico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card Principal de Calorias */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Meta Diária Calórica
                </span>
                <h2 className="text-2xl font-black text-white mt-2">Balanço Calórico</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-bold block">Meta: {metrics.targetCalories} kcal</span>
                <span className="text-xs text-slate-500">Objetivo: {profile.goal === 'lose' ? 'Emagrecer' : profile.goal === 'gain' ? 'Ganhar Massa' : 'Manter Peso'}</span>
              </div>
            </div>

            {/* Barra de Progresso de Calorias */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Consumido: <strong className="text-white">{totalCaloriesConsumed} kcal</strong></span>
                <span className="text-orange-400">Exercícios: <strong>-{totalCaloriesBurned} kcal</strong></span>
                <span className={remainingCalories >= 0 ? 'text-emerald-400' : 'text-rose-400 font-black'}>
                  {remainingCalories >= 0 ? `Restam: ${remainingCalories} kcal` : `Excesso: ${Math.abs(remainingCalories)} kcal`}
                </span>
              </div>

              <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800 relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    remainingCalories >= 0
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300'
                      : 'bg-gradient-to-r from-amber-400 to-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((netCalories / metrics.targetCalories) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Grid 3 Valores */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Alimentos</span>
                <span className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-amber-400" /> {totalCaloriesConsumed}
                </span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Exercícios</span>
                <span className="text-base font-black text-orange-400 flex items-center justify-center gap-1">
                  <Dumbbell className="w-4 h-4 text-orange-400" /> -{totalCaloriesBurned}
                </span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Líquido</span>
                <span className={`text-base font-black flex items-center justify-center gap-1 ${remainingCalories >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {netCalories} <span className="text-[10px] font-normal text-slate-400">kcal</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card de Macronutrientes (Macros) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 flex flex-col justify-between backdrop-blur-xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              🧪 Macronutrientes
            </h3>

            {/* Proteínas */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">Proteínas</span>
                <span className="text-slate-300">{totalProteinConsumed}g / {metrics.proteinGrams}g</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalProteinConsumed / metrics.proteinGrams) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carboidratos */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-teal-300">Carboidratos</span>
                <span className="text-slate-300">{totalCarbsConsumed}g / {metrics.carbsGrams}g</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-teal-300 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalCarbsConsumed / metrics.carbsGrams) * 100)}%` }}
                />
              </div>
            </div>

            {/* Gorduras */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-400">Gorduras</span>
                <span className="text-slate-300">{totalFatConsumed}g / {metrics.fatGrams}g</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-rose-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalFatConsumed / metrics.fatGrams) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tracker de Consumo de Água */}
        <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-500/20 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-2xl">
              <Droplet className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Controle de Hidratação</h3>
              <p className="text-xs text-slate-400">
                Meta recomendada: <strong className="text-sky-300">{(metrics.waterGoalMl / 1000).toFixed(1)} Litros</strong> ({metrics.waterGoalMl}ml)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-xl font-black text-sky-400">{(waterMl / 1000).toFixed(2)}L</span>
              <span className="text-[10px] text-slate-400 block font-bold">({waterMl} / {metrics.waterGoalMl}ml)</span>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => handleWaterAdd(250)}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1 shadow-md shadow-sky-500/20"
              >
                +250ml 🥛
              </button>
              <button
                onClick={() => handleWaterAdd(500)}
                className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-black px-3 py-2 rounded-xl text-xs transition-all"
              >
                +500ml 🍼
              </button>
            </div>
          </div>
        </div>

        {/* Refeições do Dia */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              🍽️ Refeições Registradas
            </h3>
            <span className="text-xs font-bold text-slate-400">{foodLogs.length} itens hoje</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {MEALS_CONFIG.map((meal) => {
              const Icon = meal.icon;
              const items = foodLogs.filter(f => f.meal === meal.type);
              const mealCalories = items.reduce((acc, i) => acc + i.calories, 0);
              const mealProtein = Number(items.reduce((acc, i) => acc + i.protein, 0).toFixed(1));

              return (
                <div
                  key={meal.type}
                  className={`bg-slate-900/90 border rounded-3xl p-5 md:p-6 space-y-4 shadow-xl backdrop-blur-xl ${meal.bg}`}
                >
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-white">{meal.label}</h4>
                        <span className="text-xs text-slate-400 font-medium">
                          {mealCalories} kcal • Proteína: {mealProtein}g
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveMeal(meal.type);
                        setIsFoodModalOpen(true);
                      }}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  </div>

                  {/* Lista de Alimentos da Refeição */}
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-2">
                      Nenhum alimento registrado para esta refeição.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-800/60">
                      {items.map((item) => (
                        <div key={item.id} className="py-2.5 flex justify-between items-center group">
                          <div>
                            <span className="font-bold text-sm text-white block group-hover:text-emerald-400 transition-colors">
                              {item.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              Prot: <strong className="text-emerald-400">{item.protein}g</strong> • Carbo: <strong className="text-teal-300">{item.carbs}g</strong> • Gord: <strong className="text-rose-400">{item.fat}g</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-black text-amber-400 text-sm">{item.calories} kcal</span>
                            <button
                              onClick={() => handleDeleteFood(item.id)}
                              className="text-slate-600 hover:text-rose-400 p-1 rounded-lg transition-colors"
                              title="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Seção de Exercícios */}
        <div className="bg-slate-900/90 border border-orange-500/20 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-2xl">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">Exercícios & Gastos do Dia</h4>
                <span className="text-xs text-slate-400 font-medium">
                  Total queimado: <strong className="text-orange-400">-{totalCaloriesBurned} kcal</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsExerciseModalOpen(true)}
              className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Registrar Treino
            </button>
          </div>

          {exerciseLogs.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-2">
              Nenhum treino ou caminhada registrada hoje.
            </p>
          ) : (
            <div className="divide-y divide-slate-800">
              {exerciseLogs.map((ex) => (
                <div key={ex.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-sm text-white block">{ex.name}</span>
                    <span className="text-xs text-slate-400">Duração: {ex.durationMinutes} minutos</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-orange-400 text-sm">-{ex.caloriesBurned} kcal</span>
                    <button
                      onClick={() => handleDeleteExercise(ex.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Modais */}
      <FoodSearchModal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        targetMeal={activeMeal}
        onAddFood={handleAddFood}
      />

      <AddExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        userWeightKg={profile.weightKg}
        onAddExercise={handleAddExercise}
      />
    </div>
  );
}
