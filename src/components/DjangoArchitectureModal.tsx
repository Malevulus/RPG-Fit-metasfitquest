import React, { useState } from 'react';
import { DJANGO_ARCHITECTURE_CODE } from '../data/defaultData';
import {
  Code2,
  Database,
  Copy,
  Check,
  Server,
  Layers,
  FileCode,
  ShieldCheck,
  Network,
} from 'lucide-react';

const SERIALIZERS_CODE = `"""
MetasFitQuest - Serializers com Django REST Framework (DRF)
src/api/serializers.py
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Meal, FoodItem, WaterLog, Achievement, MascotAccessory


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['id', 'name', 'serving', 'quantity', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'icon']


class MealSerializer(serializers.ModelSerializer):
    items = FoodItemSerializer(many=True, required=False)
    total_calories = serializers.SerializerMethodField()

    class Meta:
        model = Meal
        fields = ['id', 'date', 'time', 'category', 'name', 'items', 'total_calories']

    def get_total_calories(self, obj):
        return sum(item.calories for item in obj.items.all())

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        meal = Meal.objects.create(**validated_data)
        for item_data in items_data:
            FoodItem.objects.create(meal=meal, **item_data)
        return meal


class WaterLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterLog
        fields = ['id', 'date', 'timestamp', 'amount_ml']
        read_only_fields = ['id', 'timestamp']


class UserProfileSerializer(serializers.ModelSerializer):
    bmi = serializers.ReadOnlyField()
    tmb = serializers.ReadOnlyField()
    target_water_ml = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            'age', 'gender', 'height_cm', 'weight_kg', 'target_weight_kg',
            'activity_level', 'goal', 'health_coins', 'current_streak',
            'longest_streak', 'bmi', 'tmb', 'target_water_ml'
        ]
`;

const VIEWS_CODE = `"""
MetasFitQuest - ViewSets e Endpoints REST (DRF)
src/api/views.py
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Meal, WaterLog, UserProfile, FoodItem
from .serializers import MealSerializer, WaterLogSerializer, UserProfileSerializer


class MealViewSet(viewsets.ModelViewSet):
    """
    CRUD completo de refeições do usuário autenticado.
    Suporta filtro por data: /api/meals/?date=2026-10-02
    """
    serializer_class = MealSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Meal.objects.filter(user=self.request.user)
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)
        return queryset

    def perform_create(self, serializer):
        meal = serializer.save(user=self.request.user)
        # Bonificação de Gamificação: +20 HealthCoins por refeição registrada
        profile = self.request.user.profile
        profile.health_coins += 20
        profile.save(update_fields=['health_coins'])


class WaterLogViewSet(viewsets.ModelViewSet):
    """
    Registro e progresso diário de hidratação.
    """
    serializer_class = WaterLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WaterLog.objects.filter(user=self.request.user, date=timezone.now().date())

    def perform_create(self, serializer):
        water_log = serializer.save(user=self.request.user, date=timezone.now().date())
        # Verifica se bateu a meta de água para liberar bônus de 50 HC
        profile = self.request.user.profile
        total_today = sum(w.amount_ml for w in self.get_queryset())
        if total_today >= profile.target_water_ml:
            profile.health_coins += 50
            profile.save(update_fields=['health_coins'])
`;

export const DjangoArchitectureModal: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'models' | 'serializers' | 'views'>('models');
  const [copied, setCopied] = useState(false);

  const getCodeString = () => {
    switch (activeCodeTab) {
      case 'models':
        return DJANGO_ARCHITECTURE_CODE;
      case 'serializers':
        return SERIALIZERS_CODE;
      case 'views':
        return VIEWS_CODE;
      default:
        return DJANGO_ARCHITECTURE_CODE;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
          <Database className="w-6 h-6 text-indigo-600" />
          Arquitetura Backend: Django REST & PostgreSQL
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Modelagem relacional das entidades, serializadores e endpoints projetados para a persistência em produção.
        </p>
      </div>

      {/* Relational Schema Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core Entity 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs">
            <Server className="w-4 h-4" />
            <span>UserProfile (1:1 com auth.User)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Armazena parâmetros antropométricos (peso, altura, idade, sexo, atividade) e computa em tempo de execução o IMC, TMB (Mifflin-St Jeor) e meta hídrica.
          </p>
          <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            health_coins, current_streak, longest_streak
          </div>
        </div>

        {/* Core Entity 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs">
            <Layers className="w-4 h-4" />
            <span>Meal (1:N) & FoodItem (1:N)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Refeições agrupadas por data e categoria (Café, Almoço, Jantar, Lanches). Cada refeição possui itens com quantidade, calorias e macronutrientes.
          </p>
          <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            index_together: ['user', 'date']
          </div>
        </div>

        {/* Core Entity 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Gamificação & Hidratação</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Tabelas <code>WaterLog</code>, <code>Achievement</code>, <code>UserAchievement</code> e <code>HealthCoinTransaction</code> para auditoria e recompensa transacional.
          </p>
          <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            foreign_key: Achievement, User
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Code Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60 gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              Código Pronto para Implementação no Backend
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveCodeTab('models')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeCodeTab === 'models'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                models.py
              </button>
              <button
                onClick={() => setActiveCodeTab('serializers')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeCodeTab === 'serializers'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                serializers.py
              </button>
              <button
                onClick={() => setActiveCodeTab('views')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeCodeTab === 'views'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                views.py
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Block */}
        <div className="p-4 sm:p-6 overflow-x-auto max-h-[550px] font-mono text-xs text-slate-300 leading-relaxed">
          <pre>
            <code>{getCodeString()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
