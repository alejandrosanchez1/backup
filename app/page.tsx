'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { 
  Search, Dumbbell, Home, Settings, Menu, Flame, Play, Plus, 
  Trophy, X, Save, Trash2, CheckCircle, Clock, History, 
  Timer, SkipForward, Weight, Ruler, Eye, Loader2, Edit3, 
  ChevronDown, ChevronUp, Globe, Languages, Activity
} from 'lucide-react'

// --- 🌍 TRADUCCIONES ---
const translations = {
  es: {
    home: 'Inicio', library: 'Librería', settings: 'Configurar', progress: 'Progreso',
    welcome: 'Hola', ready: '¿Qué entrenamos hoy?', weight: 'Peso', height: 'Altura',
    streak: 'Racha', days: 'Días', myRoutines: 'Mis Rutinas', recentActivity: 'Actividad Reciente',
    searchEx: 'Buscar ejercicio...', createEx: 'Crear Ejercicio', globalDb: 'Base Global',
    localDb: 'Mis Ejercicios', muscle: 'Músculo', equipment: 'Equipo', finish: 'Finalizar',
    rest: 'Descanso', sets: 'Series', reps: 'Reps', save: 'Guardar', cancel: 'Cancelar',
    newRoutine: 'Nueva Rutina', evolution: 'Entrenamientos esta semana', seeWeights: 'Ver detalles',
    all: 'Todos', chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros', arms: 'Brazos',
    legs: 'Piernas', abs: 'Abs', cardio: 'Cardio', noRoutines: 'No hay rutinas creadas',
    volume: 'Volumen', duration: 'Duración', totalSets: 'Series totales'
  },
  en: {
    home: 'Home', library: 'Library', settings: 'Settings', progress: 'Progress',
    welcome: 'Hello', ready: "What's the plan today?", weight: 'Weight', height: 'Height',
    streak: 'Streak', days: 'Days', myRoutines: 'My Routines', recentActivity: 'Recent Activity',
    searchEx: 'Search exercise...', createEx: 'Create Exercise', globalDb: 'Global DB',
    localDb: 'My Exercises', muscle: 'Muscle', equipment: 'Equipment', finish: 'Finish',
    rest: 'Rest', sets: 'Sets', reps: 'Reps', save: 'Save', cancel: 'Cancel',
    newRoutine: 'New Routine', evolution: 'Workouts this week', seeWeights: 'See details',
    all: 'All', chest: 'Chest', back: 'Back', shoulders: 'Shoulders', arms: 'Arms',
    legs: 'Legs', abs: 'Abs', cardio: 'Cardio', noRoutines: 'No routines found',
    volume: 'Volume', duration: 'Duration', totalSets: 'Total Sets'
  }
}

const MUSCLE_FILTERS = [
  { id: 'all', labelKey: 'all', api: 'all' },
  { id: 'chest', labelKey: 'chest', api: 'chest' },
  { id: 'back', labelKey: 'back', api: 'back' },
  { id: 'shoulders', labelKey: 'shoulders', api: 'shoulders' },
  { id: 'upper arms', labelKey: 'arms', api: 'upper arms' },
  { id: 'upper legs', labelKey: 'legs', api: 'upper legs' },
  { id: 'waist', labelKey: 'abs', api: 'waist' },
  { id: 'cardio', labelKey: 'cardio', api: 'cardio' }
]

export default function GymProApp() {
  const supabase = createClient()

  // --- ESTADOS ---
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const t = (key: keyof typeof translations['es']) => translations[lang][key] || key

  const [currentView, setCurrentView] = useState<'home' | 'exercises' | 'routines' | 'workout' | 'summary' | 'progress'>('home')
  const [user, setUser] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [routines, setRoutines] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [userStats, setUserStats] = useState({ name: 'Atleta', weight: '75', height: '1.75' })
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const [searchSource, setSearchSource] = useState<'local' | 'global'>('local')
  const [selectedMuscle, setSelectedMuscle] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [showEditRoutineModal, setShowEditRoutineModal] = useState<number | null>(null)
  const [showCreateExModal, setShowCreateExModal] = useState(false)
  const [newExForm, setNewExForm] = useState({ name: '', target: 'chest', equipment: 'body weight', gif_url: '' })
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null)

  const [activeRoutine, setActiveRoutine] = useState<any>(null)
  const [workoutData, setWorkoutData] = useState<any>({})
  const [workoutTimer, setWorkoutTimer] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)

  // --- API CONFIG ---
  const rapidApiOptions = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': process.env.NEXT_PUBLIC_X_RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }
  };

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        await Promise.all([
          fetchRoutines(authUser.id),
          fetchHistory(authUser.id),
          fetchProfile(authUser.id),
          fetchExercises('', 'all', 'local')
        ])
      }
      setIsLoadingData(false)
    }
    init()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setUserStats({ name: data.full_name || 'Atleta', weight: data.weight || '75', height: data.height || '1.75' })
  }

  const saveProfile = async () => {
    await supabase.from('profiles').upsert({ id: user.id, full_name: userStats.name, weight: userStats.weight, height: userStats.height })
    setIsEditingProfile(false)
  }

  const fetchRoutines = async (userId: string) => {
    const { data: routinesData } = await supabase.from('routines').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (!routinesData) return
    const { data: exData } = await supabase.from('routine_exercises').select('*, custom_exercises(*)').in('routine_id', routinesData.map(r => r.id))
    const formatted = routinesData.map(r => ({
      ...r,
      exercises: (exData || []).filter(e => e.routine_id === r.id).map(re => ({
        ...re.custom_exercises, routineExerciseId: re.id, sets: re.sets, reps: re.reps, restTime: re.rest_time, gifUrl: re.custom_exercises.gif_url
      }))
    }))
    setRoutines(formatted)
  }

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase.from('workout_logs').select('*').eq('user_id', userId).order('date', { ascending: false })
    if (data) setHistory(data.map(log => ({ ...log, date: new Date(log.date).toLocaleDateString() })))
  }

  const fetchExercises = async (term: string = '', muscle: string = 'all', source: 'local' | 'global' = searchSource) => {
    if (source === 'local') {
      let query = supabase.from('custom_exercises').select('*').order('name')
      if (term) query = query.ilike('name', `%${term}%`)
      if (muscle !== 'all') query = query.eq('target', muscle)
      const { data } = await query
      if (data) setResults(data.map(ex => ({ ...ex, gifUrl: ex.gif_url, isCustom: !!ex.user_id })))
    } else {
      try {
        let url = `https://exercisedb.p.rapidapi.com/exercises?limit=100`;
        if (term) url = `https://exercisedb.p.rapidapi.com/exercises/name/${term.toLowerCase()}?limit=100`;
        else if (muscle !== 'all') {
          const muscleApiName = MUSCLE_FILTERS.find(f => f.id === muscle)?.api || muscle;
          url = `https://exercisedb.p.rapidapi.com/exercises/target/${muscleApiName}?limit=100`;
        }

        const res = await fetch(url, rapidApiOptions);
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data.map((ex: any) => ({
            id: `global_${ex.id}`, name: ex.name, target: ex.target, gifUrl: ex.gifUrl,
            equipment: ex.equipment, isCustom: false
          })));
        }
      } catch (err) { console.error("Error API:", err) }
    }
  }

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('custom_exercises').insert([{
      ...newExForm, user_id: user.id, is_custom: true
    }])
    if (!error) {
      setShowCreateExModal(false)
      setNewExForm({ name: '', target: 'chest', equipment: 'body weight', gif_url: '' })
      fetchExercises('', 'all', 'local')
    }
  }

  // --- LÓGICA DE PROGRESO (DATOS REALES) ---
  const chartData = useMemo(() => {
    const days = lang === 'es' ? ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = new Array(7).fill(0)
    
    // Obtener el inicio de la semana actual
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)

    history.forEach(log => {
      const logDate = new Date(log.date)
      if (logDate >= startOfWeek) {
        counts[logDate.getDay()]++
      }
    })

    return days.map((name, i) => ({ name, val: counts[i] }))
  }, [history, lang])

  const streak = useMemo(() => {
    if (!history.length) return 0
    const dates = Array.from(new Set(history.map(l => new Date(l.date).toISOString().split('T')[0]))).sort().reverse()
    const today = new Date().toISOString().split('T')[0]
    if (dates[0] !== today && dates[0] !== new Date(Date.now() - 86400000).toISOString().split('T')[0]) return 0
    let count = 0, current = new Date(dates[0])
    for (const d of dates) {
      if (d === current.toISOString().split('T')[0]) { count++; current.setDate(current.getDate() - 1) }
      else break
    }
    return count
  }, [history])

  // --- WORKOUT LOGIC ---
  const startWorkout = (routine: any) => {
    const initialData: any = {}
    routine.exercises.forEach((ex: any) => {
      initialData[ex.id] = Array.from({ length: ex.sets || 3 }).map(() => ({ weight: '', reps: ex.reps || '10', completed: false }))
    })
    setWorkoutData(initialData); setActiveRoutine(routine); setWorkoutTimer(0); setCurrentView('workout')
  }

  const finishWorkout = async () => {
    const details = activeRoutine.exercises.map((ex: any) => ({ 
      exerciseName: ex.name, 
      sets: workoutData[ex.id] || [] 
    })).filter((ex: any) => ex.sets.some((s: any) => s.completed))
    
    const totalSets = details.reduce((acc: number, ex: any) => acc + ex.sets.filter((s: any) => s.completed).length, 0)

    await supabase.from('workout_logs').insert([{ 
      user_id: user.id, 
      routine_name: activeRoutine.name, 
      duration: formatTime(workoutTimer), 
      total_sets: totalSets, 
      workout_details: details, 
      date: new Date().toISOString() 
    }])
    setCurrentView('summary'); fetchHistory(user.id)
  }

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-2xl"><Dumbbell /> GymApp</div>
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white"><Languages className="w-5 h-5" /></button>
          </div>
          <nav className="flex-1 space-y-2">
            {[
              { id: 'home', icon: Home, label: t('home') },
              { id: 'exercises', icon: Search, label: t('library') },
              { id: 'routines', icon: Settings, label: t('settings') },
              { id: 'progress', icon: Trophy, label: t('progress') }
            ].map(item => (
              <button key={item.id} onClick={() => { setCurrentView(item.id as any); setIsSidebarOpen(false) }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:bg-gray-700'}`}>
                <item.icon className="w-5 h-5" /> {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-gray-900">
        <header className="md:hidden p-4 bg-gray-800 flex justify-between items-center border-b border-gray-700">
          <span className="font-bold text-emerald-400">GymApp</span>
          <button onClick={() => setIsSidebarOpen(true)}><Menu /></button>
        </header>

        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">

          {/* VISTA: INICIO */}
          {currentView === 'home' && (
            <div className="space-y-8 animate-in fade-in">
              <header className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div><h1 className="text-3xl font-bold">{t('welcome')}, {userStats.name}</h1><p className="text-gray-400">{t('ready')}</p></div>
                  <button onClick={() => isEditingProfile ? saveProfile() : setIsEditingProfile(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-emerald-500 transition-all">
                    {isEditingProfile ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('weight')}</p>
                    {isEditingProfile ? <input type="number" value={userStats.weight} onChange={e => setUserStats({...userStats, weight: e.target.value})} className="bg-transparent text-xl font-bold w-full text-center text-emerald-400 outline-none" /> : <p className="text-xl font-bold">{userStats.weight}kg</p>}
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('height')}</p>
                    {isEditingProfile ? <input type="number" step="0.01" value={userStats.height} onChange={e => setUserStats({...userStats, height: e.target.value})} className="bg-transparent text-xl font-bold w-full text-center text-blue-400 outline-none" /> : <p className="text-xl font-bold">{userStats.height}m</p>}
                  </div>
                  <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-center">
                    <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">{t('streak')}</p>
                    <p className="text-xl font-bold text-emerald-400">{streak} <span className="text-xs font-normal">{t('days')}</span></p>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2"><Play className="w-5 h-5 text-emerald-500" /> {t('myRoutines')}</h2>
                  <div className="grid gap-4">
                    {routines.map(r => (
                      <button key={r.id} onClick={() => startWorkout(r)} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-emerald-500 flex justify-between items-center group transition-all">
                        <div className="text-left"><h3 className="font-bold text-lg group-hover:text-emerald-400">{r.name}</h3><p className="text-sm text-gray-500">{r.exercises.length} {t('library')}</p></div>
                        <div className="bg-emerald-500 p-3 rounded-full text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform"><Play className="w-6 h-6 fill-current" /></div>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2"><History className="w-5 h-5 text-emerald-500" /> {t('recentActivity')}</h2>
                  <div className="space-y-3">
                    {history.slice(0, 5).map(log => (
                      <div key={log.id} className="bg-gray-800/40 border border-gray-700/50 rounded-2xl overflow-hidden">
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-500"><Activity className="w-5 h-5" /></div>
                            <div><p className="font-bold">{log.routine_name}</p><p className="text-[10px] text-gray-500 uppercase">{log.date} • {log.duration} • {log.total_sets} {t('sets')}</p></div>
                          </div>
                          <button onClick={() => setExpandedHistoryId(expandedHistoryId === log.id ? null : log.id)} className="text-emerald-500 p-2">{expandedHistoryId === log.id ? <ChevronUp /> : <ChevronDown />}</button>
                        </div>
                        {expandedHistoryId === log.id && log.workout_details && (
                          <div className="px-4 pb-4 pt-2 border-t border-gray-700/30 bg-gray-900/20 space-y-3">
                            {log.workout_details.map((ex: any, i: number) => (
                              <div key={i} className="text-sm"><p className="text-emerald-400 font-medium mb-1 capitalize">{ex.exerciseName}</p>
                                <div className="flex flex-wrap gap-2">{ex.sets.map((s: any, si: number) => s.completed && (<span key={si} className="bg-gray-800 px-2 py-1 rounded border border-gray-700 text-[10px]">{s.weight}kg x {s.reps}</span>))}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* VISTA: LIBRERÍA */}
          {currentView === 'exercises' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('library')}</h1>
                <div className="flex gap-2">
                  <button onClick={() => { const s = searchSource === 'local' ? 'global' : 'local'; setSearchSource(s); fetchExercises(searchTerm, selectedMuscle, s); }} className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${searchSource === 'global' ? 'bg-blue-600' : 'bg-gray-700 text-gray-400'}`}>
                    <Globe className="w-4 h-4" /> {searchSource === 'global' ? t('globalDb') : t('localDb')}
                  </button>
                  <button onClick={() => setShowCreateExModal(true)} className="bg-emerald-500 p-2 rounded-xl"><Plus /></button>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1"><Search className="absolute left-3 top-3 text-gray-500" /><input placeholder={t('searchEx')} className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500" onChange={e => { setSearchTerm(e.target.value); fetchExercises(e.target.value, selectedMuscle) }} /></div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{MUSCLE_FILTERS.map(f => (<button key={f.id} onClick={() => { setSelectedMuscle(f.id); fetchExercises(searchTerm, f.id) }} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedMuscle === f.id ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>{t(f.labelKey as any)}</button>))}</div>
              </div>

              <div className="space-y-3">
                {results.map(ex => (
                  <div key={ex.id} className="flex items-center gap-4 bg-gray-800 p-3 rounded-2xl border border-gray-700 hover:border-emerald-500 transition-all group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0 relative">
                      {ex.gifUrl ? <img src={ex.gifUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-700"><Dumbbell /></div>}
                      <button onClick={() => setPreviewImage(ex.gifUrl)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Eye className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold capitalize truncate">{ex.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{ex.target} • {ex.equipment}</p>
                    </div>
                    {searchSource === 'global' && (
                      <button onClick={async () => { await supabase.from('custom_exercises').insert([{ name: ex.name, target: ex.target, gif_url: ex.gifUrl, equipment: ex.equipment }]); setSearchSource('local'); fetchExercises(); }} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA: PROGRESO (GRÁFICO REAL) */}
          {currentView === 'progress' && (
            <div className="space-y-8 animate-in fade-in">
              <h1 className="text-3xl font-bold">{t('progress')}</h1>
              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold mb-6 text-emerald-400">{t('evolution')}</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#9ca3af" fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                        cursor={{ fill: '#374151', opacity: 0.4 }}
                      />
                      <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.val > 0 ? '#10b981' : '#374151'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* VISTA: CONFIGURAR */}
          {currentView === 'routines' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('settings')}</h1>
                <button onClick={async () => { const n = prompt(t('newRoutine') + ':'); if(n) { await supabase.from('routines').insert([{name: n, user_id: user.id}]); fetchRoutines(user.id); } }} className="bg-emerald-500 px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> {t('newRoutine')}</button>
              </div>
              <div className="grid gap-4">
                {routines.map(r => (
                  <div key={r.id} className="bg-gray-800 p-6 rounded-3xl border border-gray-700 flex justify-between items-center">
                    <div><h3 className="font-bold text-xl">{r.name}</h3><p className="text-gray-500">{r.exercises.length} {t('library')}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowEditRoutineModal(r.id)} className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl hover:bg-blue-500 transition-all"><Settings className="w-6 h-6" /></button>
                      <button onClick={async () => { if(confirm('¿Borrar?')) { await supabase.from('routines').delete().eq('id', r.id); fetchRoutines(user.id); } }} className="p-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 transition-all"><Trash2 className="w-6 h-6" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA: WORKOUT */}
          {currentView === 'workout' && activeRoutine && (
            <div className="max-w-2xl mx-auto w-full space-y-6 pb-32 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center sticky top-0 bg-gray-900/95 py-4 z-20 backdrop-blur-sm">
                <div><h2 className="text-xl font-bold">{activeRoutine.name}</h2><div className="text-emerald-400 font-mono text-2xl font-bold">{formatTime(workoutTimer)}</div></div>
                <button onClick={() => { if(confirm(t('finish') + '?')) finishWorkout() }} className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-xl font-bold transition-colors">{t('finish')}</button>
              </div>
              {activeRoutine.exercises.map((ex: any) => (
                <div key={ex.id} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-xl">
                  <div className="flex gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900 border border-gray-700 cursor-pointer" onClick={() => setPreviewImage(ex.gifUrl)}><img src={ex.gifUrl} className="w-full h-full object-cover" /></div>
                    <div><h3 className="font-bold text-lg capitalize">{ex.name}</h3><p className="text-xs text-gray-500">{t('rest')}: {ex.restTime}s</p></div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-10 gap-2 text-[10px] uppercase font-bold text-gray-500 text-center"><span className="col-span-2">{t('sets')}</span><span className="col-span-3">{t('weight')}</span><span className="col-span-3">{t('reps')}</span><span className="col-span-2">OK</span></div>
                    {workoutData[ex.id]?.map((set: any, idx: number) => (
                      <div key={idx} className={`grid grid-cols-10 gap-2 items-center transition-all ${set.completed ? 'opacity-30' : ''}`}>
                        <span className="col-span-2 text-center font-bold text-gray-600">{idx+1}</span>
                        <input type="number" className="col-span-3 bg-gray-900 p-2 rounded-lg text-center border border-gray-700 outline-none" value={set.weight} onChange={e => setWorkoutData((prev: any) => ({...prev, [ex.id]: prev[ex.id].map((s: any, i: number) => i === idx ? {...s, weight: e.target.value} : s)}))} />
                        <input type="number" className="col-span-3 bg-gray-900 p-2 rounded-lg text-center border border-gray-700 outline-none" value={set.reps} onChange={e => setWorkoutData((prev: any) => ({...prev, [ex.id]: prev[ex.id].map((s: any, i: number) => i === idx ? {...s, reps: e.target.value} : s)}))} />
                        <button onClick={() => {
                          const isComp = !workoutData[ex.id][idx].completed
                          setWorkoutData((prev: any) => ({...prev, [ex.id]: prev[ex.id].map((s: any, i: number) => i === idx ? {...s, completed: isComp} : s)}))
                          if (isComp) { setRestTimer(ex.restTime); setIsResting(true) }
                        }} className={`col-span-2 p-2 rounded-lg flex justify-center ${set.completed ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'}`}><CheckCircle className="w-5 h-5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* MODAL: CREAR EJERCICIO */}
      {showCreateExModal && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateExercise} className="bg-gray-800 w-full max-w-md rounded-3xl border border-gray-700 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center mb-2"><h2 className="text-2xl font-bold">{t('createEx')}</h2><button type="button" onClick={() => setShowCreateExModal(false)}><X /></button></div>
            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Nombre</label><input required className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={newExForm.name} onChange={e => setNewExForm({...newExForm, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">{t('muscle')}</label><select className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none" value={newExForm.target} onChange={e => setNewExForm({...newExForm, target: e.target.value})}>{MUSCLE_FILTERS.filter(f => f.id !== 'all').map(f => <option key={f.id} value={f.id}>{t(f.labelKey as any)}</option>)}</select></div>
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">{t('equipment')}</label><input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none" value={newExForm.equipment} onChange={e => setNewExForm({...newExForm, equipment: e.target.value})} /></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">URL GIF</label><input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500" value={newExForm.gif_url} onChange={e => setNewExForm({...newExForm, gif_url: e.target.value})} /></div>
            <button type="submit" className="w-full bg-emerald-500 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all mt-4">{t('save')}</button>
          </form>
        </div>
      )}

      {/* MODAL: EDITAR RUTINA */}
      {showEditRoutineModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-gray-800 w-full max-w-5xl h-[90vh] rounded-3xl border border-gray-700 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center"><h2 className="text-2xl font-bold">{t('settings')}</h2><button onClick={() => setShowEditRoutineModal(null)} className="bg-emerald-500 px-8 py-2 rounded-xl font-bold">{t('save')}</button></div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 border-r border-gray-700 bg-gray-900/50 p-4 overflow-y-auto">
                <input placeholder={t('searchEx')} className="w-full bg-gray-800 p-3 rounded-xl mb-4 text-sm border border-gray-700 outline-none focus:border-emerald-500" onChange={e => fetchExercises(e.target.value)} />
                <div className="space-y-2">
                  {results.map(ex => {
                    const isSel = routines.find(r => r.id === showEditRoutineModal)?.exercises.some((e: any) => e.id === ex.id)
                    return (
                      <div key={ex.id} onClick={async () => {
                        if(isSel) {
                          const reId = routines.find(r => r.id === showEditRoutineModal)?.exercises.find((e: any) => e.id === ex.id)?.routineExerciseId
                          await supabase.from('routine_exercises').delete().eq('id', reId)
                        } else {
                          await supabase.from('routine_exercises').insert([{routine_id: showEditRoutineModal, exercise_id: ex.id, sets: 3, reps: '12', rest_time: 60}])
                        }
                        fetchRoutines(user.id)
                      }} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${isSel ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                        <div className="w-10 h-10 rounded-lg bg-black overflow-hidden"><img src={ex.gifUrl} className="w-full h-full object-cover" /></div>
                        <span className="text-xs font-bold truncate capitalize">{ex.name}</span>
                        {isSel ? <CheckCircle className="w-4 h-4 ml-auto" /> : <Plus className="w-4 h-4 ml-auto" />}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-800">
                {routines.find(r => r.id === showEditRoutineModal)?.exercises.map((ex: any) => (
                  <div key={ex.routineExerciseId} className="bg-gray-700/30 p-5 rounded-2xl border border-gray-600 grid grid-cols-3 gap-4">
                    <div className="col-span-3 flex justify-between items-center"><h4 className="font-bold capitalize">{ex.name}</h4><button onClick={async () => { await supabase.from('routine_exercises').delete().eq('id', ex.routineExerciseId); fetchRoutines(user.id) }} className="text-red-400"><Trash2 className="w-4 h-4" /></button></div>
                    <div><label className="text-[10px] text-gray-500 block mb-1">{t('sets')}</label><input type="number" value={ex.sets} className="w-full bg-gray-900 p-2 rounded-lg text-center" onChange={async e => { await supabase.from('routine_exercises').update({sets: e.target.value}).eq('id', ex.routineExerciseId); fetchRoutines(user.id) }} /></div>
                    <div><label className="text-[10px] text-gray-500 block mb-1">{t('reps')}</label><input type="text" value={ex.reps} className="w-full bg-gray-900 p-2 rounded-lg text-center" onChange={async e => { await supabase.from('routine_exercises').update({reps: e.target.value}).eq('id', ex.routineExerciseId); fetchRoutines(user.id) }} /></div>
                    <div><label className="text-[10px] text-gray-500 block mb-1">{t('rest')} (s)</label><input type="number" value={ex.restTime} className="w-full bg-gray-900 p-2 rounded-lg text-center" onChange={async e => { await supabase.from('routine_exercises').update({rest_time: e.target.value}).eq('id', ex.routineExerciseId); fetchRoutines(user.id) }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DESCANSO */}
      {isResting && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 z-[110] animate-bounce">
          <div className="flex items-center gap-3"><Timer className="w-6 h-6" /><span className="text-3xl font-mono font-bold">{formatTime(restTimer)}</span></div>
          <button onClick={() => setIsResting(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><SkipForward /></button>
        </div>
      )}

      {/* PREVIEW IMAGEN */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-full max-h-full rounded-3xl shadow-2xl border border-gray-800" />
        </div>
      )}

    </div>
  )
}
