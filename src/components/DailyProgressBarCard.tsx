import React from 'react';
import { UserProfile, MealCategory } from '../types';
import {
  Flame,
  Target,
  Sparkles,
  Droplet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  Camera,
  Utensils,
  Zap,
} from 'lucide-react';

interface DailyProgressBarCardProps {
  user: UserProfile;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterConsumedMl: number;
  onOpenScanner?: () => void;
  onOpenMealModal?: (category: MealCategory) => void;
  onAddWaterQuick?: (amountMl: number) => void;
}

export const DailyProgressBarCard: React.FC<DailyProgressBarCardProps> = ({
  user,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  waterConsumedMl,
  onOpenScanner,
  onOpenMealModal,
  onAddWaterQuick,
}) => {
  // Target values
  const targetKcal = user.targetCalories || 2000;
  const targetProtein = user.targetProteinG || 140;
  const targetCarbs = user.targetCarbsG || 210;
  const targetFat = user.targetFatG || 60;
  const targetWater = user.targetWaterMl || 2500;

  // Remaining calculations
  const remainingKcal = targetKcal - totalCalories;
  const remainingProtein = Math.max(0, Number((targetProtein - totalProtein).toFixed(1)));
  const remainingCarbs = Math.max(0, Number((targetCarbs - totalCarbs).toFixed(1)));
  const remainingFat = Math.max(0, Number((targetFat - totalFat).toFixed(1)));
  const remainingWater = Math.max(0, targetWater - waterConsumedMl);

  // Percent calculations
  const kcalPercent = Math.min(150, Math.round((totalCalories / targetKcal) * 100));
  const proteinPercent = Math.min(150, Math.round((totalProtein / targetProtein) * 100));
  const carbsPercent = Math.min(150, Math.round((totalCarbs / targetCarbs) * 100));
  const fatPercent = Math.min(150, Math.round((totalFat / targetFat) * 100));
  const waterPercent = Math.min(150, Math.round((waterConsumedMl / targetWater) * 100));

  // Average completion of core goals (capped at 100% each for overall score)
  const avgCompletion = Math.round(
    (Math.min(100, kcalPercent) +
      Math.min(100, proteinPercent) +
      Math.min(100, carbsPercent) +
      Math.min(100, fatPercent) +
      Math.min(100, waterPercent)) /
      5
  );

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header with Title and Overall Completion Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <Target className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
              Progresso Diário & Quanto Falta
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              Metas do Dia
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Veja exatamente quanto você já consumiu e quanto resta para atingir suas metas de hoje.
          </p>
        </div>

        {/* Global Progress Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-2xl shrink-0">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Circular progress background */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${Math.min(100, avgCompletion)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-mono font-extrabold text-slate-800">
              {avgCompletion}%
            </span>
          </div>
          <div className="leading-tight">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Conclusão Geral
            </span>
            <span className="text-xs font-bold text-slate-800">
              {avgCompletion >= 90 ? '🏆 Quase Perfeito!' : avgCompletion >= 50 ? '⚡ No Caminho!' : '🌱 Começando o Dia'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. CALORIES PROGRESS BAR (HIGHLIGHTED) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-inner border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Flame className="w-4 h-4 text-emerald-400" />
            </span>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Meta de Calorias Diárias
              </span>
              <span className="text-[11px] text-slate-400">
                Consumido: <b className="text-emerald-300 font-mono">{totalCalories}</b> de <b className="text-white font-mono">{targetKcal} kcal</b>
              </span>
            </div>
          </div>

          {/* Quanto Falta Highlight Badge */}
          <div className="self-start sm:self-auto">
            {remainingKcal > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold rounded-xl shadow-xs">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Faltam {remainingKcal} kcal para completar a meta!
              </span>
            ) : remainingKcal === 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/30 border border-emerald-400 text-emerald-200 text-xs font-bold rounded-xl shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Meta de calorias atingida com 100% de precisão! 🎉
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold rounded-xl shadow-xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Excedeu a meta em +{Math.abs(remainingKcal)} kcal
              </span>
            )}
          </div>
        </div>

        {/* Visual Multi-layer Progress Bar */}
        <div className="space-y-1.5">
          <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                kcalPercent > 105
                  ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600'
                  : 'bg-gradient-to-r from-teal-400 via-emerald-400 to-emerald-500 shadow-md shadow-emerald-500/30'
              }`}
              style={{ width: `${Math.min(100, kcalPercent)}%` }}
            ></div>
          </div>

          {/* Tick labels */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
            <span>0 kcal (0%)</span>
            <span>{Math.round(targetKcal * 0.5)} kcal (50%)</span>
            <span className="font-bold text-emerald-400">{targetKcal} kcal (Meta 100%)</span>
            {kcalPercent > 100 && (
              <span className="font-bold text-rose-400">Atual: {totalCalories} kcal ({kcalPercent}%)</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. MACROS & WATER GRID (VISUAL PROGRESS BARS WITH "QUANTO FALTA") */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Macronutrientes & Hidratação Diária
          </span>
          <span className="text-[11px] text-slate-400">
            Valores restantes para o equilíbrio nutricional perfeito
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* PROTEÍNAS */}
          <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Proteínas
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {proteinPercent}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xl font-extrabold font-mono text-emerald-950">
                  {totalProtein}g
                </span>
                <span className="text-xs font-mono text-emerald-700/70">
                  Meta: {targetProtein}g
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, proteinPercent)}%` }}
                ></div>
              </div>

              {/* Quanto Falta Badge */}
              <div className="pt-1 border-t border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-800 font-medium">Restante:</span>
                {remainingProtein > 0 ? (
                  <span className="font-bold font-mono text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md text-[11px]">
                    Faltam {remainingProtein}g
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Meta batida!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CARBOIDRATOS */}
          <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 flex flex-col justify-between space-y-3 hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Carboidratos
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {carbsPercent}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xl font-extrabold font-mono text-amber-950">
                  {totalCarbs}g
                </span>
                <span className="text-xs font-mono text-amber-700/70">
                  Meta: {targetCarbs}g
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-amber-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, carbsPercent)}%` }}
                ></div>
              </div>

              {/* Quanto Falta Badge */}
              <div className="pt-1 border-t border-amber-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-amber-800 font-medium">Restante:</span>
                {remainingCarbs > 0 ? (
                  <span className="font-bold font-mono text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md text-[11px]">
                    Faltam {remainingCarbs}g
                  </span>
                ) : (
                  <span className="font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Meta batida!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* GORDURAS */}
          <div className="p-4 rounded-2xl border border-rose-200/80 bg-rose-50/30 flex flex-col justify-between space-y-3 hover:border-rose-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Gorduras
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {fatPercent}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xl font-extrabold font-mono text-rose-950">
                  {totalFat}g
                </span>
                <span className="text-xs font-mono text-rose-700/70">
                  Meta: {targetFat}g
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, fatPercent)}%` }}
                ></div>
              </div>

              {/* Quanto Falta Badge */}
              <div className="pt-1 border-t border-rose-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-rose-800 font-medium">Restante:</span>
                {remainingFat > 0 ? (
                  <span className="font-bold font-mono text-rose-900 bg-rose-200/60 px-2 py-0.5 rounded-md text-[11px]">
                    Faltam {remainingFat}g
                  </span>
                ) : (
                  <span className="font-bold text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Meta batida!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ÁGUA / HIDRATAÇÃO */}
          <div className="p-4 rounded-2xl border border-sky-200/80 bg-sky-50/40 flex flex-col justify-between space-y-3 hover:border-sky-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                Água de Hoje
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                {waterPercent}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xl font-extrabold font-mono text-sky-950">
                  {waterConsumedMl} <span className="text-xs text-sky-600 font-sans">ml</span>
                </span>
                <span className="text-xs font-mono text-sky-700/70">
                  Meta: {targetWater}ml
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-sky-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, waterPercent)}%` }}
                ></div>
              </div>

              {/* Quanto Falta Badge & Quick Add */}
              <div className="pt-1 border-t border-sky-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-sky-800 font-medium">Restante:</span>
                {remainingWater > 0 ? (
                  <span className="font-bold font-mono text-sky-900 bg-sky-200/60 px-2 py-0.5 rounded-md text-[11px]">
                    Faltam {remainingWater}ml
                  </span>
                ) : (
                  <span className="font-bold text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Hidratado! 💧
                  </span>
                )}
              </div>
            </div>

            {/* Quick Water buttons */}
            {onAddWaterQuick && (
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => onAddWaterQuick(250)}
                  className="flex-1 py-1 bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer text-center"
                  title="Beber copo de 250ml"
                >
                  +250ml
                </button>
                <button
                  type="button"
                  onClick={() => onAddWaterQuick(500)}
                  className="flex-1 py-1 bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer text-center"
                  title="Beber garrafa de 500ml"
                >
                  +500ml
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Action Callout & Helpful Nutrition Suggestion */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          <p className="text-slate-600 leading-tight">
            {remainingProtein > 30 ? (
              <>
                <strong className="text-slate-800">Dica Nutricional:</strong> Você ainda precisa de{' '}
                <span className="text-emerald-700 font-bold">{remainingProtein}g de proteína</span>. Adicione ovos, frango grelhado ou iogurte natural na próxima refeição!
              </>
            ) : remainingWater > 500 ? (
              <>
                <strong className="text-slate-800">Lembrete de Água:</strong> Beba mais{' '}
                <span className="text-sky-700 font-bold">{remainingWater}ml</span> para manter seu metabolismo acelerado e queima de gordura ideal.
              </>
            ) : remainingKcal > 0 ? (
              <>
                <strong className="text-slate-800">Balanço Ideal:</strong> Restam{' '}
                <span className="text-emerald-700 font-bold">{remainingKcal} kcal</span> para você fechar a meta do dia com excelência!
              </>
            ) : (
              <>
                <strong className="text-emerald-800 font-bold">Parabéns!</strong> Você atingiu suas principais metas do dia! Excelente disciplina física.
              </>
            )}
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              type="button"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Escanear Prato (IA)</span>
            </button>
          )}
          {onOpenMealModal && (
            <button
              onClick={() => onOpenMealModal('almoco')}
              type="button"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>Adicionar Alimento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
