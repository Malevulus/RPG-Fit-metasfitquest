import React, { useState } from 'react';
import { UserProfile, WaterLog, HealthDayRecord } from '../types';
import { calculateBMI, calculateWaterTarget } from '../utils/calculations';
import {
  Droplets,
  Heart,
  Scale,
  Plus,
  Minus,
  RotateCcw,
  Bell,
  Clock,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Flame,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface HealthModuleProps {
  user: UserProfile;
  waterConsumedMl: number;
  waterLogs: WaterLog[];
  healthHistory: HealthDayRecord[];
  onAddWater: (amountMl: number) => void;
  onResetWater: () => void;
  onUpdateUserMetrics: (weight: number, height: number) => void;
  onUpdateWeightHistory?: (newWeight: number) => void;
}

export const HealthModule: React.FC<HealthModuleProps> = ({
  user,
  waterConsumedMl,
  waterLogs,
  healthHistory,
  onAddWater,
  onResetWater,
  onUpdateUserMetrics,
  onUpdateWeightHistory,
}) => {
  // Local state for interactive IMC simulator
  const [simWeight, setSimWeight] = useState(user.weight);
  const [simHeight, setSimHeight] = useState(user.height);
  const [customWaterInput, setCustomWaterInput] = useState('');
  const [reminderActive, setReminderActive] = useState(true);

  // Chart period state: '30days' | '7days' (30 days default per user request)
  const [chartPeriod, setChartPeriod] = useState<'30days' | '7days'>('30days');
  // Chart view filter state: 'weight_calories' (Evolução Peso & Ingestão Calórica) | 'weight' | 'calories' | 'water' | 'all'
  const [chartMetric, setChartMetric] = useState<'weight_calories' | 'weight' | 'calories' | 'water' | 'all'>('weight_calories');
  const [todayWeightInput, setTodayWeightInput] = useState('');

  const bmiData = calculateBMI(simWeight, simHeight);
  const targetWater = user.targetWaterMl || 2000;
  const waterPercent = Math.min(100, Math.round((waterConsumedMl / targetWater) * 100));

  // Determine ideal weight difference
  const weightDiff = Number((simWeight - bmiData.maxIdealWeight).toFixed(1));

  // Quick portion options
  const WATER_PORTIONS = [
    { label: 'Copo Pequeno', amount: 150, icon: '☕' },
    { label: 'Copo Padrão', amount: 250, icon: '🥛' },
    { label: 'Garrafinha', amount: 500, icon: '🍶' },
    { label: 'Squeeze Térmico', amount: 750, icon: '🧃' },
  ];

  const handleApplySimulatedMetrics = () => {
    onUpdateUserMetrics(simWeight, simHeight);
  };

  const handleCustomWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customWaterInput, 10);
    if (val && val > 0) {
      onAddWater(val);
      setCustomWaterInput('');
    }
  };

  const handleLogTodayWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(todayWeightInput);
    if (val && val > 0) {
      if (onUpdateWeightHistory) {
        onUpdateWeightHistory(val);
      }
      onUpdateUserMetrics(val, user.height);
      setSimWeight(val);
      setTodayWeightInput('');
    }
  };

  // Sliced data based on selected period (30 days vs 7 days)
  const displayedHistory = chartPeriod === '7days' ? healthHistory.slice(-7) : healthHistory.slice(-30);

  // Recharts 30-day / 7-day stats calculations
  const nonZeroWeights = displayedHistory.map((d) => d.weight).filter((w) => w > 0);
  const startWeight = nonZeroWeights[0] || user.weight;
  const currentWeight = nonZeroWeights[nonZeroWeights.length - 1] || user.weight;
  const weightDeltaPeriod = Number((currentWeight - startWeight).toFixed(1));

  // Water calculations for period
  const waterValues = displayedHistory.map((d) => d.waterMl).filter((w) => w > 0);
  const avgWaterPeriod =
    waterValues.length > 0 ? Math.round(waterValues.reduce((a, b) => a + b, 0) / waterValues.length) : 0;
  const waterGoalHitCount = displayedHistory.filter((d) => d.waterMl >= targetWater).length;
  const waterSuccessRate = displayedHistory.length > 0 ? Math.round((waterGoalHitCount / displayedHistory.length) * 100) : 0;

  const consumedCaloriesList = displayedHistory.map((d) => d.caloriesConsumed).filter((c) => c > 0);
  const avgCaloriesPeriod =
    consumedCaloriesList.length > 0
      ? Math.round(
          consumedCaloriesList.reduce((acc, curr) => acc + curr, 0) / consumedCaloriesList.length
        )
      : 0;

  // Custom Recharts Tooltip with Weight, Caloric Intake and Water
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      const pointWater = dataPoint?.waterMl || 0;
      const pointWaterPct = targetWater > 0 ? Math.round((pointWater / targetWater) * 100) : 0;
      const pointCal = dataPoint?.caloriesConsumed || 0;
      const pointTargetCal = dataPoint?.calorieTarget || user.targetCalories || 2100;
      const calDiff = pointCal - pointTargetCal;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs space-y-2 font-sans min-w-[210px]">
          <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-3">
            <span className="font-bold text-slate-200">{label}</span>
            <span className="text-[10px] font-mono text-slate-400">{dataPoint?.date}</span>
          </div>

          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const isWeight = entry.dataKey === 'weight';
              const isWater = entry.dataKey === 'waterMl';
              const isCalories = entry.dataKey === 'caloriesConsumed';
              const unit = isWeight ? 'kg' : isWater ? 'ml' : 'kcal';

              return (
                <div key={index} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="font-medium">{entry.name}:</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {entry.value} {unit}
                  </span>
                </div>
              );
            })}
          </div>

          {pointCal > 0 && (
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-amber-300">Meta Calórica ({pointTargetCal} kcal):</span>
              <span className={`font-mono font-bold ${calDiff <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {calDiff > 0 ? `+${calDiff}` : calDiff} kcal
              </span>
            </div>
          )}

          {pointWater > 0 && (
            <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-sky-400">
              <span>Meta de Água:</span>
              <span className="font-mono font-bold">{pointWaterPct}% atingida</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
          <Heart className="w-6 h-6 text-rose-500" />
          Módulo de Saúde & Bem-Estar
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Acompanhe seu Índice de Massa Corporal (IMC) com precisão, controle sua hidratação e monitore sua evolução de peso e calorias.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- CALCULADORA DE IMC --- */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Calculadora & Classificação de IMC
                  </h2>
                  <p className="text-xs text-slate-400">
                    Índice de Massa Corporal (OMS)
                  </p>
                </div>
              </div>

              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: bmiData.bgLight, color: bmiData.color }}
              >
                {bmiData.category}
              </span>
            </div>

            {/* Current Big Score */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Seu IMC Atual
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-display font-extrabold font-mono text-slate-900">
                    {bmiData.bmi}
                  </span>
                  <span className="text-xs text-slate-500">kg/m²</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Faixa de Peso Ideal
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {bmiData.minIdealWeight} kg — {bmiData.maxIdealWeight} kg
                </span>
              </div>
            </div>

            {/* Visual Spectrum Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1.5 font-mono">
                <span>&lt; 18.5 Magreza</span>
                <span>18.5 - 24.9 Normal</span>
                <span>25 - 29.9 Sobrepeso</span>
                <span>30+ Obesidade</span>
              </div>
              <div className="relative h-4 rounded-full overflow-hidden flex bg-slate-100 p-0.5">
                <div className="h-full w-[25%] bg-blue-400 rounded-l-full" title="Abaixo do peso"></div>
                <div className="h-full w-[35%] bg-emerald-500" title="Peso normal"></div>
                <div className="h-full w-[20%] bg-amber-400" title="Sobrepeso"></div>
                <div className="h-full w-[20%] bg-rose-500 rounded-r-full" title="Obesidade"></div>
              </div>

              {/* Dynamic Indicator Pin */}
              <div className="relative mt-2">
                <div
                  className="absolute -top-3 transition-all duration-300 transform -translate-x-1/2 flex flex-col items-center"
                  style={{
                    left: `${Math.max(5, Math.min(95, ((bmiData.bmi - 15) / 25) * 100))}%`,
                  }}
                >
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-slate-900"></div>
                  <span className="text-[10px] font-bold font-mono bg-slate-900 text-white px-1.5 py-0.5 rounded shadow">
                    {bmiData.bmi}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulator Sliders */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">
                Simular Variações de Medidas:
              </span>

              {/* Weight Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Peso:</span>
                  <span className="font-mono font-bold text-slate-900">{simWeight} kg</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="150"
                  step="0.5"
                  value={simWeight}
                  onChange={(e) => setSimWeight(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Height Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Altura:</span>
                  <span className="font-mono font-bold text-slate-900">{simHeight} cm</span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="220"
                  step="1"
                  value={simHeight}
                  onChange={(e) => setSimHeight(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {(simWeight !== user.weight || simHeight !== user.height) && (
                <button
                  onClick={handleApplySimulatedMetrics}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Salvar novas medidas no meu perfil
                </button>
              )}
            </div>

            {/* Health Feedback Box */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <Info className="w-4 h-4 text-emerald-600" />
                Diagnóstico e Recomendações
              </div>
              <p className="text-slate-600">{bmiData.advice}</p>
              {weightDiff > 0 ? (
                <p className="mt-1.5 text-amber-800 font-medium">
                  • Variação estimada para a faixa ideal máxima: cerca de {weightDiff} kg a menos.
                </p>
              ) : weightDiff < -10 ? (
                <p className="mt-1.5 text-blue-800 font-medium">
                  • Você está abaixo da faixa recomendada. Converse com um profissional para ajuste calórico.
                </p>
              ) : (
                <p className="mt-1.5 text-emerald-800 font-medium">
                  • Parabéns! Sua estrutura corporal está em uma faixa de peso favorável para longevidade e disposição.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- CONTROLE DE ÁGUA INTELIGENTE --- */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Droplets className="w-5 h-5 fill-sky-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Controle Inteligente de Água
                  </h2>
                  <p className="text-xs text-slate-400">
                    Meta: 35ml × {user.weight}kg + bônus de atividade
                  </p>
                </div>
              </div>

              <button
                onClick={onResetWater}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reiniciar contador de água do dia"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Animated Bottle / Liquid Tank Visual */}
            <div className="bg-gradient-to-b from-sky-50 to-blue-50/50 rounded-2xl p-5 mb-5 border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Liquid Graphic */}
              <div className="relative w-28 h-40 bg-white/80 border-2 border-sky-300 rounded-3xl overflow-hidden shadow-inner flex flex-col justify-end">
                {/* Liquid Level */}
                <div
                  className="w-full bg-gradient-to-t from-sky-500 to-sky-400 transition-all duration-700 relative"
                  style={{ height: `${waterPercent}%` }}
                >
                  {/* Subtle wave highlight */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-sky-300/60 blur-[1px]"></div>
                </div>

                {/* Markers */}
                <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none text-[9px] font-mono text-slate-400 font-bold">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                </div>

                {/* Percentage label in middle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold font-mono text-slate-800 bg-white/70 px-2 py-0.5 rounded-full shadow-sm">
                    {waterPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Summary & Health Coins incentive */}
              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-sky-800">
                    Hidratação do Dia
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-display font-extrabold font-mono text-sky-950">
                      {waterConsumedMl}
                    </span>
                    <span className="text-xs font-semibold text-sky-700">
                      / {targetWater} ml
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-sky-200/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${waterPercent}%` }}
                  ></div>
                </div>

                {/* Reward notification */}
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-sky-100 text-xs text-sky-900">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    {waterPercent >= 100
                      ? 'Parabéns! Meta batida e +50 HealthCoins creditadas!'
                      : waterConsumedMl === 0
                      ? 'Comece o dia registrando seu primeiro copo d\'água para ganhar HealthCoins!'
                      : `Faltam ${Math.max(0, targetWater - waterConsumedMl)} ml para conquistar o bônus de hoje.`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="space-y-3 mb-5">
              <span className="text-xs font-bold text-slate-700 block">
                Registro Rápido de Água:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WATER_PORTIONS.map((portion) => (
                  <button
                    key={portion.amount}
                    onClick={() => onAddWater(portion.amount)}
                    className="p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 rounded-2xl text-center transition-all group flex flex-col items-center cursor-pointer"
                  >
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">
                      {portion.icon}
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      +{portion.amount}ml
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {portion.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <form onSubmit={handleCustomWaterSubmit} className="flex gap-2 pt-1">
                <input
                  type="number"
                  placeholder="Ou digite quantidade em ml (ex: 350)"
                  value={customWaterInput}
                  onChange={(e) => setCustomWaterInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </form>
            </div>

            {/* Smart Reminder / Alerta de Consumo */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Lembrete Inteligente Ativo
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    Próximo aviso recomendado em 35 minutos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReminderActive(!reminderActive)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  reminderActive
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {reminderActive ? 'Ligado' : 'Pausado'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- GRÁFICO RECHARTS: EVOLUÇÃO DO PESO E INGESTÃO CALÓRICA (30 DIAS) --- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Evolução do Peso & Ingestão Calórica ({chartPeriod === '30days' ? 'Últimos 30 Dias' : 'Últimos 7 Dias'})
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  Recharts Interativo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Acompanhe a relação direta entre o consumo calórico diário (kcal) e a oscilação do seu peso corporal (kg)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period selector: 30 days vs 7 days */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setChartPeriod('30days')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartPeriod === '30days'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                30 Dias
              </button>
              <button
                onClick={() => setChartPeriod('7days')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartPeriod === '7days'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                7 Dias
              </button>
            </div>

            {/* Metric View Controls */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setChartMetric('weight_calories')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  chartMetric === 'weight_calories'
                    ? 'bg-white text-emerald-950 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="w-2 h-2 rounded-full bg-amber-500 -ml-1" />
                <span>Peso & Calorias</span>
              </button>
              <button
                onClick={() => setChartMetric('weight')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'weight'
                    ? 'bg-white text-emerald-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Peso (kg)
              </button>
              <button
                onClick={() => setChartMetric('calories')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'calories'
                    ? 'bg-white text-amber-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Calorias (kcal)
              </button>
              <button
                onClick={() => setChartMetric('water')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'water'
                    ? 'bg-white text-sky-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Água (ml)
              </button>
              <button
                onClick={() => setChartMetric('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'all'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
            </div>
          </div>
        </div>

        {/* Quick Log Today's Weight Form */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 mb-5 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pesar-se regularmente ajuda a monitorar sua tendência real sem oscilações pontuais de líquidos.</span>
          </div>

          <form onSubmit={handleLogTodayWeight} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              step="0.1"
              min="30"
              max="250"
              placeholder={`Peso hoje (${user.weight} kg)`}
              value={todayWeightInput}
              onChange={(e) => setTodayWeightInput(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500 w-36"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              Salvar Peso
            </button>
          </form>
        </div>

        {/* RECHARTS RESPONSIVE CONTAINER */}
        <div className="w-full h-72 sm:h-84">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={displayedHistory}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="dayLabel"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval={chartPeriod === '30days' ? 2 : 0}
              />

              {/* Left Y-Axis: Weight (kg) */}
              {(chartMetric === 'weight_calories' || chartMetric === 'weight' || chartMetric === 'all') && (
                <YAxis
                  yAxisId="weight"
                  orientation="left"
                  stroke="#10b981"
                  fontSize={11}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  unit="kg"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
              )}

              {/* Right Y-Axis: Caloric Intake (kcal) */}
              {(chartMetric === 'weight_calories' || chartMetric === 'calories' || chartMetric === 'all') && (
                <YAxis
                  yAxisId="calories"
                  orientation={chartMetric === 'calories' ? 'left' : 'right'}
                  stroke="#f59e0b"
                  fontSize={11}
                  domain={[0, 'auto']}
                  unit=" kcal"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
              )}

              {/* Water Y-Axis (when water or all is active) */}
              {(chartMetric === 'water' || chartMetric === 'all') && (
                <YAxis
                  yAxisId="water"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  domain={[0, 'auto']}
                  unit="ml"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
              )}

              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />

              {/* Target Calories Reference Line */}
              {(chartMetric === 'weight_calories' || chartMetric === 'calories' || chartMetric === 'all') && user.targetCalories && (
                <ReferenceLine
                  yAxisId="calories"
                  y={user.targetCalories}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Meta: ${user.targetCalories} kcal`,
                    position: 'insideTopLeft',
                    fill: '#d97706',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              )}

              {/* Water Target Reference Line */}
              {(chartMetric === 'water' || chartMetric === 'all') && targetWater > 0 && (
                <ReferenceLine
                  yAxisId="water"
                  y={targetWater}
                  stroke="#38bdf8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Meta: ${targetWater}ml`,
                    position: 'insideTopRight',
                    fill: '#0284c7',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              )}

              {/* Weight Monotone Line */}
              {(chartMetric === 'weight_calories' || chartMetric === 'weight' || chartMetric === 'all') && (
                <Line
                  yAxisId="weight"
                  type="monotone"
                  dataKey="weight"
                  name="Evolução do Peso (kg)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: chartPeriod === '30days' ? 2.5 : 4, fill: '#10b981', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              )}

              {/* Caloric Intake Monotone Line */}
              {(chartMetric === 'weight_calories' || chartMetric === 'calories' || chartMetric === 'all') && (
                <Line
                  yAxisId="calories"
                  type="monotone"
                  dataKey="caloriesConsumed"
                  name="Ingestão Calórica (kcal)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray={chartMetric === 'weight_calories' ? undefined : undefined}
                  dot={{ r: chartPeriod === '30days' ? 2.5 : 4, fill: '#f59e0b', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              )}

              {/* Water Consumed Line */}
              {(chartMetric === 'water' || chartMetric === 'all') && (
                <Line
                  yAxisId="water"
                  type="monotone"
                  dataKey="waterMl"
                  name="Consumo de Água (ml)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: chartPeriod === '30days' ? 2.5 : 4, fill: '#0284c7', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, stroke: '#0284c7', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-slate-100 mt-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Variação de Peso ({chartPeriod === '30days' ? '30 Dias' : '7 Dias'})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-bold font-mono ${weightDeltaPeriod <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {weightDeltaPeriod > 0 ? `+${weightDeltaPeriod}` : weightDeltaPeriod} kg
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({startWeight}kg → {currentWeight}kg)
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Média Calórica Diária ({chartPeriod === '30days' ? '30 Dias' : '7 Dias'})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-amber-600">
                {avgCaloriesPeriod} kcal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / dia (meta: {user.targetCalories || 2100})
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Média Diária de Água ({chartPeriod === '30days' ? '30 Dias' : '7 Dias'})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-sky-700">
                {avgWaterPeriod} ml
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / dia ({waterSuccessRate}% dias atingidos)
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Status Calórico x Peso
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-bold text-slate-800">
                {weightDeltaPeriod < 0 ? 'Déficit Efetivo (Emagrecimento)' : weightDeltaPeriod > 0 ? 'Superávit Calórico (Ganho)' : 'Manutenção Estável'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
