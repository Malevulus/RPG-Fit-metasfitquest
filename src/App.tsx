import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Meal,
  MealCategory,
  FoodItem,
  WaterLog,
  Badge,
  MascotAccessory,
  HealthDayRecord,
  SocialChallenge,
  SocialProofPost,
  LeaderboardUser,
  HealthAnamnese,
  WorkoutPlan,
  WorkoutHistoryEntry,
  ScheduledNotification,
  DietPlan,
  NutritionalAssessment,
  DietMealSection,
} from './types';
import {
  DEFAULT_USER,
  INITIAL_MEALS,
  INITIAL_BADGES,
  MASCOT_ACCESSORIES,
  INITIAL_7_DAY_HISTORY,
  INITIAL_30_DAY_HISTORY,
  getClean7DayHistory,
  getClean30DayHistory,
  INITIAL_CHALLENGES,
  INITIAL_SOCIAL_POSTS,
  INITIAL_LEADERBOARD,
} from './data/defaultData';
import {
  DEFAULT_ANAMNESE,
  getCustomizedWorkoutPlans,
} from './data/trainerData';
import { PRESET_DIET_PLANS } from './data/dietData';
import {
  DEFAULT_NOTIFICATIONS,
  sendBrowserNotification,
} from './utils/notificationService';
import {
  calculateMacros,
  calculateTargetCalories,
  calculateTDEE,
  calculateTMB,
  calculateWaterTarget,
  resolveMascotState,
} from './utils/calculations';
import { Navbar, AppBackgroundTheme } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { HealthModule } from './components/HealthModule';
import { DietModule } from './components/DietModule';
import { GamificationCenter } from './components/GamificationCenter';
import { SocialArena } from './components/SocialArena';
import { PersonalTrainerModule } from './components/PersonalTrainerModule';
import { MealModal } from './components/MealModal';
import { AuthAndOnboarding } from './components/AuthAndOnboarding';
import { AuthScreen } from './components/AuthScreen';
import { CameraNutritionScanner } from './components/CameraNutritionScanner';
import { DatabaseGoogleDriveModal } from './components/DatabaseGoogleDriveModal';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

const STORAGE_KEYS = {
  AUTH: 'nutriquest_authenticated_v1',
  USER: 'nutriquest_user_v1',
  MEALS: 'nutriquest_meals_v1',
  WATER: 'nutriquest_water_v1',
  WATER_LOGS: 'nutriquest_water_logs_v1',
  COINS: 'nutriquest_coins_v1',
  STREAK: 'nutriquest_streak_v1',
  BADGES: 'nutriquest_badges_v1',
  ACCESSORIES: 'nutriquest_accessories_v1',
  HISTORY: 'nutriquest_history_v1',
  CHALLENGES: 'nutriquest_challenges_v1',
  POSTS: 'nutriquest_posts_v1',
  LEADERBOARD: 'nutriquest_leaderboard_v1',
  BG_THEME: 'nutriquest_bg_theme_v1',
  ANAMNESE: 'nutriquest_anamnese_v1',
  WORKOUT_PLANS: 'nutriquest_workout_plans_v1',
  WORKOUT_HISTORY: 'nutriquest_workout_history_v1',
  NOTIFICATIONS: 'nutriquest_notifications_v1',
  ACTIVE_DIET_PLAN: 'nutriquest_active_diet_plan_v1',
  NUTRITIONAL_ASSESSMENT: 'nutriquest_assessment_v1',
  STEPS: 'nutriquest_steps_v1',
  STEP_GOAL: 'nutriquest_step_goal_v1',
  LAST_WEEKLY_RECAP: 'nutriquest_last_weekly_recap_v1',
};

export default function App() {
  // Authentication gate: User MUST authenticate or onboard before entering the app
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  });

  // Navigation (Dashboard, Health, Diet, Personal Trainer, Social Arena, Gamification)
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'health' | 'diet' | 'trainer' | 'gamification' | 'social'>('dashboard');

  // Background Customization Theme
  const [bgTheme, setBgTheme] = useState<AppBackgroundTheme>(() => {
    return (localStorage.getItem(STORAGE_KEYS.BG_THEME) as AppBackgroundTheme) || 'clean';
  });

  // Core User State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_USER, ...parsed };
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_USER;
  });

  // Meals State (Starts empty for new users, initialized with demo for demo user)
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_MEALS;
  });

  // Water State (Starts at 0ml for fresh users)
  const [waterConsumedMl, setWaterConsumedMl] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WATER);
    return saved ? parseInt(saved, 10) : 1750;
  });

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      { id: 'wl_1', timestamp: '08:15', amountMl: 250 },
      { id: 'wl_2', timestamp: '10:30', amountMl: 500 },
      { id: 'wl_3', timestamp: '13:00', amountMl: 500 },
      { id: 'wl_4', timestamp: '16:00', amountMl: 500 },
    ];
  });

  // Health & Weight 30-Day History for Recharts
  const [healthHistory, setHealthHistory] = useState<HealthDayRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_30_DAY_HISTORY;
  });

  // Diet Management State
  const [activeDietPlan, setActiveDietPlan] = useState<DietPlan | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_DIET_PLAN);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return PRESET_DIET_PLANS[0];
  });

  const [savedAssessment, setSavedAssessment] = useState<NutritionalAssessment | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NUTRITIONAL_ASSESSMENT);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  // Gamification State
  const [healthCoins, setHealthCoins] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COINS);
    return saved ? parseInt(saved, 10) : 285;
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
    return saved ? parseInt(saved, 10) : 5;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BADGES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_BADGES;
  });

  const [accessories, setAccessories] = useState<MascotAccessory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCESSORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return MASCOT_ACCESSORIES;
  });

  // Social Arena & Community Challenges State
  const [challenges, setChallenges] = useState<SocialChallenge[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_CHALLENGES;
  });

  const [posts, setPosts] = useState<SocialProofPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_SOCIAL_POSTS;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_LEADERBOARD;
  });

  // Personal Trainer & Anamnese State
  const [anamnese, setAnamnese] = useState<HealthAnamnese>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANAMNESE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_ANAMNESE, ...parsed };
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_ANAMNESE;
  });

  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_PLANS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return getCustomizedWorkoutPlans(DEFAULT_ANAMNESE.preferredLocation, DEFAULT_ANAMNESE);
  });

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'wh_init_1',
        date: 'Ontem',
        timestamp: '17:45',
        workoutTitle: 'Treino A · Peitoral, Ombros & Tríceps (Hipertrofia)',
        environment: 'academia',
        exercisesCompleted: 4,
        totalExercises: 4,
        rewardEarned: 100,
      },
    ];
  });

  // Scheduled Web Push Notifications State
  const [notifications, setNotifications] = useState<ScheduledNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  // Step Tracker & Cadence State
  const [stepsToday, setStepsToday] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STEPS);
    return saved ? parseInt(saved, 10) : 5420;
  });

  const [stepGoal, setStepGoal] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STEP_GOAL);
    return saved ? parseInt(saved, 10) : 10000;
  });

  // Modals
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [selectedMealCategory, setSelectedMealCategory] = useState<MealCategory>('cafe');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [databaseModalOpen, setDatabaseModalOpen] = useState(false);
  const [weeklySummaryOpen, setWeeklySummaryOpen] = useState(false);

  // Transient Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Trigger Monday Weekly Summary Modal automatically when opening the app on Mondays
  useEffect(() => {
    if (!isAuthenticated) return;

    const today = new Date();
    const dayOfWeek = today.getDay(); // 1 = Monday (Segunda-feira)
    const isMonday = dayOfWeek === 1;

    // Format week identifier YYYY-WW so it only shows once per Monday
    const currentWeekId = `${today.getFullYear()}-W${Math.ceil((today.getDate() + 6 - dayOfWeek) / 7)}-${today.toISOString().split('T')[0]}`;
    const lastRecap = localStorage.getItem(STORAGE_KEYS.LAST_WEEKLY_RECAP);

    if (isMonday && lastRecap !== currentWeekId) {
      // Delay slightly for smooth initial rendering
      const timer = setTimeout(() => {
        setWeeklySummaryOpen(true);
        localStorage.setItem(STORAGE_KEYS.LAST_WEEKLY_RECAP, currentWeekId);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATER, waterConsumedMl.toString());
  }, [waterConsumedMl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(healthHistory));
  }, [healthHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COINS, healthCoins.toString());
  }, [healthCoins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREAK, streakDays.toString());
  }, [streakDays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCESSORIES, JSON.stringify(accessories));
  }, [accessories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BG_THEME, bgTheme);
  }, [bgTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANAMNESE, JSON.stringify(anamnese));
  }, [anamnese]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_PLANS, JSON.stringify(workoutPlans));
  }, [workoutPlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (activeDietPlan) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DIET_PLAN, JSON.stringify(activeDietPlan));
    }
  }, [activeDietPlan]);

  useEffect(() => {
    if (savedAssessment) {
      localStorage.setItem(STORAGE_KEYS.NUTRITIONAL_ASSESSMENT, JSON.stringify(savedAssessment));
    }
  }, [savedAssessment]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STEPS, stepsToday.toString());
  }, [stepsToday]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STEP_GOAL, stepGoal.toString());
  }, [stepGoal]);

  // Background Web Push Notification Scheduler (checks every 25 seconds)
  useEffect(() => {
    let lastTriggeredMinute = '';

    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const timeKey = `${currentHours}:${currentMins}`;

      if (timeKey === lastTriggeredMinute) return;

      const activeMatching = notifications.filter(
        (n) => n.enabled && n.time === timeKey
      );

      if (activeMatching.length > 0) {
        lastTriggeredMinute = timeKey;
        activeMatching.forEach((notif) => {
          sendBrowserNotification(notif.title, {
            body: notif.body,
            type: notif.type,
          });
          showToast(`🔔 ${notif.title}: ${notif.body}`);
        });
      }
    }, 25000);

    return () => clearInterval(checkInterval);
  }, [notifications]);

  // Aggregate current calories
  const totalCalories = meals.reduce(
    (acc, m) => acc + m.items.reduce((sum, item) => sum + item.calories, 0),
    0
  );
  const mealsLoggedCount = meals.reduce((acc, m) => acc + (m.items.length > 0 ? 1 : 0), 0);

  // Sync today's consumption in the 30-day health history
  useEffect(() => {
    setHealthHistory((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const todayIndex = updated.length - 1;
      if (updated[todayIndex]) {
        updated[todayIndex] = {
          ...updated[todayIndex],
          caloriesConsumed: totalCalories,
          calorieTarget: user.targetCalories,
          waterMl: waterConsumedMl,
          weight: user.weight,
        };
      }
      return updated;
    });
  }, [totalCalories, waterConsumedMl, user.targetCalories, user.weight]);

  // Handle Login & Registration from entry screen
  const handleLoginSuccess = (authenticatedUser: UserProfile, isNewRegistration: boolean = false) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);

    if (isNewRegistration) {
      // Novo cadastro: começa completamente ZERADO conforme solicitado!
      // Refeições zeradas
      setMeals([]);
      // Água zerada (0 ml) para ser alimentada durante o dia
      setWaterConsumedMl(0);
      setWaterLogs([]);
      // Sequência zerada (0 dias)
      setStreakDays(0);
      // HealthCoins iniciais de boas-vindas
      setHealthCoins(50);
      // Histórico dos 30 dias limpo começando zerado com o peso cadastrado
      const cleanHistory = getClean30DayHistory(authenticatedUser.weight, authenticatedUser.targetCalories);
      setHealthHistory(cleanHistory);
      // Conquistas zeradas
      setBadges((prev) =>
        prev.map((b) => ({
          ...b,
          unlocked: false,
          progress: 0,
          unlockedAt: undefined,
        }))
      );
      showToast(`Conta criada com sucesso! Bem-vindo, ${authenticatedUser.name.split(' ')[0]}! ✨`);
    } else {
      showToast(`Bem-vindo de volta, ${authenticatedUser.name.split(' ')[0]}! ✨`);
    }

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    showToast('Sessão encerrada.');
  };

  const handleUpdateSteps = (newSteps: number) => {
    const valid = Math.max(0, Math.min(100000, Math.round(newSteps)));
    setStepsToday(valid);
  };

  const handleUpdateStepGoal = (newGoal: number) => {
    const valid = Math.max(1000, Math.min(50000, Math.round(newGoal)));
    setStepGoal(valid);
    showToast(`🎯 Meta de passos atualizada: ${valid.toLocaleString('pt-BR')} passos!`);
  };

  const handleRestoreDatabase = (importedData: any) => {
    if (importedData[STORAGE_KEYS.USER]) {
      setUser(importedData[STORAGE_KEYS.USER]);
    }
    if (importedData[STORAGE_KEYS.MEALS]) {
      setMeals(importedData[STORAGE_KEYS.MEALS]);
    }
    if (importedData[STORAGE_KEYS.WATER]) {
      setWaterConsumedMl(Number(importedData[STORAGE_KEYS.WATER]) || 0);
    }
    if (importedData[STORAGE_KEYS.WATER_LOGS]) {
      setWaterLogs(importedData[STORAGE_KEYS.WATER_LOGS]);
    }
    if (importedData[STORAGE_KEYS.HISTORY]) {
      setHealthHistory(importedData[STORAGE_KEYS.HISTORY]);
    }
    if (importedData[STORAGE_KEYS.COINS]) {
      setHealthCoins(Number(importedData[STORAGE_KEYS.COINS]) || 0);
    }
    if (importedData[STORAGE_KEYS.STREAK]) {
      setStreakDays(Number(importedData[STORAGE_KEYS.STREAK]) || 0);
    }
    if (importedData[STORAGE_KEYS.STEPS]) {
      setStepsToday(Number(importedData[STORAGE_KEYS.STEPS]) || 0);
    }
    if (importedData[STORAGE_KEYS.WORKOUT_PLANS]) {
      setWorkoutPlans(importedData[STORAGE_KEYS.WORKOUT_PLANS]);
    }
    if (importedData[STORAGE_KEYS.ANAMNESE]) {
      setAnamnese(importedData[STORAGE_KEYS.ANAMNESE]);
    }
    showToast('💾 Banco de dados restaurado e sincronizado com sucesso!');
  };

  // Mascot dynamic status
  const mascotState = resolveMascotState(
    totalCalories,
    user.targetCalories,
    waterConsumedMl,
    user.targetWaterMl,
    mealsLoggedCount
  );

  const equippedAccessories = accessories.filter((a) => a.equipped).map((a) => a.id);

  // Handlers for Meals
  const handleOpenMealModal = (category: MealCategory) => {
    setSelectedMealCategory(category);
    setMealModalOpen(true);
  };

  const handleAddFood = (category: MealCategory, item: FoodItem) => {
    setMeals((prev) => {
      const existing = prev.find((m) => m.category === category);
      if (existing) {
        return prev.map((m) =>
          m.category === category ? { ...m, items: [...m.items, item] } : m
        );
      } else {
        const newMeal: Meal = {
          id: `m_${category}_${Date.now()}`,
          category,
          name: category,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          items: [item],
        };
        return [...prev, newMeal];
      }
    });

    setHealthCoins((prev) => prev + 20);
    showToast(`+20 HC · Alimento adicionado a ${category.toUpperCase()}!`);
  };

  // Handlers for Camera AI Scanner
  const handleAddFoodsFromScanner = (category: MealCategory, items: FoodItem[]) => {
    setMeals((prev) => {
      const existing = prev.find((m) => m.category === category);
      if (existing) {
        return prev.map((m) =>
          m.category === category ? { ...m, items: [...m.items, ...items] } : m
        );
      } else {
        const newMeal: Meal = {
          id: `m_${category}_${Date.now()}`,
          category,
          name: category,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          items: items,
        };
        return [...prev, newMeal];
      }
    });

    setHealthCoins((prev) => prev + 35);
    showToast(`+35 HC · Refeição analisada com IA registrada com sucesso!`);
  };

  const handleDeleteFoodItem = (mealId: string, itemId: string) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id === mealId || m.items.some((it) => it.id === itemId)) {
          return {
            ...m,
            items: m.items.filter((it) => it.id !== itemId),
          };
        }
        return m;
      })
    );
  };

  // Handlers for Water
  const handleAddWater = (amountMl: number) => {
    const previous = waterConsumedMl;
    const nextAmount = previous + amountMl;
    setWaterConsumedMl(nextAmount);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWaterLogs((prev) => [
      { id: `wl_${Date.now()}`, timestamp: timeStr, amountMl },
      ...prev,
    ]);

    // Check if hit or passed water goal
    if (previous < user.targetWaterMl && nextAmount >= user.targetWaterMl) {
      setHealthCoins((prev) => prev + 50);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('🎉 Meta de Água Conquistada! +50 HealthCoins!');
      setBadges((prev) =>
        prev.map((b) =>
          b.id === 'badge_water_master'
            ? { ...b, unlocked: true, progress: 100, unlockedAt: 'Hoje' }
            : b
        )
      );
    } else {
      setHealthCoins((prev) => prev + 5);
      showToast(`+5 HC · +${amountMl}ml de água registrados!`);
    }
  };

  const handleResetWater = () => {
    setWaterConsumedMl(0);
    setWaterLogs([]);
    showToast('Contador de água reiniciado para o dia de hoje.');
  };

  // Handlers for Health Metrics update
  const handleUpdateUserMetrics = (weight: number, height: number) => {
    const tmb = calculateTMB(weight, height, user.age, user.gender);
    const tdee = calculateTDEE(tmb, user.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, user.goal);
    const targetWaterMl = calculateWaterTarget(weight, user.activityLevel);
    const macros = calculateMacros(targetCalories, weight, user.goal);

    setUser((prev) => ({
      ...prev,
      weight,
      height,
      tmb,
      tdee,
      targetCalories,
      targetWaterMl,
      targetProteinG: macros.proteinG,
      targetCarbsG: macros.carbsG,
      targetFatG: macros.fatG,
    }));

    showToast('Medidas e metas recalculadas com sucesso!');
  };

  const handleUpdateWeightHistory = (newWeight: number) => {
    setHealthHistory((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const todayIndex = updated.length - 1;
      if (updated[todayIndex]) {
        updated[todayIndex] = {
          ...updated[todayIndex],
          weight: newWeight,
        };
      }
      return updated;
    });
    showToast(`Peso de hoje atualizado para ${newWeight} kg!`);
  };

  // Handlers for Gamification Store
  const handleEquipAccessory = (id: string) => {
    setAccessories((prev) => {
      const target = prev.find((a) => a.id === id);
      if (!target) return prev;
      const willEquip = !target.equipped;

      return prev.map((a) => {
        if (a.category === target.category && willEquip) {
          return { ...a, equipped: a.id === id };
        }
        if (a.id === id) {
          return { ...a, equipped: willEquip };
        }
        return a;
      });
    });
    showToast('Acessório atualizado no NutriBuddy!');
  };

  const handleBuyAccessory = (id: string, price: number) => {
    if (healthCoins < price) {
      showToast('HealthCoins insuficientes para este item!');
      return;
    }

    setHealthCoins((prev) => prev - price);
    setAccessories((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unlocked: true, equipped: true } : a))
    );

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
    });
    showToast(`Parabéns! Item desbloqueado e equipado no Mascote!`);
  };

  const handleClaimBadgeReward = (badgeId: string, coins: number) => {
    setHealthCoins((prev) => prev + coins);
    showToast(`+${coins} HealthCoins resgatadas com sucesso!`);
  };

  // Handlers for Social Challenges & Community Proofs
  const handleJoinChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId
          ? { ...c, isJoined: true, participantsCount: c.participantsCount + 1 }
          : c
      )
    );
    setHealthCoins((prev) => prev + 15);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    showToast('🎉 Você entrou no desafio! +15 HealthCoins!');
  };

  const handleAdvanceChallengeDay = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === challengeId) {
          const nextProgress = Math.min(c.durationDays, c.progressDays + 1);
          const isNowCompleted = nextProgress >= c.durationDays;
          if (isNowCompleted && !c.isCompleted) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            showToast(`🏆 Desafio "${c.title}" concluído! Resgate sua premiação!`);
          } else {
            showToast(`+1 dia registrado no desafio "${c.title}"!`);
          }
          return {
            ...c,
            progressDays: nextProgress,
            isCompleted: isNowCompleted || c.isCompleted,
          };
        }
        return c;
      })
    );
  };

  const handleClaimChallengeReward = (challengeId: string, rewardCoins: number) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, rewardClaimed: true } : c))
    );
    setHealthCoins((prev) => prev + rewardCoins);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    showToast(`🎁 Recompensa resgatada: +${rewardCoins} HealthCoins!`);
  };

  const handleCreateChallenge = (
    newChallenge: Omit<
      SocialChallenge,
      'id' | 'participantsCount' | 'isJoined' | 'progressDays' | 'isCompleted' | 'rewardClaimed'
    >
  ) => {
    const created: SocialChallenge = {
      ...newChallenge,
      id: `ch_custom_${Date.now()}`,
      participantsCount: 1,
      isJoined: true,
      progressDays: 0,
      isCompleted: false,
      rewardClaimed: false,
    };
    setChallenges((prev) => [created, ...prev]);
    setHealthCoins((prev) => prev + 30);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    showToast(`🚀 Desafio comunitário publicado! +30 HealthCoins!`);
  };

  const handleCreateProofPost = (
    post: Omit<
      SocialProofPost,
      'id' | 'timestamp' | 'likesCount' | 'hasLiked' | 'reactions' | 'comments'
    >
  ) => {
    const newPost: SocialProofPost = {
      ...post,
      id: `post_${Date.now()}`,
      timestamp: 'Agora mesmo',
      likesCount: 1,
      hasLiked: true,
      reactions: { fire: 1, heart: 1, clap: 1 },
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setHealthCoins((prev) => prev + 25);
    showToast('📸 Comprovação publicada no mural da comunidade! +25 HealthCoins!');
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const willLike = !p.hasLiked;
          return {
            ...p,
            hasLiked: willLike,
            likesCount: willLike ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );
  };

  const handleReactPost = (postId: string, reactionType: 'fire' | 'heart' | 'clap') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            reactions: {
              ...p.reactions,
              [reactionType]: p.reactions[reactionType] + 1,
            },
          };
        }
        return p;
      })
    );
    showToast('Reação enviada!');
  };

  const handleAddComment = (postId: string, commentText: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c_${Date.now()}`,
            authorName: user.name.split(' ')[0],
            text: commentText,
            time: 'Agora mesmo',
          };
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );
    setHealthCoins((prev) => prev + 5);
    showToast('+5 HC · Incentivo enviado!');
  };

  // Personal Trainer & Workout Handlers
  const handleFinishWorkout = (
    workoutTitle: string,
    environment: 'casa' | 'academia',
    rewardCoins: number,
    totalEx: number
  ) => {
    const newEntry: WorkoutHistoryEntry = {
      id: `wh_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      workoutTitle,
      environment,
      exercisesCompleted: totalEx,
      totalExercises: totalEx,
      rewardEarned: rewardCoins,
    };

    setWorkoutHistory((prev) => [newEntry, ...prev]);
    setHealthCoins((prev) => prev + rewardCoins);
    setStreakDays((prev) => prev + 1);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast(`🏆 Treino Finalizado! +${rewardCoins} HealthCoins e +1 dia na sequência!`);
  };

  // Handlers for Diet Management & Healthy Menus
  const handleApplyDietPlan = (plan: DietPlan) => {
    setActiveDietPlan(plan);
    setUser((prev) => ({
      ...prev,
      targetCalories: plan.totalCalories,
      targetProteinG: plan.proteinG,
      targetCarbsG: plan.carbsG,
      targetFatG: plan.fatG,
      goal: plan.goal === 'hipertrofia' ? 'ganhar_massa' : 'emagrecer',
    }));
    setHealthCoins((prev) => prev + 40);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    showToast(`+40 HC · Cardápio "${plan.title}" aplicado às suas metas oficiais!`);
  };

  const handleImportDietMealsToDiary = (dietMeals: DietMealSection[]) => {
    setMeals((prev) => {
      const updated = [...prev];
      dietMeals.forEach((dm) => {
        const cat = (dm.category === 'lanche_manha' ? 'lanches' : dm.category === 'ceia' ? 'jantar' : dm.category) as MealCategory;
        const existingMealIndex = updated.findIndex((m) => m.category === cat);
        const newFoodItems: FoodItem[] = dm.items.map((it) => ({
          id: `fi_diet_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: it.name,
          serving: it.portion,
          quantity: 1,
          calories: it.calories,
          protein: it.protein,
          carbs: it.carbs,
          fat: it.fat,
          icon: it.icon,
        }));

        if (existingMealIndex >= 0) {
          updated[existingMealIndex] = {
            ...updated[existingMealIndex],
            items: [...updated[existingMealIndex].items, ...newFoodItems],
          };
        } else {
          updated.push({
            id: `meal_${Date.now()}_${cat}`,
            category: cat,
            name: dm.name,
            time: dm.time,
            items: newFoodItems,
          });
        }
      });
      return updated;
    });

    setHealthCoins((prev) => prev + 25);
    showToast('+25 HC · Alimentos do cardápio importados para seu diário de hoje!');
  };

  const handleSaveAssessment = (assessment: NutritionalAssessment, generatedPlan: DietPlan) => {
    setSavedAssessment(assessment);
    setActiveDietPlan(generatedPlan);
    setUser((prev) => ({
      ...prev,
      targetCalories: assessment.recommendedCalories,
      targetProteinG: assessment.macros.proteinG,
      targetCarbsG: assessment.macros.carbsG,
      targetFatG: assessment.macros.fatG,
      targetWaterMl: assessment.recommendedWaterMl,
      goal: assessment.goal === 'hipertrofia' ? 'ganhar_massa' : 'emagrecer',
    }));
  };

  // Dynamic Leaderboard calculation
  const completedChallengesCount = challenges.filter((c) => c.isCompleted).length;
  const dynamicLeaderboard = [...leaderboard]
    .map((comp) => {
      if (comp.isCurrentUser) {
        return {
          ...comp,
          name: `${user.name} (Você)`,
          healthCoins: healthCoins,
          streakDays: streakDays,
          challengesCompleted: completedChallengesCount,
        };
      }
      return comp;
    })
    .sort((a, b) => b.healthCoins - a.healthCoins)
    .map((comp, idx) => ({ ...comp, rank: idx + 1 }));

  // Dynamic Background classes & decorative visual ambient styles
  const getBackgroundClass = () => {
    switch (bgTheme) {
      case 'mint':
        return 'bg-[#eefbf4] text-slate-900';
      case 'sunset':
        return 'bg-[#fff7f0] text-slate-900';
      case 'dark_athletic':
        return 'bg-slate-950 text-slate-100';
      case 'clean':
      default:
        return 'bg-slate-50 text-slate-900';
    }
  };

  // 1. IF NOT AUTHENTICATED: Display Auth & Onboarding Screen First!
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. IF AUTHENTICATED: Display Main Application
  return (
    <div className={`min-h-screen ${getBackgroundClass()} flex flex-col selection:bg-emerald-200 selection:text-emerald-900 transition-colors duration-500 relative overflow-x-hidden`}>
      {/* Dynamic Background Graphics & Ambient Wallpaper Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {bgTheme === 'clean' && (
          <>
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-emerald-100/50 via-teal-50/20 to-transparent rounded-full blur-3xl opacity-80" />
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-100/40 rounded-full blur-2xl" />
            <div className="absolute bottom-10 -left-20 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
          </>
        )}
        {bgTheme === 'mint' && (
          <>
            <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-32 w-[700px] h-[700px] bg-teal-200/30 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px]" />
          </>
        )}
        {bgTheme === 'sunset' && (
          <>
            <div className="absolute -top-40 right-10 w-[700px] h-[500px] bg-amber-200/35 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -left-20 w-80 h-80 bg-orange-200/30 rounded-full blur-2xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:22px_22px]" />
          </>
        )}
        {bgTheme === 'dark_athletic' && (
          <>
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-10 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px]" />
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-3 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        healthCoins={healthCoins}
        streakDays={streakDays}
        currentBgTheme={bgTheme}
        onChangeBgTheme={setBgTheme}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenScanner={() => setScannerOpen(true)}
        onOpenDatabase={() => setDatabaseModalOpen(true)}
        onOpenWeeklySummary={() => setWeeklySummaryOpen(true)}
        onLogout={handleLogout}
      />

      {/* Cabeçalho MFQ - Mapa da Aventura */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-700/50 bg-slate-950 group">
          <img
            src="/assets/aistudio/Cabe_alho_MFQ_ead4cb75.png"
            alt="Cabeçalho MFQ - Mapa da Aventura: Metas Fit Quest"
            className="w-full h-auto max-h-44 sm:max-h-56 md:max-h-64 object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {currentTab === 'dashboard' && (
          <Dashboard
            user={user}
            meals={meals}
            waterConsumedMl={waterConsumedMl}
            mascotMood={mascotState.mood}
            mascotSpeech={mascotState.speech}
            equippedAccessories={equippedAccessories}
            stepsToday={stepsToday}
            stepGoal={stepGoal}
            onUpdateSteps={handleUpdateSteps}
            onUpdateStepGoal={handleUpdateStepGoal}
            onRewardCoins={(coins, reason) => {
              setHealthCoins((prev) => prev + coins);
              showToast(`+${coins} HC · ${reason}`);
            }}
            onOpenMealModal={handleOpenMealModal}
            onOpenScanner={() => setScannerOpen(true)}
            onDeleteFoodItem={handleDeleteFoodItem}
            onAddWaterQuick={handleAddWater}
            onGoToHealth={() => setCurrentTab('health')}
            onGoToGamification={() => setCurrentTab('gamification')}
            onGoToSocial={() => setCurrentTab('social')}
            onGoToTrainer={() => setCurrentTab('trainer')}
            onGoToDiet={() => setCurrentTab('diet')}
          />
        )}

        {currentTab === 'health' && (
          <HealthModule
            user={user}
            waterConsumedMl={waterConsumedMl}
            waterLogs={waterLogs}
            healthHistory={healthHistory}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
            onUpdateUserMetrics={handleUpdateUserMetrics}
            onUpdateWeightHistory={handleUpdateWeightHistory}
          />
        )}

        {currentTab === 'diet' && (
          <DietModule
            user={user}
            todayMeals={meals}
            activeDietPlan={activeDietPlan}
            savedAssessment={savedAssessment}
            onApplyDietPlan={handleApplyDietPlan}
            onImportDietMealsToDiary={handleImportDietMealsToDiary}
            onSaveAssessment={handleSaveAssessment}
            onToast={showToast}
          />
        )}

        {currentTab === 'trainer' && (
          <PersonalTrainerModule
            user={user}
            healthCoins={healthCoins}
            streakDays={streakDays}
            waterConsumedMl={waterConsumedMl}
            totalCaloriesToday={totalCalories}
            healthHistory={healthHistory}
            anamnese={anamnese}
            workoutPlans={workoutPlans}
            workoutHistory={workoutHistory}
            notifications={notifications}
            onSaveAnamnese={(updated) => {
              setAnamnese(updated);
              const refreshed = getCustomizedWorkoutPlans(updated.preferredLocation, updated);
              setWorkoutPlans(refreshed);
            }}
            onUpdateWorkoutPlans={setWorkoutPlans}
            onFinishWorkout={handleFinishWorkout}
            onUpdateNotifications={setNotifications}
            onToast={showToast}
          />
        )}

        {currentTab === 'social' && (
          <SocialArena
            user={user}
            healthCoins={healthCoins}
            streakDays={streakDays}
            challenges={challenges}
            posts={posts}
            leaderboard={dynamicLeaderboard}
            onJoinChallenge={handleJoinChallenge}
            onAdvanceChallengeDay={handleAdvanceChallengeDay}
            onClaimChallengeReward={handleClaimChallengeReward}
            onCreateChallenge={handleCreateChallenge}
            onCreateProofPost={handleCreateProofPost}
            onLikePost={handleLikePost}
            onReactPost={handleReactPost}
            onAddComment={handleAddComment}
          />
        )}

        {currentTab === 'gamification' && (
          <GamificationCenter
            healthCoins={healthCoins}
            streakDays={streakDays}
            badges={badges}
            accessories={accessories}
            onEquipAccessory={handleEquipAccessory}
            onBuyAccessory={handleBuyAccessory}
            onClaimBadgeReward={handleClaimBadgeReward}
          />
        )}
      </main>

      {/* Rodapé MFQ - Sua Jornada, Seu Progresso */}
      <footer className="w-full mt-10 pb-10 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/60 pt-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="w-full max-w-4xl relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-700/60 bg-slate-950 group">
            <img
              src="/assets/aistudio/Roda_pe_MFQ_c4c1deeb.png"
              alt="Rodapé MFQ - Sua Jornada, Seu Progresso"
              className="w-full h-auto max-h-32 sm:max-h-40 object-contain sm:object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
            />
          </div>

          <div className="text-center text-xs text-slate-500 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/assets/aistudio/Logo_MetaFitQuest_8363d166.png"
                alt="Logo MetaFitQuest"
                className="w-4 h-4 object-contain"
              />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                MetaFitQuest · Gamificação, Saúde, Dieta e Alta Performance
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Transformando hábitos diários em conquistas reais com consistência, inteligência artificial e mais XP.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MealModal
        isOpen={mealModalOpen}
        category={selectedMealCategory}
        onClose={() => setMealModalOpen(false)}
        onAddFood={handleAddFood}
        onOpenScanner={() => setScannerOpen(true)}
      />

      <AuthAndOnboarding
        isOpen={profileModalOpen}
        currentUser={user}
        onClose={() => setProfileModalOpen(false)}
        onSaveProfile={(updated) => {
          setUser(updated);
          showToast('Perfil e metas salvas com sucesso!');
        }}
      />

      {/* Camera & Barcode Nutrition Scanner Modal */}
      <CameraNutritionScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onAddFoodsToMeal={handleAddFoodsFromScanner}
        userGoal={user.goal}
      />

      {/* Database & Google Drive Cloud Server Modal */}
      <DatabaseGoogleDriveModal
        isOpen={databaseModalOpen}
        onClose={() => setDatabaseModalOpen(false)}
        onRestoreDatabase={handleRestoreDatabase}
        onToast={showToast}
      />

      {/* Monday Weekly Recap & HealthCoins Summary Modal */}
      <WeeklySummaryModal
        isOpen={weeklySummaryOpen}
        onClose={() => setWeeklySummaryOpen(false)}
        userCoins={healthCoins}
        streakDays={streakDays}
        onClaimWeeklyBonus={(bonus) => {
          setHealthCoins((prev) => prev + bonus);
          showToast(`🎉 Bônus Semanal de +${bonus} HealthCoins resgatado com sucesso!`);
        }}
      />
    </div>
  );
}
