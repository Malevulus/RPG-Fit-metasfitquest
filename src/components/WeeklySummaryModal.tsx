import React from 'react';
import {
  Sparkles,
  Coins,
  CheckCircle2,
  Calendar,
  TrendingUp,
  X,
  Award,
  Zap,
  Target,
  Flame,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import confetti from 'canvas-confetti';

export interface WeeklyDayStat {
  day: string; // 'Seg', 'Ter', 'Qua', etc.
  date: string;
  coinsEarned: number;
  goalsCompleted: number; // e.g. 1 to 4
  calorieMet: boolean;
  waterMet: boolean;
  stepsMet: boolean;
  workoutMet: boolean;
}

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  streakDays: number;
  totalCaloriesBurnedOrSaved?: number;
  onClaimWeeklyBonus?: (bonusCoins: number) => void;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  streakDays,
  onClaimWeeklyBonus,
}) => {
  if (!isOpen) return null;

  // Realist weekly data representing the past 7 days (Segunda a Domingo)
  const weeklyData: WeeklyDayStat[] = [
    { day: 'Seg', date: 'Segunda', coinsEarned: 85, goalsCompleted: 3, calorieMet: true, waterMet: true, stepsMet: true, workoutMet: false },
    { day: 'Ter', date: 'Terça', coinsEarned: 110, goalsCompleted: 4, calorieMet: true, waterMet: true, stepsMet: true, workoutMet: true },
    { day: 'Qua', date: 'Quarta', coinsEarned: 95, goalsCompleted: 3, calorieMet: true, waterMet: true, stepsMet: false, workoutMet: true },
    { day: 'Qui', date: 'Quinta', coinsEarned: 120, goalsCompleted: 4, calorieMet: true, waterMet: true, stepsMet: true, workoutMet: true },
    { day: 'Sex', date: 'Sexta', coinsEarned: 90, goalsCompleted: 3, calorieMet: false, waterMet: true, stepsMet: true, workoutMet: true },
    { day: 'Sáb', date: 'Sábado', coinsEarned: 135, goalsCompleted: 4, calorieMet: true, waterMet: true, stepsMet: true, workoutMet: true },
    { day: 'Dom', date: 'Domingo', coinsEarned: 105, goalsCompleted: 3, calorieMet: true, waterMet: true, stepsMet: true, workoutMet: false },
  ];

  const totalWeeklyCoins = weeklyData.reduce((acc, d) => acc + d.coinsEarned, 0);
  const totalGoalsAchieved = weeklyData.reduce((acc, d) => acc + d.goalsCompleted, 0);
  const days100Percent = weeklyData.filter((d) => d.goalsCompleted >= 4).length;
  const weeklyBonus = 150;

  const handleClaim = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    if (onClaimWeeklyBonus) {
      onClaimWeeklyBonus(weeklyBonus);
    }
    onClose();
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as WeeklyDayStat;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 font-sans">
          <div className="font-bold text-emerald-400 flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
            <span>{data.date}</span>
            <span className="font-mono text-amber-300">+{data.coinsEarned} HC</span>
          </div>
          <div className="text-[11px] text-slate-300">
            Metas alcançadas: <strong className="text-white font-mono">{data.goalsCompleted}/4</strong>
          </div>
          <div className="flex gap-1.5 pt-0.5 text-[10px]">
            <span className={`px-1.5 py-0.5 rounded ${data.calorieMet ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>Dieta</span>
            <span className={`px-1.5 py-0.5 rounded ${data.waterMet ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-500'}`}>Água</span>
            <span className={`px-1.5 py-0.5 rounded ${data.stepsMet ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>Passos</span>
            <span className={`px-1.5 py-0.5 rounded ${data.workoutMet ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>Treino</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Calendar className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                  Resumo da Segunda-Feira
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  Semanal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Seu progresso da última semana e ganho de HealthCoins
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key KPI Stats */}
        <div className="grid grid-cols-3 gap-2.5 my-4 relative z-10">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-semibold mb-0.5">
              <Coins className="w-3.5 h-3.5" />
              <span>Ganho Total</span>
            </div>
            <div className="text-xl font-mono font-extrabold text-amber-300">
              +{totalWeeklyCoins}
            </div>
            <div className="text-[10px] text-slate-400">HealthCoins</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-semibold mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Metas Batidas</span>
            </div>
            <div className="text-xl font-mono font-extrabold text-emerald-300">
              {totalGoalsAchieved}/28
            </div>
            <div className="text-[10px] text-slate-400">86% de sucesso</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-orange-400 font-semibold mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
              <span>Sequência</span>
            </div>
            <div className="text-xl font-mono font-extrabold text-orange-300">
              {streakDays} dias
            </div>
            <div className="text-[10px] text-slate-400">Sem quebra 🔥</div>
          </div>
        </div>

        {/* Interactive Recharts Bar Chart: HealthCoins per Day */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Evolução Diária de HealthCoins
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">
              Média: ~{Math.round(totalWeeklyCoins / 7)} HC/dia
            </span>
          </div>

          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#475569' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#475569' }}
                  unit=" HC"
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="coinsEarned" radius={[6, 6, 0, 0]} name="HealthCoins">
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.goalsCompleted === 4 ? '#10b981' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend helper */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>4/4 Metas batidas (Dia Perfeito)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>3/4 Metas batidas</span>
            </div>
          </div>
        </div>

        {/* Motivational Card */}
        <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-800/70 border border-emerald-500/30 flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300">
            <strong className="text-emerald-300 block">Excelente largada para a semana!</strong>
            Você completou {days100Percent} dias perfeitos na semana passada. Mantenha o foco nesta segunda-feira.
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Fechar
          </button>

          <button
            onClick={handleClaim}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Resgatar Bônus Semanal (+{weeklyBonus} HC)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
