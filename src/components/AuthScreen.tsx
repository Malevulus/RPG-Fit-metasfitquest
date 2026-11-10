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
import { DEFAULT_USER } from '../data/defaultData';
import { OFFICIAL_AVATARS } from '../assets/avatars';
import { Mascot } from './Mascot';
import { AvatarPickerModal } from './AvatarPickerModal';
import {
  LogIn,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  Heart,
  Award,
  Droplets,
  Flame,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Zap,
  Upload,
  RotateCcw,
  Wand2,
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, isNewRegistration?: boolean) => void;
}

const MALE_DEFAULT_AVATAR = OFFICIAL_AVATARS.male.default;
const FEMALE_DEFAULT_AVATAR = OFFICIAL_AVATARS.female.default;

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Login form: starts blank with placeholder
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register & Onboarding form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>('masculino');
  const [avatarUrl, setAvatarUrl] = useState<string>(MALE_DEFAULT_AVATAR);
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [targetWeight, setTargetWeight] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderado');
  const [goal, setGoal] = useState<GoalType>('emagrecer');

  // Preview interactive mascot gender for the left column
  const [previewMascotGender, setPreviewMascotGender] = useState<'masculino' | 'feminino'>('masculino');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [avatarPickerTab, setAvatarPickerTab] = useState<'presets' | 'upload' | 'camera' | 'ai'>('presets');

  const openAvatarPicker = (tab: 'presets' | 'upload' | 'camera' | 'ai') => {
    setAvatarPickerTab(tab);
    setIsAvatarPickerOpen(true);
  };

  // Real-time calculations for onboarding
  const numAge = parseInt(age, 10) || 0;
  const numHeight = parseFloat(height) || 0;
  const numWeight = parseFloat(weight) || 0;
  const numTargetWeight = parseFloat(targetWeight) || 0;

  const hasValidMetrics = numAge > 0 && numHeight > 0 && numWeight > 0;
  const previewTmb = hasValidMetrics ? calculateTMB(numWeight, numHeight, numAge, gender) : 0;
  const previewTdee = previewTmb > 0 ? calculateTDEE(previewTmb, activityLevel) : 0;
  const previewTargetKcal = previewTdee > 0 ? calculateTargetCalories(previewTdee, goal) : 0;
  const previewWaterMl = numWeight > 0 ? calculateWaterTarget(numWeight, activityLevel) : 0;
  const previewMacros =
    previewTargetKcal > 0 && numWeight > 0
      ? calculateMacros(previewTargetKcal, numWeight, goal)
      : { proteinG: 0, carbsG: 0, fatG: 0 };

  // When user selects gender in registration, automatically assign corresponding 3D model
  const handleGenderChange = (selected: Gender) => {
    setGender(selected);
    const newAvatar = selected === 'feminino' ? FEMALE_DEFAULT_AVATAR : MALE_DEFAULT_AVATAR;
    setAvatarUrl(newAvatar);
    if (selected === 'feminino' || selected === 'masculino') {
      setPreviewMascotGender(selected);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = localStorage.getItem('nutriquest_user_v1');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        onLoginSuccess({ ...DEFAULT_USER, ...parsed }, false);
        return;
      } catch (err) {}
    }
    onLoginSuccess(DEFAULT_USER, false);
  };

  const handleQuickDemoLogin = () => {
    onLoginSuccess(DEFAULT_USER, false);
  };

  const handleFinishRegistration = () => {
    const finalAge = numAge || 25;
    const finalHeight = numHeight || 170;
    const finalWeight = numWeight || 70;
    const finalTargetWeight = numTargetWeight || finalWeight;

    const tmb = calculateTMB(finalWeight, finalHeight, finalAge, gender);
    const tdee = calculateTDEE(tmb, activityLevel);
    const targetKcal = calculateTargetCalories(tdee, goal);
    const targetWater = calculateWaterTarget(finalWeight, activityLevel);
    const macros = calculateMacros(targetKcal, finalWeight, goal);

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'NutriBubby',
      email: email.trim() || 'nutribubby@metasfitquest.com',
      avatarUrl: avatarUrl || (gender === 'feminino' ? FEMALE_DEFAULT_AVATAR : MALE_DEFAULT_AVATAR),
      age: finalAge,
      gender,
      height: finalHeight,
      weight: finalWeight,
      targetWeight: finalTargetWeight,
      activityLevel,
      goal,
      tmb,
      tdee,
      targetCalories: targetKcal,
      targetWaterMl: targetWater,
      targetProteinG: macros.proteinG,
      targetCarbsG: macros.carbsG,
      targetFatG: macros.fatG,
    };

    onLoginSuccess(newUser, true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Cabeçalho MFQ - Banner no topo da autenticação */}
      <div className="max-w-6xl mx-auto w-full mb-6 relative z-10">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950 group">
          <img
            src="/assets/aistudio/Cabe_alho_MFQ_ead4cb75.png"
            alt="Cabeçalho MFQ - Mapa da Aventura"
            className="w-full h-auto max-h-36 sm:max-h-48 md:max-h-56 object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start relative z-10">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Brand, 3D Mascot Preview & Features List     */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand Logo & Header */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center p-1 shrink-0">
              <img
                src="/assets/aistudio/Logo_MetaFitQuest_8363d166.png"
                alt="Logo MetaFitQuest"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-tight text-white">
                  Metas<span className="text-emerald-400">FitQuest</span>
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded border border-emerald-500/30">
                  +XP
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-medium">
                Controle sua vida e otimize com mais XP
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-snug">
              Transforme hábitos em metas com <span className="text-emerald-400">recompensas e XP</span>.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              O ecossistema definitivo para dieta, hidratação científica e treinos A, B, C, D personalizados com seu atleta interativo.
            </p>
          </div>

          {/* Interactive Mascot NutriBuddy Card (with Gender Toggle) */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mascote NutriBuddy 3D</span>
              </span>

              {/* Quick Gender Switcher for the Mascot */}
              <div className="flex items-center bg-slate-900/80 rounded-xl p-1 gap-1 border border-slate-700/80 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewMascotGender('masculino')}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    previewMascotGender === 'masculino'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ♂ Masculino
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMascotGender('feminino')}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    previewMascotGender === 'feminino'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ♀ Feminino
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <Mascot
                mood="happy"
                gender={previewMascotGender}
                speech="Olá! Sou o NutriBuddy! Vamos conquistar suas metas com muito XP?"
                size="md"
              />
            </div>
          </div>

          {/* Dedicated Features List Card (NO OVERLAPPING TEXT) */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recursos de Alta Performance:
            </h3>

            {/* Feature 1: Camera Recognition */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/50 border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Camera className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">
                  Reconhecimento Visual com IA
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                  Fotografe pratos ou escaneie códigos de barra para identificar calorias e macros instantaneamente.
                </p>
              </div>
            </div>

            {/* Feature 2: Water */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/50 border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">
                  Hidratação Inteligente & Notificações
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                  Metas de água calculadas pela massa corporal e avisos agendáveis direto no navegador.
                </p>
              </div>
            </div>

            {/* Feature 3: Medalhas / HealthCoins */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/50 border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">
                  HealthCoins, Streaks & Insígnias
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                  Ganhe moedas completando treinos, desafios comunitários e suba no ranking oficial.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Auth Card (Login or Register & Onboarding)  */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col justify-between">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setOnboardingStep(1);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span>Entrar na Conta</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Cadastrar & Onboarding</span>
            </button>
          </div>

          {/* --- 1. LOGIN TAB --- */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Bem-vindo de volta!
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Insira seus dados para continuar sua jornada e otimizar com mais XP.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com.br"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no MetasFitQuest</span>
                </button>

                {/* DEMO BUTTON ALTERADO PARA NutriBubby CONFORME SOLICITADO */}
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Entrar com Conta de Demonstração (NutriBubby)</span>
                </button>
              </div>

              <div className="pt-4 text-center">
                <p className="text-xs text-slate-500">
                  Ainda não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Criar conta com avaliação personalizada
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* --- 2. REGISTER & ONBOARDING TAB --- */}
          {authMode === 'register' && (
            <div className="space-y-4">
              {/* Stepper Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    {onboardingStep === 1 && 'Etapa 1: Dados & Escolha do Avatar'}
                    {onboardingStep === 2 && 'Etapa 2: Biometria & Metas de Peso'}
                    {onboardingStep === 3 && 'Etapa 3: Nível de Atividade & Foco'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Passo {onboardingStep} de 3 · Personalização Científica
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        onboardingStep >= s
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Conta, Gênero Biológico e Avatar Correspondente */}
              {onboardingStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Seu Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Carlos Eduardo ou NutriBuddy"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com.br"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Idade (anos) *
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Ex: 26"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Gênero Biológico com Atualização Automática de Avatar */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gênero Biológico (para TMB e Avatar)
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => handleGenderChange(e.target.value as Gender)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
                      >
                        <option value="masculino">Masculino ♂ (Avatar Atleta Masculino)</option>
                        <option value="feminino">Feminino ♀ (Avatar Atleta Feminina)</option>
                        <option value="outro">Outro / Neutro</option>
                      </select>
                    </div>
                  </div>

                  {/* Avatar Selection & Customization Section */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md shrink-0 bg-gradient-to-b from-slate-100/80 to-slate-200/60 p-1 flex items-center justify-center">
                        <img
                          src={avatarUrl}
                          alt="Avatar Selecionado"
                          className="smooth-avatar w-full h-full object-contain drop-shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-1">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            Avatar Oficial do Usuário
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                            {gender === 'feminino' ? 'Modelo Feminino 3D ♀' : 'Modelo Masculino 3D ♂'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Ao escolher o gênero biológico, seu modelo oficial é vinculado automaticamente. Você também pode personalizar com as opções abaixo:
                        </p>
                      </div>
                    </div>

                    {/* Quick Avatar Actions: Camera, Upload, AI, 3D Presets */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => openAvatarPicker('camera')}
                        className="p-2 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        title="Tirar uma selfie com a câmera do dispositivo"
                      >
                        <Camera className="w-3.5 h-3.5 text-sky-600" />
                        <span>Tirar Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openAvatarPicker('upload')}
                        className="p-2 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        title="Carregar foto da galeria ou computador"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Carregar Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openAvatarPicker('ai')}
                        className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[11px] font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Gerar avatar com inteligência artificial estilizado"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Criar com IA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openAvatarPicker('presets')}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Ver galeria de modelos 3D"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Modelos 3D</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Altura, Peso Atual e Meta */}
              {onboardingStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Altura (cm) *
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="240"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Ex: 175"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Peso Atual (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="30"
                        max="250"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Ex: 75"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Meta de Peso (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="30"
                        max="250"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        placeholder="Ex: 70"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {previewWaterMl > 0 && (
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-900">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-sky-600" />
                        <span>Meta de Hidratação Calculada:</span>
                      </div>
                      <span className="font-mono font-bold text-sky-800">{previewWaterMl} ml/dia</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Nível de Atividade & Objetivo Fisiológico */}
              {onboardingStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nível de Atividade Física Diária
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(['sedentario', 'leve', 'moderado', 'intenso'] as ActivityLevel[]).map((act) => (
                        <button
                          key={act}
                          type="button"
                          onClick={() => setActivityLevel(act)}
                          className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                            activityLevel === act
                              ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold shadow-2xs'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="block capitalize font-bold">{ACTIVITY_LABELS[act]?.label || act}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {ACTIVITY_LABELS[act]?.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Objetivo Nutricional & Corporal
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'emagrecer', label: 'Emagrecer', icon: '🔥' },
                        { id: 'manter', label: 'Manutenção', icon: '⚖️' },
                        { id: 'ganhar_massa', label: 'Hipertrofia', icon: '💪' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setGoal(item.id as GoalType)}
                          className={`p-2.5 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                            goal === item.id
                              ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 shadow-2xs'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="text-base block mb-0.5">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {previewTargetKcal > 0 && (
                    <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span>Meta Calórica Diária Estimada:</span>
                        <span className="font-mono text-sm">{previewTargetKcal} kcal</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-700">
                        <span>P: {previewMacros.proteinG}g</span>
                        <span>C: {previewMacros.carbsG}g</span>
                        <span>G: {previewMacros.fatG}g</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                {onboardingStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(onboardingStep - 1)}
                    className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {onboardingStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onboardingStep === 1 && !name) {
                        setName('NutriBuddy');
                      }
                      setOnboardingStep(onboardingStep + 1);
                    }}
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                  >
                    <span>Próximo Passo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishRegistration}
                    className="py-2.5 px-4 sm:px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] text-center"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Concluir Cadastro & Iniciar Metas</span>
                    <span className="sm:hidden">Concluir Cadastro</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé MFQ - Banner no rodapé da autenticação */}
      <div className="max-w-4xl mx-auto w-full mt-8 relative z-10">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-700/80 bg-slate-950 group">
          <img
            src="/assets/aistudio/Roda_pe_MFQ_c4c1deeb.png"
            alt="Rodapé MFQ - Sua Jornada, Seu Progresso"
            className="w-full h-auto max-h-24 sm:max-h-32 object-contain sm:object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
          />
        </div>
        <p className="text-center text-[11px] text-slate-500 mt-2">
          MetaFitQuest · Sua Jornada, Seu Progresso · Saúde • Vida • Progresso
        </p>
      </div>

      {/* Avatar Picker & Webcam Modal */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        gender={gender}
        currentAvatarUrl={avatarUrl}
        initialTab={avatarPickerTab}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelectAvatar={(chosen) => setAvatarUrl(chosen)}
      />
    </div>
  );
};
