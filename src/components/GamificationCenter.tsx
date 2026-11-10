import React, { useState } from 'react';
import { Badge, MascotAccessory } from '../types';
import {
  Flame,
  Coins,
  Award,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  Lock,
  ChevronRight,
  ShieldCheck,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GamificationCenterProps {
  healthCoins: number;
  streakDays: number;
  badges: Badge[];
  accessories: MascotAccessory[];
  onEquipAccessory: (id: string) => void;
  onBuyAccessory: (id: string, price: number) => void;
  onClaimBadgeReward: (badgeId: string, coins: number) => void;
}

export const GamificationCenter: React.FC<GamificationCenterProps> = ({
  healthCoins,
  streakDays,
  badges,
  accessories,
  onEquipAccessory,
  onBuyAccessory,
  onClaimBadgeReward,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'water' | 'calories' | 'streak' | 'habits'>('all');

  const filteredBadges = badges.filter((b) =>
    activeCategory === 'all' ? true : b.category === activeCategory
  );

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleClaim = (badge: Badge) => {
    triggerCelebration();
    onClaimBadgeReward(badge.id, badge.rewardCoins);
  };

  // 7-day streak visual matrix dynamically based on current streakDays
  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const todayIdx = 5; // Sábado como dia corrente
  const WEEK_DAYS = daysOfWeek.map((day, idx) => {
    const isToday = idx === todayIdx;
    // Se streakDays for 0 (novo cadastro), nenhum dia passado está completo
    const completed = streakDays > 0 && idx < todayIdx && (todayIdx - idx) <= streakDays;
    return {
      day,
      completed,
      isToday,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
          <Award className="w-6 h-6 text-amber-500" />
          Gamificação, Sequência & Conquistas
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Mantenha hábitos saudáveis diários, conquiste insígnias exclusivas e personalize seu mascote com HealthCoins.
        </p>
      </div>

      {/* Top Cards: Streak + HealthCoins Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Hero Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
                <Flame className="w-4 h-4 text-amber-200 fill-amber-200 animate-bounce" />
                <span>Sequência Diária (Streaks)</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-black/20 px-2.5 py-1 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span className="font-semibold text-emerald-200">1 Congelamento Disponível</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl sm:text-5xl font-display font-extrabold font-mono text-white">
                {streakDays}
              </span>
              <span className="text-lg font-bold text-amber-100">dias consecutivos em foco!</span>
            </div>

            <p className="text-xs text-amber-100 max-w-md mb-5 leading-relaxed">
              Você está criando um hábito duradouro! Ao completar 7 dias seguidos, você desbloqueará o troféu lendário "Semana Imbatível" e +150 HealthCoins.
            </p>
          </div>

          {/* 7-Day Matrix */}
          <div className="bg-black/15 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-center gap-2">
              {WEEK_DAYS.map((wd, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <span className="text-[11px] text-amber-100 font-semibold mb-1">
                    {wd.day}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      wd.completed
                        ? 'bg-white text-orange-600 shadow-md'
                        : wd.isToday
                        ? 'border-2 border-white text-white animate-pulse'
                        : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {wd.completed ? '🔥' : wd.isToday ? 'Hoje' : '·'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HealthCoins Balance Card */}
        <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 rounded-3xl p-6 text-slate-900 shadow-lg shadow-yellow-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-xs font-bold text-amber-950">
                <Coins className="w-4 h-4 text-amber-900" />
                <span>Carteira HealthCoins</span>
              </div>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-amber-950/70 block">
              Saldo Disponível
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-display font-extrabold font-mono text-slate-950">
                {healthCoins}
              </span>
              <span className="text-sm font-bold text-amber-900">HC</span>
            </div>

            <p className="text-xs text-amber-950/80 mt-2 leading-relaxed">
              Ganhe mais moedas ao bater metas diárias e gaste personalizando os itens e acessórios do seu mascote.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-amber-950/10 space-y-1.5 text-xs">
            <div className="flex justify-between text-amber-950/90 font-medium">
              <span>+20 HC por refeição registrada</span>
              <span className="font-bold">✓</span>
            </div>
            <div className="flex justify-between text-amber-950/90 font-medium">
              <span>+50 HC por bater meta de água</span>
              <span className="font-bold">✓</span>
            </div>
            <div className="flex justify-between text-amber-950/90 font-medium">
              <span>+80 HC por equilíbrio calórico</span>
              <span className="font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Badges Panel & Mascot Store */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- PAINEL DE CONQUISTAS / INSÍGNIAS --- */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Galeria de Conquistas & Insígnias
              </h2>
              <p className="text-xs text-slate-400">
                {unlockedCount} de {badges.length} insígnias desbloqueadas
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeCategory === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveCategory('water')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeCategory === 'water'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Água
              </button>
              <button
                onClick={() => setActiveCategory('calories')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeCategory === 'calories'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Calorias
              </button>
              <button
                onClick={() => setActiveCategory('habits')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeCategory === 'habits'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hábitos
              </button>
              <button
                onClick={() => setActiveCategory('streak')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeCategory === 'streak'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sequência
              </button>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-amber-50/40 via-white to-slate-50/40 border-amber-200/80 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200/80 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-2 rounded-2xl bg-white shadow-sm border border-slate-100">
                        {badge.icon}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {badge.title}
                        </h4>
                        <span className="text-[10px] text-amber-700 font-semibold font-mono">
                          +{badge.rewardCoins} HealthCoins
                        </span>
                      </div>
                    </div>

                    {badge.unlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Conquistado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        {badge.progress}%
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-snug mb-3">
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar or Unlocked footer */}
                {!badge.unlocked ? (
                  <div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${badge.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Progresso em andamento ({badge.progress}%)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>{badge.unlockedAt || 'Desbloqueado recentemente'}</span>
                    <button
                      onClick={() => handleClaim(badge)}
                      className="text-amber-600 hover:text-amber-800 font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Comemorar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- LOJINHA DE PERSONALIZAÇÃO DO MASCOTE --- */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Lojinha do Mascote
                  </h2>
                  <p className="text-xs text-slate-400">
                    Gaste suas HealthCoins
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Equipe itens no NutriBuddy para vê-lo desfilar com estilo no Dashboard e nas suas vitórias diárias!
            </p>

            {/* Accessory Items List */}
            <div className="space-y-3">
              {accessories.map((acc) => {
                const canAfford = healthCoins >= acc.price;

                return (
                  <div
                    key={acc.id}
                    className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 bg-white rounded-xl shadow-xs">
                        {acc.icon}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {acc.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {acc.price} HC
                        </span>
                      </div>
                    </div>

                    <div>
                      {acc.unlocked ? (
                        <button
                          onClick={() => onEquipAccessory(acc.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                            acc.equipped
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          {acc.equipped ? 'Equipado' : 'Equipar'}
                        </button>
                      ) : (
                        <button
                          onClick={() => onBuyAccessory(acc.id, acc.price)}
                          disabled={!canAfford}
                          className={`px-3 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3 h-3" />
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Novos itens cosméticos desbloqueados a cada 10 dias de sequência!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
