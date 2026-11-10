import { ActivityLevel, Gender, GoalType, MascotMood } from '../types';

/**
 * Cálculo da Taxa Metabólica Basal (TMB) usando a equação Mifflin-St Jeor
 * Homem: (10 * peso_kg) + (6.25 * altura_cm) - (5 * idade) + 5
 * Mulher: (10 * peso_kg) + (6.25 * altura_cm) - (5 * idade) - 161
 */
export function calculateTMB(weightKg: number, heightCm: number, ageYears: number, gender: Gender): number {
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) return 1800;

  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (gender === 'masculino') {
    return Math.round(base + 5);
  } else if (gender === 'feminino') {
    return Math.round(base - 161);
  } else {
    // Valor médio para 'outro'
    return Math.round(base - 78);
  }
}

/**
 * Fatores de Atividade Física (TDEE - Total Daily Energy Expenditure)
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentario: 1.2, // Pouco ou nenhum exercício
  leve: 1.375, // Exercício leve 1 a 3 dias/semana
  moderado: 1.55, // Exercício moderado 3 a 5 dias/semana
  intenso: 1.725, // Exercício pesado 6 a 7 dias/semana
  muito_ativo: 1.9, // Treinos diários intensos ou trabalho braçal
};

export const ACTIVITY_LABELS: Record<ActivityLevel, { label: string; desc: string }> = {
  sedentario: { label: 'Sedentário', desc: 'Trabalho de escritório, pouco exercício' },
  leve: { label: 'Levemente Ativo', desc: 'Caminhada ou treino leve 1 a 3x na semana' },
  moderado: { label: 'Moderadamente Ativo', desc: 'Treino estruturado 3 a 5x na semana' },
  intenso: { label: 'Muito Ativo', desc: 'Treino pesado/esporte 6 a 7x na semana' },
  muito_ativo: { label: 'Extremamente Ativo', desc: 'Atleta ou trabalho físico pesado 2x ao dia' },
};

/**
 * Cálculo do Gasto Energético Diário Total (TDEE)
 */
export function calculateTDEE(tmb: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(tmb * multiplier);
}

/**
 * Cálculo da Meta Calórica Diária ajustada ao objetivo
 */
export function calculateTargetCalories(tdee: number, goal: GoalType): number {
  switch (goal) {
    case 'emagrecer':
      // Déficit moderado e sustentável (~400 kcal)
      return Math.max(1200, Math.round(tdee - 450));
    case 'ganhar_massa':
      // Superávit limpo (~350 kcal)
      return Math.round(tdee + 350);
    case 'manter':
    default:
      return Math.round(tdee);
  }
}

/**
 * Distribuição sugerida de Macronutrientes (Proteínas, Carbos, Gorduras)
 */
export function calculateMacros(targetCalories: number, weightKg: number, goal: GoalType) {
  let proteinG: number;
  let fatG: number;

  if (goal === 'ganhar_massa') {
    proteinG = Math.round(weightKg * 2.0); // 2.0g/kg
    fatG = Math.round((targetCalories * 0.25) / 9); // 25% calorias de gordura
  } else if (goal === 'emagrecer') {
    proteinG = Math.round(weightKg * 2.1); // alta proteína para preservar massa magra
    fatG = Math.round((targetCalories * 0.25) / 9);
  } else {
    proteinG = Math.round(weightKg * 1.6);
    fatG = Math.round((targetCalories * 0.28) / 9);
  }

  const caloriesFromProteinAndFat = proteinG * 4 + fatG * 9;
  const remainingCalories = Math.max(0, targetCalories - caloriesFromProteinAndFat);
  const carbsG = Math.round(remainingCalories / 4);

  return {
    proteinG,
    carbsG,
    fatG,
  };
}

/**
 * Cálculo da Meta Diária de Água
 * Padrão recomendado: 35ml por kg de peso corporal + compensação de atividade
 */
export function calculateWaterTarget(weightKg: number, activityLevel: ActivityLevel): number {
  const baseWater = weightKg * 35;
  const bonusActivity: Record<ActivityLevel, number> = {
    sedentario: 0,
    leve: 250,
    moderado: 500,
    intenso: 750,
    muito_ativo: 1000,
  };

  const total = baseWater + (bonusActivity[activityLevel] || 0);
  // Arredonda para múltiplos de 50ml para ficar amigável
  return Math.round(total / 50) * 50;
}

/**
 * Classificação de Índice de Massa Corporal (IMC)
 */
export interface BMIData {
  bmi: number;
  category: 'Abaixo do peso' | 'Peso normal' | 'Sobrepeso' | 'Obesidade Grau I' | 'Obesidade Grau II' | 'Obesidade Grau III';
  color: string;
  bgLight: string;
  textColor: string;
  minIdealWeight: number;
  maxIdealWeight: number;
  advice: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIData {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 22,
      category: 'Peso normal',
      color: '#10b981',
      bgLight: '#ecfdf5',
      textColor: 'text-emerald-700',
      minIdealWeight: 55,
      maxIdealWeight: 72,
      advice: 'Seu IMC está na faixa saudável! Continue mantendo uma rotina ativa e equilibrada.',
    };
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  const minIdealWeight = Number((18.5 * heightM * heightM).toFixed(1));
  const maxIdealWeight = Number((24.9 * heightM * heightM).toFixed(1));

  if (bmi < 18.5) {
    return {
      bmi,
      category: 'Abaixo do peso',
      color: '#3b82f6',
      bgLight: '#eff6ff',
      textColor: 'text-blue-700',
      minIdealWeight,
      maxIdealWeight,
      advice: 'Seu peso está abaixo do ideal. Recomendamos uma dieta rica em nutrientes com leve superávit calórico e orientação profissional.',
    };
  } else if (bmi <= 24.9) {
    return {
      bmi,
      category: 'Peso normal',
      color: '#10b981',
      bgLight: '#ecfdf5',
      textColor: 'text-emerald-700',
      minIdealWeight,
      maxIdealWeight,
      advice: 'Excelente! Seu IMC está na faixa de peso saudável. Mantenha os bons hábitos alimentares e hidratação diária.',
    };
  } else if (bmi <= 29.9) {
    return {
      bmi,
      category: 'Sobrepeso',
      color: '#f59e0b',
      bgLight: '#fffbeb',
      textColor: 'text-amber-700',
      minIdealWeight,
      maxIdealWeight,
      advice: 'Você está um pouco acima do peso ideal. Um plano com déficit calórico moderado e exercícios regulares ajudará a retornar à faixa ideal.',
    };
  } else if (bmi <= 34.9) {
    return {
      bmi,
      category: 'Obesidade Grau I',
      color: '#f97316',
      bgLight: '#fff7ed',
      textColor: 'text-orange-700',
      minIdealWeight,
      maxIdealWeight,
      advice: 'Atenção aos sinais do corpo. Pequenas trocas inteligentes no dia a dia e hidratação consistente farão uma grande diferença.',
    };
  } else if (bmi <= 39.9) {
    return {
      bmi,
      category: 'Obesidade Grau II',
      color: '#ef4444',
      bgLight: '#fef2f2',
      textColor: 'text-red-700',
      minIdealWeight,
      maxIdealWeight,
      advice: 'É importante acompanhar seus hábitos de perto com apoio de profissionais de saúde para manter sua vitalidade.',
    };
  } else {
    return {
      bmi,
      category: 'Obesidade Grau III',
      color: '#b91c1c',
      bgLight: '#fef2f2',
      textColor: 'text-red-800',
      minIdealWeight,
      maxIdealWeight,
      advice: 'Priorize consultas de rotina médica e nutricional para desenhar um plano seguro de reeducação física e alimentar.',
    };
  }
}

/**
 * Avalia o status calórico inteligente
 */
export function getCalorieStatus(consumed: number, target: number): {
  status: 'deficit' | 'ideal' | 'proximo' | 'excesso';
  label: string;
  badgeClass: string;
  description: string;
} {
  const ratio = consumed / (target || 2000);

  if (ratio < 0.6) {
    return {
      status: 'deficit',
      label: 'Déficit Saudável',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      description: `Ainda faltam ${Math.max(0, target - consumed)} kcal para completar a energia ideal do seu dia.`,
    };
  } else if (ratio <= 1.0) {
    return {
      status: 'ideal',
      label: 'Dentro do Limite Ideal',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: `Perfeito! Você está em uma faixa balanceada (${consumed} de ${target} kcal).`,
    };
  } else if (ratio <= 1.12) {
    return {
      status: 'proximo',
      label: 'Próximo do Limite',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      description: `Atenção: você está a poucos passos da meta. Priorize opções leves como chás ou saladas.`,
    };
  } else {
    return {
      status: 'excesso',
      label: 'Excesso Calórico',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      description: `Ultrapassou em ${consumed - target} kcal. Sem culpa! Compense aumentando a hidratação e mantendo o foco amanhã.`,
    };
  }
}

/**
 * Determina o humor e diálogo do mascote com base no progresso geral
 */
export function resolveMascotState(
  consumedKcal: number,
  targetKcal: number,
  waterConsumedMl: number,
  targetWaterMl: number,
  mealsLoggedCount: number
): { mood: MascotMood; speech: string } {
  const waterRatio = waterConsumedMl / (targetWaterMl || 2000);
  const calorieRatio = consumedKcal / (targetKcal || 2000);

  // Excesso calórico acentuado
  if (calorieRatio > 1.15) {
    return {
      mood: 'stuffed',
      speech: 'Ufa, comi bastante hoje! 🍉 Que tal bebermos bastante água agora para ajudar na digestão?',
    };
  }

  // Ambos completos: Dia de Campeão!
  if (waterRatio >= 1.0 && calorieRatio >= 0.85 && calorieRatio <= 1.1) {
    return {
      mood: 'champion',
      speech: 'WOOHOO! 🏆 Metas de calorias e água concluídas com perfeição! Você é um campeão!',
    };
  }

  // Falta muita água
  if (waterRatio < 0.25 && mealsLoggedCount > 0) {
    return {
      mood: 'thirsty',
      speech: 'Glup... Estou com sede! 💧 Dê um gole de água para mantermos o corpo ativo e hidratado!',
    };
  }

  // Nenhum registro hoje
  if (mealsLoggedCount === 0 && waterConsumedMl === 0) {
    return {
      mood: 'sleepy',
      speech: 'Zzz... Bom dia! ☀️ Que tal acordar comigo registrando seu primeiro copo d\'água?',
    };
  }

  // Bom progresso
  if (waterRatio >= 0.5 || calorieRatio >= 0.5) {
    return {
      mood: 'happy',
      speech: 'Sensacional! Já passamos da metade das metas de hoje! Continue nesse ritmo incrível!',
    };
  }

  // Ativo / Começando
  return {
    mood: 'active',
    speech: 'Dia em movimento! 🥗 Não se esqueça de registrar seu almoço e lanches ao longo do dia!',
  };
}
