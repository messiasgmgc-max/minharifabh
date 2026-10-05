-- ==============================================================================
-- SCRIPT DDL SUPABASE - NutriTrack (Contador de Calorias & Controle de Dieta)
-- Copie todo este conteúdo, cole no SQL Editor do Supabase e clique em "Run".
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Perfil / Metas do Usuário
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT UNIQUE DEFAULT 'default_user',
    "age" INTEGER NOT NULL DEFAULT 25,
    "gender" TEXT NOT NULL DEFAULT 'male',
    "weight_kg" DOUBLE PRECISION NOT NULL DEFAULT 75.0,
    "height_cm" DOUBLE PRECISION NOT NULL DEFAULT 175.0,
    "activity_level" TEXT NOT NULL DEFAULT 'moderate',
    "goal" TEXT NOT NULL DEFAULT 'lose',
    "custom_calories" INTEGER,
    "custom_protein" INTEGER,
    "custom_carbs" INTEGER,
    "custom_fat" INTEGER,
    "water_goal_ml" INTEGER DEFAULT 3000,
    "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Registro de Refeições (Food Logs)
CREATE TABLE IF NOT EXISTS "food_logs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT DEFAULT 'default_user',
    "date" TEXT NOT NULL, -- YYYY-MM-DD
    "meal" TEXT NOT NULL, -- breakfast, lunch, dinner, snack
    "name" TEXT NOT NULL,
    "quantity_grams" DOUBLE PRECISION NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Alimentos Personalizados Cadastrados
CREATE TABLE IF NOT EXISTS "custom_foods" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Geral',
    "serving_size" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "unit" TEXT NOT NULL DEFAULT 'g',
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Registro de Exercícios
CREATE TABLE IF NOT EXISTS "exercise_logs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT DEFAULT 'default_user',
    "date" TEXT NOT NULL, -- YYYY-MM-DD
    "name" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "calories_burned" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Histórico de Peso
CREATE TABLE IF NOT EXISTS "weight_logs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT DEFAULT 'default_user',
    "date" TEXT NOT NULL, -- YYYY-MM-DD
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Alta Performance
CREATE INDEX IF NOT EXISTS "idx_food_logs_date" ON "food_logs"("date");
CREATE INDEX IF NOT EXISTS "idx_exercise_logs_date" ON "exercise_logs"("date");
CREATE INDEX IF NOT EXISTS "idx_weight_logs_date" ON "weight_logs"("date");
