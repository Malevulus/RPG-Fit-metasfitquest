import React, { useState } from 'react';
import { MealCategory, FoodItem } from '../types';
import { FOOD_PRESETS } from '../data/defaultData';
import { X, Plus, Search, Sparkles, Utensils, Camera } from 'lucide-react';

interface MealModalProps {
  isOpen: boolean;
  category: MealCategory;
  onClose: () => void;
  onAddFood: (category: MealCategory, item: FoodItem) => void;
  onOpenScanner?: () => void;
}

const CATEGORY_NAMES: Record<MealCategory, string> = {
  cafe: 'Café da Manhã',
  almoco: 'Almoço',
  jantar: 'Jantar',
  lanches: 'Lanches',
};

export const MealModal: React.FC<MealModalProps> = ({
  isOpen,
  category,
  onClose,
  onAddFood,
  onOpenScanner,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customServing, setCustomServing] = useState('1 porção (100g)');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customIcon, setCustomIcon] = useState('🥗');

  if (!isOpen) return null;

  const filteredPresets = FOOD_PRESETS.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPreset = (item: FoodItem) => {
    const newItem: FoodItem = {
      ...item,
      id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      quantity,
      calories: Math.round(item.calories * quantity),
      protein: Number((item.protein * quantity).toFixed(1)),
      carbs: Number((item.carbs * quantity).toFixed(1)),
      fat: Number((item.fat * quantity).toFixed(1)),
    };
    onAddFood(category, newItem);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customCalories) return;

    const cal = parseFloat(customCalories) || 0;
    const prot = parseFloat(customProtein) || 0;
    const carb = parseFloat(customCarbs) || 0;
    const fat = parseFloat(customFat) || 0;

    const newItem: FoodItem = {
      id: `food_custom_${Date.now()}`,
      name: customName,
      serving: customServing,
      quantity,
      calories: Math.round(cal * quantity),
      protein: Number((prot * quantity).toFixed(1)),
      carbs: Number((carb * quantity).toFixed(1)),
      fat: Number((fat * quantity).toFixed(1)),
      icon: customIcon,
    };

    onAddFood(category, newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Adicionar a {CATEGORY_NAMES[category]}
              </h3>
              <p className="text-xs text-slate-500">
                Ganhe +20 HealthCoins ao registrar sua refeição!
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

        {/* Tab switch & Multiplier */}
        <div className="px-3 sm:px-5 pt-3 pb-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-1 bg-slate-100/90 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[38px] ${
                activeTab === 'presets'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alimentos Prontos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[38px] ${
                activeTab === 'custom'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personalizado
            </button>

            {onOpenScanner && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenScanner();
                }}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300/60 transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[38px]"
                title="Tirar foto do prato pronto ou escanear código de barras"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Foto IA</span>
              </button>
            )}
          </div>

          {/* Portion Multiplier */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 ml-auto sm:ml-0 py-1">
            <span className="font-medium">Porção:</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[36px]"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x (Padrão)</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2.0x (Dobro)</option>
              <option value={3}>3.0x</option>
            </select>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'presets' ? (
            <div>
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar alimentos saudáveis (frango, ovo, aveia...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {filteredPresets.map((food) => {
                  const totalCal = Math.round(food.calories * quantity);
                  const totalProt = Number((food.protein * quantity).toFixed(1));
                  const totalCarb = Number((food.carbs * quantity).toFixed(1));
                  const totalFat = Number((food.fat * quantity).toFixed(1));

                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectPreset(food)}
                      className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1.5 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
                          {food.icon || '🥗'}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                            {food.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {food.serving}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-mono">
                            <span className="font-semibold text-emerald-700">P: {totalProt}g</span>
                            <span>·</span>
                            <span className="font-semibold text-amber-700">C: {totalCarb}g</span>
                            <span>·</span>
                            <span className="font-semibold text-rose-700">G: {totalFat}g</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-slate-900">
                            {totalCal}
                          </span>
                          <span className="text-[10px] text-slate-400 block">kcal</span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredPresets.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Nenhum alimento encontrado. Crie um personalizado na aba acima!
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Custom Food Form */
            <form onSubmit={handleCreateCustom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome do Alimento ou Prato
                </label>
                <div className="flex gap-2">
                  <select
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-lg text-center"
                    title="Escolha um emoji"
                  >
                    <option value="🥗">🥗</option>
                    <option value="🍲">🍲</option>
                    <option value="🍗">🍗</option>
                    <option value="🥩">🥩</option>
                    <option value="🐟">🐟</option>
                    <option value="🥪">🥪</option>
                    <option value="🍎">🍎</option>
                    <option value="🥑">🥑</option>
                    <option value="🥤">🥤</option>
                    <option value="🥣">🥣</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tapioca com pasta de amendoim"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tamanho da Porção / Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1 prato fundo ou 150g"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Calorias (kcal) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="250"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-700 mb-1">
                    Proteínas (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="20"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-700 mb-1">
                    Carboidratos (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="25"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-rose-700 mb-1">
                    Gorduras (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="5"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Salvar e Adicionar Refeição
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
