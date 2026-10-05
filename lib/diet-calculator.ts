export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete';
export type DietGoal = 'lose' | 'maintain' | 'gain';
export type Gender = 'male' | 'female';

export interface UserGoalProfile {
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: DietGoal;
  customCalories?: number;
  customProteinGrams?: number;
  customCarbsGrams?: number;
  customFatGrams?: number;
  waterGoalMl?: number;
}

export const DEFAULT_USER_PROFILE: UserGoalProfile = {
  age: 25,
  gender: 'male',
  weightKg: 75,
  heightCm: 175,
  activityLevel: 'moderate',
  goal: 'lose',
  waterGoalMl: 3000,
};

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,    // Pouco ou nenhum exercício
  light: 1.375,      // Exercício leve 1-3 dias/semana
  moderate: 1.55,    // Exercício moderado 3-5 dias/semana
  intense: 1.725,    // Exercício intenso 6-7 dias/semana
  athlete: 1.9,      // Treino muito pesado/atleta
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentário (pouco ou nenhum exercício)',
  light: 'Levemente Ativo (exercício 1-3x por semana)',
  moderate: 'Moderadamente Ativo (exercício 3-5x por semana)',
  intense: 'Muito Ativo (exercício intenso 6-7x por semana)',
  athlete: 'Extremamente Ativo / Atleta (treinos 2x ao dia)',
};

export interface CalculatedDietMetrics {
  bmr: number; // TMB
  tdee: number; // Gasto total
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterGoalMl: number;
}

export function calculateDietMetrics(profile: UserGoalProfile): CalculatedDietMetrics {
  const { weightKg, heightCm, age, gender, activityLevel, goal } = profile;

  // Fórmula Mifflin-St Jeor para TMB
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  let targetCalories = tdee;
  if (goal === 'lose') {
    targetCalories = Math.round(tdee * 0.80); // Deficit de 20%
  } else if (goal === 'gain') {
    targetCalories = Math.round(tdee * 1.15); // Superavit de 15%
  }

  if (profile.customCalories && profile.customCalories > 500) {
    targetCalories = profile.customCalories;
  }

  // Divisão de Macros Recomendada (g/kg e proporções)
  // Proteína: 2.0g/kg para perda, 1.8g/kg para manutenção, 2.2g/kg para ganho
  let proteinPerKg = 2.0;
  if (goal === 'maintain') proteinPerKg = 1.8;
  if (goal === 'gain') proteinPerKg = 2.2;

  const proteinGrams = profile.customProteinGrams || Math.round(weightKg * proteinPerKg);
  
  // Gordura: 1.0g/kg
  const fatGrams = profile.customFatGrams || Math.round(weightKg * 0.9);

  // Carboidratos: Restante das calorias (1g carbo = 4kcal, 1g prot = 4kcal, 1g gord = 9kcal)
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  const remainingCaloriesForCarbs = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbsGrams = profile.customCarbsGrams || Math.round(remainingCaloriesForCarbs / 4);

  // Meta de água: 35ml por kg de peso
  const waterGoalMl = profile.waterGoalMl || Math.round(weightKg * 35);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterGoalMl,
  };
}
