'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Search, Dumbbell, Home, Settings, Play as PlayIcon, Plus, 
  Trophy, X, Save, Trash2, CheckCircle, History, 
  Timer, SkipForward, Eye, Activity, Clock, LogOut, User,
  Library, Calendar, Globe, Scale, HeartPulse, ChevronRight,
  PlusCircle, Utensils, Mail, Lock, Loader2
} from 'lucide-react'
import { Toast } from '@capacitor/toast'
import React from 'react'
import { useWorkout } from '@/lib/workout-context' 
import NutritionView from './NutritionView'
import AdminView from './AdminView'
import BottomNav from '@/components/BottomNav'
import confetti from 'canvas-confetti'


const translations = {
  es: {
    home: 'Inicio', library: 'Librería', settings: 'Configuración', profile: 'Perfil', nutrition: 'Nutrición', admin: 'Admin',
    welcome: 'Hola', lastWorkout: 'Último Entrenamiento', streak: 'Racha', days: 'Días',
    weight: 'Peso', height: 'Altura', myRoutines: 'Mis Rutinas', exercises: 'ejercicios',
    save: 'Guardar', general: 'General', objetivos: 'Objetivos', antropometria: 'Antropometría',
    rutinas: 'Rutinas', fat: 'Grasa', muscle: 'Músculo', imc: 'IMC', tmb: 'TMB',
    idealWeight: 'Peso Ideal', icc: 'Cintura/Cadera', somatotype: 'Somatotipo',
    focusAreas: 'Áreas de Enfoque', dietStyle: 'Estilo de Dieta', Additionals: 'Adicionales', 
    createEx: 'Crear Ejercicio', search: 'Buscar...', finish: 'Finalizar', rest: 'Descanso',
    composition: 'Composición', logout: 'Cerrar Sesión'
  },
  en: {
    home: 'Home', library: 'Library', settings: 'Settings', profile: 'Profile', nutrition: 'Nutrition', admin: 'Admin',
    welcome: 'Hello', lastWorkout: 'Last Workout', streak: 'Streak', days: 'Days',
    weight: 'Weight', height: 'Height', myRoutines: 'My Routines', exercises: 'exercises',
    save: 'Save', general: 'General', objetivos: 'Goals', antropometria: 'Anthro',
    rutinas: 'Routines', fat: 'Fat', muscle: 'Muscle', imc: 'BMI', tmb: 'BMR',
    idealWeight: 'Ideal Weight', icc: 'Waist/Hip', somatotype: 'Somatotype',
    focusAreas: 'Focus Areas', dietStyle: 'Diet Style', Additionals: 'Adicionales', 
    createEx: 'Create Exercise', search: 'Search...', finish: 'Finish', rest: 'Rest',
    composition: 'Composition', logout: 'Log Out'
  }
}

const MUSCLE_OPTIONS = ['chest', 'back', 'shoulders', 'upper arms', 'upper legs', 'waist', 'cardio'];
const FOCUS_OPTIONS = ['Hipertrofia', 'Fuerza', 'Pérdida de Grasa', 'Resistencia', 'Salud'];

export default function GymProApp() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const t = (key: keyof typeof translations['es']) => translations[lang][key] || key;

  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [currentView, setCurrentView] = useState<'home' | 'exercises' | 'routines' | 'myRoutines' | 'workout' | 'progress' | 'nutrition' | 'admin'>('home');
  const [pendingNavTarget, setPendingNavTarget] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashExiting, setSplashExiting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [showEditRoutineModal, setShowEditRoutineModal] = useState<number | null>(null);
  const [showCreateExModal, setShowCreateExModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [routines, setRoutines] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<any>(null);
  const [workoutData, setWorkoutData] = useState<any>({});
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [totalRestTime, setTotalRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const workoutStartRef = useRef<number>(0);
  const restEndRef = useRef<number>(0);
  const [newExData, setNewExData] = useState({ name: '', target: 'chest', gif_url: '' });
  const [isActive, setIsActive] = useState(false);

  const [userStats, setUserStats] = useState({
    name: 'Atleta', age: '25', gender: 'Hombre', weight: '75', height: '1.75', focus: [] as string[], 
    injuries: '', dietStyle: 'Equilibrada', experienceLevel: '', trainingDays: '5', role: 'user',
    diameters: { humeral: '6.3', radiocubital: '5', femoral: '8.6' },
    skinfolds: { biceps: '10', triceps: '12', subscapular: '14', suprailiaco: '15', abdominal: '19', muslo: '15', pierna: '15', pectoral: '5' },
    perimeters: { thorax: '91', abdomen: '69', cadera: '96', bicepsR: '26', bicepsC: '29', muslo: '60', pantorrilla: '33' },
    results: { fatPercentage: '0', fatLabel: '...', muscleMass: '0', bmr: '0', bmi: '0', bmiLabel: 'Normal', idealWeight: '0', icc: '0', iccLabel: 'Excelente', somatotype: { endo: '0', meso: '0', ecto: '0', label: 'Mesomorfo' } }
  });

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchRoutines(session.user.id);
        fetchProfile(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Lang preference ───────────────────────────────────────────────────────
  useEffect(() => {
    const savedLang = localStorage.getItem('gympro_lang') as 'es' | 'en';
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'es' ? 'en' : 'es';
    setLang(newLang);
    localStorage.setItem('gympro_lang', newLang);
  };

  // ── Auto-calculate body stats ─────────────────────────────────────────────
  useEffect(() => {
    const calculateStats = () => {
      const { weight, height, age, gender, skinfolds, perimeters, diameters } = userStats;
      const W = parseFloat(weight); const H = parseFloat(height); const A = parseInt(age);
      if (!W || !H || !A) return;
      const imc = W / (H * H);
      const pesoIdeal = 22 * (H * H);
      const icc = parseFloat(perimeters.abdomen) / parseFloat(perimeters.cadera);
      const sum7 = Object.values(skinfolds).reduce((a, b) => a + parseFloat(b || '0'), 0);
      let fatPct = gender === 'Hombre' 
        ? ((4.95 / (1.112 - (0.00043499 * sum7) + (0.00000055 * Math.pow(sum7, 2)) - (0.00028826 * A))) - 4.5) * 100
        : ((4.95 / (1.097 - (0.00046971 * sum7) + (0.00000056 * Math.pow(sum7, 2)) - (0.00012828 * A))) - 4.5) * 100;
      let bmr = gender === 'Hombre' ? (10 * W) + (6.25 * (H * 100)) - (5 * A) + 5 : (10 * W) + (6.25 * (H * 100)) - (5 * A) - 161;
      const endo = -0.7182 + 0.1451 * (sum7) - 0.00068 * Math.pow(sum7, 2) + 0.0000014 * Math.pow(sum7, 3);
      const meso = (0.85 * parseFloat(diameters.humeral)) + (0.601 * parseFloat(diameters.femoral)) + (0.188 * (parseFloat(perimeters.bicepsC) - parseFloat(skinfolds.triceps)/10)) + (0.161 * (parseFloat(perimeters.pantorrilla) - parseFloat(skinfolds.pierna)/10)) - (0.131 * (H * 100)) + 4.5;
      const hwr = (H * 100) / Math.pow(W, 1/3);
      let ecto = hwr > 40.75 ? (0.732 * hwr - 28.58) : (0.463 * hwr - 17.63);
      setUserStats(prev => ({
        ...prev, results: {
          fatPercentage: fatPct.toFixed(1), fatLabel: fatPct < 15 ? 'Excelente' : 'Aceptable',
          muscleMass: (W * (1 - (fatPct/100)) * 0.7).toFixed(1), bmr: Math.round(bmr).toString(),
          bmi: imc.toFixed(2), bmiLabel: imc < 25 ? 'Saludable' : 'Sobrepeso',
          idealWeight: pesoIdeal.toFixed(2), icc: icc.toFixed(2), iccLabel: icc < 0.9 ? 'Excelente' : 'Riesgo',
          somatotype: { endo: endo.toFixed(1), meso: meso.toFixed(1), ecto: ecto.toFixed(1), label: meso > ecto ? 'Mesomorfo' : 'Ectomorfo' }
        }
      }));
    };
    const timer = setTimeout(calculateStats, 500);
    return () => clearTimeout(timer);
  }, [userStats.weight, userStats.height, userStats.age, userStats.skinfolds, userStats.perimeters, userStats.gender, userStats.diameters]);

  // ── Beep sound ────────────────────────────────────────────────────────────
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const beep = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.45, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      beep(660, 0, 0.15);
      beep(880, 0.2, 0.15);
      beep(1100, 0.4, 0.35);
    } catch (e) {}
  };

  // ── Notification permission ───────────────────────────────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ── Workout timer (timestamp-based, runs in background) ───────────────────
  useEffect(() => {
    if (isActive) {
      workoutStartRef.current = Date.now() - workoutTimer * 1000;
      const interval = setInterval(() => {
        setWorkoutTimer(Math.floor((Date.now() - workoutStartRef.current) / 1000));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  // ── Rest timer (timestamp-based, runs in background) ─────────────────────
  useEffect(() => {
    if (isResting) {
      restEndRef.current = Date.now() + restTimer * 1000;
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((restEndRef.current - Date.now()) / 1000));
        setRestTimer(remaining);
        if (remaining <= 0) {
          setIsResting(false);
          playBeep();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('¡Descanso terminado!', { body: 'Es hora de tu siguiente serie 💪', silent: false });
          }
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isResting]);

  // ── Re-sync timers when tab regains focus ─────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        if (isResting) {
          const remaining = Math.max(0, Math.ceil((restEndRef.current - Date.now()) / 1000));
          setRestTimer(remaining);
        }
        if (isActive) {
          setWorkoutTimer(Math.floor((Date.now() - workoutStartRef.current) / 1000));
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isResting, isActive]);

  // ── Load exercises when entering library ──────────────────────────────────
  useEffect(() => {
    if (currentView === 'exercises') fetchExercises();
  }, [currentView]);

  // ── Load history ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) fetchHistory();
  }, [user, currentView]);

  // ── Init workout data when routine selected ───────────────────────────────
  // DESPUÉS:
useEffect(() => {
    if (!activeRoutine) return;
    const loadLastWorkout = async () => {
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('workout_details')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      const d: any = {};
      activeRoutine.exercises.forEach((ex: any) => {
        const exName = (ex.name || ex.exercise_name || '').toLowerCase();
        let lastWeight = '';
        let lastReps = ex.reps || '10';
        if (logs) {
          for (const log of logs) {
            const found = log.workout_details?.find((wd: any) =>
              (wd.exercise_name || '').toLowerCase() === exName
            );
            if (found?.sets?.length > 0) {
              lastWeight = String(found.sets[0].weight || '');
              lastReps = String(found.sets[0].reps || ex.reps || '10');
              break;
            }
          }
        }
        d[ex.id] = Array.from({ length: parseInt(ex.sets) || 3 }).map(() => ({
          weight: lastWeight, reps: lastReps, completed: false
        }));
      });
      setWorkoutData(d);
      setWorkoutTimer(0);
      setIsActive(false);
    };
    loadLastWorkout();
  }, [activeRoutine]);

  // ── Data fetchers ─────────────────────────────────────────────────────────
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setUserStats(prev => ({ 
      ...prev, 
      name: data.full_name || prev.name, weight: data.weight || prev.weight, 
      height: data.height || prev.height, age: data.age?.toString() || prev.age, 
      gender: data.gender || prev.gender, focus: data.focus_areas || [], 
      dietStyle: data.diet_style || '', injuries: data.injuries || '', 
      experienceLevel: data.experience_level || '', trainingDays: data.training_days?.toString() || '3',
      diameters: data.measurements?.diameters || prev.diameters, 
      skinfolds: data.measurements?.skinfolds || prev.skinfolds, 
      perimeters: data.measurements?.perimeters || prev.perimeters, 
      results: data.measurements?.results || prev.results,
      role: data.role || 'user',
    }));
  };

  const fetchRoutines = async (userId: string) => {
    const { data: rData } = await supabase.from('routines').select('*').eq('user_id', userId);
    if (rData) {
      const { data: eData } = await supabase.from('routine_exercises').select('*, custom_exercises(*)').in('routine_id', rData.map(r => r.id));
      setRoutines(rData.map(r => ({ 
        ...r, 
        exercises: (eData || []).filter(e => e.routine_id === r.id).map(re => ({ 
          ...re.custom_exercises, routineExerciseId: re.id, sets: re.sets, reps: re.reps, restTime: re.rest_time 
        })) 
      })));
    }
  };

  const fetchExercises = async (term = '') => {
    let q = supabase.from('all_exercises').select('*').order('name');
    if (term.trim() !== '') { q = q.ilike('name', `%${term}%`) }
    const { data } = await q;
    if (data) setResults(data.map(ex => ({ ...ex, gifUrl: ex.gif_url })));
  };

  const fetchHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('workout_logs').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (error) {
      console.error("Error cargando historial:", error);
    } else {
      const cleanData = (data || []).map((log: any) => ({
        ...log,
        workout_details: Array.isArray(log.workout_details) 
          ? log.workout_details.map((ex: any) => ({ ...ex, sets: Array.isArray(ex.sets) ? ex.sets : [] }))
          : []
      }));
      setHistory(cleanData);
    }
  };

  // ── Navigation guard ──────────────────────────────────────────────────────
  const handleNavigate = (view: string) => {
    if (isActive && view !== 'workout') {
      setPendingNavTarget(view);
    } else {
      setCurrentView(view as any);
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const updateSet = (exerciseId: string, setIndex: number, newData: any) => {
    setWorkoutData((prev: any) => {
      const currentSets = [...(prev[exerciseId] || [])];
      if (newData.completed === true && !currentSets[setIndex]?.completed) {
        const exerciseConfig = activeRoutine.exercises.find(
          (e: any) => e.id === exerciseId || e.exercise_id === exerciseId
        );
        const restTime = parseInt(exerciseConfig?.restTime || exerciseConfig?.rest_time) || 60;
        setRestTimer(restTime);
        setTotalRestTime(restTime);
        setIsResting(true);
      }
      currentSets[setIndex] = { ...currentSets[setIndex], ...newData };
      return { ...prev, [exerciseId]: currentSets };
    });
  };

  const handleCreateExercise = async () => {
    if (!newExData.name || !user) return;
    setIsSaving(true);
    const { error } = await supabase.from('exercises').insert([{ ...newExData, user_id: user.id }]);
    if (!error) { 
      setShowCreateExModal(false); 
      setNewExData({ name: '', target: 'chest', gif_url: '' }); 
      fetchExercises(); 
      Toast.show({ text: 'Creado' }); 
    }
    setIsSaving(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    await supabase.from('profiles').upsert({ 
      id: user.id, full_name: userStats.name, weight: userStats.weight, height: userStats.height, 
      age: parseInt(userStats.age), gender: userStats.gender, focus_areas: userStats.focus, 
      diet_style: userStats.dietStyle, injuries: userStats.injuries, 
      experience_level: userStats.experienceLevel, training_days: parseInt(userStats.trainingDays) || 3,
      measurements: { diameters: userStats.diameters, skinfolds: userStats.skinfolds, perimeters: userStats.perimeters, results: userStats.results }, 
      updated_at: new Date().toISOString() 
    });
    setIsSaving(false);
    Toast.show({ text: 'Guardado' });
  };

  const saveWithHistory = async () => {
    setIsSaving(true);
    await saveProfile(); 
    await supabase.from('body_stats_history').insert([{
      user_id: user.id,
      weight: parseFloat(userStats.weight),
      measurements: { skinfolds: userStats.skinfolds, perimeters: userStats.perimeters, results: userStats.results },
      date: new Date().toISOString()
    }]);
    setIsSaving(false);
  };  

  const handleLogin = async () => {
    if (!authEmail || !authPass) return alert("Ingresa credenciales");
    setIsSaving(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setShowSplash(true);
        fetchProfile(data.user.id);
        fetchRoutines(data.user.id);
        const { data: hData } = await supabase.from('workout_logs').select('*').eq('user_id', data.user.id).order('date', { ascending: false });
        if (hData) setHistory(hData);
        fetchExercises();
        setTimeout(() => setSplashExiting(true), 1800);
        setTimeout(() => { setShowSplash(false); setSplashExiting(false); }, 2400);
      }
    } catch (err: any) {
      alert(err.message || "Error al iniciar sesión");
    } finally {
      setIsSaving(false);
    }
  };

  const finishWorkout = async () => {
    if (!user) return alert("Sesión expirada");
    if (!activeRoutine) return;
    setIsSaving(true);
    try {
      const details = activeRoutine.exercises.map((ex: any) => {
        const exerciseKey = ex.id || ex.exercise_id;
        const setsFromState = workoutData[exerciseKey] || [];
        const setsArray = Array.isArray(setsFromState) ? setsFromState : Object.values(setsFromState);
        const validSets = setsArray.filter((s: any) => {
          const w = parseFloat(s.weight);
          const r = parseInt(s.reps);
          return !isNaN(w) && (w > 0 || r > 0);
        });
        return { 
          exercise_name: ex.name || ex.exercise_name, 
          sets: validSets.map((s: any) => ({ weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps) || 0 })) 
        };
      }).filter((ex: any) => ex && ex.sets.length > 0);

      if (details.length === 0) {
        alert("⚠️ No has anotado ningún peso.");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.from('workout_logs').insert([{ 
        user_id: user.id, 
        routine_name: activeRoutine.name, 
        duration: formatTime(workoutTimer),
        total_sets: details.reduce((acc: number, ex: any) => acc + ex.sets.length, 0), 
        workout_details: details, 
        created_at: new Date().toISOString() 
      }]);

      if (error) throw error;

      confetti({
        particleCount: 150, spread: 70, origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#ffffff']
      });

      setActiveRoutine(null); 
      setWorkoutData({}); 
      setCurrentView('home'); 
      setIsResting(false); 
      setRestTimer(0);
      setWorkoutTimer(0);
      setIsActive(false);
      fetchHistory(); 

    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const streak = useMemo(() => {
    if (!history || history.length === 0) return 0;
    try {
      const dates = Array.from(new Set(history.map((l: any) => l.date?.split('T')[0]))).sort().reverse() as string[];
      let c = 0; let curr = new Date(dates[0]);
      for (const d of dates) {
        if (d === curr.toISOString().split('T')[0]) { c++; curr.setDate(curr.getDate() - 1); } else break;
      }
      return c;
    } catch (e) { return 0; }
  }, [history]);

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(0,229,168,0.08), transparent 50%), radial-gradient(circle at 80% 0%, rgba(124,92,255,0.08), transparent 50%), #0B1220' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(0,229,168,0.07)' }} />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(124,92,255,0.07)' }} />
        </div>
        <div className="relative w-full max-w-md space-y-6 p-8 rounded-[20px] backdrop-blur-[10px]" style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          <div className="text-center space-y-2">
            <div className="p-4 rounded-2xl w-fit mx-auto" style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 8px 30px rgba(0,229,168,0.35)' }}>
              <Dumbbell size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black uppercase text-white tracking-tight truncate">Gym<span style={{ color: '#00E5A8' }}>Pro</span></h1>
            <p className="text-sm" style={{ color: '#A8B3CF' }}>Tu compañero de entrenamiento</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6B7895' }}>
                <Mail size={18} />
              </div>
              <input
                suppressHydrationWarning
                className="w-full rounded-xl p-3 pl-12 outline-none text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6B7895' }}>
                <Lock size={18} />
              </div>
              <input
                suppressHydrationWarning
                type="password"
                title="password"
                className="w-full rounded-xl p-3 pl-12 outline-none text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                value={authPass}
                onChange={e => setAuthPass(e.target.value)}
                placeholder="Contraseña"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isSaving}
            className="w-full py-4 rounded-[30px] font-bold uppercase text-white disabled:opacity-50 transition-all active:scale-[0.96]"
            style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 8px 30px rgba(0,229,168,0.45)' }}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin"><Loader2 size={20} /></span> Entrando...
              </span>
            ) : 'Entrar'}
          </button>

          <p className="text-center text-xs" style={{ color: '#6B7895' }}>
            ¿No tienes cuenta? <span className="font-bold" style={{ color: '#00E5A8' }}>Regístrate</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen text-white overflow-hidden font-sans relative" style={{ background: 'transparent' }}>

      <style>{`
        @keyframes logoPopIn {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.22) rotate(5deg); opacity: 1; }
          80%  { transform: scale(0.93) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes textSlideUp {
          from { transform: translateY(28px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 40px 8px rgba(0,229,168,0.45); }
          50%       { box-shadow: 0 0 90px 35px rgba(0,194,255,0.7); }
        }
        @keyframes rippleOut {
          0%   { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes bgBreath {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50%       { opacity: 0.22; transform: scale(1.15); }
        }
        @keyframes splashExit {
          0%   { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
          100% { opacity: 0; transform: scale(1.1) translateY(-12px); filter: blur(6px); }
        }
        @keyframes homeCardIn {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes homeCTABounce {
          0%   { transform: scale(0.85); opacity: 0; }
          70%  { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes viewEnter {
          0%   { opacity: 0; transform: translateY(18px) scale(0.98); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0px); }
        }
        @keyframes logoutExit {
          0%   { opacity: 1; transform: scale(1)    translateY(0);    filter: blur(0px); }
          100% { opacity: 0; transform: scale(1.06) translateY(-20px); filter: blur(8px); }
        }
      `}</style>

      {/* ── Splash overlay ──────────────────────────────────────────── */}
      {showSplash && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
          style={{ background: '#0B1220', ...(splashExiting ? { animation: 'splashExit 0.6s cubic-bezier(0.4,0,1,1) forwards' } : {}) }}
        >
          {/* Pulsing background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full blur-[100px]"
            style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', animation: 'bgBreath 1.4s ease-in-out infinite' }}
          />

          {/* Ripple rings */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{ borderColor: 'rgba(0,229,168,0.4)', animation: `rippleOut 1.6s ease-out ${i * 0.45}s infinite` }}
            />
          ))}

          {/* Content */}
          <div className="relative flex flex-col items-center gap-6 px-8">
            {/* Logo icon */}
            <div
              className="p-7 rounded-[2rem]"
              style={{
                background: 'linear-gradient(135deg,#00E5A8,#00C2FF)',
                animation: 'logoPopIn 0.75s cubic-bezier(0.175,0.885,0.32,1.275) forwards, glowPulse 1.3s ease-in-out 0.75s infinite',
                boxShadow: '0 0 40px 8px rgba(0,229,168,0.45)'
              }}
            >
              <Dumbbell size={60} className="text-white" />
            </div>

            {/* Brand */}
            <div
              className="text-center"
              style={{ animation: 'textSlideUp 0.55s ease-out 0.45s both' }}
            >
              <h1 className="text-6xl font-black uppercase text-white tracking-tight">
                Gym<span style={{ color: '#00E5A8' }}>Pro</span>
              </h1>
              <p className="text-sm tracking-[0.25em] uppercase font-bold mt-1" style={{ color: '#A8B3CF' }}>
                Tu compañero de entrenamiento
              </p>
            </div>

            {/* Call to action */}
            <div
              className="mt-2 px-8 py-3 rounded-2xl"
              style={{ background: 'rgba(0,229,168,0.1)', border: '1px solid rgba(0,229,168,0.25)', animation: 'textSlideUp 0.55s ease-out 0.85s both' }}
            >
              <p className="font-black uppercase tracking-widest text-sm" style={{ color: '#00E5A8' }}>
                ¡Listo para entrenar!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FIX: nombre de elemento faltante — era "< className=..." */}
      <div className="flex-1 overflow-y-auto pb-28 pt-12 md:pt-10" style={{ background: 'transparent' }}>
        <div key={currentView} className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8" style={{ animation: 'viewEnter 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>

          {/* ── HOME ───────────────────────────────────────────────────── */}
          {currentView === 'home' && (
            <div className="space-y-8">
              <header
                className="p-6 rounded-[20px] text-center backdrop-blur-[10px]"
                style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', animation: 'homeCardIn 0.55s ease-out both' }}
              >
                <div className="mb-6">
                  <p className="text-xs uppercase font-semibold tracking-widest mb-2" style={{ color: '#6B7895' }}>Bienvenido</p>
                  <h1 className="text-4xl md:text-5xl font-black text-white truncate">{userStats.name}</h1>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg,rgba(30,58,138,0.6),rgba(37,99,235,0.4))', border: '1px solid rgba(37,99,235,0.3)' }}>
                    <p className="text-[10px] uppercase font-bold mb-1" style={{ color: '#60a5fa' }}>{t('weight')}(Kg)</p>
                    <p className="text-xl font-bold text-white">{userStats.weight}</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg,rgba(76,29,149,0.6),rgba(124,58,237,0.4))', border: '1px solid rgba(124,58,237,0.3)' }}>
                    <p className="text-[10px] uppercase font-bold mb-1" style={{ color: '#a78bfa' }}>{t('height')}(m)</p>
                    <p className="text-xl font-bold text-white">{userStats.height}</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg,rgba(6,95,70,0.6),rgba(16,185,129,0.4))', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <p className="text-[10px] uppercase font-bold mb-1" style={{ color: '#00E5A8' }}>{t('streak')}</p>
                    <p className="text-xl font-bold text-white">{streak} / {userStats.trainingDays}</p>
                  </div>
                </div>
              </header>

              <section className="space-y-4" style={{ animation: 'homeCTABounce 0.6s cubic-bezier(0.175,0.885,0.32,1.275) 0.15s both' }}>
                <h2 className="text-[10px] font-bold uppercase px-2 tracking-widest text-center" style={{ color: '#6B7895' }}>Selecciona tu entrenamiento del día</h2>
                <button
                  onClick={() => setCurrentView('myRoutines')}
                  className="w-full p-5 md:p-8 rounded-[30px] flex items-center transition-all active:scale-[0.96] overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 8px 30px rgba(0,229,168,0.45)' }}
                >
                  <div className="flex items-center gap-3 md:gap-5 min-w-0">
                    <div className="p-3 md:p-4 rounded-2xl shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <PlayIcon size={24} fill="white" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-white font-black uppercase text-base md:text-xl leading-none truncate" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>Empezar Mi Entreno</p>
                      <p className="text-xs font-bold uppercase mt-2 tracking-widest truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <span className="text-white font-black">{routines.length}</span> rutinas disponibles
                      </p>
                    </div>
                  </div>
                </button>
              </section>

              {history[0] && (
                <section
                  className="p-5 rounded-[20px] backdrop-blur-[10px]"
                  style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', animation: 'homeCardIn 0.55s ease-out 0.3s both' }}
                >
                  <h2 className="text-[10px] font-bold uppercase mb-3 flex items-center gap-2" style={{ color: '#6B7895' }}>
                    <History size={14}/> {t('lastWorkout')}
                  </h2>
                  <div className="flex justify-between items-center min-w-0">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold truncate" style={{ color: '#00E5A8' }}>{history[0].routine_name}</h3>
                      <p className="text-xs truncate" style={{ color: '#A8B3CF' }}>{new Date(history[0].date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-white">{history[0].duration}</p>
                      <p className="text-[10px] uppercase font-bold" style={{ color: '#6B7895' }}>{history[0].total_sets} Series totales</p>
                    </div>
                  </div>
                </section>
              )}

              <div
                className="p-6 rounded-[20px] space-y-4 backdrop-blur-[10px]"
                style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', animation: 'homeCardIn 0.55s ease-out 0.45s both' }}
              >
                <h2 className="text-sm font-bold uppercase flex items-center gap-2" style={{ color: '#00E5A8' }}>
                  <PlusCircle size={18}/> Notas
                </h2>
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-sm leading-relaxed italic" style={{ color: '#A8B3CF' }}>
                    "{userStats.injuries || 'Sin notas'}"
                  </p>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00E5A8' }} />
                  <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#6B7895' }}>
                    Información personal y de preferencia
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ── PROFILE / PROGRESS ─────────────────────────────────────── */}
          {currentView === 'progress' && (
            <div className="space-y-5 pb-20">

              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: '#6B7895' }}>Tu cuenta</p>
                  <h1 className="text-3xl font-black uppercase tracking-tight text-white">{t('profile')}</h1>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="p-3 rounded-2xl transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Globe size={18} style={{ color: '#00E5A8' }}/>
                </button>
              </div>

              {/* Avatar + nombre */}
              <div
                className="p-6 rounded-[20px] flex items-center gap-5"
                style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 font-black text-2xl text-white"
                  style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 4px 20px rgba(0,229,168,0.35)' }}
                >
                  {userStats.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-white truncate">{userStats.name}</h2>
                  <p className="text-xs font-bold mt-0.5" style={{ color: '#6B7895' }}>{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00E5A8' }} />
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#00E5A8' }}>
                      {userStats.role === 'admin' ? 'Administrador' : 'Atleta activo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-[20px] text-center" style={{ background: 'linear-gradient(135deg,rgba(30,58,138,0.5),rgba(37,99,235,0.35))', border: '1px solid rgba(37,99,235,0.25)' }}>
                  <p className="text-[9px] uppercase font-bold mb-1" style={{ color: '#60a5fa' }}>{t('weight')}</p>
                  <p className="text-xl font-black text-white">{userStats.weight}</p>
                  <p className="text-[9px]" style={{ color: '#60a5fa' }}>kg</p>
                </div>
                <div className="p-4 rounded-[20px] text-center" style={{ background: 'linear-gradient(135deg,rgba(76,29,149,0.5),rgba(124,58,237,0.35))', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <p className="text-[9px] uppercase font-bold mb-1" style={{ color: '#a78bfa' }}>{t('height')}</p>
                  <p className="text-xl font-black text-white">{userStats.height}</p>
                  <p className="text-[9px]" style={{ color: '#a78bfa' }}>m</p>
                </div>
                <div className="p-4 rounded-[20px] text-center" style={{ background: 'linear-gradient(135deg,rgba(6,95,70,0.5),rgba(16,185,129,0.35))', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <p className="text-[9px] uppercase font-bold mb-1" style={{ color: '#00E5A8' }}>Racha</p>
                  <p className="text-xl font-black text-white">{streak}</p>
                  <p className="text-[9px]" style={{ color: '#00E5A8' }}>días</p>
                </div>
              </div>

              {/* Composición corporal */}
              <div
                className="p-5 rounded-[20px] space-y-4"
                style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
              >
                <h2 className="text-xs font-black uppercase flex items-center gap-2" style={{ color: '#00E5A8' }}>
                  <Activity size={14}/> {t('composition')}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                    <p className="text-[9px] uppercase font-bold mb-1" style={{ color: '#f87171' }}>{t('fat')}</p>
                    <p className="text-2xl font-black" style={{ color: '#f87171' }}>{userStats.results.fatPercentage}<span className="text-sm">%</span></p>
                    <p className="text-[9px] mt-0.5" style={{ color: '#6B7895' }}>{userStats.results.fatLabel}</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(0,229,168,0.08)', border: '1px solid rgba(0,229,168,0.18)' }}>
                    <p className="text-[9px] uppercase font-bold mb-1" style={{ color: '#00E5A8' }}>{t('muscle')}</p>
                    <p className="text-2xl font-black" style={{ color: '#00E5A8' }}>{userStats.results.muscleMass}<span className="text-sm">kg</span></p>
                    <p className="text-[9px] mt-0.5" style={{ color: '#6B7895' }}>Masa magra</p>
                  </div>
                  <div className="p-4 rounded-2xl col-span-2" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.18)' }}>
                    <p className="text-[9px] uppercase font-bold mb-1" style={{ color: '#60a5fa' }}>IMC — {t('imc')}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black" style={{ color: '#60a5fa' }}>{userStats.results.bmi}</p>
                      <span className="text-[9px] px-2 py-1 rounded-lg font-bold" style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
                        {userStats.results.bmiLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={async () => {
                    setLoggingOut(true)
                    await new Promise(r => setTimeout(r, 700))
                    await supabase.auth.signOut()
                  }}
                  disabled={loggingOut}
                  className="w-full py-4 rounded-[20px] flex items-center justify-center gap-3 transition-all active:scale-[0.97]"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <LogOut size={18} style={{ color: '#ef4444' }} />
                  <span className="font-black uppercase text-sm tracking-widest" style={{ color: '#ef4444' }}>
                    {loggingOut ? 'Cerrando...' : t('logout')}
                  </span>
                </button>
                <p className="text-center text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: '#6B7895' }}>
                  Versión 1.0.2 • FitApp
                </p>
              </div>

            </div>
          )}

          {/* ── SETTINGS / ROUTINES ────────────────────────────────────── */}
          {currentView === 'routines' && (
            <div className="space-y-5">

              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: '#6B7895' }}>Configuración</p>
                  <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                    {activeSettingsTab === 'rutinas' ? t('rutinas') : t('settings')}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSettingsTab(activeSettingsTab === 'rutinas' ? 'general' : 'rutinas')}
                    className="p-3 rounded-2xl transition-all active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Settings size={18} style={{ color: '#6B7895' }}/>
                  </button>
                  {activeSettingsTab !== 'rutinas' && (
                    <button
                      onClick={saveProfile} disabled={isSaving}
                      className="px-5 py-2.5 rounded-2xl font-black text-xs uppercase text-white flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 4px 16px rgba(0,229,168,0.35)' }}
                    >
                      <Save size={15}/> {isSaving ? '...' : t('save')}
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {['general', 'objetivos', 'antropometria', 'rutinas'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSettingsTab(tab)}
                    className="flex-shrink-0 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95"
                    style={activeSettingsTab === tab
                      ? { background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', color: '#fff', boxShadow: '0 4px 16px rgba(0,229,168,0.35)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7895' }
                    }
                  >
                    {t(tab as any)}
                  </button>
                ))}
              </div>

              {/* Tab content card */}
              <div className="p-5 rounded-[20px]" style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>

                {/* TAB GENERAL */}
                {activeSettingsTab === 'general' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-2" style={{ color: '#6B7895' }}>Nombre Completo</label>
                      <input
                        className="w-full rounded-xl p-3 outline-none text-white"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        value={userStats.name} onChange={e => setUserStats({...userStats, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Peso (kg)', key: 'weight', type: 'number', step: '0.1' },
                        { label: 'Altura (m)', key: 'height', type: 'number', step: '0.01' },
                        { label: 'Edad', key: 'age', type: 'number', step: '1' },
                      ].map(({ label, key, type, step }) => (
                        <div key={key}>
                          <label className="block text-[10px] uppercase font-bold mb-2" style={{ color: '#6B7895' }}>{label}</label>
                          <input
                            type={type} step={step}
                            className="w-full rounded-xl p-3 outline-none font-bold text-white"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                            value={(userStats as any)[key]} onChange={e => setUserStats({...userStats, [key]: e.target.value})}
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-[10px] uppercase font-bold mb-2" style={{ color: '#6B7895' }}>Sexo</label>
                        <select
                          className="w-full rounded-xl p-3 outline-none text-white"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                          value={userStats.gender} onChange={e => setUserStats({...userStats, gender: e.target.value})}
                        >
                          <option value="Hombre">Hombre</option>
                          <option value="Mujer">Mujer</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB OBJETIVOS */}
                {activeSettingsTab === 'objetivos' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-3" style={{ color: '#6B7895' }}>{t('focusAreas')}</label>
                      <div className="flex flex-wrap gap-2">
                        {FOCUS_OPTIONS.map(opt => {
                          const active = userStats.focus.includes(opt)
                          return (
                            <button
                              key={opt}
                              onClick={() => setUserStats({...userStats, focus: active ? userStats.focus.filter(f => f !== opt) : [...userStats.focus, opt]})}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                              style={active
                                ? { background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', color: '#fff', boxShadow: '0 2px 12px rgba(0,229,168,0.3)' }
                                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B7895' }
                              }
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-2" style={{ color: '#6B7895' }}>Nivel de Experiencia</label>
                      <select
                        className="w-full rounded-xl p-3 outline-none text-white"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        value={userStats.experienceLevel} onChange={e => setUserStats({...userStats, experienceLevel: e.target.value})}
                      >
                        <option value="">Seleccionar</option>
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-2" style={{ color: '#6B7895' }}>Días de Entrenamiento / Semana</label>
                      <input
                        type="number" min="1" max="7"
                        className="w-full rounded-xl p-3 outline-none text-white"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        value={userStats.trainingDays} onChange={e => setUserStats({...userStats, trainingDays: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-2" style={{ color: '#6B7895' }}>Adicionales / Notas</label>
                      <textarea
                        className="w-full rounded-xl p-3 outline-none text-white resize-none h-24"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        value={userStats.injuries} onChange={e => setUserStats({...userStats, injuries: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {/* TAB ANTROPOMETRIA */}
                {activeSettingsTab === 'antropometria' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: 'Pliegues (mm)', data: userStats.skinfolds, key: 'skinfolds' },
                      { title: 'Perímetros (cm)', data: userStats.perimeters, key: 'perimeters' },
                    ].map(({ title, data, key }) => (
                      <div key={key} className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase pb-2" style={{ color: '#00E5A8', borderBottom: '1px solid rgba(0,229,168,0.15)' }}>{title}</h4>
                        {Object.keys(data).map(k => (
                          <div key={k} className="flex justify-between items-center">
                            <span className="text-xs capitalize" style={{ color: '#A8B3CF' }}>{k}</span>
                            <input
                              type="number"
                              className="w-20 rounded-lg p-1.5 text-center text-xs font-bold text-white outline-none"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                              value={(data as any)[k]}
                              onChange={e => setUserStats({...userStats, [key]: {...(userStats as any)[key], [k]: e.target.value}})}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB RUTINAS */}
                {activeSettingsTab === 'rutinas' && (
                  <div className="space-y-3">
                    <button
                      onClick={async () => {
                        const n = prompt('Nombre de la rutina:')
                        if (n) { await supabase.from('routines').insert([{ name: n, user_id: user.id }]); fetchRoutines(user.id); }
                      }}
                      className="w-full p-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs transition-all active:scale-95"
                      style={{ border: '1.5px dashed rgba(0,229,168,0.3)', color: '#00E5A8', background: 'rgba(0,229,168,0.04)' }}
                    >
                      <Plus size={18}/> Nueva Rutina
                    </button>
                    {routines.map(r => (
                      <div key={r.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black uppercase text-sm text-white truncate">{r.name}</h3>
                            <p className="text-[10px] font-bold uppercase mt-0.5" style={{ color: '#00E5A8' }}>{r.exercises?.length || 0} ejercicios</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => { setShowEditRoutineModal(r.id); setCurrentView('exercises'); }}
                              className="px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95"
                              style={{ background: 'rgba(0,194,255,0.1)', border: '1px solid rgba(0,194,255,0.2)', color: '#00C2FF' }}
                            >
                              + Añadir
                            </button>
                            <button
                              onClick={() => setShowEditRoutineModal(r.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              <Settings size={15} style={{ color: '#6B7895' }}/>
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`¿Eliminar "${r.name}"?`)) return;
                                await supabase.from('routine_exercises').delete().eq('routine_id', r.id);
                                await supabase.from('routines').delete().eq('id', r.id);
                                fetchRoutines(user.id);
                              }}
                              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95"
                              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
                            >
                              <Trash2 size={15} style={{ color: '#ef4444' }}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ── MIS RUTINAS (vista limpia para iniciar workout) ────── */}
          {currentView === 'myRoutines' && (
            <div className="space-y-6 pb-6" style={{ animation: 'homeCardIn 0.45s ease-out both' }}>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: '#6B7895' }}>Tu plan</p>
                  <h1 className="text-3xl font-black uppercase tracking-tight text-white">Mis Rutinas</h1>
                </div>
                <div
                  className="p-3 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 4px 20px rgba(0,229,168,0.35)' }}
                >
                  <Dumbbell size={22} className="text-white" />
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,229,168,0.15)' }}>
                    <Dumbbell size={16} style={{ color: '#00E5A8' }} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white leading-none">{routines.length}</p>
                    <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color: '#6B7895' }}>Rutinas</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(124,92,255,0.15)' }}>
                    <Activity size={16} style={{ color: '#7C5CFF' }} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white leading-none">{routines.reduce((a: number, r: any) => a + (r.exercises?.length || 0), 0)}</p>
                    <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color: '#6B7895' }}>Ejercicios</p>
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="space-y-3">
                {routines.length === 0 && (
                  <div className="text-center py-20 rounded-[20px]" style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <Dumbbell size={32} style={{ color: '#6B7895' }} />
                    </div>
                    <p className="font-bold uppercase text-sm mb-1" style={{ color: '#A8B3CF' }}>No tienes rutinas aún</p>
                    <p className="text-xs mb-5" style={{ color: '#6B7895' }}>Crea tu primera rutina para empezar</p>
                    <button
                      onClick={() => { setCurrentView('routines'); setActiveSettingsTab('rutinas'); }}
                      className="px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest text-white"
                      style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 4px 20px rgba(0,229,168,0.3)' }}
                    >
                      + Crear rutina
                    </button>
                  </div>
                )}

                {routines.map((r, idx) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-[20px] flex items-center justify-between gap-4 transition-all active:scale-[0.98] backdrop-blur-[10px]"
                    style={{
                      background: 'rgba(18,26,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      animation: `homeCardIn 0.4s ease-out ${idx * 0.07}s both`
                    }}
                  >
                    {/* Color accent bar */}
                    <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: 'linear-gradient(180deg,#00E5A8,#00C2FF)' }} />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-black uppercase text-base text-white truncate">{r.name}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase" style={{ color: '#6B7895' }}>
                          <Dumbbell size={10} /> {r.exercises?.length || 0} ejercicios
                        </span>
                        {r.exercises?.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase" style={{ color: '#6B7895' }}>
                            <Activity size={10} /> {r.exercises.reduce((a: number, e: any) => a + (parseInt(e.sets) || 3), 0)} series
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setActiveRoutine(r); setCurrentView('workout'); }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg"
                        style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 4px 20px rgba(0,229,168,0.4)' }}
                      >
                        <PlayIcon size={20} fill="white" className="text-white ml-0.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {currentView === 'nutrition' && (
          <NutritionView userId={user?.id} supabase={supabase} />
        )}


          {currentView === 'admin' && (
          <AdminView supabase={supabase} />
        )}

          {/* ── EXERCISES LIBRARY ──────────────────────────────────────── */}
          {currentView === 'exercises' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase tracking-tighter truncate">{t('library')}</h1>
                <button onClick={() => setShowCreateExModal(true)} className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg flex items-center gap-2 font-bold text-xs uppercase">
                  <Plus size={18}/> {t('createEx')}
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500" />
                <input placeholder={t('search')} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 outline-none font-bold" onChange={e => fetchExercises(e.target.value)} />
              </div>
              <div className="space-y-3">
                {results.map(ex => (
                  <div key={ex.id} className="flex items-center gap-4 bg-gray-800 p-3 rounded-2xl border border-gray-700 group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                      {ex.gifUrl && <img src={ex.gifUrl} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm capitalize truncate">{ex.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{ex.target}</p>
                    </div>
                    {showEditRoutineModal && (
                      <button 
                        onClick={async () => { 
                          await supabase.from('routine_exercises').insert([{ routine_id: showEditRoutineModal, exercise_id: ex.id, sets: 3, reps: '12', rest_time: 60 }]); 
                          fetchRoutines(user.id); 
                          Toast.show({text: 'Añadido'}); 
                        }} 
                        className="bg-emerald-500 p-3 rounded-xl text-white shadow-lg"
                      >
                        <Plus size={20}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ACTIVE WORKOUT ─────────────────────────────────────────── */}
          {currentView === 'workout' && activeRoutine && (
            <div className="max-w-2xl mx-auto w-full space-y-5 pb-36" style={{ animation: 'homeCardIn 0.45s ease-out both' }}>

              {/* ── Sticky header ── */}
              <div
                className="sticky top-0 z-30 px-5 py-4 rounded-[20px] backdrop-blur-[16px]"
                style={{ background: 'rgba(11,18,32,0.95)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-0.5" style={{ color: '#00E5A8' }}>
                      Entrenamiento Activo
                    </p>
                    <h2 className="text-xl font-black tracking-tight uppercase text-white truncate">
                      {activeRoutine.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: isActive ? '#00E5A8' : '#6B7895', animation: isActive ? 'bgBreath 1.4s ease-in-out infinite' : 'none' }}
                      />
                      <span className="text-2xl font-mono font-black text-white leading-none">{formatTime(workoutTimer)}</span>
                      {isActive && (
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,168,0.12)', color: '#00E5A8' }}>
                          En curso
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!isActive) { setIsActive(true) }
                      else { setShowFinishConfirm(true) }
                    }}
                    className="px-5 py-3 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all text-white"
                    style={isActive
                      ? { background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }
                      : { background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 4px 20px rgba(0,229,168,0.4)' }
                    }
                  >
                    {isActive ? t('finish') : 'INICIAR'}
                  </button>
                </div>
              </div>

              {/* ── Exercise cards ── */}
              <div className="space-y-4">
                {activeRoutine.exercises.map((exercise: any, exIdx: number) => {
                  const numSets = parseInt(exercise.sets) || 3;
                  const completedSets = Array.from({ length: numSets }).filter((_, i) =>
                    workoutData[exercise.id]?.[i]?.completed
                  ).length;
                  const allDone = completedSets === numSets;

                  return (
                    <div
                      key={`workout-ex-${exercise.id}`}
                      className="rounded-[20px] overflow-hidden backdrop-blur-[10px]"
                      style={{
                        background: allDone ? 'rgba(0,229,168,0.06)' : 'rgba(18,26,42,0.9)',
                        border: allDone ? '1px solid rgba(0,229,168,0.25)' : '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                        animation: `homeCardIn 0.4s ease-out ${exIdx * 0.06}s both`,
                        transition: 'background 0.4s ease, border-color 0.4s ease'
                      }}
                    >
                      {/* Exercise header */}
                      <div className="p-5 flex items-center gap-4">
                        <div
                          className="relative w-18 h-18 flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center"
                          style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          {(exercise.gif_url || exercise.gifUrl) ? (
                            <img
                              src={exercise.gif_url || exercise.gifUrl}
                              alt={exercise.name}
                              className="w-full h-full object-contain p-1"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                if (fb) (fb as HTMLElement).classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`fallback-icon flex flex-col items-center justify-center opacity-50 ${(exercise.gif_url || exercise.gifUrl) ? 'hidden' : ''}`}>
                            <Dumbbell size={22} style={{ color: '#00E5A8' }} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-black text-white uppercase tracking-tight truncate">
                            {exercise.name || 'Ejercicio'}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(0,229,168,0.1)', color: '#00E5A8', border: '1px solid rgba(0,229,168,0.2)' }}>
                              {exercise.target || 'Cuerpo'}
                            </span>
                            {exercise.equipment && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.05)', color: '#6B7895', border: '1px solid rgba(255,255,255,0.07)' }}>
                                {exercise.equipment}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress pill */}
                        <div className="shrink-0 flex flex-col items-center gap-1">
                          <span className="text-lg font-black" style={{ color: allDone ? '#00E5A8' : '#A8B3CF' }}>
                            {completedSets}/{numSets}
                          </span>
                          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${(completedSets / numSets) * 100}%`, background: 'linear-gradient(90deg,#00E5A8,#00C2FF)' }}
                            />
                          </div>
                          <span className="text-[8px] uppercase font-bold" style={{ color: '#6B7895' }}>series</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 20px' }} />

                      {/* Sets table */}
                      <div className="p-5 space-y-3">
                        <div className="grid grid-cols-[28px_1fr_1fr_36px] gap-3 px-1 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#6B7895' }}>Set</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-center" style={{ color: '#6B7895' }}>Peso (kg)</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-center" style={{ color: '#6B7895' }}>Reps</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-right" style={{ color: '#6B7895' }}>OK</span>
                        </div>
                        {Array.from({ length: numSets }).map((_, index) => (
                          <ExerciseSetRow
                            key={`set-${exercise.id}-${index}`}
                            index={index}
                            set={workoutData[exercise.id]?.[index] || { weight: '', reps: exercise.reps || '10', completed: false }}
                            onUpdate={(updates: any) => updateSet(exercise.id, index, updates)}
                            onToggleComplete={() => {
                              const currentSet = workoutData[exercise.id]?.[index];
                              updateSet(exercise.id, index, { completed: !currentSet?.completed });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── BOTTOM NAV ───────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[999] h-20 flex items-center justify-around px-2"
        style={{ background: '#0B1220', borderTop: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 -10px 30px rgba(0,0,0,0.4)' }}
      >
        {[
          { view: 'home',      icon: Home,     label: t('home') },
          { view: 'nutrition', icon: Utensils, label: t('nutrition') },
          ...(userStats.role === 'admin' ? [{ view: 'admin', icon: Settings, label: 'Admin' }] : []),
          { view: 'progress',  icon: User,     label: t('profile') },
        ].map(({ view, icon: Icon, label }) => {
          const active = currentView === view;
          return (
            <button
              key={view}
              type="button"
              onClick={() => handleNavigate(view)}
              className="flex flex-col items-center justify-center w-full h-full gap-1 relative transition-all active:scale-95"
            >
              {active && (
                <div className="absolute top-0 w-8 h-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)' }} />
              )}
              <Icon size={22} style={{ color: active ? '#00E5A8' : '#6B7895', transition: 'color 0.2s ease' }} />
              <span className="text-[10px] font-bold uppercase" style={{ color: active ? '#00E5A8' : '#6B7895', transition: 'color 0.2s ease' }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── EDIT ROUTINE MODAL ───────────────────────────────────────── */}
      {showEditRoutineModal && currentView !== 'exercises' && (
        <div className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-gray-800 w-full max-w-5xl h-[90vh] rounded-3xl border border-gray-700 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Editar Rutina</h2>
              <button onClick={() => setShowEditRoutineModal(null)} className="bg-emerald-500 px-8 py-2 rounded-xl font-black uppercase text-xs tracking-widest">Listo</button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-800 no-scrollbar">
              {routines.find(r => r.id === showEditRoutineModal)?.exercises.map((ex: any) => (
                <div key={ex.routineExerciseId} className="bg-gray-700/30 p-5 rounded-2xl border border-gray-600 grid grid-cols-4 gap-4 shadow-lg">
                  <div className="col-span-4 flex justify-between items-center font-black uppercase text-sm min-w-0">
                    <span className="truncate">{ex.name}</span> 
                    <button onClick={async () => { await supabase.from('routine_exercises').delete().eq('id', ex.routineExerciseId); fetchRoutines(user.id); }} className="text-red-400"><Trash2 size={16}/></button>
                  </div>
                  <div><label className="text-[10px] text-gray-500 block font-black uppercase mb-1">Series</label><input type="number" title="sets" value={ex.sets} className="w-full bg-gray-900 p-2 rounded-lg text-center font-bold" onChange={async e => { await supabase.from('routine_exercises').update({sets: e.target.value}).eq('id', ex.routineExerciseId); fetchRoutines(user.id); }} /></div>
                  <div><label className="text-[10px] text-gray-500 block font-black uppercase mb-1">Reps</label><input type="text" title="reps" value={ex.reps} className="w-full bg-gray-900 p-2 rounded-lg text-center font-bold" onChange={async e => { await supabase.from('routine_exercises').update({reps: e.target.value}).eq('id', ex.routineExerciseId); fetchRoutines(user.id); }} /></div>
                  <div className="col-span-2"><label className="text-[10px] text-gray-500 block font-black uppercase mb-1">Descanso (seg)</label><input type="number" title="rest" value={ex.restTime} className="w-full bg-gray-900 p-2 rounded-lg text-center font-bold text-emerald-400" onChange={async e => { await supabase.from('routine_exercises').update({rest_time: e.target.value}).eq('id', ex.routineExerciseId); fetchRoutines(user.id); }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE EXERCISE MODAL ────────────────────────────────────── */}
      {showCreateExModal && (
        <div className="fixed inset-0 bg-black/90 z-[2000] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-gray-800 w-full max-w-md rounded-3xl border border-gray-700 p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">Nuevo Ejercicio</h2>
              <button onClick={() => setShowCreateExModal(false)}><X/></button>
            </div>
            <div className="space-y-4">
              <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none" value={newExData.name} onChange={e => setNewExData({...newExData, name: e.target.value})} placeholder="Nombre" />
              <select title="target" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none" value={newExData.target} onChange={e => setNewExData({...newExData, target: e.target.value})}>
                {MUSCLE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none" value={newExData.gif_url} onChange={e => setNewExData({...newExData, gif_url: e.target.value})} placeholder="URL GIF" />
              <button onClick={handleCreateExercise} disabled={isSaving} className="w-full bg-emerald-500 py-4 rounded-xl font-black uppercase shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                {isSaving ? 'Creando...' : 'Crear Ejercicio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REST TIMER OVERLAY ───────────────────────────────────────── */}
      {isResting && (() => {
        const radius = 88;
        const circumference = 2 * Math.PI * radius;
        const progress = totalRestTime > 0 ? restTimer / totalRestTime : 0;
        const dashOffset = circumference * (1 - progress);
        const mins = Math.floor(restTimer / 60);
        const secs = restTimer % 60;
        const strokeColor = progress > 0.5 ? '#00E5A8' : progress > 0.25 ? '#f59e0b' : '#ef4444';
        const glowColor  = progress > 0.5 ? 'rgba(0,229,168,0.4)' : progress > 0.25 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)';
        return (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center backdrop-blur-xl" style={{ background: 'rgba(11,18,32,0.92)' }}>

            {/* Fondo glow dinámico */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[80px] pointer-events-none transition-colors duration-700"
              style={{ background: glowColor, opacity: 0.35 }}
            />

            <div className="relative flex flex-col items-center gap-8 px-8">

              {/* Label */}
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: '#6B7895' }}>Recuperación</p>
                <p className="text-sm font-black uppercase tracking-tight text-white mt-0.5">Tiempo de Descanso</p>
              </div>

              {/* Ring */}
              <div className="relative flex items-center justify-center">
                {/* Outer glow ring */}
                <div
                  className="absolute rounded-full transition-all duration-700"
                  style={{ width: 220, height: 220, boxShadow: `0 0 60px 10px ${glowColor}`, opacity: 0.5 }}
                />
                <svg width="224" height="224" className="-rotate-90">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={strokeColor} />
                      <stop offset="100%" stopColor={progress > 0.5 ? '#00C2FF' : strokeColor} />
                    </linearGradient>
                  </defs>
                  {/* Track */}
                  <circle cx="112" cy="112" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                  {/* Progress */}
                  <circle
                    cx="112" cy="112" r={radius} fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.5s ease' }}
                  />
                </svg>

                {/* Center content */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-6xl font-black font-mono text-white leading-none" style={{ textShadow: `0 0 30px ${strokeColor}` }}>
                    {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : String(secs).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: strokeColor }}>
                    {mins > 0 ? 'minutos' : 'segundos'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${strokeColor}, ${progress > 0.5 ? '#00C2FF' : strokeColor})` }}
                />
              </div>

              {/* Skip button */}
              <button
                onClick={() => setIsResting(false)}
                className="flex items-center gap-3 px-8 py-4 rounded-[30px] font-black uppercase text-sm tracking-widest text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 8px 30px rgba(0,229,168,0.45)' }}
              >
                <SkipForward size={18} className="text-white" />
                Saltar descanso
              </button>

              <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#6B7895' }}>
                El siguiente ejercicio te espera
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── LOGOUT ANIMATION OVERLAY ─────────────────────────────────── */}
      {loggingOut && (
        <div
          className="fixed inset-0 z-[2000] flex flex-col items-center justify-center gap-6"
          style={{ background: '#0B1220', animation: 'splashExit 0.7s cubic-bezier(0.4,0,1,1) 0.5s forwards', opacity: 1 }}
        >
          <div
            className="p-6 rounded-3xl"
            style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <LogOut size={40} style={{ color: '#ef4444' }} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xl font-black uppercase text-white">Hasta pronto</p>
            <p className="text-sm" style={{ color: '#6B7895' }}>Cerrando sesión...</p>
          </div>
        </div>
      )}

      {/* ── FINISH WORKOUT CONFIRM MODAL ─────────────────────────────── */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 backdrop-blur-xl" style={{ background: 'rgba(11,18,32,0.88)' }}>
          <div
            className="w-full max-w-sm rounded-[24px] p-7 space-y-6"
            style={{ background: 'rgba(18,26,42,0.98)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <CheckCircle size={32} style={{ color: '#ef4444' }} />
              </div>
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black uppercase text-white tracking-tight">¿Finalizar entreno?</h3>
              <p className="text-sm" style={{ color: '#A8B3CF' }}>
                Se guardará tu progreso: <span className="font-bold text-white">{formatTime(workoutTimer)}</span> de entrenamiento
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => { setShowFinishConfirm(false); finishWorkout(); }}
                className="w-full py-4 rounded-[20px] font-black uppercase text-sm tracking-widest text-white transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 6px 24px rgba(0,229,168,0.35)' }}
              >
                Sí, finalizar
              </button>
              <button
                onClick={() => {
                  setShowFinishConfirm(false);
                  setIsActive(false);
                  setActiveRoutine(null);
                  setIsResting(false);
                  setCurrentView('myRoutines');
                }}
                className="w-full py-4 rounded-[20px] font-black uppercase text-sm tracking-widest transition-all active:scale-[0.97]"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
              >
                Descartar entreno
              </button>
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="w-full py-3 font-bold uppercase text-xs tracking-widest transition-all active:scale-[0.97]"
                style={{ color: '#6B7895' }}
              >
                Seguir entrenando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WORKOUT NAV GUARD MODAL ───────────────────────────────────── */}
      {pendingNavTarget && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 backdrop-blur-xl" style={{ background: 'rgba(11,18,32,0.88)' }}>
          <div
            className="w-full max-w-sm rounded-[24px] p-7 space-y-6"
            style={{ background: 'rgba(18,26,42,0.98)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.25)' }}>
                <Timer size={32} style={{ color: '#FFA500' }} />
              </div>
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black uppercase text-white tracking-tight">Entreno en curso</h3>
              <p className="text-sm" style={{ color: '#A8B3CF' }}>¿Qué deseas hacer con tu entrenamiento actual?</p>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

            <div className="space-y-3">
              <button
                onClick={async () => {
                  await finishWorkout();
                  setCurrentView(pendingNavTarget as any);
                  setPendingNavTarget(null);
                }}
                className="w-full py-4 rounded-[20px] font-black uppercase text-sm tracking-widest text-white transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 6px 24px rgba(0,229,168,0.35)' }}
              >
                Finalizar y salir
              </button>
              <button
                onClick={() => {
                  setCurrentView(pendingNavTarget as any);
                  setIsActive(false);
                  setActiveRoutine(null);
                  setIsResting(false);
                  setPendingNavTarget(null);
                }}
                className="w-full py-4 rounded-[20px] font-black uppercase text-sm tracking-widest transition-all active:scale-[0.97]"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
              >
                Descartar entreno
              </button>
              <button
                onClick={() => setPendingNavTarget(null)}
                className="w-full py-3 font-bold uppercase text-xs tracking-widest transition-all active:scale-[0.97]"
                style={{ color: '#6B7895' }}
              >
                Volver al entreno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAV ────────────────────────────────────────────────── */}
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />

    </div>
  );
}

// ── ExerciseSetRow component ──────────────────────────────────────────────────
const ExerciseSetRow = ({ index, set, onUpdate, onToggleComplete }: any) => {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${set.completed ? 'bg-emerald-500/20' : 'bg-gray-700/50'}`}>
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-xs font-bold">
        {index + 1}
      </div>
      <div className="flex-1 grid grid-cols-2 gap-2">
        <input 
          type="number" 
          placeholder="kg" 
          value={set.weight ?? ""} 
          onChange={(e) => onUpdate({ weight: e.target.value })} 
          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm outline-none focus:border-emerald-500" 
        />
        <input 
          type="number" 
          placeholder="reps" 
          value={set.reps ?? ""} 
          onChange={(e) => onUpdate({ reps: e.target.value })} 
          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm outline-none focus:border-emerald-500" 
        />
      </div>
      <button 
        onClick={onToggleComplete} 
        className={`p-2 rounded-full transition-colors ${set.completed ? 'text-emerald-400 bg-emerald-500/20' : 'text-gray-500 hover:bg-gray-700'}`}
      >
        <CheckCircle size={20} />
      </button>
    </div>
  );
};