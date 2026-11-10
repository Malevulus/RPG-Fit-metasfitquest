import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  HealthAnamnese,
  WorkoutPlan,
  WorkoutExercise,
  WorkoutHistoryEntry,
  ScheduledNotification,
  HealthDayRecord,
} from '../types';
import {
  Dumbbell,
  Home,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  Heart,
  Scale,
  Droplets,
  Bell,
  Activity,
  Flame,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Info,
  Check,
  Plus,
  Trash2,
  Edit3,
  ArrowUpDown,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ANAMNESE_QUESTIONS,
  COMMON_JOINT_RESTRICTIONS,
  getCustomizedWorkoutPlans,
} from '../data/trainerData';
import { WorkoutEditorModal } from './WorkoutEditorModal';
import { ExerciseVisual } from './ExerciseVisual';
import {
  requestNotificationPermission,
  sendBrowserNotification,
  playNotificationChime,
  isNotificationSupported,
} from '../utils/notificationService';

interface PersonalTrainerModuleProps {
  user: UserProfile;
  healthCoins: number;
  streakDays: number;
  waterConsumedMl: number;
  totalCaloriesToday: number;
  healthHistory: HealthDayRecord[];
  anamnese: HealthAnamnese;
  workoutPlans: WorkoutPlan[];
  workoutHistory: WorkoutHistoryEntry[];
  notifications: ScheduledNotification[];
  onSaveAnamnese: (updated: HealthAnamnese) => void;
  onUpdateWorkoutPlans: (plans: WorkoutPlan[]) => void;
  onFinishWorkout: (workoutTitle: string, environment: 'casa' | 'academia', rewardCoins: number, totalEx: number) => void;
  onUpdateNotifications: (notifs: ScheduledNotification[]) => void;
  onToast: (msg: string) => void;
}

export const PersonalTrainerModule: React.FC<PersonalTrainerModuleProps> = ({
  user,
  healthCoins,
  streakDays,
  waterConsumedMl,
  totalCaloriesToday,
  healthHistory,
  anamnese,
  workoutPlans,
  workoutHistory,
  notifications,
  onSaveAnamnese,
  onUpdateWorkoutPlans,
  onFinishWorkout,
  onUpdateNotifications,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'workout' | 'anamnese' | 'evolution' | 'notifications'>('workout');

  // Workout state
  const [selectedEnvironment, setSelectedEnvironment] = useState<'casa' | 'academia'>(anamnese.preferredLocation || 'academia');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  // Rest Timer state
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [activeRestExercise, setActiveRestExercise] = useState<string | null>(null);

  // Notification state
  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    try {
      return typeof Notification !== 'undefined' ? Notification.permission : 'default';
    } catch {
      return 'default';
    }
  });

  // Local form state for Anamnese
  const [tempAnamnese, setTempAnamnese] = useState<HealthAnamnese>(anamnese);

  // New notification form state
  const [newNotifType, setNewNotifType] = useState<'water' | 'meal' | 'workout'>('water');
  const [newNotifTime, setNewNotifTime] = useState<string>('14:00');
  const [newNotifTitle, setNewNotifTitle] = useState<string>('');

  // Filter plans based on selected environment
  const currentPlans = workoutPlans.filter((p) => p.environment === selectedEnvironment);
  const activePlan = currentPlans.find((p) => p.id === selectedPlanId) || currentPlans[0];

  // Rest Timer countdown effect
  useEffect(() => {
    if (restTimerSeconds === null) return;
    if (restTimerSeconds <= 0) {
      playNotificationChime('workout');
      onToast('⏰ Tempo de descanso finalizado! Hora da próxima série!');
      setRestTimerSeconds(null);
      setActiveRestExercise(null);
      return;
    }

    const interval = setInterval(() => {
      setRestTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimerSeconds, onToast]);

  // Request browser permission
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setBrowserPermission(permission);
    if (permission === 'granted') {
      onToast('🔔 Notificações ativadas com sucesso no navegador!');
      sendBrowserNotification('✅ MetasFitQuest Notificações Ativadas', {
        body: 'Agora você receberá alertas pontuais para beber água e registrar refeições com XP.',
        type: 'water',
      });
    } else {
      onToast('A permissão de notificações não foi concedida pelo navegador.');
    }
  };

  // Immediate test notification
  const handleTestNotification = () => {
    playNotificationChime('water');
    const sent = sendBrowserNotification('💧 Hora de Beber Água! (Teste)', {
      body: 'Mantenha sua hidratação em dia! Beba um copo de 250ml agora para ganhar HealthCoins.',
      type: 'water',
    });

    if (sent) {
      onToast('🔔 Notificação enviada para sua área de trabalho/navegador!');
    } else {
      onToast('🔔 Alerta sonoro emitido! (Para notificação nativa, permita os avisos no navegador).');
    }
  };

  // Toggle notification on/off
  const handleToggleNotification = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, enabled: !n.enabled } : n
    );
    onUpdateNotifications(updated);
    onToast('Configuração de lembrete atualizada.');
  };

  // Add custom notification
  const handleAddCustomNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifTime) return;

    const title = newNotifTitle.trim() || (newNotifType === 'water' ? '💧 Lembrete de Água' : newNotifType === 'meal' ? '🥗 Hora da Refeição' : '💪 Hora do Treino');
    const body = newNotifType === 'water'
      ? 'Não esqueça de manter a meta de água ativa ao longo do dia.'
      : newNotifType === 'meal'
      ? 'Registre seu prato agora para manter o balanço de macronutrientes.'
      : 'Realize suas séries de hoje para acumular HealthCoins e evolução!';

    const newNotif: ScheduledNotification = {
      id: `notif_${Date.now()}`,
      type: newNotifType,
      title,
      body,
      time: newNotifTime,
      enabled: true,
      days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    };

    onUpdateNotifications([...notifications, newNotif]);
    setNewNotifTitle('');
    onToast('Novo lembrete agendado adicionado com sucesso!');
  };

  // Delete notification
  const handleDeleteNotification = (id: string) => {
    onUpdateNotifications(notifications.filter((n) => n.id !== id));
    onToast('Lembrete removido.');
  };

  // Toggle checklist for exercise series
  const handleToggleSeries = (exerciseId: string, seriesIdx: number) => {
    if (!activePlan) return;

    let targetRestSeconds = 60;

    const updatedExercises = activePlan.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        targetRestSeconds = ex.restSeconds || 60;
        const updatedProgress = ex.seriesProgress.map((sp) => {
          if (sp.seriesIndex === seriesIdx) {
            const nextState = !sp.completed;
            if (nextState) {
              // Trigger rest timer
              setRestTimerSeconds(targetRestSeconds);
              setActiveRestExercise(ex.name);
              playNotificationChime('water');
            }
            return { ...sp, completed: nextState };
          }
          return sp;
        });
        return { ...ex, seriesProgress: updatedProgress };
      }
      return ex;
    });

    const updatedPlans = workoutPlans.map((p) =>
      p.id === activePlan.id ? { ...p, exercises: updatedExercises } : p
    );

    onUpdateWorkoutPlans(updatedPlans);
  };

  // Workout customization save handler
  const handleSaveEditedPlan = (updatedPlan: WorkoutPlan) => {
    const updatedPlans = workoutPlans.map((p) =>
      p.id === updatedPlan.id ? updatedPlan : p
    );
    onUpdateWorkoutPlans(updatedPlans);
    setEditingPlan(null);
    onToast(`✅ Treino "${updatedPlan.title}" atualizado com sucesso!`);
  };

  // Workout customization reset handler
  const handleResetPlanToDefault = () => {
    if (!editingPlan) return;
    const defaultPlans = getCustomizedWorkoutPlans(anamnese.preferredLocation, anamnese);
    const matchedDefault =
      defaultPlans.find((p) => p.id === editingPlan.id) ||
      defaultPlans[0];
    const updatedPlans = workoutPlans.map((p) =>
      p.id === editingPlan.id ? matchedDefault : p
    );
    onUpdateWorkoutPlans(updatedPlans);
    setEditingPlan(null);
    onToast('🔄 Treino restaurado para a estrutura padrão recomendada (7 exercícios)!');
  };

  // Finish whole workout
  const handleCompleteCurrentWorkout = () => {
    if (!activePlan) return;

    // Check if at least some series are done
    const totalSeries = activePlan.exercises.reduce((acc, ex) => acc + ex.seriesProgress.length, 0);
    const completedSeries = activePlan.exercises.reduce(
      (acc, ex) => acc + ex.seriesProgress.filter((sp) => sp.completed).length,
      0
    );

    if (completedSeries === 0) {
      onToast('Marque pelo menos algumas séries concluídas para finalizar seu treino!');
      return;
    }

    onFinishWorkout(
      activePlan.title,
      activePlan.environment,
      activePlan.rewardCoins,
      activePlan.exercises.length
    );

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Save Anamnese
  const handleSaveAnamneseForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAnamnese({
      ...tempAnamnese,
      completedAt: new Date().toLocaleDateString('pt-BR'),
    });

    // Re-generate customized plans
    const refreshedPlans = getCustomizedWorkoutPlans(tempAnamnese.preferredLocation, tempAnamnese);
    onUpdateWorkoutPlans(refreshedPlans);
    setSelectedEnvironment(tempAnamnese.preferredLocation);

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onToast('Anamnese salva! Treino atualizado e adaptado à sua saúde!');
    setActiveTab('workout');
  };

  const handleToggleJointPain = (jointId: string) => {
    setTempAnamnese((prev) => {
      const exists = prev.jointPainLocations.includes(jointId);
      const updated = exists
        ? prev.jointPainLocations.filter((id) => id !== jointId)
        : [...prev.jointPainLocations, jointId];
      return {
        ...prev,
        hasJointPain: updated.length > 0,
        jointPainLocations: updated,
      };
    });
  };

  // Progress metrics for current workout
  const totalWorkoutSeries = activePlan?.exercises.reduce((acc, ex) => acc + ex.seriesProgress.length, 0) || 1;
  const completedWorkoutSeries = activePlan?.exercises.reduce(
    (acc, ex) => acc + ex.seriesProgress.filter((sp) => sp.completed).length,
    0
  ) || 0;
  const workoutProgressPercent = Math.round((completedWorkoutSeries / totalWorkoutSeries) * 100);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personal Trainer & Biomecânica Científica</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Treinos, Anamnese & Evolução Física
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Exercícios adaptados para hipertrofia com guia de execução, checklist de séries, agendamento de notificações e proteção articular.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 self-start md:self-auto">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-300 block uppercase font-bold">Treinos Feitos</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{workoutHistory.length}</span>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-300 block uppercase font-bold">Sequência</span>
              <span className="text-lg font-bold font-mono text-amber-400">{streakDays} dias</span>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-300 block uppercase font-bold">HealthCoins</span>
              <span className="text-lg font-bold font-mono text-yellow-400">{healthCoins} HC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'workout'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Dumbbell className="w-4 h-4 text-emerald-600" />
          <span>Treino de Hoje</span>
        </button>

        <button
          onClick={() => setActiveTab('anamnese')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'anamnese'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Anamnese & Saúde</span>
          {anamnese.hasJointPain && (
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('evolution')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'evolution'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Evolução Física & Hábitos</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>Lembretes Web Push ({notifications.filter((n) => n.enabled).length})</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. ABA DE TREINO DE HOJE (CASA OU ACADEMIA COM CHECKLIST E IMAGENS) */}
      {/* ===================================================================== */}
      {activeTab === 'workout' && (
        <div className="space-y-6">
          {/* Environment Switcher & Plan Selector */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Ambiente de Treino
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedEnvironment('academia');
                    const plans = workoutPlans.filter((p) => p.environment === 'academia');
                    if (plans[0]) setSelectedPlanId(plans[0].id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedEnvironment === 'academia'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Academia (Máquinas & Halteres)</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedEnvironment('casa');
                    const plans = workoutPlans.filter((p) => p.environment === 'casa');
                    if (plans[0]) setSelectedPlanId(plans[0].id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedEnvironment === 'casa'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Treino em Casa (Calistenia)</span>
                </button>
              </div>
            </div>

            {/* Plan switcher tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {currentPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    (selectedPlanId === plan.id || (!selectedPlanId && currentPlans[0]?.id === plan.id))
                      ? 'bg-emerald-50 text-emerald-900 border-2 border-emerald-500 font-extrabold'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {plan.title.split('·')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Active Rest Timer Bar if active */}
          {restTimerSeconds !== null && (
            <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 animate-spin" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Descanso Ativo: {activeRestExercise || 'Próxima Série'}
                  </h4>
                  <p className="text-lg font-mono font-extrabold">
                    {restTimerSeconds}s restantes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestTimerSeconds(null)}
                className="px-3 py-1.5 bg-white text-amber-900 text-xs font-bold rounded-xl hover:bg-amber-50 transition-colors cursor-pointer"
              >
                Pular Descanso
              </button>
            </div>
          )}

          {/* Workout Header & Progress */}
          {activePlan && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {activePlan.focus}
                    </span>
                    <span className="text-xs text-slate-400">
                      ⏱️ ~{activePlan.estimatedMinutes} min estimados
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-extrabold text-slate-900 mt-1">
                    {activePlan.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activePlan.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setEditingPlan(activePlan)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                    title="Editar exercícios, séries e repetições deste treino"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                    <span>Editar Treino ({activePlan.exercises.length} ex)</span>
                  </button>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 block">
                      {completedWorkoutSeries} de {totalWorkoutSeries} séries
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700">
                      {workoutProgressPercent}% concluído
                    </span>
                  </div>
                  <button
                    onClick={handleCompleteCurrentWorkout}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finalizar Treino (+{activePlan.rewardCoins} HC)</span>
                  </button>
                </div>
              </div>

              {/* Workout Progress Bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${workoutProgressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Exercises Checklist Cards */}
          <div className="space-y-5">
            {activePlan?.exercises.map((exercise, exIndex) => {
              const allSeriesDone = exercise.seriesProgress.every((s) => s.completed);

              return (
                <div
                  key={exercise.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs ${
                    allSeriesDone
                      ? 'border-emerald-300 bg-emerald-50/15'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Exercise Accurate Biomechanics & Image */}
                    <div className="lg:col-span-4 relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 border border-slate-700 bg-slate-950 shadow-md">
                      <ExerciseVisual
                        exercise={exercise}
                        className="w-full h-full"
                        showBadge={true}
                        allowToggleView={true}
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10 pointer-events-none border border-white/10">
                        #{exIndex + 1} · {exercise.phase === 'alongamento_inicial' ? 'Along. Inicial' : exercise.phase === 'alongamento_final' ? 'Along. Final' : 'Principal'}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs z-10 pointer-events-none">
                        ⏱️ {exercise.restSeconds}s descanso
                      </div>
                    </div>

                    {/* Exercise Details & Biomechanics */}
                    <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                exercise.phase === 'alongamento_inicial'
                                  ? 'bg-sky-100 text-sky-800'
                                  : exercise.phase === 'alongamento_final'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {exercise.phase === 'alongamento_inicial'
                                ? 'Alongamento Inicial'
                                : exercise.phase === 'alongamento_final'
                                ? 'Alongamento Final'
                                : 'Exercício Principal'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {exercise.targetMuscle}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {exercise.repsRange}
                            </span>
                          </div>

                          <button
                            onClick={() => setEditingPlan(activePlan)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <ArrowUpDown className="w-3 h-3 text-emerald-600" />
                            <span>Trocar / Ajustar</span>
                          </button>
                        </div>

                        <h3 className="text-base sm:text-lg font-display font-extrabold text-slate-900">
                          {exercise.name}
                        </h3>

                        {/* Scientific anatomy target */}
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          🧬 Ativação Anatômica: <span className="font-semibold text-slate-700">{exercise.scientificTarget}</span>
                        </p>

                        {/* Adaptation alert based on anamnese */}
                        {exercise.adaptationNote && (
                          <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>{exercise.adaptationNote}</span>
                          </div>
                        )}

                        {/* Biomechanical instructions */}
                        <div className="mt-3 space-y-1">
                          <span className="text-[11px] font-bold text-slate-700 block">
                            Execução Biomecânica Passo a Passo:
                          </span>
                          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                            {exercise.executionGuide.map((step, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Interactive Series Checklist */}
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-800 block mb-2">
                          Checklist de Séries para Conclusão:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {exercise.seriesProgress.map((series) => (
                            <button
                              key={series.seriesIndex}
                              onClick={() => handleToggleSeries(exercise.id, series.seriesIndex)}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                series.completed
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold">
                                  Série {series.seriesIndex}
                                </span>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                    series.completed ? 'bg-white text-emerald-700' : 'border border-slate-300'
                                  }`}
                                >
                                  {series.completed && <Check className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-mono ${
                                  series.completed ? 'text-emerald-100' : 'text-slate-400'
                                }`}
                              >
                                {series.weightKg ? `${series.weightKg}kg · ` : ''}{series.repsDone || 10} reps
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. ABA DE ANAMNESE & PRESCRIÇÃO CIENTÍFICA */}
      {/* ===================================================================== */}
      {activeTab === 'anamnese' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              Questionário de Anamnese Esportiva & Biomecânica
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              O Personal Trainer utiliza suas respostas para identificar restrições articulares, substituir exercícios de risco e otimizar o ganho de massa com segurança.
            </p>
          </div>

          <form onSubmit={handleSaveAnamneseForm} className="space-y-6">
            {/* 1. Joint Pain & Articular Restrictions */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Você sente dores frequentes ou possui lesões diagnosticadas em alguma articulação?
              </label>
              <p className="text-xs text-slate-500">
                Selecione as regiões afetadas. O app adaptará os ângulos, amplitude e apoios dos exercícios.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_JOINT_RESTRICTIONS.map((joint) => {
                  const isSelected = tempAnamnese.jointPainLocations.includes(joint.id);
                  return (
                    <button
                      key={joint.id}
                      type="button"
                      onClick={() => handleToggleJointPain(joint.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <span>{joint.icon}</span>
                          <span>{joint.label}</span>
                        </span>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-amber-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        {joint.caution}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Experience Level */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Nível de Experiência com Treinamento de Força
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ANAMNESE_QUESTIONS[0].options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTempAnamnese((prev) => ({ ...prev, experienceLevel: opt.value as any }))}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      tempAnamnese.experienceLevel === opt.value
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-1">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block">{opt.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Preferred Location */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Local Principal dos Seus Treinos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ANAMNESE_QUESTIONS[1].options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTempAnamnese((prev) => ({ ...prev, preferredLocation: opt.value as any }))}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      tempAnamnese.preferredLocation === opt.value
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-1">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block">{opt.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Goal */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Objetivo Fisiológico
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ANAMNESE_QUESTIONS[2].options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTempAnamnese((prev) => ({ ...prev, primaryGoal: opt.value as any }))}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      tempAnamnese.primaryGoal === opt.value
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-1">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block">{opt.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Cardiovascular & Spine Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Cardiovasculares / Pressão Arterial
                </label>
                <input
                  type="text"
                  placeholder="Ex: Hipertensão controlada, labirintite..."
                  value={tempAnamnese.cardiovascularNotes}
                  onChange={(e) => setTempAnamnese((prev) => ({ ...prev, cardiovascularNotes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cirurgias Recentes ou Outros Cuidados
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cirurgia de apêndice há 6 meses..."
                  value={tempAnamnese.surgeryNotes}
                  onChange={(e) => setTempAnamnese((prev) => ({ ...prev, surgeryNotes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Salvar Anamnese & Gerar Treinos Personalizados</span>
            </button>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. ABA DE EVOLUÇÃO FÍSICA, ÁGUA, ALIMENTAÇÃO E PESO */}
      {/* ===================================================================== */}
      {activeTab === 'evolution' && (
        <div className="space-y-6">
          {/* Top 4 Pillars Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Physical Training Pillar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-emerald-600" />
                    Treinos Concluídos
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                </div>
                <div className="text-2xl font-display font-extrabold text-slate-900 font-mono">
                  {workoutHistory.length}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Sessões finalizadas com checklist completo.
                </p>
              </div>
            </div>

            {/* Water Pillar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    Hidratação Hoje
                  </span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                    {Math.round((waterConsumedMl / user.targetWaterMl) * 100)}%
                  </span>
                </div>
                <div className="text-2xl font-display font-extrabold text-slate-900 font-mono">
                  {waterConsumedMl} <span className="text-xs text-slate-400 font-normal">/ {user.targetWaterMl}ml</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Essencial para transporte de nutrientes e síntese proteica.
                </p>
              </div>
            </div>

            {/* Nutrition & Calories Pillar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Balanço Calórico
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    {Math.round((totalCaloriesToday / user.targetCalories) * 100)}%
                  </span>
                </div>
                <div className="text-2xl font-display font-extrabold text-slate-900 font-mono">
                  {totalCaloriesToday} <span className="text-xs text-slate-400 font-normal">/ {user.targetCalories} kcal</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Meta diária calculada: {user.targetProteinG}g proteína.
                </p>
              </div>
            </div>

            {/* Weight & Body Comp Pillar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    Peso Atual & Meta
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {user.goal}
                  </span>
                </div>
                <div className="text-2xl font-display font-extrabold text-slate-900 font-mono">
                  {user.weight} <span className="text-xs text-slate-400 font-normal">kg (Meta: {user.targetWeight}kg)</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Diferença para meta: {Math.abs(Number((user.weight - user.targetWeight).toFixed(1)))} kg.
                </p>
              </div>
            </div>
          </div>

          {/* Workout History List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-base font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Histórico de Sessões de Treino Concluídas
            </h3>

            {workoutHistory.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">
                  Nenhum treino concluído ainda. Abra a aba "Treino de Hoje", marque suas séries e clique em finalizar!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {workoutHistory.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {item.environment === 'academia' ? '🏋️' : '🏠'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.workoutTitle}</h4>
                        <span className="text-[11px] text-slate-400">
                          {item.date} às {item.timestamp} · {item.exercisesCompleted} exercícios
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-emerald-700">
                        +{item.rewardEarned} HC
                      </span>
                      <span className="text-[10px] text-slate-400 block">Completado</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. ABA DE LEMBRETES AGENDÁVEIS (WEB PUSH NOTIFICATIONS) */}
      {/* ===================================================================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Permission Status Banner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Status do Navegador
                </span>
                <span className={`text-xs font-bold font-mono ${browserPermission === 'granted' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  Permissão: {browserPermission === 'granted' ? 'Concedida ✅' : browserPermission === 'denied' ? 'Bloqueada 🚫' : 'Pendente ⏳'}
                </span>
              </div>
              <h3 className="text-base font-display font-bold text-slate-900 mt-1">
                Notificações Nativas do Navegador (Web Push)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Receba lembretes automáticos no desktop ou celular nos horários planejados de água e refeições.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestNotification}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>Testar Notificação Agora</span>
              </button>

              {browserPermission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Ativar Permissão no Navegador</span>
                </button>
              )}
            </div>
          </div>

          {/* Add New Custom Reminder Form */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Agendar Novo Horário de Lembrete
            </h4>
            <form onSubmit={handleAddCustomNotification} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tipo de Lembrete
                </label>
                <select
                  value={newNotifType}
                  onChange={(e) => setNewNotifType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="water">💧 Beber Água</option>
                  <option value="meal">🥗 Registrar Refeição</option>
                  <option value="workout">💪 Hora do Treino</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Horário Planejado (HH:mm)
                </label>
                <input
                  type="time"
                  required
                  value={newNotifTime}
                  onChange={(e) => setNewNotifTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Título Personalizado (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Copo de água com limão"
                  value={newNotifTitle}
                  onChange={(e) => setNewNotifTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Salvar Lembrete</span>
              </button>
            </form>
          </div>

          {/* Scheduled Reminders List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lembretes Agendados ({notifications.length})
              </span>
              <span className="text-xs text-slate-400">
                Disparos programados com alerta sonoro
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {notifications.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between transition-colors hover:bg-slate-50/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-lg">
                      {item.type === 'water' ? '💧' : item.type === 'meal' ? '🥗' : '💪'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          ⏰ {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.body}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleNotification(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        item.enabled
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {item.enabled ? 'Ativo' : 'Pausado'}
                    </button>

                    <button
                      onClick={() => handleDeleteNotification(item.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Excluir lembrete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workout Customization & Exercise Swapping Modal */}
      <WorkoutEditorModal
        isOpen={editingPlan !== null}
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
        onSavePlan={handleSaveEditedPlan}
        onResetPlanToDefault={handleResetPlanToDefault}
      />
    </div>
  );
};
