'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Search, Dumbbell, Home, Settings, Play as PlayIcon, Plus, 
  Trophy, X, Save, Trash2, CheckCircle, History, 
  Timer, SkipForward, Eye, Activity, Clock, LogOut, User,
  Library, Calendar, Globe, Scale, HeartPulse
} from 'lucide-react'
import { Toast } from '@capacitor/toast'
import React from 'react'

const translations = {
  es: {
    home: 'Inicio', library: 'Librería', settings: 'Configuración', profile: 'Perfil',
    welcome: 'Hola', lastWorkout: 'Último Entrenamiento', streak: 'Racha', days: 'Días',
    weight: 'Peso', height: 'Altura', myRoutines: 'Mis Rutinas', exercises: 'ejercicios',
    save: 'Guardar', general: 'General', objetivos: 'Objetivos', antropometria: 'Antropometría',
    rutinas: 'Rutinas', fat: 'Grasa', muscle: 'Músculo', imc: 'IMC', tmb: 'TMB',
    idealWeight: 'Peso Ideal', icc: 'Cintura/Cadera', somatotype: 'Somatotipo',
    focusAreas: 'Áreas de Enfoque', dietStyle: 'Estilo de Dieta', injuries: 'Lesiones', 
    createEx: 'Crear Ejercicio', search: 'Buscar...', finish: 'Finalizar', rest: 'Descanso'
  },
  en: {
    home: 'Home', library: 'Library', settings: 'Settings', profile: 'Profile',
    welcome: 'Hello', lastWorkout: 'Last Workout', streak: 'Streak', days: 'Days',
    weight: 'Weight', height: 'Height', myRoutines: 'My Routines', exercises: 'exercises',
    save: 'Save', general: 'General', objetivos: 'Goals', antropometria: 'Anthro',
    rutinas: 'Routines', fat: 'Fat', muscle: 'Muscle', imc: 'BMI', tmb: 'BMR',
    idealWeight: 'Ideal Weight', icc: 'Waist/Hip', somatotype: 'Somatotype',
    focusAreas: 'Focus Areas', dietStyle: 'Diet Style', injuries: 'Injuries', 
    createEx: 'Create Exercise', search: 'Search...', finish: 'Finish', rest: 'Rest'
  }
}

const MUSCLE_OPTIONS = ['chest', 'back', 'shoulders', 'upper arms', 'upper legs', 'waist', 'cardio'];
const FOCUS_OPTIONS = ['Hipertrofia', 'Fuerza', 'Pérdida de Grasa', 'Resistencia', 'Salud'];

export default function GymProApp() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const t = (key: keyof typeof translations['es']) => translations[lang][key] || key;

  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('alejanquevedo17@gmail.com');
  const [authPass, setAuthPass] = useState('123qweasd');
  const [currentView, setCurrentView] = useState<'home' | 'exercises' | 'routines' | 'workout' | 'progress'>('home');
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

  const [userStats, setUserStats] = useState({
    name: 'Atleta', age: '25', gender: 'Hombre', weight: '75', height: '1.75', focus: [] as string[], 
    injuries: '', dietStyle: 'Equilibrada',
    diameters: { humeral: '6.3', radiocubital: '5', femoral: '8.6' },
    skinfolds: { biceps: '10', triceps: '12', subscapular: '14', suprailiaco: '15', abdominal: '19', muslo: '15', pierna: '15', pectoral: '5' },
    perimeters: { thorax: '91', abdomen: '69', cadera: '96', bicepsR: '26', bicepsC: '29', muslo: '60', pantorrilla: '33' },
    results: { fatPercentage: '0', fatLabel: '...', muscleMass: '0', bmr: '0', bmi: '0', bmiLabel: 'Normal', idealWeight: '0', icc: '0', iccLabel: 'Excelente', somatotype: { endo: '0', meso: '0', ecto: '0', label: 'Mesomorfo' } }
  });

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

  useEffect(() => {
    let interval: any;
    if (activeRoutine && !isResting) interval = setInterval(() => setWorkoutTimer(s => s + 1), 1000);
    if (isResting && restTimer > 0) interval = setInterval(() => setRestTimer(s => s - 1), 1000);
    else if (restTimer === 0 && isResting) setIsResting(false);
    return () => clearInterval(interval);
  }, [activeRoutine, isResting, restTimer]);
  const handleLogin = async () => {
    setIsSaving(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
    if (!error && data.user) {
      setUser(data.user); fetchProfile(data.user.id); fetchRoutines(data.user.id);
      const { data: hData } = await supabase.from('workout_logs').select('*').eq('user_id', data.user.id).order('date', { ascending: false });
      if (hData) setHistory(hData);
      fetchExercises();
    }
    setIsSaving(false);
  };
  // Al cargar la app, recuperamos el idioma guardado
useEffect(() => {
  const savedLang = localStorage.getItem('gympro_lang') as 'es' | 'en';
  if (savedLang) setLang(savedLang);
}, []);

// Al cambiar el idioma, lo guardamos en la memoria
const toggleLanguage = () => {
  const newLang = lang === 'es' ? 'en' : 'es';
  setLang(newLang);
  localStorage.setItem('gympro_lang', newLang);
};


  const handleCreateExercise = async () => {
    if (!newExData.name || !user) return;
    setIsSaving(true);
    const { error } = await supabase.from('custom_exercises').insert([{ ...newExData, user_id: user.id }]);
    if (!error) { setShowCreateExModal(false); setNewExData({ name: '', target: 'chest', gif_url: '' }); fetchExercises(); Toast.show({ text: 'Creado' }); }
    setIsSaving(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    await supabase.from('profiles').upsert({ 
      id: user.id, full_name: userStats.name, weight: userStats.weight, height: userStats.height, age: parseInt(userStats.age), 
      gender: userStats.gender, focus_areas: userStats.focus, diet_style: userStats.dietStyle, injuries: userStats.injuries, 
      measurements: { diameters: userStats.diameters, skinfolds: userStats.skinfolds, perimeters: userStats.perimeters, results: userStats.results }, 
      updated_at: new Date().toISOString() 
    });
    setIsSaving(false);
    Toast.show({ text: 'Guardado' });
  };

  const saveWithHistory = async () => {
    setIsSaving(true);
    
    // 1. Actualizamos el perfil actual (lo que ya haces)
    await saveProfile(); 
  
    // 2. Creamos un hito en el historial (La Memoria)
    await supabase.from('body_stats_history').insert([{
      user_id: user.id,
      weight: parseFloat(userStats.weight),
      measurements: {
        skinfolds: userStats.skinfolds,
        perimeters: userStats.perimeters,
        results: userStats.results
      },
      date: new Date().toISOString()
    }]);
    
    setIsSaving(false);
  };  

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setUserStats(prev => ({ ...prev, name: data.full_name || prev.name, weight: data.weight || prev.weight, height: data.height || prev.height, age: data.age?.toString() || prev.age, gender: data.gender || prev.gender, focus: data.focus_areas || [], dietStyle: data.diet_style || '', injuries: data.injuries || '', diameters: data.measurements?.diameters || prev.diameters, skinfolds: data.measurements?.skinfolds || prev.skinfolds, perimeters: data.measurements?.perimeters || prev.perimeters, results: data.measurements?.results || prev.results }));
  };

  const fetchRoutines = async (userId: string) => {
    const { data: rData } = await supabase.from('routines').select('*').eq('user_id', userId);
    if (rData) {
      const { data: eData } = await supabase.from('routine_exercises').select('*, custom_exercises(*)').in('routine_id', rData.map(r => r.id));
      setRoutines(rData.map(r => ({ ...r, exercises: (eData || []).filter(e => e.routine_id === r.id).map(re => ({ ...re.custom_exercises, routineExerciseId: re.id, sets: re.sets, reps: re.reps, restTime: re.rest_time })) })));
    }
  };

  const fetchExercises = async (term = '') => {
    let q = supabase.from('custom_exercises').select('*').order('name');
    if (term) q = q.ilike('name', `%${term}%`);
    const { data } = await q;
    if (data) setResults(data.map(ex => ({ ...ex, gifUrl: ex.gif_url })));
  };

  const finishWorkout = async () => {
    setIsSaving(true);
    const details = activeRoutine.exercises.map((ex: any) => ({ exerciseName: ex.name, sets: workoutData[ex.id] || [] })).filter((ex: any) => ex.sets.some((s: any) => s.completed));
    await supabase.from('workout_logs').insert([{ user_id: user.id, routine_name: activeRoutine.name, duration: formatTime(workoutTimer), total_sets: details.length, workout_details: details, date: new Date().toISOString() }]);
    const { data: hData } = await supabase.from('workout_logs').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (hData) setHistory(hData);
    setActiveRoutine(null); setCurrentView('home'); setIsSaving(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const streak = useMemo(() => { if (!history.length) return 0; const dates = Array.from(new Set(history.map(l => l.date.split('T')[0]))).sort().reverse(); let c = 0, curr = new Date(dates[0]); for (const d of dates) { if (d === curr.toISOString().split('T')[0]) { c++; curr.setDate(curr.getDate() - 1); } else break; } return c; }, [history]);

  if (!user) return (
    <div className="h-screen bg-gray-900 flex items-center justify-center p-6 text-center">
      <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 w-full max-w-md space-y-6">
        <div className="bg-emerald-500 p-4 rounded-full w-fit mx-auto"><Dumbbell size={40} className="text-white" /></div>
        <h1 className="text-2xl font-black uppercase text-emerald-400">GymPro Login</h1>
        <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="Email" />
        <input type="password" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none" value={authPass} onChange={e => setAuthPass(e.target.value)} placeholder="Password" />
        <button onClick={handleLogin} className="w-full bg-emerald-500 py-4 rounded-xl font-black uppercase">Entrar</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden font-sans relative">
      <main className="flex-1 overflow-y-auto bg-gray-900 pb-28">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          
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

              {history[0] && (
                <section className="bg-gray-800/40 p-5 rounded-3xl border border-gray-700">
                  <h2 className="text-[10px] font-black uppercase text-gray-500 mb-3 flex items-center gap-2"><History size={14}/> {t('lastWorkout')}</h2>
                  <div className="flex justify-between items-center">
                    <div><h3 className="text-lg font-bold text-emerald-400">{history[0].routine_name}</h3><p className="text-xs text-gray-400">{new Date(history[0].date).toLocaleDateString()}</p></div>
                    <div className="text-right"><p className="text-lg font-mono font-bold">{history[0].duration}</p><p className="text-[10px] uppercase text-gray-500 font-bold">{history[0].total_sets} Series</p></div>
                  </div>
                </section>
              )}

              <div className="grid gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><PlayIcon className="w-5 h-5 text-emerald-500" /> {t('myRoutines')}</h2>
                {routines.map(r => (
                  <button key={r.id} onClick={() => { const d: any = {}; r.exercises.forEach((ex: any) => d[ex.id] = Array.from({ length: parseInt(ex.sets) || 3 }).map(() => ({ weight: '', reps: ex.reps || '10', completed: false }))); setWorkoutData(d); setActiveRoutine(r); setWorkoutTimer(0); setCurrentView('workout'); }} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex justify-between items-center group transition-all">
                    <div className="text-left"><h3 className="font-bold text-lg group-hover:text-emerald-400">{r.name}</h3><p className="text-sm text-gray-500">{r.exercises.length} {t('exercises')}</p></div>
                    <div className="bg-emerald-500 p-3 rounded-full"><PlayIcon className="w-6 h-6 fill-current" /></div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {currentView === 'progress' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{t('profile')}</h1>
                <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="p-2 bg-gray-800 rounded-xl border border-gray-700 text-emerald-400 active:scale-90 transition-all shadow-lg"><Globe size={20}/></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 space-y-4 shadow-xl">
                  <h2 className="text-sm font-black uppercase text-emerald-400 flex items-center gap-2"><Activity size={18}/> Composición</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700"><p className="text-[10px] text-gray-500 uppercase font-bold">{t('fat')}</p><p className="text-xl font-black text-red-400">{userStats.results.fatPercentage}%</p><p className="text-[9px] text-gray-400">{userStats.results.fatLabel}</p></div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700"><p className="text-[10px] text-gray-500 uppercase font-bold">{t('muscle')}</p><p className="text-xl font-black text-emerald-400">{userStats.results.muscleMass}kg</p></div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700"><p className="text-[10px] text-gray-500 uppercase font-bold">{t('imc')}</p><p className="text-xl font-black text-blue-400">{userStats.results.bmi}</p><p className="text-[9px] text-gray-400">{userStats.results.bmiLabel}</p></div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700"><p className="text-[10px] text-gray-500 uppercase font-bold">{t('tmb')}</p><p className="text-xl font-black text-orange-400">{userStats.results.bmr}</p><p className="text-[9px] text-gray-400">kcal/día</p></div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 space-y-4 shadow-xl">
                  <h2 className="text-sm font-black uppercase text-emerald-400 flex items-center gap-2"><HeartPulse size={18}/> Salud e Ideal</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border border-gray-700"><span className="text-xs font-bold text-gray-400 uppercase">{t('idealWeight')}</span><span className="font-black text-emerald-400">{userStats.results.idealWeight} kg</span></div>
                    <div className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border border-gray-700"><span className="text-xs font-bold text-gray-400 uppercase">{t('icc')}</span><span className="font-black text-blue-400">{userStats.results.icc}</span></div>
                    <div className="p-3 bg-gray-900 rounded-xl border border-gray-700">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">{t('somatotype')}</p>
                      <div className="flex justify-between text-center mb-2">
                        <div><p className="text-[9px] text-gray-500">ENDO</p><p className="font-bold">{userStats.results.somatotype.endo}</p></div>
                        <div><p className="text-[9px] text-gray-500">MESO</p><p className="font-bold">{userStats.results.somatotype.meso}</p></div>
                        <div><p className="text-[9px] text-gray-500">ECTO</p><p className="font-bold">{userStats.results.somatotype.ecto}</p></div>
                      </div>
                      <div className="bg-emerald-500/10 p-1 rounded text-center text-[10px] font-black text-emerald-400 uppercase border border-emerald-500/20">{userStats.results.somatotype.label}</div>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest"><LogOut size={16}/> Cerrar Sesión</button>
            </div>
          )}

          {currentView === 'routines' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center"><h1 className="text-3xl font-bold uppercase tracking-tighter">{t('settings')}</h1><button onClick={saveProfile} className="bg-emerald-500 px-6 py-2 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all"><Save size={18} /> {t('save')}</button></div>
              <div className="flex gap-4 border-b border-gray-700 pb-px overflow-x-auto no-scrollbar">
                {['general', 'objetivos', 'antropometria', 'rutinas'].map(tab => (
                  <button key={tab} onClick={() => setActiveSettingsTab(tab)} className={`px-2 py-2 font-black text-[10px] uppercase transition-all ${activeSettingsTab === tab ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500'}`}>{t(tab as any)}</button>
                ))}
              </div>
              <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700">
                {activeSettingsTab === 'general' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Nombre</label><input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={userStats.name} onChange={e => setUserStats({...userStats, name: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Edad</label><input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={userStats.age} onChange={e => setUserStats({...userStats, age: e.target.value})} /></div>
                      <div><label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Sexo</label><select className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={userStats.gender} onChange={e => setUserStats({...userStats, gender: e.target.value})}><option value="Hombre">Hombre</option><option value="Mujer">Mujer</option></select></div>
                    </div>
                  </div>
                )}
                {activeSettingsTab === 'objetivos' && (
                  <div className="space-y-6">
                    <div><label className="text-[10px] text-gray-500 uppercase mb-3 block font-black">{t('focusAreas')}</label>
                      <div className="flex flex-wrap gap-2">{FOCUS_OPTIONS.map(opt => (
                        <button key={opt} onClick={() => { const newF = userStats.focus.includes(opt) ? userStats.focus.filter(f => f !== opt) : [...userStats.focus, opt]; setUserStats({...userStats, focus: newF}); }} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${userStats.focus.includes(opt) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}>{opt}</button>
                      ))}</div>
                    </div>
                    <div><label className="text-[10px] text-gray-500 uppercase mb-2 block font-black">{t('dietStyle')}</label><input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={userStats.dietStyle} onChange={e => setUserStats({...userStats, dietStyle: e.target.value})} /></div>
                    <div><label className="text-[10px] text-gray-500 uppercase mb-2 block font-black">{t('injuries')}</label><textarea className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none h-24 focus:border-emerald-500" value={userStats.injuries} onChange={e => setUserStats({...userStats, injuries: e.target.value})} /></div>
                  </div>
                )}
                {activeSettingsTab === 'antropometria' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3"><h4 className="text-[10px] font-black text-gray-500 uppercase border-b border-gray-700 pb-2">Pliegues</h4>{Object.keys(userStats.skinfolds).map(k => (<div key={k} className="flex justify-between items-center"><span className="text-[10px] text-gray-400 capitalize">{k}</span><input type="number" className="w-16 bg-gray-900 border border-gray-700 rounded-lg p-1 text-center text-xs font-bold" value={(userStats.skinfolds as any)[k]} onChange={e => setUserStats({...userStats, skinfolds: {...userStats.skinfolds, [k]: e.target.value}})} /></div>))}</div>
                    <div className="space-y-3"><h4 className="text-[10px] font-black text-gray-500 uppercase border-b border-gray-700 pb-2">Perímetros</h4>{Object.keys(userStats.perimeters).map(k => (<div key={k} className="flex justify-between items-center"><span className="text-[10px] text-gray-400 capitalize">{k}</span><input type="number" className="w-16 bg-gray-900 border border-gray-700 rounded-lg p-1 text-center text-xs font-bold" value={(userStats.perimeters as any)[k]} onChange={e => setUserStats({...userStats, perimeters: {...userStats.perimeters, [k]: e.target.value}})} /></div>))}</div>
                    <div className="space-y-3"><h4 className="text-[10px] font-black text-gray-500 uppercase border-b border-gray-700 pb-2">Diámetros</h4>{Object.keys(userStats.diameters).map(k => (<div key={k} className="flex justify-between items-center"><span className="text-[10px] text-gray-400 capitalize">{k}</span><input type="number" className="w-16 bg-gray-900 border border-gray-700 rounded-lg p-1 text-center text-xs font-bold" value={(userStats.diameters as any)[k]} onChange={e => setUserStats({...userStats, diameters: {...userStats.diameters, [k]: e.target.value}})} /></div>))}</div>
                  </div>
                )}
                {activeSettingsTab === 'rutinas' && (
                  <div className="space-y-4">
                    <button onClick={async () => { const n = prompt('Nombre:'); if (n) { await supabase.from('routines').insert([{ name: n, user_id: user.id }]); fetchRoutines(user.id); } }} className="w-full bg-gray-900 border-2 border-dashed border-gray-700 p-4 rounded-2xl flex items-center justify-center gap-2 text-gray-500 font-black uppercase text-xs hover:border-emerald-500 transition-all"><Plus size={20}/> Nueva Rutina</button>
                    {routines.map(r => (
                      <div key={r.id} className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700 flex justify-between items-center">
                        <div><h3 className="font-black uppercase text-sm">{r.name}</h3><p className="text-[10px] text-emerald-500 font-bold uppercase">{r.exercises.length} ejercicios</p></div>
                        <div className="flex gap-2"><button onClick={() => { setShowEditRoutineModal(r.id); setCurrentView('exercises'); }} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black uppercase">+ Añadir</button><button onClick={() => setShowEditRoutineModal(r.id)} className="p-2 bg-gray-700 text-white rounded-lg"><Settings size={18}/></button></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'exercises' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center"><h1 className="text-3xl font-black uppercase tracking-tighter">{t('library')}</h1><button onClick={() => setShowCreateExModal(true)} className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg flex items-center gap-2 font-bold text-xs uppercase active:scale-90 transition-all"><Plus size={18}/> {t('createEx')}</button></div>
              <div className="relative"><Search className="absolute left-3 top-3 text-gray-500" /><input placeholder={t('search')} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 font-bold" onChange={e => fetchExercises(e.target.value)} /></div>
              <div className="space-y-3">
                {results.map(ex => (
                  <div key={ex.id} className="flex items-center gap-4 bg-gray-800 p-3 rounded-2xl border border-gray-700 hover:border-emerald-500 transition-all group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0 relative">{ex.gifUrl && <img src={ex.gifUrl} className="w-full h-full object-cover" alt="" />}<button onClick={() => setPreviewImage(ex.gifUrl)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Eye size={16}/></button></div>
                    <div className="flex-1 min-w-0"><h4 className="font-black text-sm capitalize truncate">{ex.name}</h4><p className="text-[10px] text-gray-500 uppercase font-bold">{ex.target}</p></div>
                    {showEditRoutineModal && <button onClick={async () => { await supabase.from('routine_exercises').insert([{ routine_id: showEditRoutineModal, exercise_id: ex.id, sets: 3, reps: '12', rest_time: 60 }]); fetchRoutines(user.id); Toast.show({text: 'Añadido'}); }} className="bg-emerald-500 p-3 rounded-xl text-white shadow-lg active:scale-90 transition-all"><Plus size={20}/></button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'workout' && activeRoutine && (
            <div className="max-w-2xl mx-auto w-full space-y-8 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-end sticky top-0 bg-gray-900/90 py-6 z-20 backdrop-blur-xl border-b border-gray-800/50">
                <div><h2 className="text-3xl font-black tracking-tighter uppercase text-white">{activeRoutine.name}</h2><div className="flex items-center gap-2 text-emerald-400 font-mono text-2xl font-bold"><Clock size={20} className="animate-pulse" />{formatTime(workoutTimer)}</div></div>
                <button onClick={() => { if(confirm('¿Finalizar?')) finishWorkout() }} className="px-8 py-3 rounded-2xl font-black uppercase text-sm tracking-widest bg-red-500 shadow-lg active:scale-95 transition-all">{t('finish')}</button>
              </div>
              {activeRoutine.exercises.map((ex: any) => (
                <div key={ex.id} className="bg-gray-800/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-gray-700/50 space-y-6 shadow-2xl">
                  <div className="flex items-center gap-5"><div className="w-20 h-20 rounded-3xl overflow-hidden bg-gray-900 shadow-inner">{ex.gifUrl && <img src={ex.gifUrl} className="w-full h-full object-cover" alt="" />}</div><div><h3 className="font-black text-xl capitalize text-white leading-tight">{ex.name}</h3><span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border border-emerald-500/20">{t('rest')}: {ex.restTime}s</span></div></div>
                  <div className="space-y-3">{workoutData[ex.id]?.map((set: any, idx: number) => (<div key={idx} className={`grid grid-cols-12 gap-3 items-center p-2 rounded-2xl transition-all ${set.completed ? 'opacity-40' : 'bg-gray-900/40'}`}><div className="col-span-1 text-center font-black text-gray-500 text-sm">{idx + 1}</div><div className="col-span-4 relative"><input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 text-center font-bold outline-none focus:border-emerald-500" value={set.weight} onChange={e => setWorkoutData((p: any) => ({...p, [ex.id]: p[ex.id].map((s: any, i: number) => i === idx ? {...s, weight: e.target.value} : s)}))} placeholder="kg" /></div><div className="col-span-4 relative"><input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 text-center font-bold outline-none focus:border-emerald-500" value={set.reps} onChange={e => setWorkoutData((p: any) => ({...p, [ex.id]: p[ex.id].map((s: any, i: number) => i === idx ? {...s, reps: e.target.value} : s)}))} placeholder="reps" /></div><button onClick={() => { const isComp = !workoutData[ex.id][idx].completed; setWorkoutData((p: any) => ({...p, [ex.id]: p[ex.id].map((s: any, i: number) => i === idx ? {...s, completed: isComp} : s)})); if (isComp) { setRestTimer(ex.restTime); setIsResting(true); } }} className={`col-span-3 py-3 rounded-xl flex justify-center items-center transition-all active:scale-90 ${set.completed ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-800 text-gray-500'}`}><CheckCircle size={24} /></button></div>))}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-[999] h-20 bg-[#111827] border-t border-gray-800 flex items-center justify-around px-2 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button type="button" onClick={() => setCurrentView('home')} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-90 transition-transform"><Home className={`w-6 h-6 ${currentView === 'home' ? 'text-emerald-500' : 'text-gray-500'}`} /><span className="text-[10px] font-bold uppercase">{t('home')}</span></button>
        <button type="button" onClick={() => setCurrentView('routines')} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-90 transition-transform"><Settings className={`w-6 h-6 ${currentView === 'routines' ? 'text-emerald-500' : 'text-gray-500'}`} /><span className="text-[10px] font-bold uppercase">{t('settings')}</span></button>
        <button type="button" onClick={() => setCurrentView('exercises')} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-90 transition-transform"><Library className={`w-6 h-6 ${currentView === 'exercises' ? 'text-emerald-500' : 'text-gray-500'}`} /><span className="text-[10px] font-bold uppercase">{t('library')}</span></button>
        <button type="button" onClick={() => setCurrentView('progress')} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-90 transition-transform"><User className={`w-6 h-6 ${currentView === 'progress' ? 'text-emerald-500' : 'text-gray-500'}`} /><span className="text-[10px] font-bold uppercase">{t('profile')}</span></button>
      </nav>

      {showEditRoutineModal && currentView !== 'exercises' && (
        <div className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-gray-800 w-full max-w-5xl h-[90vh] rounded-3xl border border-gray-700 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center"><h2 className="text-2xl font-black uppercase tracking-tighter">Editar Rutina</h2><button onClick={() => setShowEditRoutineModal(null)} className="bg-emerald-500 px-8 py-2 rounded-xl font-black uppercase text-xs tracking-widest">Listo</button></div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-800 no-scrollbar">
                {routines.find(r => r.id === showEditRoutineModal)?.exercises.map((ex: any) => (
                  <div key={ex.routineExerciseId} className="bg-gray-700/30 p-5 rounded-2xl border border-gray-600 grid grid-cols-4 gap-4 shadow-lg">
                    <div className="col-span-4 flex justify-between items-center font-black uppercase text-sm">{ex.name} <button onClick={async () => { await supabase.from('routine_exercises').delete().eq('id', ex.routineExerciseId); fetchRoutines(user.id); }} className="text-red-400"><Trash2 size={16}/></button></div>
                    <div><label className="text-[10px] text-gray-500 block font-black uppercase mb-1">Series</label><input type="number" value={ex.sets} className="w-full bg-gray-900 p-2 rounded-lg text-center font-bold" onChange={async e => { await supabase.from('routine_exercises').update({sets: e.target.value}).eq('id', ex.routineExerciseId); fetchRoutines(user.id); }} /></div>
                    <div><label className="text-[10px] text-gray-500 block font-black uppercase mb-1">Reps</label><input type="text" value={ex.reps} className="w-full bg-gray-900 p-2 rounded-lg text-center font-bold" onChange={async e => { await supabase.from('routine_exercises').update({reps: e.target.value}).eq('id', ex.routineExerciseId); fetchRoutines(user.id); }} /></div>
                    <div className="col-span-2"><label className="text-[10px] text-gray-500 block font-black uppercase mb-1">Descanso (seg)</label><input type="number" value={ex.restTime} className="w-full bg-gray-900 p-2 rounded-lg text-center font-bold text-emerald-400" onChange={async e => { await supabase.from('routine_exercises').update({rest_time: e.target.value}).eq('id', ex.routineExerciseId); fetchRoutines(user.id); }} /></div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {showCreateExModal && (
        <div className="fixed inset-0 bg-black/90 z-[2000] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-gray-800 w-full max-w-md rounded-3xl border border-gray-700 p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center"><h2 className="text-xl font-black uppercase tracking-tighter">Nuevo Ejercicio</h2><button onClick={() => setShowCreateExModal(false)}><X/></button></div>
            <div className="space-y-4">
              <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={newExData.name} onChange={e => setNewExData({...newExData, name: e.target.value})} placeholder="Nombre" />
              <select className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={newExData.target} onChange={e => setNewExData({...newExData, target: e.target.value})}>{MUSCLE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}</select>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={newExData.gif_url} onChange={e => setNewExData({...newExData, gif_url: e.target.value})} placeholder="URL GIF" />
              <button onClick={handleCreateExercise} className="w-full bg-emerald-500 py-4 rounded-xl font-black uppercase shadow-lg shadow-emerald-500/20">Crear Ejercicio</button>
            </div>
          </div>
        </div>
      )}

      {isResting && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 z-[1100] animate-bounce border-2 border-white/20">
          <div className="flex items-center gap-3"><Timer className="w-6 h-6" /><span className="text-3xl font-mono font-black">{formatTime(restTimer)}</span></div>
          <button onClick={() => setIsResting(false)} className="bg-white/20 p-2 rounded-full"><SkipForward /></button>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/95 z-[2000] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}><img src={previewImage} className="max-w-full max-h-full rounded-3xl shadow-2xl border border-gray-800" alt="" /></div>
      )}
    </div>
  );
}
