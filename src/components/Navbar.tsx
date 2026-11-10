import React from 'react';
import {
  Flame,
  Coins,
  Heart,
  Award,
  LayoutDashboard,
  SlidersHorizontal,
  Camera,
  LogOut,
  Users,
  Palette,
  Dumbbell,
  UtensilsCrossed,
  Database,
  Calendar,
} from 'lucide-react';
import { UserProfile } from '../types';

export type AppBackgroundTheme = 'clean' | 'mint' | 'sunset' | 'dark_athletic';

interface NavbarProps {
  currentTab: 'dashboard' | 'health' | 'diet' | 'trainer' | 'gamification' | 'social';
  onSelectTab: (tab: 'dashboard' | 'health' | 'diet' | 'trainer' | 'gamification' | 'social') => void;
  user: UserProfile;
  healthCoins: number;
  streakDays: number;
  currentBgTheme?: AppBackgroundTheme;
  onChangeBgTheme?: (theme: AppBackgroundTheme) => void;
  onOpenProfile: () => void;
  onOpenScanner: () => void;
  onOpenDatabase?: () => void;
  onOpenWeeklySummary?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  healthCoins,
  streakDays,
  currentBgTheme,
  onChangeBgTheme,
  onOpenProfile,
  onOpenScanner,
  onOpenDatabase,
  onOpenWeeklySummary,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-1.5 sm:gap-2.5 shrink min-w-0 cursor-pointer group"
            title="Ir para o Dashboard"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/assets/aistudio/Logo_MetaFitQuest_8363d166.png"
                alt="Logo MetaFitQuest"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-sm sm:text-lg tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  Metas<span className="text-emerald-600">Fit</span><span className="hidden xs:inline">Quest</span>
                </span>
                <span className="text-[9px] font-semibold tracking-wider uppercase px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded shrink-0 hidden sm:inline">
                  +XP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block truncate">
                Controle sua vida e otimize com mais XP
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => onSelectTab('health')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'health'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Saúde & IMC
            </button>

            <button
              onClick={() => onSelectTab('diet')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'diet'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              Dieta & Cardápios
            </button>

            <button
              onClick={() => onSelectTab('trainer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'trainer'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              Personal & Treino
            </button>

            <button
              onClick={() => onSelectTab('social')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'social'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              Social
            </button>

            <button
              onClick={() => onSelectTab('gamification')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'gamification'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              Conquistas
            </button>
          </nav>

          {/* Gamification Stats: Streak + Coins + Profile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 bg-amber-50 border border-amber-200/70 rounded-xl text-amber-900 cursor-pointer hover:bg-amber-100/70 transition-colors"
              title="Sequência de dias cumprindo metas saudáveis"
              onClick={() => onSelectTab('gamification')}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-amber-500 shrink-0" />
              <span className="text-xs font-bold font-mono tabular-nums">{streakDays}</span>
              <span className="text-[10px] font-medium text-amber-800 hidden sm:inline">d</span>
            </div>

            {/* HealthCoins */}
            <div
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-900 cursor-pointer hover:bg-yellow-100/70 transition-colors"
              title="Suas HealthCoins acumuladas"
              onClick={() => onSelectTab('gamification')}
            >
              <Coins className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
              <span className="text-xs font-bold font-mono tabular-nums">{healthCoins}</span>
              <span className="text-[9px] font-semibold text-yellow-700 bg-yellow-200/60 px-1 py-0.2 rounded hidden sm:inline">HC</span>
            </div>

            {/* Background Theme Switcher */}
            {onChangeBgTheme && (
              <button
                onClick={() => {
                  const themes: AppBackgroundTheme[] = ['clean', 'mint', 'sunset', 'dark_athletic'];
                  const currentIndex = themes.indexOf(currentBgTheme || 'clean');
                  const nextTheme = themes[(currentIndex + 1) % themes.length];
                  onChangeBgTheme(nextTheme);
                }}
                className="p-1 sm:p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
                title={`Mudar visual do background (Atual: ${currentBgTheme || 'clean'})`}
              >
                <Palette className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            )}

            {/* Database & Cloud Server / Drive Button */}
            {onOpenDatabase && (
              <button
                onClick={onOpenDatabase}
                className="p-1 sm:p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                title="Banco de Dados, Servidor e Google Drive"
              >
                <Database className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden xl:inline text-[11px] font-bold text-slate-700">Drive / Banco</span>
              </button>
            )}

            {/* Weekly Summary Button */}
            {onOpenWeeklySummary && (
              <button
                onClick={onOpenWeeklySummary}
                className="p-1 sm:p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                title="Resumo Semanal de Metas e HealthCoins"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline text-[11px] font-bold text-emerald-800">Resumo Semanal</span>
              </button>
            )}

            {/* Camera / AI Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Escanear Prato ou Código de Barras com Câmera"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Escanear IA</span>
            </button>

            {/* User Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer shrink-0"
              title="Configurar Perfil e Metas"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] overflow-hidden border border-emerald-500/30 shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="smooth-avatar w-full h-full object-contain" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <span className="hidden sm:inline font-semibold text-xs">{user.name.split(' ')[0]}</span>
              <SlidersHorizontal className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Sair da Conta (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden items-center justify-between py-1.5 border-t border-slate-100 overflow-x-auto scrollbar-none gap-1 px-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[50px] py-1 px-1 text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
              currentTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Painel</span>
          </button>
          <button
            onClick={() => onSelectTab('health')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[50px] py-1 px-1 text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
              currentTab === 'health' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Saúde</span>
          </button>
          <button
            onClick={() => onSelectTab('diet')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[50px] py-1 px-1 text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
              currentTab === 'diet' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
            <span>Dieta</span>
          </button>
          <button
            onClick={() => onSelectTab('trainer')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[50px] py-1 px-1 text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
              currentTab === 'trainer' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Dumbbell className="w-4 h-4 text-emerald-600" />
            <span>Treino</span>
          </button>
          <button
            onClick={() => onSelectTab('social')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[50px] py-1 px-1 text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
              currentTab === 'social' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Social</span>
          </button>
          <button
            onClick={() => onSelectTab('gamification')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[50px] py-1 px-1 text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
              currentTab === 'gamification' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Prêmios</span>
          </button>
        </div>
      </div>
    </header>
  );
};
