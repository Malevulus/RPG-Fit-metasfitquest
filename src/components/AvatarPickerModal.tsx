import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  Check,
  RotateCcw,
  Zap,
  Wand2,
  Shield,
  Palette,
  Flame,
  Award,
} from 'lucide-react';
import { OFFICIAL_AVATARS } from '../assets/avatars';

interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatarUrl?: string;
  gender: 'masculino' | 'feminino' | 'outro';
  initialTab?: 'presets' | 'upload' | 'camera' | 'ai';
  onClose: () => void;
  onSelectAvatar: (avatarUrl: string) => void;
}

const AI_STYLED_PRESETS = [
  {
    id: 'ai_male_power',
    name: 'Atleta Campeão 3D',
    gender: 'masculino',
    url: OFFICIAL_AVATARS.male.default,
  },
  {
    id: 'ai_female_power',
    name: 'Atleta Campeã 3D',
    gender: 'feminino',
    url: OFFICIAL_AVATARS.female.default,
  },
  {
    id: 'ai_male_hydrated',
    name: 'Foco & Hidratação',
    gender: 'masculino',
    url: OFFICIAL_AVATARS.male.water,
  },
  {
    id: 'ai_female_hydrated',
    name: 'Foco & Hidratação',
    gender: 'feminino',
    url: OFFICIAL_AVATARS.female.water,
  },
  {
    id: 'ai_male_tired',
    name: 'Superando o Cansaço',
    gender: 'masculino',
    url: OFFICIAL_AVATARS.male.tired,
  },
  {
    id: 'ai_female_tired',
    name: 'Superando o Cansaço',
    gender: 'feminino',
    url: OFFICIAL_AVATARS.female.tired,
  },
];

const AI_STYLES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon Hero',
    badge: 'Futurista',
    colors: ['#06b6d4', '#ec4899', '#3b82f6'],
    bgGradient: 'from-cyan-950 via-slate-900 to-fuchsia-950',
    description: 'Iluminação neon intensa, traços cibernéticos e óculos táticos luminosos.',
  },
  {
    id: 'anime_shonen',
    name: 'Anime Campeão Shonen',
    badge: 'Aura de Poder',
    colors: ['#f59e0b', '#ef4444', '#eab308'],
    bgGradient: 'from-amber-950 via-slate-900 to-rose-950',
    description: 'Estilo dinâmico com aura de energia pura, olhar focado e chamas de determinação.',
  },
  {
    id: 'pixar_3d',
    name: 'Animação 3D Heroica',
    badge: 'Estilo Estúdio',
    colors: ['#10b981', '#14b8a6', '#0ea5e9'],
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    description: 'Renderização 3D polida, iluminação cinematográfica e uniforme atlético premium.',
  },
  {
    id: 'comic_book',
    name: 'Comic Book Marvel/DC',
    badge: 'HQ Clássica',
    colors: ['#8b5cf6', '#6366f1', '#ec4899'],
    bgGradient: 'from-violet-950 via-slate-900 to-indigo-950',
    description: 'Hachuras dramáticas, musculatura esculpida e contraste épico de quadrinhos.',
  },
];

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  currentAvatarUrl,
  gender,
  initialTab = 'presets',
  onClose,
  onSelectAvatar,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'camera' | 'ai'>(initialTab);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  React.useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab === 'camera') {
      handleStartCamera();
    }
  }, [initialTab, isOpen]);

  const defaultForGender =
    gender === 'feminino' ? OFFICIAL_AVATARS.female.default : OFFICIAL_AVATARS.male.default;

  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatarUrl || defaultForGender);

  // AI Generator state
  const [selectedAiStyle, setSelectedAiStyle] = useState<string>('pixar_3d');
  const [aiGender, setAiGender] = useState<'masculino' | 'feminino'>(
    gender === 'feminino' ? 'feminino' : 'masculino'
  );
  const [aiAccessory, setAiAccessory] = useState<string>('faixa');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (JPEG, PNG ou WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('A imagem não pode ultrapassar 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewUrl(dataUrl);
      }
    };
    reader.onerror = () => {
      setUploadError('Erro ao carregar o arquivo.');
    };
    reader.readAsDataURL(file);
  };

  // Start Camera Stream
  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Acesso à câmera não suportado neste navegador ou ambiente.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Permissão para a câmera não concedida ou dispositivo ocupado.');
    }
  };

  // Stop Camera Stream
  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Photo from Camera
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const minDim = Math.min(canvas.width, canvas.height);
    const startX = (canvas.width - minDim) / 2;
    const startY = (canvas.height - minDim) / 2;
    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 480, 480);

    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(capturedDataUrl);
    handleStopCamera();
  };

  // Generate Styled AI Avatar on Canvas
  const handleGenerateAiAvatar = () => {
    setIsGeneratingAi(true);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsGeneratingAi(false);
        return;
      }

      const styleDef = AI_STYLES.find((s) => s.id === selectedAiStyle) || AI_STYLES[2];

      // 1. Dynamic Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
      bgGrad.addColorStop(0, styleDef.colors[0]);
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, styleDef.colors[1]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 512, 512);

      // 2. Aura Circles / Energy particles
      ctx.save();
      for (let i = 0; i < 16; i++) {
        const radius = Math.random() * 40 + 10;
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = styleDef.colors[i % styleDef.colors.length] + '33';
        ctx.fill();
      }
      ctx.restore();

      // 3. Central Halo / Glow
      const haloGrad = ctx.createRadialGradient(256, 240, 50, 256, 240, 200);
      haloGrad.addColorStop(0, styleDef.colors[0] + '88');
      haloGrad.addColorStop(0.7, styleDef.colors[1] + '22');
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(256, 240, 200, 0, Math.PI * 2);
      ctx.fill();

      // 4. Athletic Silhouette & Torso
      ctx.save();
      // Torso / Shoulders
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(256, 420, 160, 110, 0, 0, Math.PI * 2);
      ctx.fill();

      // Athletic Tank Top / Suit
      const suitGrad = ctx.createLinearGradient(160, 320, 350, 480);
      suitGrad.addColorStop(0, styleDef.colors[0]);
      suitGrad.addColorStop(1, styleDef.colors[1]);
      ctx.fillStyle = suitGrad;
      ctx.beginPath();
      ctx.moveTo(170, 460);
      ctx.quadraticCurveTo(210, 350, 256, 350);
      ctx.quadraticCurveTo(302, 350, 342, 460);
      ctx.lineTo(170, 460);
      ctx.fill();

      // Neck
      ctx.fillStyle = aiGender === 'feminino' ? '#fcd34d' : '#f59e0b';
      ctx.fillRect(232, 280, 48, 60);

      // Head
      ctx.beginPath();
      ctx.ellipse(256, 220, 75, 95, 0, 0, Math.PI * 2);
      ctx.fillStyle = aiGender === 'feminino' ? '#fed7aa' : '#fcd34d';
      ctx.fill();

      // Hair
      ctx.fillStyle = selectedAiStyle === 'cyberpunk' ? '#06b6d4' : '#1e1b4b';
      ctx.beginPath();
      if (aiGender === 'feminino') {
        // High Athletic Ponytail
        ctx.arc(256, 170, 85, Math.PI, 0, false);
        ctx.lineTo(360, 300);
        ctx.lineTo(330, 310);
        ctx.lineTo(256, 210);
        ctx.fill();
      } else {
        // Dynamic Athletic Spiky / Styled Hair
        ctx.arc(256, 175, 85, Math.PI, 0, false);
        ctx.lineTo(340, 170);
        ctx.lineTo(256, 130);
        ctx.lineTo(172, 170);
        ctx.fill();
      }

      // Athletic Accessory
      if (aiAccessory === 'faixa') {
        // Sweatband / Headband
        ctx.fillStyle = styleDef.colors[0];
        ctx.fillRect(182, 175, 148, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('METAS FIT', 230, 189);
      } else if (aiAccessory === 'oculos') {
        // Cyber Sports Visor
        ctx.fillStyle = styleDef.colors[1] + 'cc';
        ctx.fillRect(190, 200, 132, 25);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(190, 200, 132, 25);
      } else if (aiAccessory === 'fones') {
        // Sport Headphones
        ctx.fillStyle = '#334155';
        ctx.fillRect(165, 195, 20, 50);
        ctx.fillRect(327, 195, 20, 50);
        ctx.beginPath();
        ctx.arc(256, 185, 90, Math.PI, 0, false);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      // Athletic Eyes / Determined Expression
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(230, 220, 6, 0, Math.PI * 2);
      ctx.arc(282, 220, 6, 0, Math.PI * 2);
      ctx.fill();

      // Confident Smile
      ctx.beginPath();
      ctx.arc(256, 255, 18, 0.15, Math.PI - 0.15);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Style Watermark / Badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(16, 460, 480, 36);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`⚡ AI AVATAR · ${styleDef.name.toUpperCase()}`, 30, 484);

      ctx.restore();

      const generatedUrl = canvas.toDataURL('image/png');
      setPreviewUrl(generatedUrl);
      setIsGeneratingAi(false);
    }, 600);
  };

  const handleApply = () => {
    handleStopCamera();
    onSelectAvatar(previewUrl);
    onClose();
  };

  const handleModalClose = () => {
    handleStopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                AVATAR & IDENTIDADE 3D
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-display font-extrabold text-slate-900 mt-0.5">
              Escolher ou Criar Avatar do Usuário
            </h3>
          </div>

          <button
            onClick={handleModalClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Preview Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg shrink-0 bg-slate-800/80 p-1 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Avatar Selecionado"
              className="smooth-avatar w-full h-full object-contain drop-shadow-md"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-1 right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow-xs">
              <Check className="w-3 h-3" />
            </div>
          </div>

          <div className="min-w-0">
            <span className="text-[11px] text-emerald-400 font-bold block">
              Avatar Ativo Selecionado
            </span>
            <h4 className="text-sm font-bold text-white truncate">
              MetasFitQuest · Perfil & Mascote
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
              Utilize o modelo 3D oficial, envie sua foto, capture com a câmera ou crie com IA.
            </p>
          </div>
        </div>

        {/* Tab Navigation (4 Options) */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => {
              handleStopCamera();
              setActiveTab('presets');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modelos 3D</span>
          </button>

          <button
            onClick={() => {
              handleStopCamera();
              setActiveTab('upload');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Carregar Foto</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('camera');
              handleStartCamera();
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'camera'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Tirar Foto</span>
          </button>

          <button
            onClick={() => {
              handleStopCamera();
              setActiveTab('ai');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Criar com IA</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {/* 1. Official 3D Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600">
                Modelos 3D oficiais masculina e feminina com expressões esportivas:
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AI_STYLED_PRESETS.map((preset) => {
                  const isSelected = previewUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setPreviewUrl(preset.url)}
                      className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer text-center group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/30 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gradient-to-b from-slate-100/70 to-slate-200/50 p-1.5 flex items-center justify-center">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="smooth-avatar w-full h-full object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 block truncate">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {preset.gender === 'feminino' ? 'Feminino ♀' : 'Masculino ♂'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Upload Photo Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4 text-center py-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-3xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Clique para selecionar uma foto do seu dispositivo
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Formatos aceitos: JPG, PNG, WEBP (qualquer tamanho)
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Procurar Arquivo no Celular / PC...
                </button>
              </div>

              {previewUrl && (
                <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  Foto pronta! Clique em "Confirmar Avatar" para aplicar no seu perfil.
                </div>
              )}
            </div>
          )}

          {/* 3. Camera Capture Tab */}
          {activeTab === 'camera' && (
            <div className="space-y-4 text-center">
              {cameraError ? (
                <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs space-y-2">
                  <p>{cameraError}</p>
                  <button
                    onClick={handleStartCamera}
                    className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Tentar Conectar Câmera Novamente
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-xl">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-emerald-400/50 rounded-full m-4" />
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capturar Foto</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. AI Generator Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <Wand2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Criador de Avatar Fitness com IA:</strong> Personalize seu estilo épico, escolha acessórios atléticos e gere um avatar estilizado exclusivo para sua jornada de XP.
                </p>
              </div>

              {/* Style selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Escolha o Estilo Artístico:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AI_STYLES.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => setSelectedAiStyle(style.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedAiStyle === style.id
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          {style.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {style.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {style.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender and Accessory options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base do Atleta
                  </label>
                  <select
                    value={aiGender}
                    onChange={(e) => setAiGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="masculino">Masculino ♂</option>
                    <option value="feminino">Feminino ♀</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Acessório Fitness
                  </label>
                  <select
                    value={aiAccessory}
                    onChange={(e) => setAiAccessory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="faixa">Faixa de Treino MetasFit</option>
                    <option value="oculos">Visor Tático Cyber Esportivo</option>
                    <option value="fones">Fones Esportivos Bluetooth</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerateAiAvatar}
                disabled={isGeneratingAi}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Gerando Avatar com IA...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Gerar Avatar com IA Agora</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={() => {
              setPreviewUrl(defaultForGender);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center sm:justify-start gap-1 cursor-pointer py-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Modelo Padrão</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleModalClose}
              className="flex-1 sm:flex-initial py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer min-h-[42px] text-center"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="flex-1 sm:flex-initial py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer min-h-[42px] text-center"
            >
              Confirmar Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
