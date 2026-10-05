'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { FoodItem } from '@/lib/nutrition-db';
import { getAllFoods, addCustomFood } from '@/lib/storage';
import { Apple, Search, Plus, Flame, CheckCircle2, Filter } from 'lucide-react';

export default function FoodsPage() {
  const [foods, setFoods] = useState<FoodItem[]>(getAllFoods());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Proteínas');
  const [newServing, setNewServing] = useState(100);
  const [newUnit, setNewUnit] = useState('g');
  const [newCalories, setNewCalories] = useState(100);
  const [newProtein, setNewProtein] = useState(10);
  const [newCarbs, setNewCarbs] = useState(10);
  const [newFat, setNewFat] = useState(2);

  const categories = ['all', 'Proteínas', 'Carboidratos', 'Frutas', 'Grãos', 'Laticínios', 'Gorduras', 'Vegetais', 'Suplementos'];

  const filteredFoods = foods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const created = addCustomFood({
      name: newName,
      category: newCategory,
      servingSize: newServing,
      unit: newUnit,
      calories: newCalories,
      protein: newProtein,
      carbs: newCarbs,
      fat: newFat,
    });

    setFoods(getAllFoods());
    setShowAddForm(false);
    setNewName('');
    setSuccessMsg(`Alimento "${created.name}" cadastrado com sucesso!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 md:pb-12">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              🍎 Banco de Alimentos & Tabela Nutricional
            </h1>
            <p className="text-xs text-slate-400">
              Consulte a composição nutricional dos alimentos ou cadastre seus próprios itens personalizados.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {showAddForm ? 'Cancelar' : '+ Cadastrar Alimento'}
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-5 h-5" /> {successMsg}
          </div>
        )}

        {/* Formulário de Cadastro de Alimento Personalizado */}
        {showAddForm && (
          <form onSubmit={handleCreateCustomFood} className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 space-y-5 shadow-2xl animate-fadeIn">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              ✨ Cadastrar Alimento Personalizado
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-bold block mb-1">Nome do Alimento / Marca</label>
                <input
                  type="text"
                  placeholder="Ex: Iogurte Grego Frutas Vermelhas"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium"
                >
                  {categories.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Tamanho da Porção Base</label>
                <input
                  type="number"
                  value={newServing}
                  onChange={(e) => setNewServing(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Unidade (g ou ml)</label>
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white font-medium"
                >
                  <option value="g">Grama (g)</option>
                  <option value="ml">Mililitro (ml)</option>
                  <option value="unid">Unidade (unid)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Calorias (kcal por porção)</label>
                <input
                  type="number"
                  value={newCalories}
                  onChange={(e) => setNewCalories(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-amber-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Proteínas (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProtein}
                  onChange={(e) => setNewProtein(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Carboidratos (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newCarbs}
                  onChange={(e) => setNewCarbs(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-teal-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Gorduras (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newFat}
                  onChange={(e) => setNewFat(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-rose-400 font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all"
            >
              Salvar Alimento
            </button>
          </form>
        )}

        {/* Filtros e Busca */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar alimento por nome ou ingrediente..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Todos os Alimentos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Alimentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 space-y-3 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase bg-slate-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {food.category}
                  </span>
                  <span className="font-black text-amber-400 text-xs flex items-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> {food.calories} kcal
                  </span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors pt-1">
                  {food.name}
                </h3>
                <p className="text-xs text-slate-400">Porção base: {food.servingSize}{food.unit}</p>
              </div>

              {/* Tabela de Macros */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Proteínas</span>
                  <span className="font-black text-emerald-400">{food.protein}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Carbos</span>
                  <span className="font-black text-teal-300">{food.carbs}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Gorduras</span>
                  <span className="font-black text-rose-400">{food.fat}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
