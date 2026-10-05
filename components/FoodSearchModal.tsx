'use client';

import React, { useState } from 'react';
import { FoodItem } from '@/lib/nutrition-db';
import { MealType, getAllFoods } from '@/lib/storage';
import { Search, Plus, X, Flame, Scale } from 'lucide-react';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMeal: MealType;
  onAddFood: (item: {
    foodId: string;
    name: string;
    meal: MealType;
    quantityGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanches / Snacks',
};

export function FoodSearchModal({ isOpen, onClose, targetMeal, onAddFood }: FoodSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portion, setPortion] = useState<number>(100);

  if (!isOpen) return null;

  const allFoods = getAllFoods();
  const filteredFoods = allFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateMacros = (food: FoodItem, grams: number) => {
    const factor = grams / (food.servingSize || 100);
    return {
      calories: Math.round(food.calories * factor),
      protein: Number((food.protein * factor).toFixed(1)),
      carbs: Number((food.carbs * factor).toFixed(1)),
      fat: Number((food.fat * factor).toFixed(1)),
    };
  };

  const handleConfirmAdd = () => {
    if (!selectedFood) return;
    const macros = calculateMacros(selectedFood, portion);
    onAddFood({
      foodId: selectedFood.id,
      name: `${selectedFood.name} (${portion}${selectedFood.unit})`,
      meal: targetMeal,
      quantityGrams: portion,
      ...macros,
    });

    // Reset and close
    setSelectedFood(null);
    setPortion(100);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              🍎 Adicionar ao {MEAL_LABELS[targetMeal]}
            </h3>
            <p className="text-xs text-slate-400">Pesquise alimentos ou escolha da lista abaixo</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Food Detail Form */}
        {selectedFood ? (
          <div className="bg-slate-950 border border-emerald-500/30 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {selectedFood.category}
                </span>
                <h4 className="text-base font-black text-white mt-1">{selectedFood.name}</h4>
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 underline"
              >
                Trocar Alimento
              </button>
            </div>

            {/* Portion Control Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-400" /> Porção ({selectedFood.unit}):
                </span>
                <span className="text-emerald-400 font-extrabold text-sm">{portion} {selectedFood.unit}</span>
              </label>
              
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="2000"
                  value={portion}
                  onChange={(e) => setPortion(Math.max(1, Number(e.target.value) || 0))}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-xl p-3 text-center text-base font-black text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
                
                {/* Portion Quick Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {[30, 50, 100, 150, 200, 250].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setPortion(quick)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        portion === quick
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {quick}{selectedFood.unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Macros Preview */}
            {(() => {
              const macros = calculateMacros(selectedFood, portion);
              return (
                <div className="grid grid-cols-4 gap-2 bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Calorias</span>
                    <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-0.5">
                      <Flame className="w-3.5 h-3.5" /> {macros.calories}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Proteínas</span>
                    <span className="text-sm font-extrabold text-emerald-400">{macros.protein}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Carbos</span>
                    <span className="text-sm font-extrabold text-teal-300">{macros.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Gorduras</span>
                    <span className="text-sm font-extrabold text-rose-400">{macros.fat}g</span>
                  </div>
                </div>
              );
            })()}

            <button
              type="button"
              onClick={handleConfirmAdd}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Refeição
            </button>
          </div>
        ) : (
          /* Search & List */
          <>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou categoria (ex: Frango, Arroz, Frutas)..."
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all font-medium"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[350px]">
              {filteredFoods.length === 0 ? (
                <div className="text-center py-10 space-y-2 text-slate-400">
                  <p className="text-xs">Nenhum alimento encontrado com "{searchTerm}"</p>
                </div>
              ) : (
                filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 p-3.5 rounded-2xl cursor-pointer transition-all flex justify-between items-center group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md">
                          {food.category}
                        </span>
                        <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                          {food.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Porção base: <span className="font-medium text-slate-300">{food.servingSize}{food.unit}</span> • Prot: <span className="text-emerald-400 font-bold">{food.protein}g</span> • Carbo: <span className="text-teal-300 font-bold">{food.carbs}g</span> • Gord: <span className="text-rose-400 font-bold">{food.fat}g</span>
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="font-black text-amber-400 text-sm flex items-center gap-0.5">
                        <Flame className="w-3.5 h-3.5" /> {food.calories} <span className="text-[10px] text-slate-500 font-normal">kcal</span>
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
