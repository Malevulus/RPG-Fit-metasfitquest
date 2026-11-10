import React, { useState } from 'react';
import { MascotMood } from '../types';
import { MessageCircle, Sparkles, Zap, Heart, Droplets } from 'lucide-react';

interface MascotProps {
  mood: MascotMood;
  speech: string;
  name?: string;
  gender?: 'masculino' | 'feminino';
  equippedItems?: string[];
  onTap?: () => void;
  size?: 'sm' | 'md' | 'lg';
  hideSpeech?: boolean;
}

const QUOTES_BY_MOOD: Record<MascotMood, string[]> = {
  sleepy: [
    'Zzz... Hora do primeiro copo d\'água!',
    'Bocejo... Que tal um café e alongamento matinal?',
    'Bom dia! Vamos acordar esse metabolismo juntos!',
  ],
  thirsty: [
    'Minhas células pedem hidratação!',
    'Glup glup... Mais um gole para turbinar o foco!',
    'A água mantém seus músculos e cérebro em 100%!',
  ],
  active: [
    'Estou pronto pro treino de hoje!',
    'Você fez escolhas saudáveis, continue assim!',
    'Vamos registrar aquele lanchinho nutritivo com XP?',
  ],
  happy: [
    'Que dia produtivo! Você tá mandando ver!',
    'Olha esse progresso nas metas, que orgulho!',
    'Seu corpo agradece cada escolha de hoje!',
  ],
  champion: [
    'INCRÍVEL! Nível Mestre da Saúde atingido hoje! 🏆',
    'Você bateu todas as metas! Recompensa e XP garantidos!',
    'Você é imparável! Continue com essa energia!',
  ],
  stuffed: [
    'Ufa, que refeição nutritiva! Hora de caminhar um pouquinho.',
    'Bateu as calorias? Equilíbrio e consistência são a chave!',
    'Muita água agora para digerir com tranquilidade!',
  ],
};

import { OFFICIAL_AVATARS } from '../assets/avatars';

const MALE_ASSETS = {
  avatar: OFFICIAL_AVATARS.male.default,
  water: OFFICIAL_AVATARS.male.water,
  tired: OFFICIAL_AVATARS.male.tired,
};

const FEMALE_ASSETS = {
  avatar: OFFICIAL_AVATARS.female.default,
  water: OFFICIAL_AVATARS.female.water,
  tired: OFFICIAL_AVATARS.female.tired,
};

export const Mascot: React.FC<MascotProps> = ({
  mood,
  speech,
  name = 'NutriBuddy',
  gender = 'masculino',
  equippedItems = [],
  onTap,
  size = 'md',
  hideSpeech = false,
}) => {
  const [bounce, setBounce] = useState(false);
  const [tapEffect, setTapEffect] = useState<string | null>(null);
  const [customQuote, setCustomQuote] = useState<string | null>(null);

  const handleMascotClick = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 500);

    const quotes = QUOTES_BY_MOOD[mood] || QUOTES_BY_MOOD.happy;
    const randomQ = quotes[Math.floor(Math.random() * quotes.length)];
    setCustomQuote(randomQ);

    const rewards = ['✨ +5 XP', '💚 Foco Total!', '💧 Beba Água!', '🔥 Força no Treino!'];
    setTapEffect(rewards[Math.floor(Math.random() * rewards.length)]);
    setTimeout(() => setTapEffect(null), 1200);

    if (onTap) onTap();
  };

  const assets = gender === 'feminino' ? FEMALE_ASSETS : MALE_ASSETS;

  // Determine character image according to mood
  let activeImage = assets.avatar;
  if (mood === 'thirsty') {
    activeImage = assets.water;
  } else if (mood === 'sleepy') {
    activeImage = assets.tired;
  }

  const dimensionClasses =
    size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-44 h-44 sm:w-52 sm:h-52' : 'w-32 h-32 sm:w-36 sm:h-36';

  return (
    <div className="relative flex flex-col items-center select-none group max-w-full">
      {/* Tap Floating XP Bubble */}
      {tapEffect && (
        <div className="absolute -top-7 animate-bounce bg-emerald-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg z-30 pointer-events-none whitespace-nowrap">
          {tapEffect}
        </div>
      )}

      {/* Speech Bubble */}
      {!hideSpeech && (
        <div className="relative mb-2 max-w-[280px] sm:max-w-xs bg-white text-slate-800 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 shadow-md transition-all duration-300 transform group-hover:-translate-y-0.5">
          <div className="flex items-start gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs leading-relaxed font-medium">
              {customQuote || speech}
            </p>
          </div>
          {/* Bubble arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200/80 rotate-45"></div>
        </div>
      )}

      {/* 3D Animated Character Container */}
      <div
        onClick={handleMascotClick}
        className={`relative cursor-pointer transition-transform duration-300 ${dimensionClasses} ${
          bounce ? 'scale-110 rotate-2' : 'hover:scale-105 active:scale-95'
        }`}
        title={`Clique para interagir com ${name}!`}
        role="button"
        tabIndex={0}
      >
        {/* Glow Aura for Champion state */}
        {mood === 'champion' && (
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full blur-md opacity-75 animate-pulse" />
        )}

        {/* Outer Frame with Transparent Floating Character */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={activeImage}
            alt={`${name} (${gender})`}
            referrerPolicy="no-referrer"
            className="smooth-avatar w-full h-full object-contain object-bottom drop-shadow-[0_12px_22px_rgba(0,0,0,0.30)] transition-all duration-300 pointer-events-none"
            style={{ imageRendering: 'auto' }}
          />

          {/* Status Badge Tag */}
          <div className="absolute bottom-0 right-0 bg-slate-900/85 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-white/20">
            {mood === 'thirsty' ? (
              <>
                <Droplets className="w-2.5 h-2.5 text-sky-400" />
                <span>Água</span>
              </>
            ) : mood === 'sleepy' ? (
              <span>Zzz</span>
            ) : mood === 'champion' ? (
              <>
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>XP Top</span>
              </>
            ) : (
              <>
                <Zap className="w-2.5 h-2.5 text-emerald-400" />
                <span>+XP</span>
              </>
            )}
          </div>
        </div>

        {/* Gender indicator dot */}
        <div
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-md ${
            gender === 'feminino' ? 'bg-pink-500 text-white' : 'bg-red-500 text-white'
          }`}
          title={gender === 'feminino' ? 'Versão Feminina' : 'Versão Masculina'}
        >
          {gender === 'feminino' ? '♀' : '♂'}
        </div>
      </div>

      <span className="text-[10px] font-bold text-slate-500 mt-1.5 tracking-wide">
        {name} · {gender === 'feminino' ? 'Atleta Feminina' : 'Atleta Masculino'}
      </span>
    </div>
  );
};
