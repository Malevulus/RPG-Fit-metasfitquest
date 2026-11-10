export type Gender = 'masculino' | 'feminino' | 'outro';

export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_ativo';

export type GoalType = 'emagrecer' | 'manter' | 'ganhar_massa';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  age: number;
  gender: Gender;
  weight: number; // in kg
  targetWeight: number; // in kg
  height: number; // in cm
  activityLevel: ActivityLevel;
  goal: GoalType;
  avatarSeed?: string;
  tmb: number; // Taxa Metabólica Basal
  tdee: number; // Gasto Energético Total
  targetCalories: number; // Meta diária ajustada
  targetWaterMl: number; // Meta de água diária calculada
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}

export type MealCategory = 'cafe' | 'almoco' | 'jantar' | 'lanches';

export interface FoodItem {
  id: string;
  name: string;
  serving: string;
  quantity: number;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  icon?: string;
  cookingMethod?: string;
  estimatedGrams?: number;
}

export interface Meal {
  id: string;
  category: MealCategory;
  name: string;
  time: string;
  items: FoodItem[];
}

export interface WaterLog {
  id: string;
  timestamp: string;
  amountMl: number;
}

export interface StepLog {
  id: string;
  timestamp: string;
  stepsAdded: number;
  mode: 'manual' | 'walk' | 'run' | 'live_sensor';
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  waterLogs: WaterLog[];
  waterConsumedMl: number;
  stepsCount?: number;
  notes?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'water' | 'calories' | 'streak' | 'habits';
  progress: number; // 0 to 100
  rewardCoins: number;
}

export interface MascotAccessory {
  id: string;
  name: string;
  category: 'hat' | 'glasses' | 'item' | 'skin';
  price: number;
  unlocked: boolean;
  equipped: boolean;
  icon: string;
  color: string;
}

export type MascotMood = 'sleepy' | 'thirsty' | 'active' | 'happy' | 'champion' | 'stuffed';

export interface MascotStatus {
  name: string;
  mood: MascotMood;
  speech: string;
  equippedItems: string[];
}

export interface HealthDayRecord {
  date: string;
  dayLabel: string;
  weight: number;
  caloriesConsumed: number;
  calorieTarget: number;
  waterMl: number;
}

export interface SocialChallenge {
  id: string;
  title: string;
  description: string;
  category: 'nutricao' | 'hidratacao' | 'atividade' | 'habitos';
  durationDays: number;
  daysRemaining: number;
  participantsCount: number;
  rewardCoins: number;
  creatorName: string;
  isJoined: boolean;
  progressDays: number; // quantos dias o usuário já cumpriu
  isCompleted: boolean;
  rewardClaimed: boolean;
  icon: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  text: string;
  time: string;
}

export interface SocialProofPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  challengeId?: string;
  challengeTitle?: string;
  imageUrl: string;
  caption: string;
  timestamp: string;
  likesCount: number;
  hasLiked: boolean;
  reactions: {
    fire: number;
    heart: number;
    clap: number;
  };
  comments: PostComment[];
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  healthCoins: number;
  streakDays: number;
  challengesCompleted: number;
  isCurrentUser?: boolean;
}

export interface ScheduledNotification {
  id: string;
  type: 'water' | 'meal' | 'workout';
  title: string;
  body: string;
  time: string; // HH:mm
  enabled: boolean;
  days: string[];
}

export interface HealthAnamnese {
  hasJointPain: boolean;
  jointPainLocations: string[]; // 'joelho' | 'lombar' | 'ombro' | 'cervical' | 'punho'
  hasCardiovascularIssue: boolean;
  cardiovascularNotes: string;
  hasSpineIssues: boolean; // hérnia de disco, escoliose
  spineNotes: string;
  hasRecentSurgery: boolean;
  surgeryNotes: string;
  experienceLevel: 'iniciante' | 'intermediario' | 'avancado';
  preferredLocation: 'casa' | 'academia';
  primaryGoal: 'hipertrofia' | 'emagrecimento' | 'condicionamento' | 'forca';
  weeklyFrequency: number;
  completedAt?: string;
}

export interface ExerciseSeriesCheck {
  seriesIndex: number;
  completed: boolean;
  repsDone?: number;
  weightKg?: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetMuscle: string;
  scientificTarget: string; // Fisiologia e anatomia muscular (Pectoralis major, etc.)
  environment: 'casa' | 'academia' | 'ambos';
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  sets: number;
  repsRange: string;
  restSeconds: number;
  imageUrl: string;
  executionGuide: string[];
  contraindications: string[]; // restrições da anamnese
  adaptationNote?: string;
  muscleGroup?: 'peito' | 'triceps' | 'pernas' | 'costas' | 'biceps' | 'cardio' | 'alongamento';
  phase?: 'alongamento_inicial' | 'principal' | 'alongamento_final';
  seriesProgress: ExerciseSeriesCheck[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  subtitle: string;
  focus: string;
  environment: 'casa' | 'academia';
  estimatedMinutes: number;
  rewardCoins: number;
  exercises: WorkoutExercise[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface WorkoutHistoryEntry {
  id: string;
  date: string;
  timestamp: string;
  workoutTitle: string;
  environment: 'casa' | 'academia';
  exercisesCompleted: number;
  totalExercises: number;
  rewardEarned: number;
}

// ---------------------------------------------------------------------------
// Diet Management, Healthy Menus & Nutritional Assessment Types
// ---------------------------------------------------------------------------
export type DietGoal = 'emagrecimento' | 'hipertrofia' | 'manutencao';
export type DietStyle = 'equilibrada' | 'low_carb' | 'mediterranea' | 'hiperproteica' | 'vegetariana' | 'pratica';

export interface DietMealItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  icon?: string;
  tip?: string;
  substitutions?: string[];
}

export interface DietMealSection {
  id: string;
  category: MealCategory | 'lanche_manha' | 'lanche_tarde' | 'ceia';
  name: string;
  time: string;
  targetCalories: number;
  items: DietMealItem[];
}

export interface DietPlan {
  id: string;
  title: string;
  subtitle: string;
  goal: DietGoal;
  dietStyle: DietStyle;
  description: string;
  totalCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  tags: string[];
  icon: string;
  meals: DietMealSection[];
  groceryList: { category: string; items: string[] }[];
}

export interface NutritionalAssessment {
  age: number;
  gender: Gender;
  weight: number;
  targetWeight: number;
  height: number;
  activityLevel: ActivityLevel;
  goal: DietGoal;
  dietStyle: DietStyle;
  mealsPerDay: number; // 3, 4, 5, 6
  cookingTime: 'rapido' | 'moderado' | 'elaborado';
  budget: 'economico' | 'moderado' | 'livre';
  favoriteFoods: string;
  dislikedFoods: string;
  calculatedTmb: number;
  calculatedTdee: number;
  recommendedCalories: number;
  recommendedWaterMl: number;
  macros: { proteinG: number; carbsG: number; fatG: number; fiberG: number };
  completedAt?: string;
}


