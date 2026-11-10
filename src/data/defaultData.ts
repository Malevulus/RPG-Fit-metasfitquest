import { Badge, FoodItem, MascotAccessory, Meal, UserProfile } from '../types';
import { calculateMacros, calculateTargetCalories, calculateTDEE, calculateTMB, calculateWaterTarget } from '../utils/calculations';

const defaultWeight = 74;
const defaultHeight = 176;
const defaultAge = 28;
const defaultGender = 'masculino';
const defaultActivity = 'moderado';
const defaultGoal = 'emagrecer';

const tmb = calculateTMB(defaultWeight, defaultHeight, defaultAge, defaultGender);
const tdee = calculateTDEE(tmb, defaultActivity);
const targetCalories = calculateTargetCalories(tdee, defaultGoal);
const targetWaterMl = calculateWaterTarget(defaultWeight, defaultActivity);
const macros = calculateMacros(targetCalories, defaultWeight, defaultGoal);

import { OFFICIAL_AVATARS } from '../assets/avatars';

export const DEFAULT_USER: UserProfile = {
  id: 'usr_001',
  name: 'NutriBubby',
  email: 'nutribubby@metasfitquest.com',
  avatarUrl: OFFICIAL_AVATARS.male.default,
  age: defaultAge,
  gender: defaultGender,
  weight: defaultWeight,
  targetWeight: 70,
  height: defaultHeight,
  activityLevel: defaultActivity,
  goal: defaultGoal,
  tmb,
  tdee,
  targetCalories,
  targetWaterMl,
  targetProteinG: macros.proteinG,
  targetCarbsG: macros.carbsG,
  targetFatG: macros.fatG,
};

export const FOOD_PRESETS: FoodItem[] = [
  { id: 'f1', name: 'Ovos Mexidos (2 unid)', serving: '2 unidades (100g)', quantity: 1, calories: 154, protein: 13, carbs: 1.2, fat: 11, icon: '🍳' },
  { id: 'f2', name: 'Pão Integral c/ Queijo Branco', serving: '1 fatia (50g)', quantity: 1, calories: 140, protein: 7.5, carbs: 18, fat: 4.5, icon: '🥪' },
  { id: 'f3', name: 'Banana com Aveia e Mel', serving: '1 porção (120g)', quantity: 1, calories: 185, protein: 4.2, carbs: 39, fat: 2.1, icon: '🍌' },
  { id: 'f4', name: 'Café Preto sem Açúcar', serving: '1 xícara (150ml)', quantity: 1, calories: 4, protein: 0.3, carbs: 0.5, fat: 0, icon: '☕' },
  { id: 'f5', name: 'Peito de Frango Grelhado', serving: '1 filé médio (150g)', quantity: 1, calories: 247, protein: 46, carbs: 0, fat: 5.4, icon: '🍗' },
  { id: 'f6', name: 'Arroz Integral Cozido', serving: '4 colheres de sopa (100g)', quantity: 1, calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, icon: '🍚' },
  { id: 'f7', name: 'Feijão Carioca Cozido', serving: '1 concha média (80g)', quantity: 1, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, icon: '🫘' },
  { id: 'f8', name: 'Salada Verde c/ Azeite e Limão', serving: '1 prato fundo (100g)', quantity: 1, calories: 65, protein: 1.5, carbs: 4.0, fat: 5.0, icon: '🥗' },
  { id: 'f9', name: 'Iogurte Natural Proteico', serving: '1 pote (160g)', quantity: 1, calories: 110, protein: 14, carbs: 6.5, fat: 2.8, icon: '🥛' },
  { id: 'f10', name: 'Whey Protein Isolado c/ Água', serving: '1 scoop (30g)', quantity: 1, calories: 120, protein: 24, carbs: 2.0, fat: 1.0, icon: '🥤' },
  { id: 'f11', name: 'Maçã Fuji Fresca', serving: '1 unidade média (130g)', quantity: 1, calories: 72, protein: 0.4, carbs: 19, fat: 0.2, icon: '🍎' },
  { id: 'f12', name: 'Salmão Grelhado com Legumes', serving: '1 posta (160g)', quantity: 1, calories: 310, protein: 34, carbs: 4, fat: 17, icon: '🐟' },
  { id: 'f13', name: 'Batata Doce Assada', serving: '1 unidade pequena (100g)', quantity: 1, calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, icon: '🍠' },
  { id: 'f14', name: 'Mix de Castanhas e Nozes', serving: '1 punhado (30g)', quantity: 1, calories: 185, protein: 5.0, carbs: 6.0, fat: 16.5, icon: '🥜' },
  { id: 'f15', name: 'Omelete de Claras com Espinafre', serving: '1 porção (150g)', quantity: 1, calories: 120, protein: 18, carbs: 2.5, fat: 3.5, icon: '🌿' },
];

export const INITIAL_MEALS: Meal[] = [
  {
    id: 'm_cafe',
    category: 'cafe',
    name: 'Café da Manhã',
    time: '08:00',
    items: [
      { id: 'fi_1', name: 'Ovos Mexidos (2 unid)', serving: '2 unidades (100g)', quantity: 1, calories: 154, protein: 13, carbs: 1.2, fat: 11, icon: '🍳' },
      { id: 'fi_2', name: 'Pão Integral c/ Queijo Branco', serving: '1 fatia (50g)', quantity: 1, calories: 140, protein: 7.5, carbs: 18, fat: 4.5, icon: '🥪' },
      { id: 'fi_3', name: 'Café Preto sem Açúcar', serving: '1 xícara (150ml)', quantity: 1, calories: 4, protein: 0.3, carbs: 0.5, fat: 0, icon: '☕' },
    ],
  },
  {
    id: 'm_almoco',
    category: 'almoco',
    name: 'Almoço',
    time: '12:30',
    items: [
      { id: 'fi_4', name: 'Peito de Frango Grelhado', serving: '1 filé médio (150g)', quantity: 1, calories: 247, protein: 46, carbs: 0, fat: 5.4, icon: '🍗' },
      { id: 'fi_5', name: 'Arroz Integral Cozido', serving: '4 colheres (100g)', quantity: 1, calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, icon: '🍚' },
      { id: 'fi_6', name: 'Feijão Carioca Cozido', serving: '1 concha média (80g)', quantity: 1, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, icon: '🫘' },
      { id: 'fi_7', name: 'Salada Verde c/ Azeite e Limão', serving: '1 prato fundo (100g)', quantity: 1, calories: 65, protein: 1.5, carbs: 4.0, fat: 5.0, icon: '🥗' },
    ],
  },
  {
    id: 'm_lanche',
    category: 'lanches',
    name: 'Lanches',
    time: '16:15',
    items: [
      { id: 'fi_8', name: 'Iogurte Natural Proteico', serving: '1 pote (160g)', quantity: 1, calories: 110, protein: 14, carbs: 6.5, fat: 2.8, icon: '🥛' },
      { id: 'fi_9', name: 'Maçã Fuji Fresca', serving: '1 unidade (130g)', quantity: 1, calories: 72, protein: 0.4, carbs: 19, fat: 0.2, icon: '🍎' },
    ],
  },
  {
    id: 'm_jantar',
    category: 'jantar',
    name: 'Jantar',
    time: '19:45',
    items: [
      { id: 'fi_10', name: 'Salmão Grelhado com Legumes', serving: '1 posta (160g)', quantity: 1, calories: 310, protein: 34, carbs: 4, fat: 17, icon: '🐟' },
      { id: 'fi_11', name: 'Batata Doce Assada', serving: '1 unid pequena (100g)', quantity: 1, calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, icon: '🍠' },
    ],
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_first_water',
    title: 'Primeiro Gole',
    description: 'Registrou o primeiro copo de água do dia.',
    icon: '💧',
    unlocked: true,
    unlockedAt: 'Hoje às 08:30',
    category: 'water',
    progress: 100,
    rewardCoins: 25,
  },
  {
    id: 'badge_water_master',
    title: 'Mestre da Hidratação',
    description: 'Atingiu a meta completa de 100% de água diária calculada.',
    icon: '🌊',
    unlocked: false,
    category: 'water',
    progress: 75,
    rewardCoins: 60,
  },
  {
    id: 'badge_full_diary',
    title: 'Diário Completo',
    description: 'Registrou itens em todas as 4 refeições principais do dia.',
    icon: '📋',
    unlocked: true,
    unlockedAt: 'Hoje às 20:00',
    category: 'habits',
    progress: 100,
    rewardCoins: 50,
  },
  {
    id: 'badge_macro_balance',
    title: 'Equilíbrio Dourado',
    description: 'Manteve as calorias consumidas dentro de ±5% da meta diária.',
    icon: '⚖️',
    unlocked: true,
    unlockedAt: 'Ontem',
    category: 'calories',
    progress: 100,
    rewardCoins: 80,
  },
  {
    id: 'badge_protein_goal',
    title: 'Poder Proteico',
    description: 'Atingiu a meta calculada de proteínas para proteção muscular.',
    icon: '💪',
    unlocked: false,
    category: 'calories',
    progress: 88,
    rewardCoins: 40,
  },
  {
    id: 'badge_streak_3',
    title: 'Chama Viva (3 Dias)',
    description: 'Manteve a sequência de hábitos saudáveis por 3 dias consecutivos.',
    icon: '🔥',
    unlocked: true,
    unlockedAt: 'Há 2 dias',
    category: 'streak',
    progress: 100,
    rewardCoins: 40,
  },
  {
    id: 'badge_streak_7',
    title: 'Semana Imbatível',
    description: 'Completou 7 dias seguidos de metas diárias registradas.',
    icon: '👑',
    unlocked: false,
    category: 'streak',
    progress: 71,
    rewardCoins: 150,
  },
  {
    id: 'badge_clean_eating',
    title: 'Prato Colorido',
    description: 'Consumiu pelo menos 3 porções de frutas, folhas ou legumes frescos.',
    icon: '🥗',
    unlocked: true,
    unlockedAt: 'Hoje às 13:00',
    category: 'habits',
    progress: 100,
    rewardCoins: 35,
  },
];

export const MASCOT_ACCESSORIES: MascotAccessory[] = [
  { id: 'acc_cap', name: 'Boné Esportivo', category: 'hat', price: 120, unlocked: true, equipped: true, icon: '🧢', color: '#10b981' },
  { id: 'acc_sunglasses', name: 'Óculos Descolados', category: 'glasses', price: 180, unlocked: false, equipped: false, icon: '🕶️', color: '#3b82f6' },
  { id: 'acc_cape', name: 'Capa de Campeão', category: 'item', price: 250, unlocked: false, equipped: false, icon: '🦸', color: '#f59e0b' },
  { id: 'acc_bottle', name: 'Garrafinha Dourada', category: 'item', price: 150, unlocked: false, equipped: false, icon: '✨', color: '#eab308' },
  { id: 'acc_crown', name: 'Coroa Imperial', category: 'hat', price: 400, unlocked: false, equipped: false, icon: '👑', color: '#f59e0b' },
];

export const INITIAL_7_DAY_HISTORY = [
  { date: '2026-10-08', dayLabel: 'Qui', weight: 74.8, caloriesConsumed: 2150, calorieTarget: 2100, waterMl: 2600 },
  { date: '2026-10-09', dayLabel: 'Sex', weight: 74.5, caloriesConsumed: 2020, calorieTarget: 2100, waterMl: 2800 },
  { date: '2026-10-10', dayLabel: 'Sáb', weight: 74.6, caloriesConsumed: 2200, calorieTarget: 2100, waterMl: 2500 },
  { date: '2026-10-11', dayLabel: 'Dom', weight: 74.3, caloriesConsumed: 1980, calorieTarget: 2100, waterMl: 2750 },
  { date: '2026-10-12', dayLabel: 'Seg', weight: 74.1, caloriesConsumed: 2050, calorieTarget: 2100, waterMl: 2800 },
  { date: '2026-10-13', dayLabel: 'Ter', weight: 73.9, caloriesConsumed: 1990, calorieTarget: 2100, waterMl: 2850 },
  { date: '2026-10-14', dayLabel: 'Hoje', weight: 73.6, caloriesConsumed: 1106, calorieTarget: 2100, waterMl: 1750 },
];

export const INITIAL_30_DAY_HISTORY: import('../types').HealthDayRecord[] = [
  { date: '15/09', dayLabel: '15/09', weight: 75.8, caloriesConsumed: 2250, calorieTarget: 2100, waterMl: 2100 },
  { date: '16/09', dayLabel: '16/09', weight: 75.7, caloriesConsumed: 2100, calorieTarget: 2100, waterMl: 2400 },
  { date: '17/09', dayLabel: '17/09', weight: 75.6, caloriesConsumed: 2050, calorieTarget: 2100, waterMl: 2650 },
  { date: '18/09', dayLabel: '18/09', weight: 75.5, caloriesConsumed: 2180, calorieTarget: 2100, waterMl: 2500 },
  { date: '19/09', dayLabel: '19/09', weight: 75.5, caloriesConsumed: 2120, calorieTarget: 2100, waterMl: 2700 },
  { date: '20/09', dayLabel: '20/09', weight: 75.3, caloriesConsumed: 2300, calorieTarget: 2100, waterMl: 2300 },
  { date: '21/09', dayLabel: '21/09', weight: 75.4, caloriesConsumed: 2150, calorieTarget: 2100, waterMl: 2450 },
  { date: '22/09', dayLabel: '22/09', weight: 75.2, caloriesConsumed: 2080, calorieTarget: 2100, waterMl: 2800 },
  { date: '23/09', dayLabel: '23/09', weight: 75.1, caloriesConsumed: 2040, calorieTarget: 2100, waterMl: 2900 },
  { date: '24/09', dayLabel: '24/09', weight: 75.0, caloriesConsumed: 2190, calorieTarget: 2100, waterMl: 2600 },
  { date: '25/09', dayLabel: '25/09', weight: 74.9, caloriesConsumed: 2100, calorieTarget: 2100, waterMl: 2750 },
  { date: '26/09', dayLabel: '26/09', weight: 75.0, caloriesConsumed: 2210, calorieTarget: 2100, waterMl: 2500 },
  { date: '27/09', dayLabel: '27/09', weight: 74.8, caloriesConsumed: 2140, calorieTarget: 2100, waterMl: 2850 },
  { date: '28/09', dayLabel: '28/09', weight: 74.7, caloriesConsumed: 2020, calorieTarget: 2100, waterMl: 2950 },
  { date: '29/09', dayLabel: '29/09', weight: 74.8, caloriesConsumed: 2110, calorieTarget: 2100, waterMl: 2600 },
  { date: '30/09', dayLabel: '30/09', weight: 74.6, caloriesConsumed: 2090, calorieTarget: 2100, waterMl: 2700 },
  { date: '01/10', dayLabel: '01/10', weight: 74.5, caloriesConsumed: 2050, calorieTarget: 2100, waterMl: 2800 },
  { date: '02/10', dayLabel: '02/10', weight: 74.4, caloriesConsumed: 2120, calorieTarget: 2100, waterMl: 2750 },
  { date: '03/10', dayLabel: '03/10', weight: 74.5, caloriesConsumed: 2190, calorieTarget: 2100, waterMl: 2550 },
  { date: '04/10', dayLabel: '04/10', weight: 74.3, caloriesConsumed: 2160, calorieTarget: 2100, waterMl: 2600 },
  { date: '05/10', dayLabel: '05/10', weight: 74.2, caloriesConsumed: 2080, calorieTarget: 2100, waterMl: 2850 },
  { date: '06/10', dayLabel: '06/10', weight: 74.2, caloriesConsumed: 2040, calorieTarget: 2100, waterMl: 2900 },
  { date: '07/10', dayLabel: '07/10', weight: 74.0, caloriesConsumed: 2100, calorieTarget: 2100, waterMl: 2750 },
  { date: '08/10', dayLabel: '08/10', weight: 74.8, caloriesConsumed: 2150, calorieTarget: 2100, waterMl: 2600 },
  { date: '09/10', dayLabel: '09/10', weight: 74.5, caloriesConsumed: 2020, calorieTarget: 2100, waterMl: 2800 },
  { date: '10/10', dayLabel: '10/10', weight: 74.6, caloriesConsumed: 2200, calorieTarget: 2100, waterMl: 2500 },
  { date: '11/10', dayLabel: '11/10', weight: 74.3, caloriesConsumed: 1980, calorieTarget: 2100, waterMl: 2750 },
  { date: '12/10', dayLabel: '12/10', weight: 74.1, caloriesConsumed: 2050, calorieTarget: 2100, waterMl: 2800 },
  { date: '13/10', dayLabel: '13/10', weight: 73.9, caloriesConsumed: 1990, calorieTarget: 2100, waterMl: 2850 },
  { date: '14/10', dayLabel: 'Hoje', weight: 73.6, caloriesConsumed: 1106, calorieTarget: 2100, waterMl: 1750 },
];

export const getClean7DayHistory = (initialWeight: number, calorieTarget: number) => {
  const days = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Ontem', 'Hoje'];
  return days.map((dayLabel, idx) => ({
    date: `Dia ${idx + 1}`,
    dayLabel,
    weight: initialWeight > 0 ? initialWeight : 0,
    caloriesConsumed: 0,
    calorieTarget: calorieTarget > 0 ? calorieTarget : 2000,
    waterMl: 0,
  }));
};

export const getClean30DayHistory = (initialWeight: number, calorieTarget: number) => {
  return Array.from({ length: 30 }, (_, idx) => {
    const isToday = idx === 29;
    const isYesterday = idx === 28;
    const dayNum = idx + 1;
    return {
      date: `Dia ${dayNum}`,
      dayLabel: isToday ? 'Hoje' : isYesterday ? 'Ontem' : `D-${30 - dayNum}`,
      weight: initialWeight > 0 ? initialWeight : 0,
      caloriesConsumed: 0,
      calorieTarget: calorieTarget > 0 ? calorieTarget : 2000,
      waterMl: 0,
    };
  });
};

export const INITIAL_CHALLENGES: import('../types').SocialChallenge[] = [
  {
    id: 'ch_1',
    title: 'Desafio 7 Dias de Hidratação Máxima',
    description: 'Bata 100% da sua meta de água diária calculada por 7 dias seguidos.',
    category: 'hidratacao',
    durationDays: 7,
    daysRemaining: 4,
    participantsCount: 342,
    rewardCoins: 120,
    creatorName: 'Dra. Camila Nutri',
    isJoined: true,
    progressDays: 3,
    isCompleted: false,
    rewardClaimed: false,
    icon: '💧',
  },
  {
    id: 'ch_2',
    title: 'Semana do Prato Colorido (5 Dias)',
    description: 'Fotografe e registre pelo menos 3 vegetais ou folhas frescas no almoço.',
    category: 'nutricao',
    durationDays: 5,
    daysRemaining: 2,
    participantsCount: 215,
    rewardCoins: 100,
    creatorName: 'Comunidade MetasFitQuest',
    isJoined: true,
    progressDays: 4,
    isCompleted: false,
    rewardClaimed: false,
    icon: '🥗',
  },
  {
    id: 'ch_3',
    title: 'Zero Açúcar Refinado (10 Dias)',
    description: 'Substitua doces e refrigerantes comuns por frutas in natura ou chás aromáticos.',
    category: 'habitos',
    durationDays: 10,
    daysRemaining: 8,
    participantsCount: 489,
    rewardCoins: 200,
    creatorName: 'Equipe FitLife',
    isJoined: false,
    progressDays: 0,
    isCompleted: false,
    rewardClaimed: false,
    icon: '🚫',
  },
  {
    id: 'ch_4',
    title: 'Cozinhar em Casa (3 Dias Seguidos)',
    description: 'Evite delivery e prepare suas próprias refeições ricas em nutrientes limpos.',
    category: 'nutricao',
    durationDays: 3,
    daysRemaining: 3,
    participantsCount: 178,
    rewardCoins: 80,
    creatorName: 'Chef Saudável',
    isJoined: false,
    progressDays: 0,
    isCompleted: false,
    rewardClaimed: false,
    icon: '🍳',
  },
];

export const INITIAL_SOCIAL_POSTS: import('../types').SocialProofPost[] = [
  {
    id: 'post_1',
    authorName: 'Beatriz Ramos',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    challengeId: 'ch_2',
    challengeTitle: 'Semana do Prato Colorido (5 Dias)',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    caption: 'Dia 4/5 cumprido! Frango grelhado bem temperado, arroz integral e uma salada super crocante de rúcula com tomatinhos. Foco total nas HealthCoins! 🥗💪',
    timestamp: 'Há 25 minutos',
    likesCount: 24,
    hasLiked: false,
    reactions: { fire: 18, heart: 12, clap: 7 },
    comments: [
      { id: 'c1', authorName: 'Carlos Eduardo', text: 'Esse prato tá digno de foto de revista! Mandou bem demais 👏', time: 'Há 15 min' },
      { id: 'c2', authorName: 'Juliana Mendes', text: 'Inspirador! Amanhã vou montar um assim também.', time: 'Há 5 min' },
    ],
  },
  {
    id: 'post_2',
    authorName: 'Carlos Eduardo',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    challengeId: 'ch_1',
    challengeTitle: 'Desafio 7 Dias de Hidratação Máxima',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
    caption: '3ª garrafinha cheia de água fresca com rodelas de limão! Meta de 2.800ml batida antes do pôr do sol. O corpo agradece muito 💧🧊✨',
    timestamp: 'Há 1 hora',
    likesCount: 31,
    hasLiked: true,
    reactions: { fire: 22, heart: 15, clap: 11 },
    comments: [
      { id: 'c3', authorName: 'Dra. Camila', text: 'Excelente hábito! Adicionar limão ajuda muito no sabor e na vitamina C.', time: 'Há 40 min' },
    ],
  },
  {
    id: 'post_3',
    authorName: 'Juliana Mendes',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    challengeId: 'ch_3',
    challengeTitle: 'Zero Açúcar Refinado (10 Dias)',
    imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&auto=format&fit=crop&q=80',
    caption: 'Bateu a vontade de doce pós-almoço, mas mantive a disciplina! Bowl de iogurte grego natural com morangos frescos e sementes de chia. Delícia pura! 🍓🥣',
    timestamp: 'Há 3 horas',
    likesCount: 19,
    hasLiked: false,
    reactions: { fire: 14, heart: 9, clap: 8 },
    comments: [
      { id: 'c4', authorName: 'Beatriz Ramos', text: 'Melhor troca inteligente! Segura o foco na meta!', time: 'Há 2 h' },
    ],
  },
];

export const INITIAL_LEADERBOARD: import('../types').LeaderboardUser[] = [
  { id: 'lb_1', rank: 1, name: 'Ana Paula Lima', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', healthCoins: 840, streakDays: 14, challengesCompleted: 8 },
  { id: 'lb_2', rank: 2, name: 'Rafael Souza', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', healthCoins: 710, streakDays: 12, challengesCompleted: 6 },
  { id: 'lb_3', rank: 3, name: 'Beatriz Ramos', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', healthCoins: 650, streakDays: 9, challengesCompleted: 5 },
  { id: 'lb_4', rank: 4, name: 'Você (NutriBubby)', avatar: OFFICIAL_AVATARS.male.default, healthCoins: 285, streakDays: 5, challengesCompleted: 2, isCurrentUser: true },
  { id: 'lb_5', rank: 5, name: 'Carlos Eduardo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', healthCoins: 260, streakDays: 4, challengesCompleted: 3 },
  { id: 'lb_6', rank: 6, name: 'Mariana Costa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', healthCoins: 230, streakDays: 4, challengesCompleted: 2 },
  { id: 'lb_7', rank: 7, name: 'Felipe Rocha', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80', healthCoins: 195, streakDays: 3, challengesCompleted: 1 },
];

export const DJANGO_ARCHITECTURE_CODE = `"""
MetasFitQuest - Arquitetura de Backend com Django REST Framework & PostgreSQL/SQLite
Modelagem de Dados e Relacionamentos das Entidades Principais
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


# -------------------------------------------------------------------------
# 1. Perfil do Usuário e Metas Antropométricas
# -------------------------------------------------------------------------
class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('masculino', 'Masculino'),
        ('feminino', 'Feminino'),
        ('outro', 'Outro'),
    ]
    
    ACTIVITY_LEVEL_CHOICES = [
        ('sedentario', 'Sedentário (pouco exercício)'),
        ('leve', 'Leve (1-3x por semana)'),
        ('moderado', 'Moderado (3-5x por semana)'),
        ('intenso', 'Intenso (6-7x por semana)'),
        ('muito_ativo', 'Muito Ativo (2x ao dia/trabalho pesado)'),
    ]
    
    GOAL_CHOICES = [
        ('emagrecer', 'Emagrecer com Saúde'),
        ('manter', 'Manter Peso e Vitalidade'),
        ('ganhar_massa', 'Ganhar Massa Magra (Hipertrofia)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.PositiveIntegerField(validators=[MinValueValidator(12), MaxValueValidator(120)])
    gender = models.CharField(max_length=15, choices=GENDER_CHOICES, default='masculino')
    height_cm = models.FloatField(help_text="Altura em centímetros")
    weight_kg = models.FloatField(help_text="Peso atual em quilogramas")
    target_weight_kg = models.FloatField(help_text="Peso desejado em quilogramas")
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES, default='moderado')
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='emagrecer')
    
    # Gamificação
    health_coins = models.PositiveIntegerField(default=150)
    current_streak = models.PositiveIntegerField(default=5)
    longest_streak = models.PositiveIntegerField(default=12)
    last_active_date = models.DateField(default=timezone.now)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def bmi(self):
        """Calcula o IMC: peso / (altura/100)^2"""
        h_m = self.height_cm / 100
        return round(self.weight_kg / (h_m ** 2), 1)

    @property
    def tmb(self):
        """Mifflin-St Jeor Equation"""
        base = (10 * self.weight_kg) + (6.25 * self.height_cm) - (5 * self.age)
        if self.gender == 'masculino':
            return round(base + 5)
        elif self.gender == 'feminino':
            return round(base - 161)
        return round(base - 78)

    @property
    def target_water_ml(self):
        """Base 35ml/kg + bônus de atividade"""
        bonus = {'sedentario': 0, 'leve': 250, 'moderado': 500, 'intenso': 750, 'muito_ativo': 1000}
        return round((self.weight_kg * 35) + bonus.get(self.activity_level, 0))

    def __str__(self):
        return f"{self.user.username} ({self.goal})"


# -------------------------------------------------------------------------
# 2. Refeições e Alimentos Registrados
# -------------------------------------------------------------------------
class Meal(models.Model):
    CATEGORY_CHOICES = [
        ('cafe', 'Café da Manhã'),
        ('almoco', 'Almoço'),
        ('jantar', 'Jantar'),
        ('lanches', 'Lanches'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meals')
    date = models.DateField(default=timezone.now)
    time = models.TimeField(default=timezone.now)
    category = models.CharField(max_length=15, choices=CATEGORY_CHOICES)
    name = models.CharField(max_length=80, blank=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.get_category_display()} - {self.user.username} ({self.date})"


class FoodItem(models.Model):
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=120)
    serving = models.CharField(max_length=80)
    quantity = models.FloatField(default=1.0)
    calories = models.FloatField(help_text="Kcal")
    protein_g = models.FloatField(help_text="Gramas de proteína")
    carbs_g = models.FloatField(help_text="Gramas de carboidratos")
    fat_g = models.FloatField(help_text="Gramas de gorduras")
    icon = models.CharField(max_length=10, blank=True, default='🥗')

    def __str__(self):
        return f"{self.name} ({self.calories} kcal)"


# -------------------------------------------------------------------------
# 3. Registro de Hidratação
# -------------------------------------------------------------------------
class WaterLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='water_logs')
    date = models.DateField(default=timezone.now)
    timestamp = models.DateTimeField(default=timezone.now)
    amount_ml = models.PositiveIntegerField(help_text="Volume ingerido em mililitros")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} +{self.amount_ml}ml em {self.timestamp.strftime('%H:%M')}"


# -------------------------------------------------------------------------
# 4. Gamificação: Conquistas, Moedas e Mascote
# -------------------------------------------------------------------------
class Achievement(models.Model):
    code = models.SlugField(unique=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=10)
    reward_coins = models.PositiveIntegerField(default=50)

    def __str__(self):
        return f"{self.icon} {self.title}"


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')


class HealthCoinTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coin_transactions')
    amount = models.IntegerField(help_text="Pode ser positivo (ganho) ou negativo (resgate na loja)")
    reason = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)


class MascotAccessory(models.Model):
    name = models.CharField(max_length=80)
    category = models.CharField(max_length=30)
    price_coins = models.PositiveIntegerField()
    icon = models.CharField(max_length=10)


class UserMascotInventory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mascot_inventory')
    accessory = models.ForeignKey(MascotAccessory, on_delete=models.CASCADE)
    is_equipped = models.BooleanField(default=False)
`;
