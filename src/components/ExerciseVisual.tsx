import React, { useState, useEffect } from 'react';
import { WorkoutExercise } from '../types';
import {
  Dumbbell,
  Layers,
  Eye,
  Play,
  Pause,
  Sparkles,
  Info,
  Maximize2,
  X,
  Zap,
  ArrowUp,
  ArrowDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ExerciseVisualProps {
  exercise: WorkoutExercise;
  className?: string;
  showBadge?: boolean;
  allowToggleView?: boolean;
}

export const ExerciseVisual: React.FC<ExerciseVisualProps> = ({
  exercise,
  className = '',
  showBadge = true,
  allowToggleView = true,
}) => {
  const [viewMode, setViewMode] = useState<'diagram' | 'photo'>('diagram');
  const [imgError, setImgError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'concentric' | 'eccentric' | 'peak'>('concentric');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Group colors and muscle cues
  const getGroupTheme = (group?: string) => {
    switch (group) {
      case 'peito':
        return {
          glow: 'rgba(244, 63, 94, 0.35)',
          primary: '#f43f5e',
          accent: '#fda4af',
          bg: 'from-rose-950 via-slate-900 to-slate-950',
          equipmentColor: '#cbd5e1',
          label: 'Peitoral & Tríceps',
        };
      case 'triceps':
        return {
          glow: 'rgba(245, 158, 11, 0.35)',
          primary: '#f59e0b',
          accent: '#fde68a',
          bg: 'from-amber-950 via-slate-900 to-slate-950',
          equipmentColor: '#cbd5e1',
          label: 'Tríceps Braquial',
        };
      case 'pernas':
        return {
          glow: 'rgba(16, 185, 129, 0.35)',
          primary: '#10b981',
          accent: '#a7f3d0',
          bg: 'from-emerald-950 via-slate-900 to-slate-950',
          equipmentColor: '#94a3b8',
          label: 'Quadríceps & Glúteos',
        };
      case 'costas':
        return {
          glow: 'rgba(14, 165, 233, 0.35)',
          primary: '#0ea5e9',
          accent: '#bae6fd',
          bg: 'from-sky-950 via-slate-900 to-slate-950',
          equipmentColor: '#cbd5e1',
          label: 'Dorsais & Escápulas',
        };
      case 'biceps':
        return {
          glow: 'rgba(99, 102, 241, 0.35)',
          primary: '#6366f1',
          accent: '#c7d2fe',
          bg: 'from-indigo-950 via-slate-900 to-slate-950',
          equipmentColor: '#cbd5e1',
          label: 'Bíceps Braquial',
        };
      case 'cardio':
        return {
          glow: 'rgba(249, 115, 22, 0.35)',
          primary: '#f97316',
          accent: '#fed7aa',
          bg: 'from-orange-950 via-slate-900 to-slate-950',
          equipmentColor: '#fdba74',
          label: 'Cardiorrespiratório & Core',
        };
      case 'alongamento':
      default:
        return {
          glow: 'rgba(20, 184, 166, 0.35)',
          primary: '#14b8a6',
          accent: '#99f6e4',
          bg: 'from-teal-950 via-slate-900 to-slate-950',
          equipmentColor: '#a5f3fc',
          label: 'Mobilidade & Descompressão',
        };
    }
  };

  const theme = getGroupTheme(exercise.muscleGroup);

  // Biomechanical cycle timer: loops between concentric and eccentric phases
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev === 'concentric') return 'peak';
        if (prev === 'peak') return 'eccentric';
        return 'concentric';
      });
    }, 1300);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const animStyle = {
    animationPlayState: isPlaying ? ('running' as const) : ('paused' as const),
  };

  // Render Dynamic Biomechanical Animated SVG
  const renderBiomechanicsSVG = () => {
    const id = exercise.id.toLowerCase();

    // 1. SUPINO RETO / SUPINO INCLINADO / CRUCIFIXO / PECK DECK
    if (id.includes('supino') || id.includes('crucifixo') || id.includes('peck_deck')) {
      const isIncline = id.includes('inclinado');
      const isFly = id.includes('crucifixo');
      const isDecline = id.includes('declinado');

      return (
        <svg viewBox="0 0 300 200" className="w-full h-full select-none">
          {/* Gym Floor & Grid */}
          <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Bench Setup */}
          {isIncline ? (
            <g>
              <line x1="80" y1="180" x2="110" y2="120" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
              <line x1="110" y1="120" x2="190" y2="60" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
              <line x1="70" y1="130" x2="120" y2="130" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
              <circle cx="100" cy="180" r="4" fill="#94a3b8" />
            </g>
          ) : isDecline ? (
            <g>
              <line x1="90" y1="90" x2="210" y2="150" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
              <line x1="120" y1="180" x2="150" y2="120" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <rect x="70" y="125" width="160" height="12" rx="4" fill="#0284c7" />
              <line x1="90" y1="137" x2="90" y2="180" stroke="#64748b" strokeWidth="6" />
              <line x1="210" y1="137" x2="210" y2="180" stroke="#64748b" strokeWidth="6" />
            </g>
          )}

          {/* Athlete Static Body */}
          <g>
            <circle cx="95" cy="115" r="14" fill="#f8fafc" />
            <rect x="110" y="112" width="75" height="22" rx="8" fill="#334155" />
            {/* Glowing Pectoral Engine */}
            <rect
              x="120"
              y="110"
              width="45"
              height="14"
              rx="6"
              fill={theme.primary}
              className={currentPhase === 'peak' ? 'animate-ping opacity-90' : 'animate-pulse'}
            />
            {/* Pelvis & Legs bent */}
            <circle cx="185" cy="122" r="10" fill="#334155" />
            <path d="M 185 125 L 210 150 L 220 180" fill="none" stroke="#475569" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Dynamic Moving Arms & Barbell / Dumbbells */}
          {isFly ? (
            <g>
              {/* Left Fly Arm (Animated open/close) */}
              <g className="anim-fly-left" style={animStyle}>
                <path d="M 135 115 Q 110 85 95 70" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                <rect x="85" y="62" width="20" height="14" rx="3" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
              </g>
              {/* Right Fly Arm */}
              <g className="anim-fly-right" style={animStyle}>
                <path d="M 155 115 Q 180 85 195 70" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                <rect x="185" y="62" width="20" height="14" rx="3" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
              </g>
              {/* Motion arc guide */}
              <path d="M 85 75 Q 140 45 195 75" fill="none" stroke={theme.accent} strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            </g>
          ) : (
            // Animated Vertical Press (Arms + Olympic Barbell smoothly pumping)
            <g className="anim-press" style={animStyle}>
              <path d="M 135 115 L 140 75" fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
              <path d="M 155 115 L 160 75" fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
              {/* Olympic Barbell */}
              <line x1="60" y1="70" x2="240" y2="70" stroke="#f1f5f9" strokeWidth="5" strokeLinecap="round" />
              {/* Olympic Plates with glow */}
              <rect x="68" y="48" width="10" height="44" rx="3" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
              <rect x="80" y="54" width="8" height="32" rx="2" fill="#ef4444" />
              <rect x="222" y="48" width="10" height="44" rx="3" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
              <rect x="212" y="54" width="8" height="32" rx="2" fill="#ef4444" />
              {/* Vertical velocity indicator */}
              <circle cx="150" cy="70" r="3" fill="#f43f5e" />
            </g>
          )}

          {/* Muscle Focus Label */}
          <text x="150" y="28" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold" letterSpacing="0.5">
            PEITORAL MAIOR · FASE {currentPhase === 'concentric' ? 'CONCÊNTRICA ⬆️' : currentPhase === 'peak' ? 'PICO DE TENSÃO ⚡' : 'EXCÊNTRICA ⬇️'}
          </text>
        </svg>
      );
    }

    // 2. FLEXÃO DE BRAÇO / CROSSOVER / DIPS
    if (id.includes('crossover') || id.includes('dips') || id.includes('flexao')) {
      if (id.includes('flexao')) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="170" x2="280" y2="170" stroke="#475569" strokeWidth="3" />
            {/* Whole body dips down and up */}
            <g className="anim-pushup" style={animStyle}>
              <circle cx="230" cy="115" r="13" fill="#f8fafc" />
              <path d="M 220 125 L 120 150 L 60 165" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
              <circle cx="190" cy="135" r="10" fill={theme.primary} className="animate-pulse" />
              <path d="M 195 135 L 210 170" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
            </g>
            <text x="150" y="32" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
              FLEXÃO DE BRAÇO · TENSÃO MECÂNICA DINÂMICA
            </text>
          </svg>
        );
      }

      return (
        <svg viewBox="0 0 300 200" className="w-full h-full select-none">
          <rect x="30" y="20" width="16" height="160" rx="3" fill="#334155" />
          <rect x="254" y="20" width="16" height="160" rx="3" fill="#334155" />
          <line x1="46" y1="35" x2="130" y2="105" stroke="#f59e0b" strokeWidth="3" strokeDasharray="3 3" />
          <line x1="254" y1="35" x2="170" y2="105" stroke="#f59e0b" strokeWidth="3" strokeDasharray="3 3" />
          <circle cx="150" cy="70" r="14" fill="#f8fafc" />
          <path d="M 150 85 L 150 140 L 135 180 M 150 140 L 165 180" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
          <circle cx="150" cy="98" r="9" fill={theme.primary} className="animate-pulse" />
          {/* Animated crossing hands */}
          <g className="anim-fly-left" style={animStyle}>
            <path d="M 150 92 L 130 112" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          </g>
          <g className="anim-fly-right" style={animStyle}>
            <path d="M 150 92 L 170 112" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          </g>
          <text x="150" y="192" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">
            CROSSOVER · ADUÇÃO HORIZONTAL COM CABOS
          </text>
        </svg>
      );
    }

    // 3. TRÍCEPS (Corda, Testa, Francês, Barra Reta, Coice, Mergulho)
    if (exercise.muscleGroup === 'triceps') {
      const isDipsBench = id.includes('mergulho');
      const isLyingExtension = id.includes('testa') || id.includes('frances');

      if (isDipsBench) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="50" y="115" width="60" height="20" rx="4" fill="#0284c7" />
            <line x1="70" y1="135" x2="70" y2="180" stroke="#64748b" strokeWidth="6" />
            {/* Athlete dipping on bench */}
            <g className="anim-pushup" style={animStyle}>
              <circle cx="120" cy="85" r="13" fill="#f8fafc" />
              <path d="M 120 98 L 120 145 L 180 180" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
              <path d="M 120 105 L 85 115" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
              <circle cx="102" cy="110" r="7" fill={theme.primary} className="animate-pulse" />
            </g>
            <text x="150" y="32" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
              MERGULHO NO BANCO · EXTENSÃO DE TRÍCEPS COM PESO DO CORPO
            </text>
          </svg>
        );
      }

      if (isLyingExtension) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="70" y="125" width="160" height="12" rx="4" fill="#0284c7" />
            <line x1="90" y1="137" x2="90" y2="180" stroke="#64748b" strokeWidth="6" />
            <line x1="210" y1="137" x2="210" y2="180" stroke="#64748b" strokeWidth="6" />
            {/* Athlete Head and Torso */}
            <circle cx="95" cy="115" r="14" fill="#f8fafc" />
            <rect x="110" y="112" width="75" height="22" rx="8" fill="#334155" />
            <path d="M 185 125 L 210 150 L 220 180" fill="none" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
            {/* Upper arm vertical, forearm hinging back to forehead */}
            <line x1="130" y1="115" x2="130" y2="75" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
            <circle cx="130" cy="90" r="7" fill={theme.primary} className="animate-pulse" />
            <g className="anim-curl" style={animStyle}>
              <line x1="130" y1="75" x2="95" y2="90" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
              <circle cx="95" cy="90" r="10" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
            </g>
            <text x="150" y="28" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
              TRÍCEPS TESTA COM BARRA W · CABEÇA LONGA E LATERAL
            </text>
          </svg>
        );
      }

      // Default Pulley Rope or Bar
      return (
        <svg viewBox="0 0 300 200" className="w-full h-full select-none">
          <rect x="135" y="10" width="30" height="14" rx="3" fill="#475569" />
          <line x1="150" y1="24" x2="150" y2="70" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="120" cy="75" r="14" fill="#f8fafc" />
          <path d="M 120 90 L 120 145 L 110 180 M 120 145 L 135 180" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
          <path d="M 120 95 L 140 108" stroke="#475569" strokeWidth="7" />
          <circle cx="132" cy="100" r="7" fill={theme.primary} className="animate-pulse" />
          {/* Dynamic Extending Forearms & Rope */}
          <g className="anim-triceps" style={animStyle}>
            <path d="M 140 108 L 145 145" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
            <path d="M 140 145 L 152 155 M 140 145 L 130 155" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          </g>
          <text x="150" y="190" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
            TRÍCEPS POLIA CORDA · FASE {currentPhase === 'concentric' ? 'ABERTURA MÁXIMA ⚡' : 'CONTROLE EXCÊNTRICO ⬇️'}
          </text>
        </svg>
      );
    }

    // 4. PERNAS & GLÚTEOS (Agachamento, Leg Press, Extensora, Flexora, Pélvica, Panturrilha, Stiff, Afundo)
    if (exercise.muscleGroup === 'pernas') {
      const isLegPress = id.includes('leg_press');
      const isExtensora = id.includes('extensora');
      const isFlexora = id.includes('flexora');
      const isPelvica = id.includes('pelvica') || id.includes('hip_thrust');
      const isPanturrilha = id.includes('panturrilha');
      const isStiff = id.includes('stiff');

      // 4A. Cadeira Extensora
      if (isExtensora) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="90" y="100" width="20" height="60" rx="4" fill="#0284c7" />
            <rect x="90" y="135" width="75" height="14" rx="4" fill="#0284c7" />
            <circle cx="100" cy="85" r="13" fill="#f8fafc" />
            {/* Seated Thigh */}
            <path d="M 100 135 L 165 135" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
            <circle cx="135" cy="130" r="9" fill={theme.primary} className="animate-pulse" />
            {/* Animated Lower Leg Kicking Upwards */}
            <g className="anim-leg-ext" style={animStyle}>
              <line x1="165" y1="135" x2="165" y2="175" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" />
              <circle cx="165" cy="170" r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
            </g>
            <text x="150" y="32" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
              CADEIRA EXTENSORA · ISOLAMENTO DE RETO FEMORAL & VASTOS
            </text>
          </svg>
        );
      }

      // 4B. Mesa Flexora
      if (isFlexora) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="70" y1="145" x2="230" y2="145" stroke="#0284c7" strokeWidth="12" strokeLinecap="round" />
            <circle cx="215" cy="130" r="13" fill="#f8fafc" />
            <path d="M 205 140 L 120 140" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
            <circle cx="150" cy="135" r="8" fill={theme.primary} className="animate-pulse" />
            {/* Animated Leg Curling up to glutes */}
            <g className="anim-hamstring" style={animStyle}>
              <line x1="120" y1="140" x2="65" y2="140" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" />
              <circle cx="70" cy="140" r="9" fill="#10b981" stroke="#fff" strokeWidth="2" />
            </g>
            <text x="150" y="35" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
              MESA FLEXORA · CONTRAÇÃO DE ISQUIOTIBIAIS (POSTERIOR DE COXA)
            </text>
          </svg>
        );
      }

      // 4C. Elevação Pélvica / Hip Thrust
      if (isPelvica) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="60" y="130" width="35" height="40" rx="4" fill="#0284c7" />
            {/* Athlete Hip Thrusting Upwards */}
            <g className="anim-hip-thrust" style={animStyle}>
              <circle cx="75" cy="120" r="12" fill="#f8fafc" />
              <path d="M 80 130 L 140 135 L 180 175" stroke="#334155" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="140" cy="135" r="10" fill={theme.primary} className="animate-pulse" />
              {/* Olympic Barbell over hips */}
              <circle cx="140" cy="125" r="9" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
            </g>
            <text x="150" y="32" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
              ELEVAÇÃO PÉLVICA · PICO DE HIPERTROFIA DE GLÚTEO MÁXIMO
            </text>
          </svg>
        );
      }

      // 4D. Panturrilha em Pé
      if (isPanturrilha) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="130" y="170" width="50" height="10" rx="2" fill="#475569" />
            {/* Athlete rising on toes */}
            <g className="anim-calf-raise" style={animStyle}>
              <circle cx="150" cy="65" r="14" fill="#f8fafc" />
              <path d="M 150 80 L 150 130 L 145 170 M 150 130 L 155 170" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
              <circle cx="145" cy="150" r="7" fill={theme.primary} className="animate-pulse" />
              <circle cx="155" cy="150" r="7" fill={theme.primary} className="animate-pulse" />
              <ellipse cx="150" cy="172" rx="10" ry="4" fill="#10b981" />
            </g>
            <text x="150" y="32" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
              PANTURRILHA EM PÉ · FLEXÃO PLANTAR DE GASTROCNÊMIO E SÓLEO
            </text>
          </svg>
        );
      }

      // 4E. Stiff com Halteres / Barra
      if (isStiff) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            {/* Athlete hip hinging with back straight */}
            <g className="anim-row" style={animStyle}>
              <circle cx="130" cy="75" r="13" fill="#f8fafc" />
              <path d="M 130 88 L 155 125 L 150 175" stroke="#334155" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="155" cy="140" r="8" fill={theme.primary} className="animate-pulse" />
              {/* Barbell hanging vertically */}
              <line x1="120" y1="100" x2="120" y2="155" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
              <circle cx="120" cy="155" r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
            </g>
            <text x="150" y="30" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
              STIFF COM HALTERES · CADEIA POSTERIOR & GLÚTEOS
            </text>
          </svg>
        );
      }

      // 4F. Leg Press 45º
      if (isLegPress) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="60" y1="160" x2="240" y2="40" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
            <rect x="70" y="125" width="45" height="16" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="3" transform="rotate(-33 92 133)" />
            <circle cx="80" cy="115" r="12" fill="#f8fafc" />
            <g className="anim-legpress" style={animStyle}>
              <rect x="180" y="55" width="40" height="25" rx="4" fill="#0284c7" stroke="#fff" strokeWidth="2" transform="rotate(-33 200 67)" />
              <path d="M 85 125 L 130 140 L 175 90" stroke="#334155" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 98 128 L 132 140" stroke={theme.primary} strokeWidth="7" strokeLinecap="round" className="animate-pulse" />
            </g>
            <text x="150" y="190" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
              LEG PRESS 45º · FORÇA E HIPERTROFIA DE QUADRÍCEPS
            </text>
          </svg>
        );
      }

      // 4G. Default Squat (Agachamento Livre)
      return (
        <svg viewBox="0 0 300 200" className="w-full h-full select-none">
          <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="3" />
          <line x1="70" y1="40" x2="70" y2="180" stroke="#64748b" strokeWidth="5" />
          <line x1="230" y1="40" x2="230" y2="180" stroke="#64748b" strokeWidth="5" />
          <g className="anim-squat" style={animStyle}>
            <circle cx="150" cy="72" r="13" fill="#f8fafc" />
            <line x1="100" y1="84" x2="200" y2="84" stroke="#f1f5f9" strokeWidth="5" strokeLinecap="round" />
            <rect x="105" y="68" width="12" height="32" rx="3" fill="#10b981" stroke="#fff" strokeWidth="1" />
            <rect x="183" y="68" width="12" height="32" rx="3" fill="#10b981" stroke="#fff" strokeWidth="1" />
            <path d="M 150 86 L 150 118 L 125 145 L 140 180" stroke="#334155" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="136" cy="130" r="8" fill={theme.primary} className="animate-pulse" />
          </g>
          <text x="150" y="28" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
            AGACHAMENTO LIVRE · QUADRÍCEPS, GLÚTEOS & CORE
          </text>
        </svg>
      );
    }

    // 5. COSTAS / DORSAIS (Puxada Alta, Barra Fixa, Remada Curvada, Cavalinho, Serrote)
    if (exercise.muscleGroup === 'costas') {
      const isPullUp = id.includes('barra_fixa');
      const isRow = id.includes('remada') || id.includes('cavalinho') || id.includes('serrote');

      // 5A. Barra Fixa
      if (isPullUp) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            {/* Pull Up Rig */}
            <line x1="50" y1="35" x2="250" y2="35" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
            <line x1="60" y1="35" x2="60" y2="180" stroke="#334155" strokeWidth="6" />
            <line x1="240" y1="35" x2="240" y2="180" stroke="#334155" strokeWidth="6" />
            {/* Athlete pulling body up to bar */}
            <g className="anim-pullup" style={animStyle}>
              <circle cx="150" cy="50" r="13" fill="#f8fafc" />
              <path d="M 135 60 L 165 60 L 158 100 L 142 100 Z" fill={theme.primary} className="animate-pulse" />
              <path d="M 135 60 L 115 35 M 165 60 L 185 35" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
              <path d="M 150 100 L 145 140 M 150 100 L 155 140" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
            </g>
            <text x="150" y="190" textAnchor="middle" fill="#0ea5e9" fontSize="10" fontWeight="bold">
              BARRA FIXA · FORÇA REAL E ATIVAÇÃO MÁXIMA DE DORSAIS
            </text>
          </svg>
        );
      }

      // 5B. Remadas (Curvada, Cavalinho, Serrote)
      if (isRow) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="120" cy="80" r="13" fill="#f8fafc" />
            <path d="M 120 92 L 160 120 L 155 175" stroke="#334155" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 135 95 L 160 115" stroke={theme.primary} strokeWidth="8" strokeLinecap="round" className="animate-pulse" />
            {/* Animated Rowing Barbell */}
            <g className="anim-row" style={animStyle}>
              <line x1="130" y1="100" x2="120" y2="145" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
              <circle cx="120" cy="145" r="9" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
            </g>
            <text x="150" y="32" textAnchor="middle" fill="#0ea5e9" fontSize="10" fontWeight="bold">
              REMADA CURVADA · RETRAÇÃO ESCAPULAR & ESPESSURA DE DORSAIS
            </text>
          </svg>
        );
      }

      // 5C. Puxada Alta
      return (
        <svg viewBox="0 0 300 200" className="w-full h-full select-none">
          <line x1="150" y1="10" x2="150" y2="35" stroke="#94a3b8" strokeWidth="4" />
          <g className="anim-pull" style={animStyle}>
            <line x1="60" y1="35" x2="240" y2="35" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
            <circle cx="150" cy="75" r="14" fill="#f8fafc" />
            <path d="M 130 90 L 170 90 L 158 135 L 142 135 Z" fill={theme.primary} className="animate-pulse" />
            <path d="M 135 90 L 95 42 M 165 90 L 205 42" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
            <path d="M 150 135 L 145 175 M 150 135 L 155 175" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
          </g>
          <text x="150" y="190" textAnchor="middle" fill="#0ea5e9" fontSize="10" fontWeight="bold">
            PUXADA ALTA NA POLIA · EXPANSÃO DORSAL & LATÍSSIMO
          </text>
        </svg>
      );
    }

    // 6. BÍCEPS (Rosca Direta, Rosca Martelo, Scott, 21, Concentrada)
    if (exercise.muscleGroup === 'biceps') {
      const isScott = id.includes('scott');
      const isHammer = id.includes('martelo');

      if (isScott) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            {/* Scott Bench angled pad */}
            <line x1="110" y1="140" x2="165" y2="95" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" />
            <circle cx="95" cy="90" r="13" fill="#f8fafc" />
            <path d="M 100 102 L 120 140 L 115 180" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
            <circle cx="135" cy="110" r="8" fill={theme.primary} className="animate-pulse" />
            {/* Forearm curling from pad */}
            <g className="anim-curl" style={animStyle}>
              <line x1="160" y1="100" x2="140" y2="65" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
              <circle cx="140" cy="65" r="9" fill="#6366f1" stroke="#fff" strokeWidth="2" />
            </g>
            <text x="150" y="32" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="bold">
              BANCO SCOTT · ISOLAMENTO TOTAL SEM ROUBO DE DELTOIDE
            </text>
          </svg>
        );
      }

      if (isHammer) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <circle cx="150" cy="55" r="14" fill="#f8fafc" />
            <path d="M 150 70 L 150 135 L 140 180 M 150 135 L 160 180" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
            {/* Neutral grip dumbbell curl */}
            <g className="anim-curl" style={animStyle}>
              <path d="M 150 78 L 130 100 L 122 75" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
              <path d="M 150 78 L 170 100 L 178 75" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
              <rect x="117" y="65" width="10" height="22" rx="3" fill="#cbd5e1" stroke="#4f46e5" strokeWidth="2" />
              <rect x="173" y="65" width="10" height="22" rx="3" fill="#cbd5e1" stroke="#4f46e5" strokeWidth="2" />
            </g>
            <text x="150" y="190" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="bold">
              ROSCA MARTELO · FOCO EM BRAQUIAL & BRAQUIORRADIAL
            </text>
          </svg>
        );
      }

      // Default Rosca Direta W
      return (
        <svg viewBox="0 0 300 200" className="w-full h-full select-none">
          <circle cx="150" cy="55" r="14" fill="#f8fafc" />
          <path d="M 150 70 L 150 135 L 140 180 M 150 135 L 160 180" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
          <g className="anim-curl" style={animStyle}>
            <path d="M 150 78 L 130 100 L 122 75" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 150 78 L 170 100 L 178 75" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="128" cy="90" r="9" fill={theme.primary} className="animate-pulse" />
            <circle cx="172" cy="90" r="9" fill={theme.primary} className="animate-pulse" />
            <rect x="110" y="68" width="24" height="12" rx="3" fill="#cbd5e1" stroke="#4f46e5" strokeWidth="2" />
            <rect x="166" y="68" width="24" height="12" rx="3" fill="#cbd5e1" stroke="#4f46e5" strokeWidth="2" />
          </g>
          <text x="150" y="190" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="bold">
            ROSCA DIRETA BARRA W · PICO DE CONTRAÇÃO DO BÍCEPS
          </text>
        </svg>
      );
    }

    // 7. CARDIO & CORE (Esteira, Prancha, Pular Corda, Bicicleta, Abdominal, Mountain Climbers)
    if (exercise.muscleGroup === 'cardio') {
      const isPlank = id.includes('prancha');
      const isJumpRope = id.includes('pular_corda');
      const isBike = id.includes('bicicleta');
      const isCrunch = id.includes('abdominal');
      const isClimber = id.includes('mountain') || id.includes('burpees');

      // 7A. Pular Corda
      if (isJumpRope) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="3" />
            {/* Athlete jumping up and down */}
            <g className="anim-jumprope-jump" style={animStyle}>
              <circle cx="150" cy="70" r="13" fill="#f8fafc" />
              <path d="M 150 83 L 150 130 L 142 165 M 150 130 L 158 165" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
              <path d="M 150 92 L 128 115 M 150 92 L 172 115" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
            </g>
            {/* Rotating Rope */}
            <g className="anim-jumprope-rope" style={animStyle}>
              <ellipse cx="150" cy="110" rx="45" ry="60" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="6 3" />
            </g>
            <text x="150" y="30" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">
              PULAR CORDA · AGILIDADE, GASTO CALÓRICO & PANTURRILHA
            </text>
          </svg>
        );
      }

      // 7B. Bicicleta Ergométrica
      if (isBike) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="3" />
            {/* Stationary Bike Frame */}
            <path d="M 90 180 L 120 120 L 150 145 L 200 100 L 220 180" fill="none" stroke="#64748b" strokeWidth="5" strokeLinejoin="round" />
            <circle cx="110" cy="175" r="16" fill="none" stroke="#94a3b8" strokeWidth="4" />
            <circle cx="210" cy="175" r="16" fill="none" stroke="#94a3b8" strokeWidth="4" />
            <rect x="105" y="112" width="25" height="8" rx="2" fill="#0284c7" />
            {/* Athlete Pedaling */}
            <circle cx="130" cy="70" r="13" fill="#f8fafc" />
            <path d="M 130 83 L 120 120 M 130 88 L 180 100" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
            {/* Rotating Pedals */}
            <g className="anim-bike-pedal" style={animStyle}>
              <circle cx="150" cy="145" r="6" fill="#f97316" />
              <line x1="150" y1="145" x2="165" y2="135" stroke="#f1f5f9" strokeWidth="4" />
              <line x1="150" y1="145" x2="135" y2="155" stroke="#f1f5f9" strokeWidth="4" />
            </g>
            <text x="150" y="30" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">
              BICICLETA ERGOMÉTRICA · CONDICIONAMENTO SEM IMPACTO ARTICULAR
            </text>
          </svg>
        );
      }

      // 7C. Abdominal Supra / Crunch
      if (isCrunch) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="170" x2="280" y2="170" stroke="#475569" strokeWidth="3" />
            {/* Legs bent on floor */}
            <path d="M 175 165 L 205 130 L 225 170" stroke="#334155" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            {/* Curling Torso */}
            <g className="anim-crunch" style={animStyle}>
              <circle cx="85" cy="135" r="13" fill="#f8fafc" />
              <line x1="95" y1="142" x2="175" y2="165" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
              <circle cx="140" cy="155" r="9" fill={theme.primary} className="animate-pulse" />
              <path d="M 90 135 L 75 125" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
            </g>
            <text x="150" y="35" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">
              ABDOMINAL SUPRA · FLEXÃO DE TRONCO & RETO ABDOMINAL
            </text>
          </svg>
        );
      }

      // 7D. Prancha Isométrica
      if (isPlank) {
        return (
          <svg viewBox="0 0 300 200" className="w-full h-full select-none">
            <line x1="20" y1="165" x2="280" y2="165" stroke="#475569" strokeWidth="3" />
            <circle cx="230" cy="118" r="12" fill="#f8fafc" />
            <line x1="220" y1="125" x2="70" y2="155" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
            <rect x="120" y="132" width="60" height="14" rx="5" fill="#f97316" className="animate-ping opacity-75" />
            <rect x="120" y="132" width="60" height="14" rx="5" fill="#f97316" />
            <path d="M 210 130 L 210 165" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
            <path d="M 70 155 L 65 165" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
            <text x="150" y="45" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="bold">
              PRANCHA ISOMÉTRICA · ESTABILIZAÇÃO DO TRANSVERSO ABDOMINAL
            </text>
          </svg>
        );
      }

      // 7E. Running / Esteira
      return (
        <svg viewBox="0 0 300 200" className="w-full h-full select-none">
          <line x1="30" y1="170" x2="270" y2="170" stroke="#475569" strokeWidth="3" />
          <circle cx="165" cy="65" r="13" fill="#f8fafc" />
          <path d="M 160 78 L 145 115" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
          <g className="anim-run-front" style={animStyle}>
            <path d="M 145 115 L 180 145 L 205 170" stroke="#334155" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 155 85 L 185 98" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
          </g>
          <g className="anim-run-back" style={animStyle}>
            <path d="M 145 115 L 115 135 L 90 130" stroke="#334155" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 155 85 L 125 78" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
          </g>
          <line x1="70" y1="80" x2="110" y2="80" stroke="#fb923c" strokeWidth="2" strokeDasharray="6 4" />
          <text x="150" y="190" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">
            ESTEIRA · CONDICIONAMENTO, RESISTÊNCIA & GASTO CALÓRICO
          </text>
        </svg>
      );
    }

    // 8. ALONGAMENTO & MOBILIDADE (Gato-Vaca, Quadríceps, Isquiotibiais, Peitoral)
    const isCatCow = id.includes('gato') || id.includes('escapular');
    const isQuadStretch = id.includes('quadriceps');

    if (isCatCow) {
      return (
        <svg viewBox="0 0 300 200" className="w-full h-full select-none">
          <line x1="30" y1="175" x2="270" y2="175" stroke="#475569" strokeWidth="3" />
          <circle cx="215" cy="115" r="13" fill="#f8fafc" />
          <line x1="205" y1="125" x2="205" y2="175" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
          <line x1="95" y1="140" x2="95" y2="175" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
          {/* Ondulating Spine */}
          <g className="anim-cat-cow" style={animStyle}>
            <path d="M 95 140 Q 150 115 205 125" fill="none" stroke="#14b8a6" strokeWidth="10" strokeLinecap="round" />
            <circle cx="150" cy="125" r="8" fill="#14b8a6" className="animate-pulse" />
          </g>
          <text x="150" y="32" textAnchor="middle" fill="#14b8a6" fontSize="10" fontWeight="bold">
            GATO-VACA · MOBILIDADE DA COLUNA & LIBERAÇÃO ESCAPULAR
          </text>
        </svg>
      );
    }

    if (isQuadStretch) {
      return (
        <svg viewBox="0 0 300 200" className="w-full h-full select-none">
          <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="3" />
          <circle cx="150" cy="55" r="14" fill="#f8fafc" />
          {/* Standing Leg */}
          <line x1="150" y1="70" x2="150" y2="125" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
          <line x1="150" y1="125" x2="150" y2="180" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
          {/* Bent leg held by hand to glute */}
          <g className="anim-stretch" style={animStyle}>
            <path d="M 150 125 L 130 160 L 132 130" stroke="#14b8a6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 150 85 L 135 130" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
            <circle cx="140" cy="140" r="7" fill="#14b8a6" className="animate-pulse" />
          </g>
          <text x="150" y="30" textAnchor="middle" fill="#14b8a6" fontSize="10" fontWeight="bold">
            ALONGAMENTO DE QUADRÍCEPS · ALONGAMENTO PASSIVO E ALINHAMENTO DO QUADRIL
          </text>
        </svg>
      );
    }

    // Default Mobilidade & Alongamento Geral
    return (
      <svg viewBox="0 0 300 200" className="w-full h-full select-none">
        <circle cx="150" cy="100" r="70" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
        <g className="anim-stretch" style={animStyle}>
          <circle cx="150" cy="55" r="14" fill="#f8fafc" />
          <path d="M 150 70 L 150 130 L 135 175 M 150 130 L 165 175" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
          <path d="M 150 80 Q 120 40 100 35 M 150 80 Q 180 40 200 35" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          <circle cx="150" cy="95" r="8" fill="#14b8a6" className="animate-pulse" />
        </g>
        <text x="150" y="192" textAnchor="middle" fill="#14b8a6" fontSize="10" fontWeight="bold">
          MOBILIDADE ARTICULAR & DESCOMPRESSÃO POSTURAL
        </text>
      </svg>
    );
  };

  return (
    <>
      <div className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group ${className}`}>
        {/* Visual content: Animated Diagram or Photo with Graceful Fallback */}
        {viewMode === 'photo' && exercise.imageUrl && !imgError ? (
          <div className="w-full h-full relative">
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className={`w-full h-full p-2 bg-gradient-to-b ${theme.bg} flex items-center justify-center relative`}>
            {renderBiomechanicsSVG()}
          </div>
        )}

        {/* Top Badges: Target Muscle & Phase Indicator */}
        {showBadge && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 flex-wrap">
            <span
              className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md backdrop-blur-md text-white border"
              style={{
                backgroundColor: `${theme.primary}dd`,
                borderColor: theme.accent,
              }}
            >
              {exercise.targetMuscle.split('(')[0].trim()}
            </span>

            {/* Rep Tempo Cadence Pill */}
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-black/70 backdrop-blur-md text-emerald-300 rounded-md border border-white/10 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" />
              <span>
                {currentPhase === 'concentric' ? 'Subida' : currentPhase === 'peak' ? 'Pico' : 'Descida'}
              </span>
            </span>
          </div>
        )}

        {/* Top-Right Interactive Toolbar: Play/Pause, Inspect & Photo Toggle */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Play/Pause Animation Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying((prev) => !prev);
            }}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl border border-slate-700/80 shadow-md backdrop-blur-md transition-all cursor-pointer"
            title={isPlaying ? 'Pausar animação biomecânica' : 'Iniciar animação biomecânica'}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            ) : (
              <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
            )}
          </button>

          {/* Toggle Photo vs Biomechanics */}
          {allowToggleView && exercise.imageUrl && !imgError && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode((prev) => (prev === 'diagram' ? 'photo' : 'diagram'));
              }}
              className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl border border-slate-700/80 shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
              title="Alternar entre ilustração técnica e foto"
            >
              {viewMode === 'diagram' ? (
                <Eye className="w-3 h-3 text-emerald-400" />
              ) : (
                <Layers className="w-3 h-3 text-sky-400" />
              )}
            </button>
          )}

          {/* Expand Details Modal */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailModalOpen(true);
            }}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl border border-slate-700/80 shadow-md backdrop-blur-md transition-all cursor-pointer"
            title="Ver detalhes biomecânicos e instruções"
          >
            <Maximize2 className="w-3 h-3 text-slate-300" />
          </button>
        </div>

        {/* Bottom Subtitle / Scientific cue */}
        <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white/90 font-medium z-10 pointer-events-none drop-shadow">
          <span className="truncate">{exercise.name}</span>
          <span className="font-mono text-emerald-300 font-bold shrink-0 ml-2">
            {exercise.repsRange}
          </span>
        </div>
      </div>

      {/* Expanded Biomechanical Inspection Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">
                    {exercise.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {exercise.scientificTarget || exercise.targetMuscle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Large Animation Canvas */}
              <div className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2 relative">
                {renderBiomechanicsSVG()}
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="px-2.5 py-1 bg-black/80 hover:bg-black text-white text-[11px] font-bold rounded-lg border border-white/20 flex items-center gap-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-amber-400" />}
                    <span>{isPlaying ? 'Pausar' : 'Animar'}</span>
                  </button>
                </div>
              </div>

              {/* Execution Cadence & Anatomy */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Séries</span>
                  <span className="font-mono font-bold text-white text-sm">{exercise.sets}</span>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Repetições</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">{exercise.repsRange}</span>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Descanso</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{exercise.restSeconds}s</span>
                </div>
              </div>

              {/* Step by step execution steps */}
              {exercise.executionGuide && exercise.executionGuide.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Instruções de Execução Correta:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {exercise.executionGuide.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-800/40 p-2 rounded-xl border border-slate-700/40">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Biomechanical Adaptation Note or Contraindications */}
              {exercise.contraindications && exercise.contraindications.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300">Atenção Biomecânica:</strong>
                    <span>{exercise.contraindications.join(' · ')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Entendi, voltar ao treino
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
