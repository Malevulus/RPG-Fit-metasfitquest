import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, GoalType } from '../types';
import {
  calculateTMB,
  calculateTDEE,
  calculateTargetCalories,
  calculateWaterTarget,
  calculateMacros,
  ACTIVITY_LABELS,
} from '../utils/calculations';
import {
  X,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Flame,
  Droplets,
  Scale,
  Sparkles,
  Lock,
  Mail,
  LogIn,
} from 'lucide-react';

interface AuthAndOnboardingProps {
  isOpen: boolean;
  currentUser: UserProfile;
  initialMode?: 'profile' | 'login' | 'register' | 'onboarding';
  onClose: () => void;
  onSaveProfile: (updated: UserProfile) => void;
  onAuthSuccess?: (email: string, name: string) => void;
}

export const AuthAndOnboarding: React.FC<AuthAndOnboardingProps> = ({
  isOpen,
  currentUser,
  initialMode = 'profile',
  onClose,
  onSaveProfile,
}) => {
  const [view, setView] = useState<'profile' | 'login' | 'register' | 'onboarding'>(initialMode);
  const [step, setStep] = useState(1);

  // Form states
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('••••••••');
  const [age, setAge] = useState(currentUser.age);
  const [gender, setGender] = useState<Gender>(currentUser.gender);
  const [weight, setWeight] = useState(currentUser.weight);
  const [targetWeight, setTargetWeight] = useState(currentUser.targetWeight);
  const [height, setHeight] = useState(currentUser.height);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(currentUser.activityLevel);
  const [goal, setGoal] = useState<GoalType>(currentUser.goal);

  if (!isOpen) return null;

  // Real-time calculation preview
  const previewTmb = calculateTMB(weight, height, age, gender);
  const previewTdee = calculateTDEE(previewTmb, activityLevel);
  const previewTargetKcal = calculateTargetCalories(previewTdee, goal);
  const previewWaterMl = calculateWaterTarget(weight, activityLevel);
  const previewMacros = calculateMacros(previewTargetKcal, weight, goal);

  const handleFinishOnboarding = () => {
    const updated: UserProfile = {
      ...currentUser,
      name,
      email,
      age,
      gender,
      weight,
      targetWeight,
      height,
      activityLevel,
      goal,
      tmb: previewTmb,
      tdee: previewTdee,
      targetCalories: previewTargetKcal,
      targetWaterMl: previewWaterMl,
      targetProteinG: previewMacros.proteinG,
      targetCarbsG: previewMacros.carbsG,
      targetFatG: previewMacros.fatG,
    };
    onSaveProfile(updated);
    onClose();
  };

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleFinishOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                {view === 'login' && 'Entrar na sua Conta'}
                {view === 'register' && 'Criar Nova Conta Gamificada'}
                {view === 'onboarding' && 'Onboarding & Metas Nutricionais'}
                {view === 'profile' && 'Perfil Antropométrico & Metas'}
              </h3>
              <p className="text-xs text-slate-500">
                {view === 'onboarding'
                  ? `Etapa ${step} de 3 · Personalização Científica`
                  : 'Ajuste seus parâmetros corporais e objetivos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Switcher if not on onboarding step */}
        {view !== 'onboarding' && (
          <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1 bg-slate-50/30">
            <button
              onClick={() => setView('profile')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                view === 'profile'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Configurar Metas
            </button>
            <button
              onClick={() => {
                setView('onboarding');
                setStep(1);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-700 hover:bg-emerald-50 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Refazer Onboarding
            </button>
            <button
              onClick={() => setView('login')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                view === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setView('register')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                view === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cadastro
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* --- LOGIN VIEW --- */}
          {view === 'login' && (
            <form onSubmit={handleMockLogin} className="space-y-4 max-w-sm mx-auto py-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com.br"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Entrar no MetasFitQuest
              </button>

              <p className="text-center text-xs text-slate-500 pt-2">
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="text-emerald-700 font-semibold underline"
                >
                  Cadastre-se grátis
                </button>
              </p>
            </form>
          )}

          {/* --- REGISTER VIEW --- */}
          {view === 'register' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setView('onboarding');
                setStep(1);
              }}
              className="space-y-4 max-w-sm mx-auto py-2"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Criar Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Continuar para o Onboarding
              </button>
            </form>
          )}

          {/* --- ONBOARDING & PROFILE VIEW --- */}
          {(view === 'profile' || view === 'onboarding') && (
            <div className="space-y-5">
              {/* Step indicator in Onboarding mode */}
              {view === 'onboarding' && (
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex-1 flex items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          step >= s ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {s}
                      </div>
                      {s < 3 && (
                        <div
                          className={`flex-1 h-1 mx-2 rounded ${
                            step > s ? 'bg-emerald-600' : 'bg-slate-200'
                          }`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 1: Dados Básicos (Idade, Gênero, Altura) */}
              {(view === 'profile' || step === 1) && (
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    1. Dados Pessoais & Biometria
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Idade (anos)
                      </label>
                      <input
                        type="number"
                        min="12"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value, 10) || 25)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gênero Biológico
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                        <option value="outro">Outro / Não-binário</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Altura: <span className="font-mono text-emerald-700">{height} cm</span>
                    </label>
                    <input
                      type="range"
                      min="130"
                      max="220"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Peso e Meta de Peso */}
              {(view === 'profile' || step === 2) && (
                <div className="space-y-3.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    2. Peso Atual & Meta
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Peso Atual (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="35"
                        max="200"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 70)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Peso Desejado (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="35"
                        max="200"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 68)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Atividade Física & Objetivo */}
              {(view === 'profile' || step === 3) && (
                <div className="space-y-3.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    3. Rotina & Objetivo Principal
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nível de Atividade Física
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((lvl) => (
                        <div
                          key={lvl}
                          onClick={() => setActivityLevel(lvl)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            activityLevel === lvl
                              ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs">{ACTIVITY_LABELS[lvl].label}</div>
                          <div className="text-[10px] text-slate-500">{ACTIVITY_LABELS[lvl].desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Objetivo Nutricional
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'emagrecer', label: 'Emagrecer', icon: '🥗', desc: 'Déficit calórico saudável' },
                        { id: 'manter', label: 'Manter Peso', icon: '⚖️', desc: 'Equilíbrio e disposição' },
                        { id: 'ganhar_massa', label: 'Ganhar Massa', icon: '💪', desc: 'Superávit limpo & força' },
                      ].map((obj) => (
                        <div
                          key={obj.id}
                          onClick={() => setGoal(obj.id as GoalType)}
                          className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                            goal === obj.id
                              ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="text-xl block mb-1">{obj.icon}</span>
                          <span className="font-bold text-xs block">{obj.label}</span>
                          <span className="text-[10px] text-slate-400 block">{obj.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scientific Live Preview Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Cálculo Automático das Metas
                  </span>
                  <span>Mifflin-St Jeor</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white/10 rounded-xl p-2">
                    <span className="text-[10px] text-slate-400 block">TMB Basal</span>
                    <span className="font-mono font-bold text-sm">{previewTmb}</span>
                    <span className="text-[9px] text-slate-400 block">kcal</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2">
                    <span className="text-[10px] text-slate-400 block">Gasto Total (TDEE)</span>
                    <span className="font-mono font-bold text-sm">{previewTdee}</span>
                    <span className="text-[9px] text-slate-400 block">kcal</span>
                  </div>
                  <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-2">
                    <span className="text-[10px] text-emerald-300 block">Meta Diária</span>
                    <span className="font-mono font-bold text-sm text-emerald-300">{previewTargetKcal}</span>
                    <span className="text-[9px] text-emerald-400 block">kcal</span>
                  </div>
                  <div className="bg-sky-500/20 border border-sky-400/40 rounded-xl p-2">
                    <span className="text-[10px] text-sky-300 block">Meta Água</span>
                    <span className="font-mono font-bold text-sm text-sky-300">{previewWaterMl}</span>
                    <span className="text-[9px] text-sky-400 block">ml/dia</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {view === 'onboarding' && step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </button>
                ) : (
                  <div></div>
                )}

                {view === 'onboarding' && step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishOnboarding}
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Salvar e Aplicar Metas
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
