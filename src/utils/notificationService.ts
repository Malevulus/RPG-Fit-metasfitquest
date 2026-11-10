import { ScheduledNotification } from '../types';

/**
 * Play a pleasant synthesized web audio chime for reminders
 */
export const playNotificationChime = (type: 'water' | 'meal' | 'workout' = 'water') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'water') {
      // Pleasant water droplet chime (high frequency sliding up)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'workout') {
      // Energetic fanfare chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.55);
    } else {
      // Meal bell
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (err) {
    // AudioContext might be restricted until user gesture
  }
};

/**
 * Check if Web Notification API is supported
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Could not request notification permission:', err);
    return 'default';
  }
};

/**
 * Trigger a browser notification with safe fallback
 */
export const sendBrowserNotification = (
  title: string,
  options: {
    body: string;
    icon?: string;
    type?: 'water' | 'meal' | 'workout';
    onClick?: () => void;
  }
): boolean => {
  // Always play audio chime
  playNotificationChime(options.type || 'water');

  try {
    if (!isNotificationSupported() || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return false;
    }
  } catch (e) {
    return false;
  }

  try {
    const notif = new Notification(title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: '/favicon.ico',
    });

    if (options.onClick) {
      notif.onclick = () => {
        window.focus();
        options.onClick?.();
        notif.close();
      };
    }

    return true;
  } catch (e) {
    // Iframe or browser security restrictions may block native notifications
    return false;
  }
};

/**
 * Default scheduled notifications for hydration and meals
 */
export const DEFAULT_NOTIFICATIONS: ScheduledNotification[] = [
  {
    id: 'notif_water_morning',
    type: 'water',
    title: '💧 Hora da Hidratação Matinal',
    body: 'Beba 300ml de água para despertar seu metabolismo e ativar seus órgãos!',
    time: '09:00',
    enabled: true,
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  },
  {
    id: 'notif_meal_breakfast',
    type: 'meal',
    title: '🍳 Registro do Café da Manhã',
    body: 'Não esqueça de registrar seu café para manter seu balanço calórico e proteico.',
    time: '08:30',
    enabled: true,
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  },
  {
    id: 'notif_water_midday',
    type: 'water',
    title: '💧 Meta de Água do Meio-Dia',
    body: 'Mais um copo de água fresca! Mantenha a hidratação em dia antes do almoço.',
    time: '11:30',
    enabled: true,
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  },
  {
    id: 'notif_meal_lunch',
    type: 'meal',
    title: '🥗 Registro do Almoço',
    body: 'Hora de fotografar ou registrar seu prato nutritivo com vegetais e proteínas!',
    time: '12:45',
    enabled: true,
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  },
  {
    id: 'notif_water_afternoon',
    type: 'water',
    title: '💧 Foco da Tarde: Mais Água',
    body: 'Evite a fadiga da tarde! Encha sua garrafinha agora (+500ml).',
    time: '15:00',
    enabled: true,
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  },
  {
    id: 'notif_workout_time',
    type: 'workout',
    title: '💪 Hora do Treino de Hipertrofia!',
    body: 'Seu treino do Personal Trainer está te esperando. Complete as séries para ganhar HealthCoins!',
    time: '17:30',
    enabled: true,
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
  },
  {
    id: 'notif_meal_dinner',
    type: 'meal',
    title: '🍲 Registro do Jantar',
    body: 'Feche seu diário calórico de hoje e garanta o equilíbrio nutricional.',
    time: '20:00',
    enabled: true,
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  },
  {
    id: 'notif_water_night',
    type: 'water',
    title: '💧 Último Copo do Dia',
    body: 'Bata 100% da sua meta antes de dormir para auxiliar na regeneração muscular noturna.',
    time: '21:30',
    enabled: true,
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  },
];
