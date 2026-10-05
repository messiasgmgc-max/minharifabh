import { UserGoalProfile, DEFAULT_USER_PROFILE } from './diet-calculator';
import { FoodItem, INITIAL_FOOD_DATABASE, INITIAL_EXERCISE_DATABASE } from './nutrition-db';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface LoggedFoodItem {
  id: string;
  foodId: string;
  name: string;
  meal: MealType;
  quantityGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD
}

export interface LoggedExercise {
  id: string;
  name: string;
  durationMinutes: number;
  caloriesBurned: number;
  date: string; // YYYY-MM-DD
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
}

// Memory / LocalStorage Key Names
const PROFILE_KEY = 'nutritrack_profile_v1';
const FOOD_LOGS_KEY = 'nutritrack_food_logs_v1';
const EXERCISE_LOGS_KEY = 'nutritrack_exercise_logs_v1';
const WEIGHT_LOGS_KEY = 'nutritrack_weight_logs_v1';
const WATER_LOGS_KEY = 'nutritrack_water_logs_v1';
const CUSTOM_FOODS_KEY = 'nutritrack_custom_foods_v1';

export function getStoredProfile(): UserGoalProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
  } catch (e) {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredProfile(profile: UserGoalProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getStoredFoodLogs(date: string): LoggedFoodItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FOOD_LOGS_KEY);
    const allLogs: LoggedFoodItem[] = data ? JSON.parse(data) : [];
    return allLogs.filter(item => item.date === date);
  } catch (e) {
    return [];
  }
}

export function addFoodLog(item: Omit<LoggedFoodItem, 'id'>): LoggedFoodItem {
  const newItem: LoggedFoodItem = {
    ...item,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(FOOD_LOGS_KEY);
    const allLogs: LoggedFoodItem[] = data ? JSON.parse(data) : [];
    allLogs.push(newItem);
    localStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(allLogs));
  }
  return newItem;
}

export function deleteFoodLog(id: string): void {
  if (typeof window === 'undefined') return;
  const data = localStorage.getItem(FOOD_LOGS_KEY);
  const allLogs: LoggedFoodItem[] = data ? JSON.parse(data) : [];
  const filtered = allLogs.filter(item => item.id !== id);
  localStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(filtered));
}

export function getStoredExerciseLogs(date: string): LoggedExercise[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(EXERCISE_LOGS_KEY);
    const allLogs: LoggedExercise[] = data ? JSON.parse(data) : [];
    return allLogs.filter(item => item.date === date);
  } catch (e) {
    return [];
  }
}

export function addExerciseLog(item: Omit<LoggedExercise, 'id'>): LoggedExercise {
  const newItem: LoggedExercise = {
    ...item,
    id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(EXERCISE_LOGS_KEY);
    const allLogs: LoggedExercise[] = data ? JSON.parse(data) : [];
    allLogs.push(newItem);
    localStorage.setItem(EXERCISE_LOGS_KEY, JSON.stringify(allLogs));
  }
  return newItem;
}

export function deleteExerciseLog(id: string): void {
  if (typeof window === 'undefined') return;
  const data = localStorage.getItem(EXERCISE_LOGS_KEY);
  const allLogs: LoggedExercise[] = data ? JSON.parse(data) : [];
  const filtered = allLogs.filter(item => item.id !== id);
  localStorage.setItem(EXERCISE_LOGS_KEY, JSON.stringify(filtered));
}

export function getWaterLog(date: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const data = localStorage.getItem(WATER_LOGS_KEY);
    const logs: WaterLog[] = data ? JSON.parse(data) : [];
    const found = logs.find(l => l.date === date);
    return found ? found.amountMl : 0;
  } catch (e) {
    return 0;
  }
}

export function addWaterLog(date: string, deltaMl: number): number {
  if (typeof window === 'undefined') return 0;
  const data = localStorage.getItem(WATER_LOGS_KEY);
  const logs: WaterLog[] = data ? JSON.parse(data) : [];
  const index = logs.findIndex(l => l.date === date);
  
  let newAmount = deltaMl;
  if (index >= 0) {
    newAmount = Math.max(0, logs[index].amountMl + deltaMl);
    logs[index].amountMl = newAmount;
  } else {
    newAmount = Math.max(0, deltaMl);
    logs.push({ date, amountMl: newAmount });
  }

  localStorage.setItem(WATER_LOGS_KEY, JSON.stringify(logs));
  return newAmount;
}

export function getCustomFoods(): FoodItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CUSTOM_FOODS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function addCustomFood(food: Omit<FoodItem, 'id'>): FoodItem {
  const newFood: FoodItem = {
    ...food,
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  if (typeof window !== 'undefined') {
    const custom = getCustomFoods();
    custom.push(newFood);
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(custom));
  }
  return newFood;
}

export function getAllFoods(): FoodItem[] {
  const custom = getCustomFoods();
  return [...INITIAL_FOOD_DATABASE, ...custom];
}

export function getWeightHistory(): WeightEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(WEIGHT_LOGS_KEY);
    const history: WeightEntry[] = data ? JSON.parse(data) : [];
    return history.sort((a, b) => (a.date > b.date ? 1 : -1));
  } catch (e) {
    return [];
  }
}

export function addWeightEntry(entry: Omit<WeightEntry, 'id'>): WeightEntry {
  const newEntry: WeightEntry = {
    ...entry,
    id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  if (typeof window !== 'undefined') {
    const history = getWeightHistory();
    // remove existing entry for same date if any
    const filtered = history.filter(h => h.date !== entry.date);
    filtered.push(newEntry);
    localStorage.setItem(WEIGHT_LOGS_KEY, JSON.stringify(filtered));
  }
  return newEntry;
}
