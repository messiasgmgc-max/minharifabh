export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: number; // em gramas ou ml
  unit: string; // 'g', 'ml', 'unid'
  calories: number; // kcal por porção
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber?: number; // g
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: string;
  met: number; // Metabolic Equivalent of Task
  icon: string;
}

export const INITIAL_FOOD_DATABASE: FoodItem[] = [
  // Proteínas & Carnes
  { id: 'f1', name: 'Peito de Frango Grelhado', category: 'Proteínas', servingSize: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 'f2', name: 'Ovo Cozido Inteiro', category: 'Proteínas', servingSize: 50, unit: 'unid', calories: 77, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0 },
  { id: 'f3', name: 'Carne Moída de Patinho Grelhada', category: 'Proteínas', servingSize: 100, unit: 'g', calories: 219, protein: 35.9, carbs: 0, fat: 7.3, fiber: 0 },
  { id: 'f4', name: 'Filé de Tilápia Grelhado', category: 'Proteínas', servingSize: 100, unit: 'g', calories: 128, protein: 26, carbs: 0, fat: 2.7, fiber: 0 },
  { id: 'f5', name: 'Whey Protein (Concentrado)', category: 'Suplementos', servingSize: 30, unit: 'g', calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
  { id: 'f6', name: 'Atum em Lata (em água)', category: 'Proteínas', servingSize: 100, unit: 'g', calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 },

  // Carboidratos & Grãos
  { id: 'f7', name: 'Arroz Branco Cozido', category: 'Carboidratos', servingSize: 100, unit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { id: 'f8', name: 'Arroz Integral Cozido', category: 'Carboidratos', servingSize: 100, unit: 'g', calories: 124, protein: 2.6, carbs: 25.8, fat: 1, fiber: 1.8 },
  { id: 'f9', name: 'Feijão Carioca Cozido', category: 'Grãos', servingSize: 100, unit: 'g', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5 },
  { id: 'f10', name: 'Batata Doce Cozida', category: 'Carboidratos', servingSize: 100, unit: 'g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
  { id: 'f11', name: 'Aveia em Flocos', category: 'Grãos', servingSize: 30, unit: 'g', calories: 118, protein: 4.3, carbs: 20, fat: 2.2, fiber: 2.7 },
  { id: 'f12', name: 'Pão de Fôrma Integral', category: 'Carboidratos', servingSize: 50, unit: 'fatia (2x)', calories: 124, protein: 4.5, carbs: 23, fat: 1.5, fiber: 3.2 },
  { id: 'f13', name: 'Tapioca (Goma)', category: 'Carboidratos', servingSize: 50, unit: 'g', calories: 120, protein: 0, carbs: 30, fat: 0, fiber: 0 },
  { id: 'f14', name: 'Macarrão Cozido', category: 'Carboidratos', servingSize: 100, unit: 'g', calories: 158, protein: 5.8, carbs: 31, fat: 0.9, fiber: 1.8 },

  // Frutas & Vegetais
  { id: 'f15', name: 'Banana Prata', category: 'Frutas', servingSize: 100, unit: 'unid', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  { id: 'f16', name: 'Maçã Fuji', category: 'Frutas', servingSize: 130, unit: 'unid', calories: 68, protein: 0.3, carbs: 17, fat: 0.2, fiber: 3.1 },
  { id: 'f17', name: 'Mamão Papaia', category: 'Frutas', servingSize: 100, unit: 'g', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7 },
  { id: 'f18', name: 'Morango Fresco', category: 'Frutas', servingSize: 100, unit: 'g', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
  { id: 'f19', name: 'Abacate', category: 'Frutas', servingSize: 100, unit: 'g', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 },
  { id: 'f20', name: 'Brócolis Cozido no Vapor', category: 'Vegetais', servingSize: 100, unit: 'g', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 },

  // Laticínios & Gorduras
  { id: 'f21', name: 'Iogurte Natural Desnatado', category: 'Laticínios', servingSize: 160, unit: 'pote', calories: 85, protein: 7.2, carbs: 12, fat: 0.5, fiber: 0 },
  { id: 'f22', name: 'Queijo Cottage', category: 'Laticínios', servingSize: 50, unit: 'g', calories: 49, protein: 6.2, carbs: 1.7, fat: 2.1, fiber: 0 },
  { id: 'f23', name: 'Queijo Minas Frescal', category: 'Laticínios', servingSize: 50, unit: 'g', calories: 120, protein: 8.7, carbs: 1.5, fat: 9, fiber: 0 },
  { id: 'f24', name: 'Azeite de Oliva Extra Virgem', category: 'Gorduras', servingSize: 13, unit: 'colher sopa', calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0 },
  { id: 'f25', name: 'Pasta de Amendoim Integral', category: 'Gorduras', servingSize: 15, unit: 'colher sopa', calories: 94, protein: 4, carbs: 3, fat: 8, fiber: 1 },
  { id: 'f26', name: 'Castanha-do-Pará', category: 'Gorduras', servingSize: 10, unit: '2 unid', calories: 65, protein: 1.4, carbs: 1.2, fat: 6.6, fiber: 0.7 },
];

export const INITIAL_EXERCISE_DATABASE: ExerciseItem[] = [
  { id: 'e1', name: 'Musculação (Intensidade Moderada)', category: 'Força', met: 5.0, icon: '🏋️‍♂️' },
  { id: 'e2', name: 'Musculação (Alta Intensidade / Pesada)', category: 'Força', met: 6.0, icon: '💪' },
  { id: 'e3', name: 'Corrida Moderada (8 km/h)', category: 'Cardio', met: 8.3, icon: '🏃‍♂️' },
  { id: 'e4', name: 'Corrida Rápida (10 km/h)', category: 'Cardio', met: 9.8, icon: '⚡' },
  { id: 'e5', name: 'Caminhada Rápida (5 km/h)', category: 'Cardio', met: 3.8, icon: '🚶‍♂️' },
  { id: 'e6', name: 'Ciclismo Moderado (15-20 km/h)', category: 'Cardio', met: 6.8, icon: '🚴‍♂️' },
  { id: 'e7', name: 'Natação (Estilo Livre Moderado)', category: 'Cardio', met: 7.0, icon: '🏊‍♂️' },
  { id: 'e8', name: 'Futebol / Esporte Coletivo', category: 'Esporte', met: 7.0, icon: '⚽' },
  { id: 'e9', name: 'Crossfit / HIIT Treino Funcional', category: 'Cardio', met: 8.0, icon: '🔥' },
  { id: 'e10', name: 'Pular Corda', category: 'Cardio', met: 10.0, icon: '🪢' },
];

export function calculateCaloriesBurned(met: number, weightKg: number, durationMinutes: number): number {
  return Math.round(met * weightKg * (durationMinutes / 60));
}
