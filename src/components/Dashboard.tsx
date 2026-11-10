import React from 'react';
import { Meal, MealCategory, UserProfile, FoodItem, MascotMood } from '../types';
import { Mascot } from './Mascot';
import { DailyProgressBarCard } from './DailyProgressBarCard';
import { StepTrackerCard } from './StepTrackerCard';
import { getCalorieStatus } from '../utils/calculations';
import {
  Utensils,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Droplet,
  Sparkles,
  Flame,
  PieChart,
  Calendar,
  Camera,
  Barcode,
  Users,
  Trophy,
  ArrowRight,
  Dumbbell,
  UtensilsCrossed,
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  meals: Meal[];
  waterConsumedMl: number;
  mascotMood: MascotMood;
  mascotSpeech: string;
  equippedAccessories: string[];
  stepsToday?: number;
  stepGoal?: number;
  onUpdateSteps?: (steps: number) => void;
  onUpdateStepGoal?: (goal: number) => void;
  onRewardCoins?: (coins: number, reason: string) => void;
  onOpenMealModal: (category: MealCategory) => void;
  onOpenScanner: () => void;
  onDeleteFoodItem: (mealId: string, itemId: string) => void;
  onAddWaterQuick: (amountMl: number) => void;
  onGoToHealth: () => void;
  onGoToGamification: () => void;
  onGoToSocial?: () => void;
  onGoToTrainer?: () => void;
  onGoToDiet?: () => void;
}

const CATEGORY_DETAILS: Record<MealCategory, { title: string; defaultTime: string; icon: string; bg: string }> = {
  cafe: { title: 'Café da Manhã', defaultTime: '08:00', icon: '🍳', bg: 'bg-amber-500/10 text-amber-700' },
  almoco: { title: 'Almoço', defaultTime: '12:30', icon: '🥗', bg: 'bg-emerald-500/10 text-emerald-700' },
  lanches: { title: 'Lanches & Snacks', defaultTime: '16:00', icon: '🍎', bg: 'bg-orange-500/10 text-orange-700' },
  jantar: { title: 'Jantar', defaultTime: '20:00', icon: '🍲', bg: 'bg-indigo-500/10 text-indigo-700' },
};

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  meals,
  waterConsumedMl,
  mascotMood,
  mascotSpeech,
  equippedAccessories,
  stepsToday = 5420,
  stepGoal = 10000,
  onUpdateSteps = () => {},
  onUpdateStepGoal,
  onRewardCoins,
  onOpenMealModal,
  onOpenScanner,
  onDeleteFoodItem,
  onAddWaterQuick,
  onGoToHealth,
  onGoToGamification,
  onGoToSocial,
  onGoToTrainer,
  onGoToDiet,
}) => {
  // Aggregate current consumption
  const totalCalories = meals.reduce((acc, m) => acc + m.items.reduce((sum, item) => sum + item.calories, 0), 0);
  const totalProtein = Number(
    meals.reduce((acc, m) => acc + m.items.reduce((sum, item) => sum + item.protein, 0), 0).toFixed(1)
  );
  const totalCarbs = Number(
    meals.reduce((acc, m) => acc + m.items.reduce((sum, item) => sum + item.carbs, 0), 0).toFixed(1)
  );
  const totalFat = Number(
    meals.reduce((acc, m) => acc + m.items.reduce((sum, item) => sum + item.fat, 0), 0).toFixed(1)
  );

  const targetKcal = user.targetCalories;
  const remainingKcal = targetKcal - totalCalories;
  const caloriePercent = Math.min(150, Math.round((totalCalories / targetKcal) * 100));

  // Smart status
  const calorieStatus = getCalorieStatus(totalCalories, targetKcal);

  // Water progress
  const waterPercent = Math.min(100, Math.round((waterConsumedMl / user.targetWaterMl) * 100));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero with Mascot & Energy Balance */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-400/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Welcome & Smart Status Alert */}
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              <span>Resumo Diário Inteligente</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                Olá, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-sm">
                Hoje seu objetivo é <span className="font-semibold text-white capitalize">{user.goal.replace('_', ' ')}</span> com gasto estimado em {user.tdee} kcal.
              </p>
            </div>

            {/* Smart Status Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Alerta Inteligente
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="text-xl">
                  {calorieStatus.status === 'ideal' && '🎯'}
                  {calorieStatus.status === 'deficit' && '🥗'}
                  {calorieStatus.status === 'proximo' && '⚠️'}
                  {calorieStatus.status === 'excesso' && '🚨'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {calorieStatus.label}
                  </h4>
                  <p className="text-[11px] text-emerald-100 leading-snug mt-0.5">
                    {calorieStatus.description}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Camera Scanner CTA Button */}
            <button
              onClick={onOpenScanner}
              className="w-full py-2.5 px-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
            >
              <Camera className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>Escanear Prato / Código de Barras (IA)</span>
            </button>
          </div>

          {/* Calorie Ring & Balance Gauge */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-200">
                  Balanço Calórico
                </span>
                <p className="text-xs text-emerald-100">
                  Consumo vs. Meta (TMB + Atividade)
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-white">
                  {totalCalories} <span className="text-xs text-emerald-200">/ {targetKcal} kcal</span>
                </span>
              </div>
            </div>

            {/* Big Progress Bar & Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-emerald-100">
                <span>Progresso do dia</span>
                <span className="font-mono font-bold text-white">{caloriePercent}%</span>
              </div>
              {/* Animated Progress Bar */}
              <div className="w-full h-3.5 bg-black/20 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    caloriePercent > 110
                      ? 'bg-gradient-to-r from-amber-400 to-rose-400'
                      : 'bg-gradient-to-r from-emerald-300 to-teal-300'
                  }`}
                  style={{ width: `${Math.min(100, caloriePercent)}%` }}
                ></div>
              </div>

              {/* Energy Split: Consumidas / Restantes / Gasto Total */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="text-[10px] text-emerald-200 block">Consumidas</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-white">
                    {totalCalories}
                  </span>
                  <span className="text-[9px] text-emerald-300 block">kcal</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="text-[10px] text-emerald-200 block">Restantes</span>
                  <span className={`text-xs sm:text-sm font-bold font-mono ${remainingKcal < 0 ? 'text-rose-300' : 'text-white'}`}>
                    {remainingKcal < 0 ? `+${Math.abs(remainingKcal)}` : remainingKcal}
                  </span>
                  <span className="text-[9px] text-emerald-300 block">{remainingKcal < 0 ? 'excedente' : 'kcal'}</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="text-[10px] text-emerald-200 block">Gasto (TDEE)</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-white">
                    {user.tdee}
                  </span>
                  <span className="text-[9px] text-emerald-300 block">kcal/dia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Mascot Hub */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Mascot
              mood={mascotMood}
              speech={mascotSpeech}
              name={user.name || 'NutriBubby'}
              gender={user.gender === 'feminino' ? 'feminino' : 'masculino'}
              equippedItems={equippedAccessories}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Visualização de Barra de Progresso Diária: Calorias, Macros e Quanto Falta */}
      <DailyProgressBarCard
        user={user}
        totalCalories={totalCalories}
        totalProtein={totalProtein}
        totalCarbs={totalCarbs}
        totalFat={totalFat}
        waterConsumedMl={waterConsumedMl}
        onOpenScanner={onOpenScanner}
        onOpenMealModal={onOpenMealModal}
        onAddWaterQuick={onAddWaterQuick}
      />

      {/* Marcador de Passos Interativo & Queima Calórica vs Consumo */}
      <StepTrackerCard
        user={user}
        stepsToday={stepsToday}
        stepGoal={stepGoal}
        totalCaloriesConsumed={totalCalories}
        onUpdateSteps={onUpdateSteps}
        onUpdateGoal={onUpdateStepGoal}
        onRewardCoins={onRewardCoins}
      />

      {/* Personal Trainer & Hipertrofia Callout */}
      {onGoToTrainer && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 text-white border border-white/20 flex items-center justify-center shrink-0">
              <Dumbbell className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/20 text-emerald-100 rounded-full border border-white/20">
                  Personal Trainer & Hipertrofia
                </span>
                <span className="text-xs text-yellow-300 font-bold font-mono">
                  +100 HC por treino
                </span>
              </div>
              <h3 className="font-display font-bold text-sm sm:text-base mt-1 text-white">
                Treino de Hoje Adaptado: Casa ou Academia
              </h3>
              <p className="text-xs text-emerald-100/90">
                Anamnese biomecânica, fotos dos exercícios, checklist de séries e descanso programado.
              </p>
            </div>
          </div>

          <button
            onClick={onGoToTrainer}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md shadow-black/10 transition-all cursor-pointer shrink-0 self-stretch sm:self-auto active:scale-95"
          >
            <Dumbbell className="w-4 h-4 text-emerald-700" />
            <span>Iniciar Treino de Hoje</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      )}

      {/* Social Challenges & Community Arena Callout */}
      {onGoToSocial && (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-5 shadow-sm border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/20">
                  Arena & Desafios
                </span>
                <span className="text-xs text-amber-300 font-bold font-mono">
                  +120 HC em prêmios
                </span>
              </div>
              <h3 className="font-display font-bold text-sm sm:text-base mt-1 text-white">
                Desafios com Metas em Dias & Hub de Fotos
              </h3>
              <p className="text-xs text-slate-300">
                Participe de desafios da comunidade, comprove pratos e água com fotos e dispute o ranque de HealthCoins!
              </p>
            </div>
          </div>

          <button
            onClick={onGoToSocial}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0 self-stretch sm:self-auto active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>Entrar na Arena Social</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Diet Management & Cardápios Callout Banner */}
      {onGoToDiet && (
        <div className="bg-gradient-to-r from-teal-800 via-emerald-850 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-teal-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-full border border-teal-400/20">
                  Nutrição & Cardápios
                </span>
                <span className="text-xs text-emerald-300 font-bold font-mono">
                  Hipertrofia ou Emagrecimento
                </span>
              </div>
              <h3 className="font-display font-bold text-sm sm:text-base mt-1 text-white">
                Planejamento de Dieta & Avaliação Nutricional
              </h3>
              <p className="text-xs text-slate-300">
                Cardápios calculados cientificamente com macronutrientes, substituições saudáveis e lista de compras semanal!
              </p>
            </div>
          </div>

          <button
            onClick={onGoToDiet}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 transition-all cursor-pointer shrink-0 self-stretch sm:self-auto active:scale-95"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Gerenciar Dieta & Cardápios</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Histórico do Dia: Categorias de Refeição */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              Histórico de Refeições do Dia
            </h2>
            <p className="text-xs text-slate-500">
              Registre o que você comeu para manter a contagem precisa e conquistar HealthCoins.
            </p>
          </div>
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Foto do Prato ou Código (IA)</span>
          </button>
        </div>

        {/* Meal Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['cafe', 'almoco', 'lanches', 'jantar'] as MealCategory[]).map((cat) => {
            const meal = meals.find((m) => m.category === cat);
            const items = meal?.items || [];
            const mealKcal = items.reduce((sum, it) => sum + it.calories, 0);
            const mealProtein = Number(items.reduce((sum, it) => sum + it.protein, 0).toFixed(1));
            const details = CATEGORY_DETAILS[cat];

            return (
              <div
                key={cat}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl p-2 rounded-xl bg-slate-100">
                      {details.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {details.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {items.length === 0 ? 'Nenhum item registrado' : `${items.length} ${items.length === 1 ? 'item' : 'itens'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-slate-800">
                        {mealKcal} <span className="text-[10px] text-slate-400">kcal</span>
                      </span>
                      {mealProtein > 0 && (
                        <span className="text-[10px] text-emerald-600 font-mono block">
                          {mealProtein}g prot
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenMealModal(cat)}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                      title="Adicionar alimento"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 mb-3 flex-1 min-h-[48px]">
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center h-16 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                      Clique no botão + para adicionar
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-base">{item.icon || '🥗'}</span>
                          <div className="truncate">
                            <span className="font-semibold text-slate-800">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {item.serving} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-semibold text-slate-700 text-xs">
                            {item.calories} <span className="text-[10px] text-slate-400">kcal</span>
                          </span>
                          <button
                            onClick={() => onDeleteFoodItem(meal?.id || '', item.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remover alimento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer action */}
                <button
                  onClick={() => onOpenMealModal(cat)}
                  className="w-full py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Alimento
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
