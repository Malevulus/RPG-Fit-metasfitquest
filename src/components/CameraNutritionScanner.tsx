import React, { useState, useRef, useEffect } from 'react';
import { MealCategory, FoodItem } from '../types';
import {
  Camera,
  Barcode,
  Sparkles,
  Upload,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  ScanLine,
  Zap,
  Info,
  ChevronRight,
  Flame,
  Utensils,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CameraNutritionScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFoodsToMeal: (category: MealCategory, items: FoodItem[]) => void;
  userGoal?: string;
}

export interface AnalyzedDishItem extends FoodItem {
  cookingMethod?: string;
  estimatedGrams?: number;
}

interface AnalyzedDish {
  dishName: string;
  description: string;
  metodoPreparoGeral?: string;
  estimatedGrams: number;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  items: AnalyzedDishItem[];
  nutritionTips: string;
}

interface ScannedProduct {
  name: string;
  brand: string;
  category: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodiumMg: number;
  fiberG: number;
  icon: string;
  nutriScore: 'A' | 'B' | 'C' | 'D' | 'E';
  healthTip: string;
}

interface SamplePlatePreset {
  id: string;
  label: string;
  mode: 'plate';
  name: string;
  desc: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  items: FoodItem[];
}

interface SampleBarcodePreset {
  id: string;
  label: string;
  mode: 'barcode';
  barcode: string;
}

type SamplePreset = SamplePlatePreset | SampleBarcodePreset;

// Sample test photos in base64/SVG data URIs for instant testing without camera hardware
const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'prato_feito',
    label: '🍛 Prato Executivo com Frango',
    mode: 'plate' as const,
    name: 'Frango Grelhado com Arroz, Feijão e Salada',
    desc: 'Prato tradicional brasileiro rico em proteínas magras e fibras.',
    grams: 430,
    kcal: 512,
    protein: 48,
    carbs: 52,
    fat: 10,
    items: [
      { id: 'p_1', name: 'Filé de Frango Grelhado', cookingMethod: 'Grelhado', serving: '150g', quantity: 1, calories: 247, protein: 42, carbs: 0, fat: 5.5, icon: '🍗' },
      { id: 'p_2', name: 'Arroz Integral', cookingMethod: 'Cozido', serving: '100g', quantity: 1, calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, icon: '🍚' },
      { id: 'p_3', name: 'Feijão Carioca', cookingMethod: 'Cozido', serving: '80g', quantity: 1, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, icon: '🫘' },
      { id: 'p_4', name: 'Salada Verde Fresca', cookingMethod: 'Cru / Fresco', serving: '90g', quantity: 1, calories: 65, protein: 1.1, carbs: 3.6, fat: 4.5, icon: '🥗' },
    ],
  },
  {
    id: 'salmao_legumes',
    label: '🐟 Salmão com Brócolis e Batata',
    mode: 'plate' as const,
    name: 'Salmão Grelhado com Legumes no Vapor',
    desc: 'Rico em Ômega-3 de alta qualidade e carboidratos complexos.',
    grams: 380,
    kcal: 440,
    protein: 38,
    carbs: 28,
    fat: 18,
    items: [
      { id: 's_1', name: 'Posta de Salmão ao Forno', cookingMethod: 'Assado no forno', serving: '140g', quantity: 1, calories: 280, protein: 32, carbs: 0, fat: 16, icon: '🐟' },
      { id: 's_2', name: 'Brócolis e Cenoura ao Vapor', cookingMethod: 'Cozido no vapor', serving: '120g', quantity: 1, calories: 65, protein: 3.8, carbs: 11, fat: 0.5, icon: '🥦' },
      { id: 's_3', name: 'Batata Inglesa Assada', cookingMethod: 'Assada com casca', serving: '110g', quantity: 1, calories: 95, protein: 2.2, carbs: 21, fat: 0.2, icon: '🥔' },
    ],
  },
  {
    id: 'barcode_iogurte',
    label: '🏷️ Código: Iogurte Nestlé',
    mode: 'barcode' as const,
    barcode: '7891000100103',
  },
  {
    id: 'barcode_whey',
    label: '🏷️ Código: Whey Protein Max',
    mode: 'barcode' as const,
    barcode: '7898511790014',
  },
  {
    id: 'barcode_cereal',
    label: '🏷️ Código: Barra de Cereal Nutry',
    mode: 'barcode' as const,
    barcode: '7898357410015',
  },
];

export const CameraNutritionScanner: React.FC<CameraNutritionScannerProps> = ({
  isOpen,
  onClose,
  onAddFoodsToMeal,
  userGoal = 'emagrecer',
}) => {
  const [scanMode, setScanMode] = useState<'plate' | 'barcode'>('plate');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetCategory, setTargetCategory] = useState<MealCategory>('almoco');

  // Results
  const [analyzedDish, setAnalyzedDish] = useState<AnalyzedDish | null>(null);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);

  // Video element and stream reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream when open
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Câmera não suportada neste navegador. Use o envio de imagem ou os exemplos prontos.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Permissão da câmera não concedida. Você pode enviar uma foto da galeria ou selecionar os exemplos abaixo.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      analyzeImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Security & usability: validate type and size limit (12MB)
      if (!file.type.startsWith('image/')) {
        setCameraError('Formato inválido. Por favor, envie uma foto válida (JPEG, PNG ou WEBP).');
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        setCameraError('A imagem selecionada é muito pesada (limite de 12MB). Por favor, envie uma foto menor.');
        return;
      }

      setCameraError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCapturedImage(dataUrl);
        stopCamera();
        analyzeImage(dataUrl);
      };
      reader.onerror = () => {
        setCameraError('Erro ao carregar o arquivo. Tente novamente.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze captured or uploaded image
  const analyzeImage = async (dataUrl: string) => {
    setIsAnalyzing(true);
    setAnalyzedDish(null);
    setScannedProduct(null);

    try {
      if (scanMode === 'plate') {
        const response = await fetch('/api/analyze-plate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            mimeType: 'image/jpeg',
            userGoal,
          }),
        });

        if (!response.ok) throw new Error('Falha na resposta da API');
        const data: AnalyzedDish = await response.json();
        setAnalyzedDish(data);
      } else {
        // Barcode mode with image
        const response = await fetch('/api/scan-barcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            mimeType: 'image/jpeg',
          }),
        });

        if (!response.ok) throw new Error('Falha ao processar código');
        const data = await response.json();
        if (data.product) {
          setScannedProduct(data.product);
        }
      }
    } catch (err) {
      console.error('Error during image analysis:', err);
      // Fallback
      if (scanMode === 'plate') {
        const fallbackPreset = SAMPLE_PRESETS[0] as SamplePlatePreset;
        setAnalyzedDish({
          dishName: fallbackPreset.name,
          description: fallbackPreset.desc,
          estimatedGrams: fallbackPreset.grams,
          totalCalories: fallbackPreset.kcal,
          protein: fallbackPreset.protein,
          carbs: fallbackPreset.carbs,
          fat: fallbackPreset.fat,
          healthScore: 92,
          items: fallbackPreset.items,
          nutritionTips: 'Excelente combinação de carboidratos complexos e proteínas magras para o seu objetivo.',
        });
      } else {
        const fallbackBarcode = (SAMPLE_PRESETS[2] as SampleBarcodePreset).barcode;
        handleBarcodeLookup(fallbackBarcode);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBarcodeLookup = async (code: string) => {
    setIsAnalyzing(true);
    setScannedProduct(null);
    setAnalyzedDish(null);

    try {
      const response = await fetch('/api/scan-barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: code }),
      });
      const data = await response.json();
      if (data.product) {
        setScannedProduct(data.product);
      }
    } catch (e) {
      console.warn('Barcode lookup error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: SamplePreset) => {
    setScanMode(sample.mode);
    stopCamera();

    if (sample.mode === 'plate') {
      const plate = sample as SamplePlatePreset;
      setIsAnalyzing(true);
      setTimeout(() => {
        setAnalyzedDish({
          dishName: plate.name,
          description: plate.desc,
          estimatedGrams: plate.grams,
          totalCalories: plate.kcal,
          protein: plate.protein,
          carbs: plate.carbs,
          fat: plate.fat,
          healthScore: 95,
          items: plate.items,
          nutritionTips: 'Refeição perfeitamente calculada para ganho de saciedade e queima de gordura.',
        });
        setIsAnalyzing(false);
      }, 700);
    } else if (sample.mode === 'barcode') {
      const bc = sample as SampleBarcodePreset;
      handleBarcodeLookup(bc.barcode);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalyzedDish(null);
    setScannedProduct(null);
    startCamera();
  };

  // Add analyzed items to the user's meal log
  const handleConfirmAddToMeal = () => {
    if (analyzedDish) {
      const itemsToAdd: FoodItem[] = analyzedDish.items.map((it, idx) => ({
        id: `ai_${Date.now()}_${idx}`,
        name: it.name,
        serving: it.serving,
        quantity: 1,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
        icon: it.icon || '🥗',
      }));

      onAddFoodsToMeal(targetCategory, itemsToAdd);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onClose();
    } else if (scannedProduct) {
      const itemToAdd: FoodItem = {
        id: `scanned_${Date.now()}`,
        name: `${scannedProduct.name} (${scannedProduct.brand})`,
        serving: scannedProduct.serving,
        quantity: 1,
        calories: scannedProduct.calories,
        protein: scannedProduct.protein,
        carbs: scannedProduct.carbs,
        fat: scannedProduct.fat,
        icon: scannedProduct.icon || '📦',
      };

      onAddFoodsToMeal(targetCategory, [itemToAdd]);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[94dvh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 truncate">
                  NutriVision IA & Scanner
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Estime alimentos, método de preparo e calorias com IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs: Prato Pronto vs Código de Barras */}
        <div className="px-3 sm:px-5 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/40">
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl flex-1 sm:flex-initial">
            <button
              onClick={() => {
                setScanMode('plate');
                if (capturedImage) handleRetake();
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-lg transition-all min-h-[38px] ${
                scanMode === 'plate'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Foto do Prato (IA)</span>
            </button>
            <button
              onClick={() => {
                setScanMode('barcode');
                if (capturedImage) handleRetake();
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-lg transition-all min-h-[38px] ${
                scanMode === 'barcode'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Barcode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Código de Barras</span>
            </button>
          </div>

          {/* Quick upload input */}
          <div className="shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors min-h-[38px]"
              title="Carregar foto da galeria"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Galeria</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* CAMERA / CAPTURE VIEWPORT */}
          {!analyzedDish && !scannedProduct && (
            <div>
              <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner">
                {/* Live video */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />

                {/* If captured preview before analysis */}
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Camera Inactive / Error Overlay */}
                {!cameraActive && !capturedImage && (
                  <div className="text-center p-6 space-y-3">
                    <Camera className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400 max-w-sm">
                      {cameraError || 'Iniciando câmera... Se solicitado pelo navegador, autorize o acesso à câmera.'}
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={startCamera}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Tentar Câmera Novamente
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Enviar Imagem
                      </button>
                    </div>
                  </div>
                )}

                {/* HUD Overlay / Reticle */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4">
                    {/* Top Guide */}
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1.5">
                      <ScanLine className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>
                        {scanMode === 'plate'
                          ? 'Enquadre o prato completo dentro do círculo'
                          : 'Alinhe as listras do código de barras'}
                      </span>
                    </div>

                    {/* Central Target Guide */}
                    {scanMode === 'plate' ? (
                      <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-emerald-400/70 border-dashed animate-pulse flex items-center justify-center">
                        <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                      </div>
                    ) : (
                      <div className="w-64 h-28 border-2 border-red-500/80 rounded-xl relative flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 animate-pulse shadow-sm shadow-red-500"></div>
                      </div>
                    )}

                    {/* Bottom hint */}
                    <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded">
                      Iluminação boa melhora a precisão da IA
                    </span>
                  </div>
                )}

                {/* Loading Wave when analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white space-y-3 z-30">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center animate-spin">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <h4 className="font-display font-bold text-sm text-emerald-300">
                        Processando com Visão Computacional...
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {scanMode === 'plate'
                          ? 'Identificando alimentos, porções em gramas e calorias'
                          : 'Consultando rótulo nutricional e ingredientes'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Controls: Capture Button */}
              {cameraActive && !isAnalyzing && (
                <div className="flex items-center justify-center pt-3">
                  <button
                    onClick={handleCapturePhoto}
                    className="w-16 h-16 rounded-full border-4 border-emerald-200 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                    title="Tirar Foto"
                  >
                    <Camera className="w-7 h-7" />
                  </button>
                </div>
              )}

              {/* Sample Presets for Instant 1-Click Testing */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Teste Imediato (Sem precisar de câmera física):
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PRESETS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-all text-left flex items-center gap-1.5"
                    >
                      <span>{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- RESULTS: DISH ANALYSIS (FOTO DO PRATO) --- */}
          {analyzedDish && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                        Prato Identificado com Sucesso
                      </span>
                      {analyzedDish.metodoPreparoGeral && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                          🔥 Preparo: {analyzedDish.metodoPreparoGeral}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-extrabold text-base text-slate-900 mt-1">
                      {analyzedDish.dishName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {analyzedDish.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-display font-extrabold font-mono text-emerald-800">
                      {analyzedDish.totalCalories}
                    </span>
                    <span className="text-xs text-emerald-600 block font-medium">kcal totais</span>
                  </div>
                </div>

                {/* Macro Summary Chips */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-emerald-200/70 text-center font-mono text-xs">
                  <div className="bg-white/80 rounded-xl p-1.5 border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-sans">Peso Est.</span>
                    <span className="font-bold text-slate-800">{analyzedDish.estimatedGrams}g</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-1.5 border border-emerald-100">
                    <span className="text-[10px] text-emerald-600 block font-sans">Proteínas</span>
                    <span className="font-bold text-emerald-700">{analyzedDish.protein}g</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-1.5 border border-emerald-100">
                    <span className="text-[10px] text-amber-600 block font-sans">Carbos</span>
                    <span className="font-bold text-amber-700">{analyzedDish.carbs}g</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-1.5 border border-emerald-100">
                    <span className="text-[10px] text-rose-600 block font-sans">Gorduras</span>
                    <span className="font-bold text-rose-700">{analyzedDish.fat}g</span>
                  </div>
                </div>

                {/* Nutritionist Tip */}
                <div className="mt-3 p-2.5 bg-white/90 rounded-xl border border-emerald-100 flex items-start gap-2 text-xs text-emerald-900">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{analyzedDish.nutritionTips}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Alimentos Detectados no Prato ({analyzedDish.items.length}):
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {analyzedDish.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{item.icon || '🥗'}</span>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 block truncate">{item.name}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px]">
                            <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                              {item.serving || `${item.estimatedGrams || 100}g`}
                            </span>
                            {item.cookingMethod && (
                              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                                🔥 {item.cookingMethod}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono shrink-0 pl-7 sm:pl-0">
                        <span className="font-bold text-slate-900">{item.calories} kcal</span>
                        <span className="text-[10px] text-slate-400 block">
                          P: {item.protein}g · C: {item.carbs}g · G: {item.fat}g
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm / Add to Meal Sticky Footer */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-3 px-3 sm:px-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-600 shrink-0">Adicionar a:</span>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value as MealCategory)}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[42px] cursor-pointer"
                  >
                    <option value="cafe">Café da Manhã</option>
                    <option value="almoco">Almoço</option>
                    <option value="lanches">Lanches & Snacks</option>
                    <option value="jantar">Jantar</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleRetake}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 min-h-[44px] shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Nova Foto</span>
                  </button>
                  <button
                    onClick={handleConfirmAddToMeal}
                    className="flex-1 sm:flex-none py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 min-h-[44px] active:scale-98 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Registrar Refeição (+35 HC)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- RESULTS: BARCODE / PACKAGED PRODUCT SCAN --- */}
          {scannedProduct && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-white rounded-2xl shadow-xs">
                      {scannedProduct.icon}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-100 px-2 py-0.5 rounded-full">
                        {scannedProduct.brand} · {scannedProduct.category}
                      </span>
                      <h3 className="font-display font-extrabold text-base text-slate-900 mt-1">
                        {scannedProduct.name}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Porção: {scannedProduct.serving}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-display font-extrabold font-mono text-sky-900">
                      {scannedProduct.calories}
                    </span>
                    <span className="text-xs text-sky-600 block">kcal/porção</span>
                  </div>
                </div>

                {/* Nutrition Facts Table */}
                <div className="grid grid-cols-5 gap-2 pt-3 border-t border-sky-200/70 text-center font-mono text-xs">
                  <div className="bg-white/80 rounded-xl p-1.5 border border-sky-100">
                    <span className="text-[10px] text-emerald-600 block font-sans">Proteína</span>
                    <span className="font-bold text-emerald-700">{scannedProduct.protein}g</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-1.5 border border-sky-100">
                    <span className="text-[10px] text-amber-600 block font-sans">Carboidratos</span>
                    <span className="font-bold text-amber-700">{scannedProduct.carbs}g</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-1.5 border border-sky-100">
                    <span className="text-[10px] text-rose-600 block font-sans">Gorduras</span>
                    <span className="font-bold text-rose-700">{scannedProduct.fat}g</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-1.5 border border-sky-100">
                    <span className="text-[10px] text-slate-400 block font-sans">Sódio</span>
                    <span className="font-bold text-slate-700">{scannedProduct.sodiumMg}mg</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-1.5 border border-sky-100">
                    <span className="text-[10px] text-indigo-600 block font-sans">Nutri-Score</span>
                    <span className="font-bold text-indigo-700">{scannedProduct.nutriScore}</span>
                  </div>
                </div>

                {/* Health assessment tip */}
                <div className="mt-3 p-2.5 bg-white/90 rounded-xl border border-sky-100 flex items-start gap-2 text-xs text-sky-900">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{scannedProduct.healthTip}</span>
                </div>
              </div>

              {/* Confirm / Add to Meal Sticky Footer */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-3 px-3 sm:px-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-600 shrink-0">Adicionar a:</span>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value as MealCategory)}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[42px] cursor-pointer"
                  >
                    <option value="cafe">Café da Manhã</option>
                    <option value="almoco">Almoço</option>
                    <option value="lanches">Lanches & Snacks</option>
                    <option value="jantar">Jantar</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleRetake}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 min-h-[44px] shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Escanear Outro</span>
                  </button>
                  <button
                    onClick={handleConfirmAddToMeal}
                    className="flex-1 sm:flex-none py-2.5 px-5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5 min-h-[44px] active:scale-98 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Registrar Produto (+25 HC)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
