import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import {
  Footprints,
  Flame,
  TrendingUp,
  Play,
  Pause,
  Plus,
  Target,
  Sparkles,
  Zap,
  CheckCircle2,
  Utensils,
  Award,
  Timer,
  Navigation,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StepTrackerCardProps {
  user: UserProfile;
  stepsToday: number;
  stepGoal: number;
  totalCaloriesConsumed: number;
  onUpdateSteps: (newSteps: number) => void;
  onUpdateGoal?: (newGoal: number) => void;
  onRewardCoins?: (coins: number, reason: string) => void;
  className?: string;
}

export const StepTrackerCard: React.FC<StepTrackerCardProps> = ({
  user,
  stepsToday,
  stepGoal = 10000,
  totalCaloriesConsumed,
  onUpdateSteps,
  onUpdateGoal,
  onRewardCoins,
  className = '',
}) => {
  const [isLiveWalking, setIsLiveWalking] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customStepInput, setCustomStepInput] = useState('');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(stepGoal);
  const [liveWalkCadence, setLiveWalkCadence] = useState<'normal' | 'brisk'>('normal');

  // Stride calculation: average human stride ~ 0.415 * height
  const heightCm = user.height || 175;
  const weightKg = user.weight || 72;
  const strideMeters = (heightCm * 0.415) / 100; // in meters
  const distanceKm = Number(((stepsToday * strideMeters) / 1000).toFixed(2));

  // Calories burned via steps: based on weight & distance / step factor (~0.04-0.05 kcal/step)
  // Standard MET formula: Walking ~ 3.5 METs => ~ 0.00055 kcal per kg per step
  const caloriesBurnedFromSteps = Math.round(stepsToday * (weightKg * 0.00055));

  // Active duration estimate: ~105-115 steps/minute
  const activeMinutes = Math.round(stepsToday / 110);

  // Relationship with consumed calories
  const percentOfConsumedBurned = totalCaloriesConsumed > 0
    ? Math.min(150, Math.round((caloriesBurnedFromSteps / totalCaloriesConsumed) * 100))
    : 0;

  // Percentage of step goal
  const stepPercent = Math.min(150, Math.round((stepsToday / stepGoal) * 100));

  // Food equivalence calculation
  const getFoodEquivalence = (kcal: number) => {
    if (kcal < 60) return { label: 'Uma maçã fresca', icon: '🍎', kcal: 60 };
    if (kcal < 120) return { label: 'Um iogurte proteico ou banana', icon: '🍌', kcal: 110 };
    if (kcal < 200) return { label: 'Dois ovos mexidos', icon: '🍳', kcal: 160 };
    if (kcal < 300) return { label: 'Filé de frango grelhado (150g)', icon: '🍗', kcal: 250 };
    if (kcal < 450) return { label: 'Prato de almoço leve (Arroz + Salada + Frango)', icon: '🥗', kcal: 420 };
    return { label: 'Refeição completa balanceada', icon: '🍱', kcal: 520 };
  };

  const foodEquiv = getFoodEquivalence(caloriesBurnedFromSteps);

  // Live walking timer simulator
  useEffect(() => {
    let interval: any = null;
    if (isLiveWalking) {
      const stepIncrement = liveWalkCadence === 'brisk' ? 3 : 2;
      interval = setInterval(() => {
        onUpdateSteps(stepsToday + stepIncrement);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveWalking, stepsToday, liveWalkCadence, onUpdateSteps]);

  // Milestone reward detection
  const previousMilestonesRef = useRef<{ m5k: boolean; m10k: boolean }>({
    m5k: stepsToday >= 5000,
    m10k: stepsToday >= 10000,
  });

  useEffect(() => {
    if (!previousMilestonesRef.current.m5k && stepsToday >= 5000) {
      previousMilestonesRef.current.m5k = true;
      if (onRewardCoins) onRewardCoins(15, 'Meta de 5.000 Passos alcançada!');
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
    if (!previousMilestonesRef.current.m10k && stepsToday >= 10000) {
      previousMilestonesRef.current.m10k = true;
      if (onRewardCoins) onRewardCoins(35, 'Meta de 10.000 Passos alcançada! 🏆');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  }, [stepsToday, onRewardCoins]);

  const handleAddSteps = (amount: number) => {
    const next = stepsToday + amount;
    onUpdateSteps(next);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customStepInput, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateSteps(val);
      setCustomModalOpen(false);
      setCustomStepInput('');
    }
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateGoal) {
      onUpdateGoal(selectedGoal);
    }
    setGoalModalOpen(false);
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden ${className}`}>
      {/* Background visual aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Title and Settings */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white">
                Marcador de Passos & Queima Calórica
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Pedômetro Ativo
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Monitore passos diários e veja como eles compensam suas calorias consumidas.
            </p>
          </div>
        </div>

        {/* Live Simulator & Goal Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsLiveWalking((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isLiveWalking
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="Simular ou iniciar monitoramento de passos ao vivo"
          >
            {isLiveWalking ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Caminhando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Modo Caminhada</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setGoalModalOpen(true)}
            className="p-1.5 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl border border-white/10 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Ajustar meta diária de passos"
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold">{stepGoal}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Step Progress Ring vs Calorie Relationship */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 items-center">
        {/* Left: Step Gauge and Core Stats (col-span-5) */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4 sm:gap-6">
          {/* Radial Step Ring */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-700 ease-out"
                strokeDasharray={`${Math.min(100, stepPercent)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <Footprints className={`w-4 h-4 text-emerald-400 mb-0.5 ${isLiveWalking ? 'animate-bounce' : ''}`} />
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-tight">
                {stepsToday.toLocaleString('pt-BR')}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                de {stepGoal.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Queima Ativa
                </span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {caloriesBurnedFromSteps} kcal
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, stepPercent)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/5 rounded-xl p-1.5 border border-white/5">
                <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-sky-400" /> Distância
                </span>
                <span className="font-mono font-bold text-white text-xs">{distanceKm} km</span>
              </div>
              <div className="bg-white/5 rounded-xl p-1.5 border border-white/5">
                <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                  <Timer className="w-3 h-3 text-teal-400" /> Tempo Ativo
                </span>
                <span className="font-mono font-bold text-white text-xs">{activeMinutes} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: CALORIE RELATIONSHIP & ENERGY BALANCE EQUATION (col-span-7) */}
        <div className="lg:col-span-7 bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Relação Passos vs. Calorias Consumidas
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-300">
              Ingeridas hoje: <strong className="text-white">{totalCaloriesConsumed} kcal</strong>
            </span>
          </div>

          {/* Direct Comparative Energy Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300">
                Compensação pelas passadas:
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {percentOfConsumedBurned}% neutralizado
              </span>
            </div>

            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(100, percentOfConsumedBurned)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0 kcal</span>
              <span>Queima: {caloriesBurnedFromSteps} kcal</span>
              <span>Consumido: {totalCaloriesConsumed} kcal</span>
            </div>
          </div>

          {/* Visual Food Equivalence Callout */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs">
            <span className="text-2xl p-1 bg-white/10 rounded-xl shrink-0">
              {foodEquiv.icon}
            </span>
            <div className="leading-tight">
              <span className="text-[11px] font-bold text-emerald-300 block">
                Equivalência Nutricional Queimada:
              </span>
              <span className="text-xs text-slate-200">
                Seus passos de hoje já queimaram o equivalente calórico a <strong>{foodEquiv.label}</strong> (~{caloriesBurnedFromSteps} kcal)!
              </span>
            </div>
          </div>

          {/* Interactive Step Adder Buttons */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">
              Adicionar Passos:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddSteps(250)}
                className="px-2.5 py-1 bg-white/10 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95"
              >
                +250
              </button>
              <button
                type="button"
                onClick={() => handleAddSteps(500)}
                className="px-2.5 py-1 bg-white/10 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95"
              >
                +500
              </button>
              <button
                type="button"
                onClick={() => handleAddSteps(1000)}
                className="px-2.5 py-1 bg-white/10 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95"
              >
                +1.000
              </button>
              <button
                type="button"
                onClick={() => handleAddSteps(2500)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95"
              >
                +2.500 (+{Math.round(2500 * (weightKg * 0.00055))} kcal)
              </button>
              <button
                type="button"
                onClick={() => setCustomModalOpen(true)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
              >
                Personalizar...
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Steps Input Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Definir Passos de Hoje</h4>
              </div>
              <button
                onClick={() => setCustomModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Quantidade total de passos dados hoje:
                </label>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={customStepInput}
                  onChange={(e) => setCustomStepInput(e.target.value)}
                  placeholder={`Ex: ${stepsToday}`}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Salvar Passos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step Goal Adjustment Modal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Meta Diária de Passos</h4>
              </div>
              <button
                onClick={() => setGoalModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Escolha seu alvo diário de saúde cardiovascular:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[6000, 8000, 10000, 12000, 15000].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGoal(g)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedGoal === g
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {g.toLocaleString('pt-BR')} passos
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Confirmar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
