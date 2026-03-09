'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Search, Dumbbell, Home, Settings, Play as PlayIcon, Plus, 
  Trophy, X, Save, Trash2, CheckCircle, History, 
  Timer, SkipForward, Eye, Activity, Clock, LogOut, User,
  Library, Calendar, Globe, Scale, HeartPulse, ChevronRight,
  PlusCircle
} from 'lucide-react'
import { Toast } from '@capacitor/toast'
import React from 'react'
import { useWorkout } from '@/lib/workout-context' 
import confetti from 'canvas-confetti'


const translations = {
  es: {
    home: 'Inicio', library: 'Librería', settings: 'Configuración', profile: 'Perfil',
    welcome: 'Hola', lastWorkout: 'Último Entrenamiento', streak: 'Racha', days: 'Días',
    weight: 'Peso', height: 'Altura', myRoutines: 'Mis Rutinas', exercises: 'ejercicios',
    save: 'Guardar', general: 'General', objetivos: 'Objetivos', antropometria: 'Antropometría',
    rutinas: 'Rutinas', fat: 'Grasa', muscle: 'Músculo', imc: 'IMC', tmb: 'TMB',
    idealWeight: 'Peso Ideal', icc: 'Cintura/Cadera', somatotype: 'Somatotipo',
    focusAreas: 'Áreas de Enfoque', dietStyle: 'Estilo de Dieta', injuries: 'Lesiones', 
    createEx: 'Crear Ejercicio', search: 'Buscar...', finish: 'Finalizar', rest: 'Descanso',
    composition: 'Composición', logout: 'Cerrar Sesión'
  },
  en: {
    home: 'Home', library: 'Library', settings: 'Settings', profile: 'Profile',
    welcome: 'Hello', lastWorkout: 'Last Workout', streak: 'Streak', days: 'Days',
    weight: 'Weight', height: 'Height', myRoutines: 'My Routines', exercises: 'exercises',
    save: 'Save', general: 'General', objetivos: 'Goals', antropometria: 'Anthro',
    rutinas: 'Routines', fat: 'Fat', muscle: 'Muscle', imc: 'BMI', tmb: 'BMR',
    idealWeight: 'Ideal Weight', icc: 'Waist/Hip', somatotype: 'Somatotype',
    focusAreas: 'Focus Areas', dietStyle: 'Diet Style', injuries: 'Injuries', 
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
  const [currentView, setCurrentView] = useState<'home' | 'exercises' | 'routines' | 'myRoutines' | 'workout' | 'progress'>('home');
  const [isSaving, setIsSaving] = useState(false);
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
  const [isResting, setIsResting] = useState(false);
  const [newExData, setNewExData] = useState({ name: '', target: 'chest', gif_url: '' });
  const [isActive, setIsActive] = useState(false);

  const [userStats, setUserStats] = useState({
    name: 'Atleta', age: '25', gender: 'Hombre', weight: '75', height: '1.75', focus: [] as string[], 
    injuries: '', dietStyle: 'Equilibrada',
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

  // ── Workout timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setWorkoutTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // ── Rest timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: any;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => setRestTimer((s) => s - 1), 1000);
    } else if (restTimer <= 0 && isResting) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  // ── Load exercises when entering library ──────────────────────────────────
  useEffect(() => {
    if (currentView === 'exercises') fetchExercises();
  }, [currentView]);

  // ── Load history ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) fetchHistory();
  }, [user, currentView]);

  // ── Init workout data when routine selected ───────────────────────────────
  useEffect(() => {
    if (activeRoutine) {
      const d: any = {};
      activeRoutine.exercises.forEach((ex: any) =>
        d[ex.id] = Array.from({ length: parseInt(ex.sets) || 3 }).map(() => ({ 
          weight: '', reps: ex.reps || '10', completed: false 
        }))
      );
      setWorkoutData(d);
      // FIX: reset timer when starting a new workout
      setWorkoutTimer(0);
      setIsActive(false);
    }
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
      diameters: data.measurements?.diameters || prev.diameters, 
      skinfolds: data.measurements?.skinfolds || prev.skinfolds, 
      perimeters: data.measurements?.perimeters || prev.perimeters, 
      results: data.measurements?.results || prev.results 
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
        fetchProfile(data.user.id); 
        fetchRoutines(data.user.id);
        const { data: hData } = await supabase.from('workout_logs').select('*').eq('user_id', data.user.id).order('date', { ascending: false });
        if (hData) setHistory(hData);
        fetchExercises();
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
      <div className="h-screen bg-gray-900 flex items-center justify-center p-6 text-center">
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 w-full max-w-md space-y-6">
          <div className="bg-emerald-500 p-4 rounded-full w-fit mx-auto"><Dumbbell size={40} className="text-white" /></div>
          <h1 className="text-2xl font-black uppercase text-emerald-400">GymPro Login</h1>
          <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none text-white" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="Email" />
          <input type="password" title="password" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none text-white" value={authPass} onChange={e => setAuthPass(e.target.value)} placeholder="Password" />
          <button onClick={handleLogin} disabled={isSaving} className="w-full bg-emerald-500 py-4 rounded-xl font-black uppercase text-white hover:bg-emerald-600 disabled:opacity-50">
            {isSaving ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden font-sans relative">

      {/* FIX: nombre de elemento faltante — era "< className=..." */}
      <div className="flex-1 overflow-y-auto bg-gray-900 pb-28">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">

          {/* ── HOME ───────────────────────────────────────────────────── */}
          {currentView === 'home' && (
            <div className="space-y-8 animate-in fade-in">
              <header className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl">
                <h1 className="text-3xl font-bold mb-6">{t('welcome')}, {userStats.name}</h1>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700"><p className="text-[10px] text-gray-500 uppercase font-bold">{t('weight')}</p><p className="text-xl font-bold">{userStats.weight}kg</p></div>
                  <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700"><p className="text-[10px] text-gray-500 uppercase font-bold">{t('height')}</p><p className="text-xl font-bold">{userStats.height}m</p></div>
                  <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20"><p className="text-[10px] text-emerald-500 uppercase font-bold">{t('streak')}</p><p className="text-xl font-bold text-emerald-400">{streak} {t('days')}</p></div>
                </div>
              </header>

              <section className="space-y-4">
                <h2 className="text-[10px] font-black uppercase text-gray-500 px-2 tracking-widest">Entrenamiento de hoy</h2>
                <button 
                  onClick={() => setCurrentView('myRoutines')} 
                  className="w-full bg-emerald-500 hover:bg-emerald-400 p-6 rounded-[2.5rem] flex items-center justify-between group transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-black/20 p-4 rounded-2xl">
                      <PlayIcon size={24} fill="black" />
                    </div>
                    <div className="text-left">
                      <p className="text-black font-black uppercase text-lg leading-none">Empezar Rutina</p>
                      <p className="text-black/60 text-[10px] font-bold uppercase mt-1">Selecciona tu plan del día</p>
                      <p className="text-[10px] text-black/50 font-bold uppercase mt-4 tracking-widest">
                        Tienes <span className="text-black font-black">{routines.length}</span> rutinas disponibles
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-black/40 group-hover:translate-x-1 transition-transform" />
                </button>
              </section>

              {history[0] && (
                <section className="bg-gray-800/40 p-5 rounded-3xl border border-gray-700">
                  <h2 className="text-[10px] font-black uppercase text-gray-500 mb-3 flex items-center gap-2"><History size={14}/> {t('lastWorkout')}</h2>
                  <div className="flex justify-between items-center">
                    <div><h3 className="text-lg font-bold text-emerald-400">{history[0].routine_name}</h3><p className="text-xs text-gray-400">{new Date(history[0].date).toLocaleDateString()}</p></div>
                    <div className="text-right"><p className="text-lg font-mono font-bold">{history[0].duration}</p><p className="text-[10px] uppercase text-gray-500 font-bold">{history[0].total_sets} Series totales</p></div>
                  </div>
                </section>
              )}
              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl space-y-4">
                <h2 className="text-sm font-black uppercase text-emerald-400 flex items-center gap-2"><PlusCircle size={18}/> Adicionales</h2>
                <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-700/50">
                  <p className="text-gray-300 text-sm leading-relaxed italic">"{userStats.injuries || 'Sin notas adicionales'}"</p>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE / PROGRESS ─────────────────────────────────────── */}
          {currentView === 'progress' && (
            <div className="space-y-8 animate-in fade-in pb-20">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{t('profile')}</h1>
                <button onClick={toggleLanguage} className="p-2 bg-gray-800 rounded-xl border border-gray-700 text-emerald-400">
                  <Globe size={20}/>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-xl text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-black mb-1">{t('weight')}</p>
                  <p className="text-2xl font-black text-white">{userStats.weight}kg</p>
                </div>
                <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-xl text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-black mb-1">{t('height')}</p>
                  <p className="text-2xl font-black text-white">{userStats.height}m</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 space-y-4 shadow-xl">
                  <h2 className="text-sm font-black uppercase text-emerald-400 flex items-center gap-2">
                    <Activity size={18}/> {t('composition')}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{t('fat')}</p>
                      <p className="text-xl font-black text-red-400">{userStats.results.fatPercentage}%</p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{t('muscle')}</p>
                      <p className="text-xl font-black text-emerald-400">{userStats.results.muscleMass}kg</p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 col-span-2">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Índice de Masa Corporal ({t('imc')})</p>
                      <p className="text-xl font-black text-blue-400">{userStats.results.bmi}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl space-y-4">
                <h2 className="text-sm font-black uppercase text-emerald-400 flex items-center gap-2">
                  <PlusCircle size={18}/> Adicionales
                </h2>
                <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-700/50">
                  <p className="text-gray-300 text-sm leading-relaxed italic">
                    "{userStats.injuries || 'Sin notas adicionales'}"
                  </p>
                </div>
                <div className="flex items-center gap-2 px-1">
                  Versión 1.0.2 • FitApp
                </p>
              </div>
            </div> 
          )}

          {/* ── SETTINGS / ROUTINES ────────────────────────────────────── */}
          {currentView === 'routines' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold uppercase tracking-tighter">
                  {activeSettingsTab === 'rutinas' ? t('rutinas') : t('settings')}
                </h1>
                <div className="flex gap-2">
                  {/* Botón engranaje: alterna entre Rutinas y Configuración */}
                  <button 
                    onClick={() => setActiveSettingsTab(activeSettingsTab === 'rutinas' ? 'general' : 'rutinas')}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    <Settings size={20}/>
                  </button>
                  {activeSettingsTab !== 'rutinas' && (
                    <button onClick={saveProfile} disabled={isSaving} className="bg-emerald-500 px-6 py-2 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                      <Save size={18} /> {isSaving ? '...' : t('save')}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-4 border-b border-gray-700 pb-px overflow-x-auto no-scrollbar">
                {['general', 'objetivos', 'antropometria', 'rutinas'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveSettingsTab(tab)} 
                    className={`px-2 py-2 font-black text-[10px] uppercase transition-all whitespace-nowrap ${activeSettingsTab === tab ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500'}`}
                  >
                    {t(tab as any)}
                  </button>
                ))}
              </div>

              <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700">

                {/* TAB GENERAL */}
                {activeSettingsTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Nombre Completo</label>
                      <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={userStats.name} onChange={e => setUserStats({...userStats, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Peso (kg)</label>
                        <input type="number" step="0.1" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 text-emerald-400 font-bold" value={userStats.weight} onChange={e => setUserStats({...userStats, weight: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Altura (m)</label>
                        <input type="number" step="0.01" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 text-emerald-400 font-bold" value={userStats.height} onChange={e => setUserStats({...userStats, height: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Edad</label>
                        <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={userStats.age} onChange={e => setUserStats({...userStats, age: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Sexo</label>
                        <select className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={userStats.gender} onChange={e => setUserStats({...userStats, gender: e.target.value})}>
                          <option value="Hombre">Hombre</option>
                          <option value="Mujer">Mujer</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB OBJETIVOS */}
                {activeSettingsTab === 'objetivos' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase mb-3 block font-black">{t('focusAreas')}</label>
                      <div className="flex flex-wrap gap-2">
                        {FOCUS_OPTIONS.map(opt => (
                          <button 
                            key={opt} 
                            onClick={() => {
                              const newF = userStats.focus.includes(opt) ? userStats.focus.filter(f => f !== opt) : [...userStats.focus, opt];
                              setUserStats({...userStats, focus: newF});
                            }} 
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${userStats.focus.includes(opt) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase mb-2 block font-black">{t('dietStyle')}</label>
                      <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={userStats.dietStyle} onChange={e => setUserStats({...userStats, dietStyle: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase mb-2 block font-black">{t('injuries')}</label>
                      <textarea className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none h-24 focus:border-emerald-500" value={userStats.injuries} onChange={e => setUserStats({...userStats, injuries: e.target.value})} />
                    </div>
                  </div>
                )}

                {/* TAB ANTROPOMETRIA */}
                {activeSettingsTab === 'antropometria' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase border-b border-gray-700 pb-2">Pliegues</h4>
                      {Object.keys(userStats.skinfolds).map(k => (
                        <div key={`skinfold-${k}`} className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 capitalize">{k}</span>
                          <input type="number" className="w-16 bg-gray-900 border border-gray-700 rounded-lg p-1 text-center text-xs font-bold" value={(userStats.skinfolds as any)[k]} onChange={e => setUserStats({...userStats, skinfolds: {...userStats.skinfolds, [k]: e.target.value}})} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase border-b border-gray-700 pb-2">Perímetros</h4>
                      {Object.keys(userStats.perimeters).map(k => (
                        <div key={`perimeter-${k}`} className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 capitalize">{k}</span>
                          <input type="number" className="w-16 bg-gray-900 border border-gray-700 rounded-lg p-1 text-center text-xs font-bold" value={(userStats.perimeters as any)[k]} onChange={e => setUserStats({...userStats, perimeters: {...userStats.perimeters, [k]: e.target.value}})} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB RUTINAS */}
                {activeSettingsTab === 'rutinas' && (
                  <div className="space-y-4">
                    <button 
                      onClick={async () => { 
                        const n = prompt('Nombre:'); 
                        if (n) { await supabase.from('routines').insert([{ name: n, user_id: user.id }]); fetchRoutines(user.id); } 
                      }} 
                      className="w-full bg-gray-900 border-2 border-dashed border-gray-700 p-4 rounded-2xl flex items-center justify-center gap-2 text-gray-500 font-black uppercase text-xs hover:border-emerald-500 transition-all"
                    >
                      <Plus size={20}/> Nueva Rutina
                    </button>
                    {routines.map(r => (
                      <div key={r.id} className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-black uppercase text-sm">{r.name}</h3>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase">{r.exercises?.length || 0} ejercicios</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setShowEditRoutineModal(r.id); setCurrentView('exercises'); }} 
                              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black uppercase"
                            >
                              + Añadir
                            </button>
                            <button 
                              onClick={() => setShowEditRoutineModal(r.id)} 
                              className="p-2 bg-gray-700 text-white rounded-lg"
                            >
                              <Settings size={18}/>
                            </button>
                            <button 
                              onClick={async () => { 
                                if (!confirm(`¿Eliminar "${r.name}"?`)) return;
                                await supabase.from('routine_exercises').delete().eq('routine_id', r.id);
                                await supabase.from('routines').delete().eq('id', r.id);
                                fetchRoutines(user.id);
                              }} 
                              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 size={18}/>
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
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3">
                <PlayIcon size={22} className="text-emerald-500" />
                <h1 className="text-2xl font-black uppercase tracking-tighter">Mis Rutinas</h1>
              </div>

              <div className="space-y-3">
                {routines.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold uppercase text-sm">No tienes rutinas aún</p>
                    <button
                      onClick={() => { setCurrentView('routines'); setActiveSettingsTab('rutinas'); }}
                      className="mt-4 text-emerald-400 text-xs font-bold uppercase tracking-widest"
                    >
                      + Crear rutina
                    </button>
                  </div>
                )}

                {routines.map(r => (
                  <div
                    key={r.id}
                    className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                  >
                    <div>
                      <h3 className="font-black uppercase text-base text-white group-hover:text-emerald-400 transition-colors">
                        {r.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-bold mt-0.5">
                        {r.exercises?.length || 0} ejercicios
                      </p>
                    </div>
                    <button
                      onClick={() => { setActiveRoutine(r); setCurrentView('workout'); }}
                      className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex-shrink-0"
                    >
                      <PlayIcon size={20} fill="white" className="text-white ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EXERCISES LIBRARY ──────────────────────────────────────── */}
          {currentView === 'exercises' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{t('library')}</h1>
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
            <div className="max-w-2xl mx-auto w-full space-y-8 animate-in slide-in-from-bottom-10 pb-32">
              
              <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 px-6 py-6 rounded-b-[2.5rem] shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Entrenamiento Activo</p>
                    <h2 className="text-3xl font-black tracking-tighter uppercase text-white truncate max-w-[220px]">
                      {activeRoutine.name}
                    </h2>
                  </div>
                  <button 
                    onClick={() => { if(confirm('¿Deseas finalizar el entrenamiento?')) finishWorkout() }} 
                    className="px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-95 transition-all text-white"
                  >
                    {t('finish')}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-2xl border border-gray-700/50">
                  <div className="flex items-center gap-3 px-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                    <span className="text-3xl font-mono font-black text-white leading-none">
                      {formatTime(workoutTimer)}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
                      isActive 
                      ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                      : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    {isActive ? <><span className="text-base">⏸</span> PAUSAR</> : <><span className="text-base">▶</span> INICIAR</>}
                  </button>
                </div>
              </div>

              <div className="px-4 space-y-8 pb-32">
                {activeRoutine.exercises.map((exercise: any) => {
                  const numSets = parseInt(exercise.sets) || 3;
                  return (
                    <div key={`workout-ex-${exercise.id}`} className="bg-gray-800/40 rounded-[2.5rem] border border-gray-700/50 overflow-hidden shadow-xl backdrop-blur-sm">
                      <div className="p-6 pb-0 flex items-center gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden group">
                          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {(exercise.gif_url || exercise.gifUrl) ? (
                            <img
                              src={exercise.gif_url || exercise.gifUrl}
                              alt={exercise.name}
                              className="w-full h-full object-contain p-2 relative z-10 transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`fallback-icon flex flex-col items-center justify-center opacity-40 ${(exercise.gif_url || exercise.gifUrl) ? 'hidden' : ''}`}>
                            <Dumbbell size={24} className="text-emerald-500 mb-1" />
                            <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400">GymPro</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">
                            {exercise.name || 'Ejercicio'}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                              {exercise.target || 'Cuerpo'}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-700/50 border border-white/5 rounded-md text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                              {exercise.equipment || 'Equipo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-[32px_1fr_1fr_40px] gap-4 px-2">
                          <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Set</span>
                          <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest text-center">Peso (kg)</span>
                          <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest text-center">Reps</span>
                          <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest text-right">OK</span>
                        </div>
                        <div className="space-y-3">
                          {Array.from({ length: numSets }).map((_, index) => (
                            <ExerciseSetRow 
                              key={`set-${exercise.id}-${index}`} 
                              index={index} 
                              set={workoutData[exercise.id]?.[index] || { weight: "", reps: exercise.reps || "10", completed: false }} 
                              onUpdate={(updates: any) => updateSet(exercise.id, index, updates)} 
                              onToggleComplete={() => { 
                                const currentSet = workoutData[exercise.id]?.[index];
                                updateSet(exercise.id, index, { completed: !currentSet?.completed }); 
                              }} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── BOTTOM NAV — FIX: estaba fuera del return ────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-[999] h-20 bg-[#111827] border-t border-gray-800 flex items-center justify-around px-2 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button type="button" onClick={() => setCurrentView('home')} className="flex flex-col items-center justify-center w-full h-full gap-1">
          <Home className={`w-6 h-6 ${currentView === 'home' ? 'text-emerald-500' : 'text-gray-500'}`} />
          <span className="text-[10px] font-bold uppercase">{t('home')}</span>
        </button>
        <button type="button" onClick={() => setCurrentView('routines')} className="flex flex-col items-center justify-center w-full h-full gap-1">
          <Settings className={`w-6 h-6 ${currentView === 'routines' ? 'text-emerald-500' : 'text-gray-500'}`} />
          <span className="text-[10px] font-bold uppercase">{t('settings')}</span>
        </button>
        <button type="button" onClick={() => setCurrentView('exercises')} className="flex flex-col items-center justify-center w-full h-full gap-1">
          <Library className={`w-6 h-6 ${currentView === 'exercises' ? 'text-emerald-500' : 'text-gray-500'}`} />
          <span className="text-[10px] font-bold uppercase">{t('library')}</span>
        </button>
        <button type="button" onClick={() => setCurrentView('progress')} className="flex flex-col items-center justify-center w-full h-full gap-1">
          <User className={`w-6 h-6 ${currentView === 'progress' ? 'text-emerald-500' : 'text-gray-500'}`} />
          <span className="text-[10px] font-bold uppercase">{t('profile')}</span>
        </button>
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
                  <div className="col-span-4 flex justify-between items-center font-black uppercase text-sm">
                    {ex.name} 
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
      {isResting && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 z-[1100] animate-bounce border-2 border-white/20">
          <div className="flex items-center gap-3">
            <Timer className="w-6 h-6" />
            <span className="text-3xl font-mono font-black">{restTimer}s</span>
          </div>
          <button onClick={() => setIsResting(false)} className="bg-white/20 p-2 rounded-full"><SkipForward /></button>
        </div>
      )}

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