import React, { useState } from 'react';
import {
  UserProfile,
  Meal,
  DietPlan,
  DietGoal,
  DietStyle,
  NutritionalAssessment,
  DietMealSection,
} from '../types';
import { PRESET_DIET_PLANS, generateCustomDietPlan } from '../data/dietData';
import {
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  Apple,
  Flame,
  Scale,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Heart,
  Info,
  Clock,
  Printer,
  Copy,
  DollarSign,
  ChefHat,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DietModuleProps {
  user: UserProfile;
  todayMeals: Meal[];
  activeDietPlan: DietPlan | null;
  savedAssessment: NutritionalAssessment | null;
  onApplyDietPlan: (plan: DietPlan) => void;
  onImportDietMealsToDiary: (meals: DietMealSection[]) => void;
  onSaveAssessment: (assessment: NutritionalAssessment, generatedPlan: DietPlan) => void;
  onToast: (msg: string) => void;
}

export const DietModule: React.FC<DietModuleProps> = ({
  user,
  todayMeals,
  activeDietPlan,
  savedAssessment,
  onApplyDietPlan,
  onImportDietMealsToDiary,
  onSaveAssessment,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'assessment' | 'my_plan'>('plans');

  // Filter state for preset plans
  const [selectedGoal, setSelectedGoal] = useState<DietGoal | 'all'>('all');
  const [selectedStyle, setSelectedStyle] = useState<DietStyle | 'all'>('all');
  const [expandedPlanId, setExpandedPlanId] = useState<string>(PRESET_DIET_PLANS[0]?.id || '');

  // Grocery modal state
  const [groceryModalPlan, setGroceryModalPlan] = useState<DietPlan | null>(null);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Record<string, boolean>>({});

  // Assessment Form State
  const initialGoal: DietGoal = user.goal === 'ganhar_massa' ? 'hipertrofia' : 'emagrecimento';
  const [formAge, setFormAge] = useState<number>(user.age || 28);
  const [formGender, setFormGender] = useState<'masculino' | 'feminino' | 'outro'>(user.gender || 'masculino');
  const [formWeight, setFormWeight] = useState<number>(user.weight || 73.6);
  const [formTargetWeight, setFormTargetWeight] = useState<number>(user.targetWeight || 70.0);
  const [formHeight, setFormHeight] = useState<number>(user.height || 175);
  const [formActivity, setFormActivity] = useState<UserProfile['activityLevel']>(user.activityLevel || 'moderado');
  const [formGoal, setFormGoal] = useState<DietGoal>(initialGoal);
  const [formStyle, setFormStyle] = useState<DietStyle>('equilibrada');
  const [formMealsCount, setFormMealsCount] = useState<number>(4);
  const [formCookingTime, setFormCookingTime] = useState<'rapido' | 'moderado' | 'elaborado'>('rapido');
  const [formBudget, setFormBudget] = useState<'economico' | 'moderado' | 'livre'>('moderado');
  const [formFavorites, setFormFavorites] = useState<string>(
    savedAssessment?.favoriteFoods || 'Ovos, aveia, banana, frango grelhado, azeite'
  );
  const [formDislikes, setFormDislikes] = useState<string>(
    savedAssessment?.dislikedFoods || 'Fígado, frutos do mar'
  );

  // Result of generated assessment plan
  const [generatedAssessmentPlan, setGeneratedAssessmentPlan] = useState<DietPlan | null>(
    activeDietPlan && activeDietPlan.id.startsWith('custom_') ? activeDietPlan : null
  );

  // Filter preset diet plans
  const filteredPlans = PRESET_DIET_PLANS.filter((plan) => {
    if (selectedGoal !== 'all' && plan.goal !== selectedGoal) return false;
    if (selectedStyle !== 'all' && plan.dietStyle !== selectedStyle) return false;
    return true;
  });

  // Calculate today's consumed macros from diary
  const todayConsumedCalories = todayMeals.reduce((acc, m) => {
    return acc + m.items.reduce((sum, it) => sum + it.calories * it.quantity, 0);
  }, 0);
  const todayConsumedProtein = Math.round(
    todayMeals.reduce((acc, m) => {
      return acc + m.items.reduce((sum, it) => sum + it.protein * it.quantity, 0);
    }, 0)
  );
  const todayConsumedCarbs = Math.round(
    todayMeals.reduce((acc, m) => {
      return acc + m.items.reduce((sum, it) => sum + it.carbs * it.quantity, 0);
    }, 0)
  );
  const todayConsumedFat = Math.round(
    todayMeals.reduce((acc, m) => {
      return acc + m.items.reduce((sum, it) => sum + it.fat * it.quantity, 0);
    }, 0)
  );

  // Handle Assessment Calculation
  const handleCalculateAssessment = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. TMB - Mifflin-St Jeor
    let tmb = 10 * formWeight + 6.25 * formHeight - 5 * formAge;
    if (formGender === 'feminino') {
      tmb -= 161;
    } else {
      tmb += 5;
    }
    tmb = Math.round(tmb);

    // 2. Activity multiplier
    const activityMultipliers: Record<UserProfile['activityLevel'], number> = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muito_ativo: 1.9,
    };
    const factor = activityMultipliers[formActivity] || 1.55;
    const tdee = Math.round(tmb * factor);

    // 3. Recommended calories adjusted by goal
    let targetCalories = tdee;
    if (formGoal === 'emagrecimento') {
      targetCalories = Math.max(1300, tdee - 450); // deficit seguro
    } else if (formGoal === 'hipertrofia') {
      targetCalories = tdee + 380; // superávit limpo
    }

    // 4. Protein calculation based on ISSN guidelines (1.8g to 2.2g per kg for training)
    const proteinFactor = formGoal === 'hipertrofia' ? 2.0 : 1.8;
    const targetProteinG = Math.round(formWeight * proteinFactor);
    const proteinKcal = targetProteinG * 4;

    // 5. Fat: ~25% to 28% of total calories
    const fatKcal = targetCalories * 0.27;
    const targetFatG = Math.round(fatKcal / 9);

    // 6. Carbs: Remaining calories
    const remainingKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal));
    const targetCarbsG = Math.round(remainingKcal / 4);

    // 7. Water: 35ml per kg + activity
    const waterFactor = formActivity === 'intenso' || formActivity === 'muito_ativo' ? 42 : 35;
    const recommendedWaterMl = Math.round(formWeight * waterFactor);

    const assessment: NutritionalAssessment = {
      age: formAge,
      gender: formGender,
      weight: formWeight,
      targetWeight: formTargetWeight,
      height: formHeight,
      activityLevel: formActivity,
      goal: formGoal,
      dietStyle: formStyle,
      mealsPerDay: formMealsCount,
      cookingTime: formCookingTime,
      budget: formBudget,
      favoriteFoods: formFavorites,
      dislikedFoods: formDislikes,
      calculatedTmb: tmb,
      calculatedTdee: tdee,
      recommendedCalories: targetCalories,
      recommendedWaterMl,
      macros: {
        proteinG: targetProteinG,
        carbsG: targetCarbsG,
        fatG: targetFatG,
        fiberG: Math.round(targetCalories / 60), // ~30-40g
      },
      completedAt: new Date().toLocaleDateString('pt-BR'),
    };

    const newPlan = generateCustomDietPlan(assessment);
    setGeneratedAssessmentPlan(newPlan);
    onSaveAssessment(assessment, newPlan);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    onToast('🎉 Avaliação concluída e Cardápio Otimizado gerado com sucesso!');
  };

  const toggleGroceryItem = (key: string) => {
    setCheckedGroceryItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const copyGroceryListToClipboard = (plan: DietPlan) => {
    const textLines = [
      `🛒 LISTA DE COMPRAS SEMANAL - ${plan.title.toUpperCase()}`,
      `Meta: ${plan.totalCalories} kcal (${plan.proteinG}g P | ${plan.carbsG}g C | ${plan.fatG}g G)`,
      '',
    ];

    plan.groceryList.forEach((group) => {
      textLines.push(`[${group.category}]`);
      group.items.forEach((item) => textLines.push(` • ${item}`));
      textLines.push('');
    });

    textLines.push('Gerado pelo MetasFitQuest · Controle sua vida e otimize com mais XP');

    navigator.clipboard.writeText(textLines.join('\n'));
    onToast('📋 Lista de compras copiada para a área de transferência!');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Nutrição Científica & Cardápios Funcionais
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
              Gerenciamento de Dieta & Cardápios
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore cardápios inteligentes para controle de peso ou ganho de massa, faça sua avaliação
              nutricional personalizada e adote planos otimizados para sua rotina e preferências.
            </p>
          </div>

          {/* Quick Target Chips */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 min-w-[240px]">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block mb-1.5">
              Sua Meta Diária Atual
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-black text-white">{user.targetCalories}</span>
              <span className="text-xs text-slate-300">kcal / dia</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] font-mono">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Proteína</span>
                <span className="font-bold text-emerald-300">{user.targetProteinG}g</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Carbo</span>
                <span className="font-bold text-amber-300">{user.targetCarbsG}g</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Gordura</span>
                <span className="font-bold text-rose-300">{user.targetFatG}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'plans'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Opções de Cardápios Saudáveis
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'assessment'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Avaliação Nutricional (Anamnese & IA)
          </button>

          <button
            onClick={() => setActiveTab('my_plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'my_plan'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Meu Plano Ativo & Diário
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OPÇÕES DE CARDÁPIOS SAUDÁVEIS PRONTOS
         ========================================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Objective Switcher & Filter Pills */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  Filtrar por Objetivo ou Estilo de Cardápio
                </h3>
                <p className="text-xs text-slate-500">
                  Escolha conforme seu foco atual: emagrecimento, hipertrofia ou equilíbrio
                </p>
              </div>

              {/* Goal buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setSelectedGoal('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGoal === 'all'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedGoal('hipertrofia')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGoal === 'hipertrofia'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Ganho de Massa
                </button>
                <button
                  onClick={() => setSelectedGoal('emagrecimento')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGoal === 'emagrecimento'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  Controle de Peso
                </button>
              </div>
            </div>

            {/* Style Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium mr-1 text-[11px]">Estilo:</span>
              {[
                { id: 'all', label: 'Todos os estilos' },
                { id: 'hiperproteica', label: 'Alta Proteína' },
                { id: 'low_carb', label: 'Low-Carb' },
                { id: 'mediterranea', label: 'Mediterrânea' },
                { id: 'pratica', label: 'Econômica & Prática' },
                { id: 'vegetariana', label: 'Vegetariana' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStyle(st.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedStyle === st.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Diet Cards */}
          <div className="space-y-4">
            {filteredPlans.map((plan) => {
              const isExpanded = expandedPlanId === plan.id;
              const isCurrent = activeDietPlan?.id === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl border transition-all shadow-xs overflow-hidden ${
                    isCurrent
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                          {plan.icon}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900">
                              {plan.title}
                            </h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Ativo no Perfil
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                plan.goal === 'hipertrofia'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-sky-100 text-sky-900'
                              }`}
                            >
                              {plan.goal === 'hipertrofia' ? 'Ganho de Massa' : 'Controle / Perda de Peso'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {plan.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Calorie & Macro Pills */}
                      <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 self-start lg:self-auto shrink-0">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                          <span className="text-base font-black font-mono text-slate-900">
                            {plan.totalCalories} <span className="text-[11px] font-normal text-slate-500">kcal</span>
                          </span>
                        </div>
                        <div className="h-7 w-px bg-slate-200" />
                        <div className="text-[11px] font-mono space-y-0.5">
                          <div className="text-emerald-700 font-bold">{plan.proteinG}g P</div>
                          <div className="text-amber-700 font-bold">{plan.carbsG}g C</div>
                        </div>
                        <div className="text-[11px] font-mono space-y-0.5">
                          <div className="text-rose-700 font-bold">{plan.fatG}g G</div>
                          <div className="text-teal-700 font-bold">{plan.fiberG}g Fibras</div>
                        </div>
                      </div>
                    </div>

                    {/* Macro Visual Distribution Bar */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
                        <span>Distribuição de Macronutrientes:</span>
                        <span className="font-mono text-xs">
                          P: {Math.round(((plan.proteinG * 4) / plan.totalCalories) * 100)}% · C:{' '}
                          {Math.round(((plan.carbsG * 4) / plan.totalCalories) * 100)}% · G:{' '}
                          {Math.round(((plan.fatG * 9) / plan.totalCalories) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden flex bg-slate-100">
                        <div
                          style={{ width: `${((plan.proteinG * 4) / plan.totalCalories) * 100}%` }}
                          className="bg-emerald-500"
                          title="Proteínas"
                        />
                        <div
                          style={{ width: `${((plan.carbsG * 4) / plan.totalCalories) * 100}%` }}
                          className="bg-amber-400"
                          title="Carboidratos"
                        />
                        <div
                          style={{ width: `${((plan.fatG * 9) / plan.totalCalories) * 100}%` }}
                          className="bg-rose-400"
                          title="Gorduras"
                        />
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {plan.tags.map((tg, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setGroceryModalPlan(plan)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Ver lista de compras semanal deste cardápio"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Lista de Compras</span>
                        </button>

                        <button
                          onClick={() => {
                            onApplyDietPlan(plan);
                            onToast(`Cardápio "${plan.title}" adotado como sua meta oficial!`);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isCurrent ? 'Cardápio Ativo' : 'Adotar como Meta'}
                        </button>

                        <button
                          onClick={() => setExpandedPlanId(isExpanded ? '' : plan.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                          title={isExpanded ? 'Recolher detalhes' : 'Ver refeições completas'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Meals Breakdown */}
                  {isExpanded && (
                    <div className="bg-slate-50/70 p-5 sm:p-6 border-t border-slate-100 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          Estrutura de Refeições do Cardápio ({plan.meals.length} Refeições)
                        </h4>

                        <button
                          onClick={() => {
                            onImportDietMealsToDiary(plan.meals);
                            onToast('Refeições do cardápio carregadas no seu diário de hoje!');
                          }}
                          className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          Preencher Diário de Hoje com este Cardápio
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.meals.map((meal) => (
                          <div
                            key={meal.id}
                            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                                  {meal.time}
                                </span>
                                <h5 className="text-xs font-bold text-slate-900">{meal.name}</h5>
                              </div>
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700">
                                ~{meal.targetCalories} kcal
                              </span>
                            </div>

                            <ul className="space-y-2 text-xs">
                              {meal.items.map((it) => (
                                <li key={it.id} className="space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-sm shrink-0">{it.icon || '🥗'}</span>
                                      <div>
                                        <span className="font-semibold text-slate-800">{it.name}</span>
                                        <span className="block text-[11px] text-slate-500 font-mono">
                                          {it.portion}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-slate-600 font-mono text-[11px] font-bold shrink-0">
                                      {it.calories} kcal
                                    </span>
                                  </div>

                                  {it.tip && (
                                    <p className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex items-start gap-1">
                                      <Info className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                      <span>{it.tip}</span>
                                    </p>
                                  )}

                                  {it.substitutions && it.substitutions.length > 0 && (
                                    <div className="text-[10px] text-slate-400 pl-4 border-l-2 border-emerald-300">
                                      <span className="font-semibold text-slate-600">Substituições: </span>
                                      {it.substitutions.join(' · ')}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: AVALIAÇÃO NUTRICIONAL COMPLETA (ANAMNESE & GERADOR OTIMIZADO)
         ========================================================================= */}
      {activeTab === 'assessment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Assessment Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Avaliação Nutricional Individualizada
                </h2>
                <p className="text-xs text-slate-400">
                  Cálculo científico pelas equações Mifflin-St Jeor e diretrizes da ISSN
                </p>
              </div>
            </div>

            <form onSubmit={handleCalculateAssessment} className="space-y-5">
              {/* Passo 1: Biometria */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  1. Dados Biométricos & Fisiológicos
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Idade</label>
                    <input
                      type="number"
                      min="15"
                      max="100"
                      value={formAge}
                      onChange={(e) => setFormAge(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sexo Biológico</label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Peso Atual (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="35"
                      max="250"
                      value={formWeight}
                      onChange={(e) => setFormWeight(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Meta de Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="35"
                      max="250"
                      value={formTargetWeight}
                      onChange={(e) => setFormTargetWeight(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      min="120"
                      max="230"
                      value={formHeight}
                      onChange={(e) => setFormHeight(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nível de Atividade Diária
                    </label>
                    <select
                      value={formActivity}
                      onChange={(e) => setFormActivity(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
                      <option value="leve">Leve (treinos 1-3 dias/semana)</option>
                      <option value="moderado">Moderado (treinos 3-5 dias/semana)</option>
                      <option value="intenso">Intenso (treinos intensos 6-7 dias)</option>
                      <option value="muito_ativo">Muito Ativo (atleta ou trabalho físico pesado)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Passo 2: Objetivo & Estilo */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  2. Objetivo Nutricional & Preferências Alimentares
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormGoal('emagrecimento')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formGoal === 'emagrecimento'
                        ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-sky-600 mb-1" />
                    <span className="text-xs block font-bold">Controle & Emagrecer</span>
                    <span className="text-[10px] text-slate-500 font-normal">Déficit calórico saudável (-450 kcal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormGoal('hipertrofia')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formGoal === 'hipertrofia'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="text-xs block font-bold">Ganho de Massa / Hipertrofia</span>
                    <span className="text-[10px] text-slate-500 font-normal">Superávit limpo (+380 kcal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormGoal('manutencao')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formGoal === 'manutencao'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-xs block font-bold">Manutenção & Longevidade</span>
                    <span className="text-[10px] text-slate-500 font-normal">Equilíbrio metabólico basal</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Padrão de Alimentação
                    </label>
                    <select
                      value={formStyle}
                      onChange={(e) => setFormStyle(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      <option value="equilibrada">Equilibrada Tradicional</option>
                      <option value="hiperproteica">Alta Proteína (Foco Muscular)</option>
                      <option value="low_carb">Low-Carb (Baixo Carboidrato)</option>
                      <option value="mediterranea">Mediterrânea (Gorduras Boas & Peixes)</option>
                      <option value="vegetariana">Vegetariana (Plant-Based & Ovos)</option>
                      <option value="pratica">Econômica & Rápida</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Refeições Desejadas por Dia
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormMealsCount(num)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            formMealsCount === num
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {num}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 3: Rotina, Tempo, Gostos */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
                  3. Rotina de Vida, Tempo & Gostos Pessoais
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Tempo Disponível para Cozinhar
                    </label>
                    <select
                      value={formCookingTime}
                      onChange={(e) => setFormCookingTime(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      <option value="rapido">Rápido / Marmitas Práticas (até 15 min)</option>
                      <option value="moderado">Moderado (cozinho diariamente ~30 min)</option>
                      <option value="elaborado">Gosto de receitas e preparos elaborados</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Orçamento Alimentar
                    </label>
                    <select
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      <option value="economico">Econômico (foco em ovos, frango, aveia, banana)</option>
                      <option value="moderado">Moderado / Custo-benefício padrão</option>
                      <option value="livre">Variado / Livre (inclui salmão, nozes, cogumelos)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Alimentos Favoritos que Você Não Quer Abrir Mão
                  </label>
                  <input
                    type="text"
                    value={formFavorites}
                    onChange={(e) => setFormFavorites(e.target.value)}
                    placeholder="Ex: ovos, café, aveia, banana, pasta de amendoim, chocolate 70%"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Alimentos que Você NÃO Gosta ou tem Intolerância
                  </label>
                  <input
                    type="text"
                    value={formDislikes}
                    onChange={(e) => setFormDislikes(e.target.value)}
                    placeholder="Ex: fígado, frutos do mar, leite de vaca, berinjela"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Calcular Diagnóstico & Gerar Cardápio Otimizado
                </button>
              </div>
            </form>
          </div>

          {/* Assessment Diagnostics & Generated Plan Preview */}
          <div className="lg:col-span-5 space-y-6">
            {savedAssessment ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">
                      Diagnóstico Bioenergético
                    </span>
                    <h3 className="text-base font-bold text-slate-900">Suas Necessidades Fisiológicas</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {savedAssessment.completedAt || 'Hoje'}
                  </span>
                </div>

                {/* Big numbers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">TMB (Basal)</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-bold font-mono text-slate-900">
                        {savedAssessment.calculatedTmb}
                      </span>
                      <span className="text-[10px] text-slate-500">kcal</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">GET (Gasto Total)</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-bold font-mono text-slate-900">
                        {savedAssessment.calculatedTdee}
                      </span>
                      <span className="text-[10px] text-slate-500">kcal</span>
                    </div>
                  </div>
                </div>

                {/* Target Highlight */}
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Meta Calórica Prescrita:</span>
                    <span className="font-mono font-black text-emerald-800 text-base">
                      {savedAssessment.recommendedCalories} kcal / dia
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    {savedAssessment.goal === 'hipertrofia'
                      ? 'Superávit anabólico limpo para hipertrofia sem ganho desnecessário de gordura.'
                      : 'Déficit calórico inteligente para oxidação de gorduras preservando a massa magra.'}
                  </p>
                </div>

                {/* Macros distribution */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Macronutrientes Otimizados:</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Proteína</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {savedAssessment.macros.proteinG}g
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Carboidrato</span>
                      <span className="font-bold text-amber-700 text-sm">
                        {savedAssessment.macros.carbsG}g
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Gordura</span>
                      <span className="font-bold text-rose-700 text-sm">
                        {savedAssessment.macros.fatG}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Generated Cardápio CTA */}
                {generatedAssessmentPlan && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Cardápio Otimizado Gerado:</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Pronto para Usar
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                      <span className="font-bold text-slate-800 block">{generatedAssessmentPlan.title}</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {generatedAssessmentPlan.subtitle}
                      </p>
                      <div className="text-[11px] font-mono font-bold text-emerald-700 pt-1">
                        {generatedAssessmentPlan.totalCalories} kcal · {generatedAssessmentPlan.meals.length} Refeições
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onApplyDietPlan(generatedAssessmentPlan);
                          setActiveTab('my_plan');
                          onToast('Cardápio personalizado adotado com sucesso!');
                        }}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Adotar Cardápio no Perfil
                      </button>

                      <button
                        onClick={() => setGroceryModalPlan(generatedAssessmentPlan)}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Ver lista de compras deste cardápio"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center space-y-3 flex flex-col items-center justify-center min-h-[360px]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                  📋
                </div>
                <h3 className="text-base font-bold text-slate-900">Preencha sua Avaliação</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Informe seus dados e preferências ao lado para calcular sua taxa metabólica exata e gerar um
                  cardápio 100% funcional sob medida.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MEU PLANO ATIVO & ACOMPANHAMENTO DIÁRIO
         ========================================================================= */}
      {activeTab === 'my_plan' && (
        <div className="space-y-6">
          {activeDietPlan ? (
            <div className="space-y-6">
              {/* Active Plan Header Box */}
              <div className="bg-white rounded-3xl border border-emerald-500/80 ring-2 ring-emerald-500/20 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shrink-0">
                      {activeDietPlan.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Plano Oficial Ativo
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {activeDietPlan.goal === 'hipertrofia' ? 'Ganho de Massa' : 'Controle de Peso'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{activeDietPlan.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{activeDietPlan.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setGroceryModalPlan(activeDietPlan)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Lista de Compras
                    </button>
                    <button
                      onClick={() => {
                        onImportDietMealsToDiary(activeDietPlan.meals);
                        onToast('Refeições de hoje preenchidas com o plano ativo!');
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Carregar no Diário de Hoje
                    </button>
                  </div>
                </div>

                {/* Macro Target vs Actual Today Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-100">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Calorias Hoje / Meta
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold font-mono text-slate-900">
                        {todayConsumedCalories}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {activeDietPlan.totalCalories} kcal
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (todayConsumedCalories / activeDietPlan.totalCalories) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Proteína Hoje / Meta
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold font-mono text-emerald-700">
                        {todayConsumedProtein}g
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {activeDietPlan.proteinG}g
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (todayConsumedProtein / activeDietPlan.proteinG) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Carboidratos Hoje / Meta
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold font-mono text-amber-700">
                        {todayConsumedCarbs}g
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {activeDietPlan.carbsG}g
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (todayConsumedCarbs / activeDietPlan.carbsG) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Gorduras Hoje / Meta
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold font-mono text-rose-700">
                        {todayConsumedFat}g
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {activeDietPlan.fatG}g
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-rose-400 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (todayConsumedFat / activeDietPlan.fatG) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Meals Checklist */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                  Grade de Refeições do seu Cardápio Ativo
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeDietPlan.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-mono font-bold text-slate-600">
                            {meal.time}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900">{meal.name}</h5>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-700">
                          {meal.targetCalories} kcal
                        </span>
                      </div>

                      <div className="space-y-2">
                        {meal.items.map((it) => (
                          <div
                            key={it.id}
                            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <span>{it.icon || '🥗'}</span>
                                {it.name}
                              </span>
                              <span className="font-mono text-slate-600 font-bold">{it.portion}</span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200/50">
                              <span>{it.calories} kcal</span>
                              <span>P: {it.protein}g · C: {it.carbs}g · G: {it.fat}g</span>
                            </div>

                            {it.substitutions && it.substitutions.length > 0 && (
                              <p className="text-[10px] text-slate-400">
                                <span className="font-semibold text-slate-600">Alternativa: </span>
                                {it.substitutions[0]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center text-2xl">
                🍽️
              </div>
              <h3 className="text-base font-bold text-slate-900">Nenhum Cardápio Adotado Ainda</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Vá até a aba "Opções de Cardápios Saudáveis" para escolher um plano pronto ou utilize a "Avaliação
                Nutricional" para gerar um cardápio funcional sob medida para você!
              </p>
              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Explorar Cardápios Prontos
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: LISTA DE COMPRAS SEMANAL INTERATIVA
         ========================================================================= */}
      {groceryModalPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                  Supermercado & Feira
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Lista de Compras: {groceryModalPlan.title}
                </h3>
              </div>
              <button
                onClick={() => setGroceryModalPlan(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <p className="text-slate-500 text-[11px]">
                Marque os itens que você já tem em casa ou no carrinho para organizar sua semana:
              </p>

              {groceryModalPlan.groceryList.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {group.category}
                  </h4>
                  <div className="space-y-1.5 pl-3">
                    {group.items.map((item, iIdx) => {
                      const key = `${groceryModalPlan.id}_${gIdx}_${iIdx}`;
                      const isChecked = !!checkedGroceryItems[key];

                      return (
                        <label
                          key={iIdx}
                          className={`flex items-center gap-2.5 p-2 rounded-xl transition-colors cursor-pointer ${
                            isChecked ? 'bg-slate-100 text-slate-400 line-through' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleGroceryItem(key)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => copyGroceryListToClipboard(groceryModalPlan)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar Lista
              </button>

              <button
                onClick={() => setGroceryModalPlan(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
