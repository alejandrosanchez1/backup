'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  X, Save, Trash2, Shield, Users, Plus, UserPlus,
  Dumbbell, ChevronRight, Search, Check, ArrowLeft,
  Clock, RotateCcw, Hash, ChevronUp, ChevronDown, UserX, Calendar, Crown, Upload, Image, Loader2,
  KeyRound, Eye, EyeOff, Mail, Copy, CheckCheck
} from 'lucide-react'
import { exercisesData } from '@/lib/exercises-data'
import { fetchExercises } from '@/lib/exercisedb-api'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wrjenrtnojmhianqzxlo.supabase.co'
const SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyamVucnRub2ptaGlhbnF6eGxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU4MTYxOCwiZXhwIjoyMDg2MTU3NjE4fQ.GME1KUAeu-Z1ndUpNsQ9OFr0AnW0tcmGGU19eQG9d4U'

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ── Types ─────────────────────────────────────────────────────────────────────
type Profile = {
  id: string; full_name: string; weight: string; height: string
  age: number; gender: string; role: string; experience_level: string
  training_days: number; injuries: string; diet_style: string; focus_areas: string[]
  email?: string; created_at?: string; plan?: string; membership_end?: string; coach_id?: string
  whatsapp?: string; indicativo?: string; language?: string; nutrition_format_pref?: string
  measurements?: {
    diameters?: Record<string, string>
    skinfolds?: Record<string, string>
    perimeters?: Record<string, string>
    goals?: { objetivo_principal?: string; meta_peso?: string; meta_grasa?: string; nota?: string }
  }
}
type Meal = { name: string; protein: string[]; carbs: string[]; fat: string[] }
type DayPlan = { day: string; meals: Meal[] }
type RoutineEx = { id: number; exercise_id: string; name: string; target?: string; gifUrl?: string; sets: number; reps: string; rest_time: number; order: number }
type Routine   = { id: string; name: string; exercises: RoutineEx[] }

const MEAL_NAMES    = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Media Tarde', 'Cena']
const DAY_NAMES     = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const emptyDaysPlan = (): DayPlan[] => DAY_NAMES.map(day => ({ day, meals: MEAL_NAMES.map(n => ({ name: n, protein: [], carbs: [], fat: [] })) }))
const DEFAULT_SALADS = [
  { name: "🌴 Tropical Caribe", ingredients: "Papaya, mango, pepino, limón, semillas de chía", benefit: "Digestiva y antiinflamatoria" },
  { name: "🥕 Andina Energética", ingredients: "Zanahoria rallada, papa criolla, espinaca baby, aguacate", benefit: "Rica en potasio" },
  { name: "🌽 Campesina Suave", ingredients: "Maíz tierno, tomate cherry, pepino, aceite de oliva", benefit: "Aporte de fibra moderada" },
  { name: "🍍 Dulce del Valle", ingredients: "Piña, manzana verde, semillas de girasol", benefit: "Enzimas digestivas" },
  { name: "🥑 Pacífica Proteica", ingredients: "Aguacate, tomate, pepino, atún desmenuzado", benefit: "Alta en omega y proteínas" },
]
const FOCUS_OPTIONS = ['Hipertrofia', 'Fuerza', 'Pérdida de Grasa', 'Resistencia', 'Salud']

// ── Cálculo de resultados cineantropométricos ─────────────────────────────────
function calcBodyResults(p: {
  weight: string | number; height: string | number; age: number | string; gender: string;
  skinfolds?: Record<string, string>; perimeters?: Record<string, string>; diameters?: Record<string, string>;
}) {
  const W = parseFloat(String(p.weight)); const H = parseFloat(String(p.height)); const A = parseInt(String(p.age));
  if (!W || !H || !A) return null;
  const sk = p.skinfolds || {}; const pe = p.perimeters || {}; const di = p.diameters || {};
  const sum7 = ['biceps','triceps','subscapular','suprailiaco','abdominal','muslo','pierna','pectoral']
    .reduce((acc, k) => acc + parseFloat(sk[k] || '0'), 0);
  const imc = W / (H * H);
  const icc = parseFloat(pe.abdomen || '0') / (parseFloat(pe.cadera || '1') || 1);
  let fatPct = p.gender === 'Hombre'
    ? ((4.95 / (1.112 - 0.00043499*sum7 + 0.00000055*Math.pow(sum7,2) - 0.00028826*A)) - 4.5) * 100
    : ((4.95 / (1.097 - 0.00046971*sum7 + 0.00000056*Math.pow(sum7,2) - 0.00012828*A)) - 4.5) * 100;
  if (!isFinite(fatPct) || fatPct < 0) fatPct = 0;
  const muscleMass = W * (1 - fatPct/100) * 0.7;
  const bmr = p.gender === 'Hombre'
    ? (10*W) + (6.25*(H*100)) - (5*A) + 5
    : (10*W) + (6.25*(H*100)) - (5*A) - 161;
  const endo = -0.7182 + 0.1451*sum7 - 0.00068*Math.pow(sum7,2) + 0.0000014*Math.pow(sum7,3);
  const meso = (0.85*parseFloat(di.humeral||'6.3')) + (0.601*parseFloat(di.femoral||'8.6')) +
    (0.188*(parseFloat(pe.bicepsC||'29') - parseFloat(sk.triceps||'0')/10)) +
    (0.161*(parseFloat(pe.pantorrilla||'33') - parseFloat(sk.pierna||'0')/10)) - (0.131*(H*100)) + 4.5;
  const hwr = (H*100) / Math.pow(W, 1/3);
  const ecto = hwr > 40.75 ? (0.732*hwr - 28.58) : (0.463*hwr - 17.63);
  return {
    fatPercentage: fatPct.toFixed(1),
    fatLabel: fatPct < 15 ? 'Excelente' : fatPct < 25 ? 'Aceptable' : 'Alto',
    muscleMass: muscleMass.toFixed(1),
    bmr: Math.round(bmr).toString(),
    bmi: imc.toFixed(2),
    bmiLabel: imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Saludable' : imc < 30 ? 'Sobrepeso' : 'Obesidad',
    idealWeight: (22 * H * H).toFixed(2),
    icc: icc.toFixed(2),
    iccLabel: icc < 0.9 ? 'Excelente' : 'Riesgo',
    somatotype: {
      endo: isFinite(endo) ? endo.toFixed(1) : '0',
      meso: isFinite(meso) ? meso.toFixed(1) : '0',
      ecto: isFinite(ecto) ? ecto.toFixed(1) : '0',
      label: meso > ecto ? 'Mesomorfo' : 'Ectomorfo',
    },
  };
}

// ── SparkLine para gráficas de progreso ──────────────────────────────────────
function AdminSparkLine({ data, color, unit, invertGood = false, label }: { data: { date: string; value: number }[]; color: string; unit: string; invertGood?: boolean; label: string }) {
  if (data.length < 2) return null
  const values = data.map(d => d.value)
  const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1
  const W = 280; const H = 52; const pad = 4
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - ((d.value - min) / range) * (H - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const first = values[0]; const last = values[values.length - 1]
  const change = +(last - first).toFixed(1)
  const isImproved = invertGood ? change < 0 : change > 0
  const changeColor = change === 0 ? '#6B7895' : isImproved ? '#00E5A8' : '#f87171'
  const lastX = pad + ((data.length - 1) / (data.length - 1)) * (W - pad * 2)
  const lastY = H - pad - ((last - min) / range) * (H - pad * 2)
  const fmt = (d: string) => new Date(d).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  return (
    <div className="space-y-1">
      <p className="text-[9px] uppercase font-black tracking-widest" style={{ color: '#6B7895' }}>{label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 52 }}>
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} opacity="0.9" />
        <circle cx={lastX} cy={lastY} r="3.5" fill={color} />
      </svg>
      <div className="flex justify-between items-center">
        <span className="text-[9px]" style={{ color: '#6B7895' }}>{fmt(data[0].date)} · {first}{unit}</span>
        <span className="text-[9px] font-black" style={{ color: changeColor }}>{change > 0 ? '+' : ''}{change}{unit}</span>
        <span className="text-[9px]" style={{ color: '#6B7895' }}>{fmt(data[data.length-1].date)} · {last}{unit}</span>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
}
const inp: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, color: '#fff', outline: 'none', width: '100%', padding: '11px 14px', fontSize: 14
}
const lbl: React.CSSProperties = {
  fontSize: 10, color: '#6B7895', textTransform: 'uppercase',
  fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6, display: 'block'
}
const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg,#00E5A8,#00C2FF)',
  boxShadow: '0 8px 24px rgba(0,229,168,0.4)', borderRadius: 20,
  padding: '14px 0', fontWeight: 900, fontSize: 13, color: '#fff',
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminView({ supabase, currentUserId, currentUserRole }: { supabase: any; currentUserId: string; currentUserRole: string }) {
  const isAdmin = currentUserRole === 'admin'
  const isCoach = currentUserRole === 'coach'
  const [users, setUsers]               = useState<Profile[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab]       = useState<'profile'|'progreso'|'nutrition'|'routines'|'notas'|'config'|'control'>('profile')
  const [meals, setMeals]               = useState<Meal[]>([])
  const [waterGoal, setWaterGoal]       = useState(8)
  const [includeSalads, setIncludeSalads] = useState(false)
  const [nutritionFormat, setNutritionFormat] = useState<'select'|'days'>('select')
  const [daysMeals, setDaysMeals]       = useState<DayPlan[]>(emptyDaysPlan())
  const [activeDayIdx, setActiveDayIdx] = useState(0)
  const [userWorkoutLogs, setUserWorkoutLogs] = useState<any[]>([])
  const [clientBodyStats, setClientBodyStats] = useState<any[]>([])
  const [controlMonth, setControlMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [routines, setRoutines]         = useState<Routine[]>([])
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [editProfile, setEditProfile]   = useState<Partial<Profile>>({})
  const [saving, setSaving]             = useState(false)
  const [success, setSuccess]           = useState('')
  const [error, setError]               = useState('')

  // Create user
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser]       = useState({ full_name: '', email: '', password: '', role: 'user' })
  const [creating, setCreating]     = useState(false)

  // Routine management
  const [newRoutineName, setNewRoutineName] = useState('')
  const [exSearch, setExSearch]             = useState('')
  const [exResults, setExResults]           = useState<any[]>([])
  const [selectedEx, setSelectedEx]         = useState<any | null>(null)
  const [exConfig, setExConfig]             = useState({ sets: 3, reps: '10', rest_time: 60 })
  const [addingEx, setAddingEx]             = useState(false)
  const [showCreateEx, setShowCreateEx]     = useState(false)
  const [newEx, setNewEx]                   = useState({ name: '', target: '' })
  const [creatingEx, setCreatingEx]         = useState(false)
  const searchRef                           = useRef<HTMLInputElement>(null)
  const exSearchIdRef                       = useRef(0)

  // ── Credentials ──────────────────────────────────────────────────────────
  const [newPassword, setNewPassword]         = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [emailCopied, setEmailCopied]         = useState(false)

  // ── Coach branding ────────────────────────────────────────────────────────
  const [coachLogo, setCoachLogo]         = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef                      = useRef<HTMLInputElement>(null)

  // ── Coach own settings ────────────────────────────────────────────────────
  const [mainTab, setMainTab]               = useState<'alumnos'|'miperfil'>('alumnos')
  const [myProfile, setMyProfile]           = useState<Partial<Profile>>({})
  const [coachWhatsApp, setCoachWhatsApp]   = useState('')
  const [coachIndicativo, setCoachIndicativo] = useState('+57')
  const [appLanguage, setAppLanguage]       = useState('es')
  const [coachNutritionPref, setCoachNutritionPref] = useState<'select'|'days'>('select')
  const [nutritionPrefSaved, setNutritionPrefSaved] = useState(false)
  const [savingMySettings, setSavingMySettings] = useState(false)
  const [adminWhatsApp, setAdminWhatsApp]   = useState('')
  const [userCoachWA, setUserCoachWA]       = useState('')

  // ── Coach own nutrition ───────────────────────────────────────────────────
  const [myMeals, setMyMeals]               = useState<Meal[]>(MEAL_NAMES.map(n => ({ name: n, protein: [], carbs: [], fat: [] })))
  const [myDaysMeals, setMyDaysMeals]       = useState<DayPlan[]>(emptyDaysPlan())
  const [myWaterGoal, setMyWaterGoal]       = useState(8)
  const [myIncludeSalads, setMyIncludeSalads] = useState(false)
  const [myActiveDayIdx, setMyActiveDayIdx] = useState(0)
  const [savingMyNutrition, setSavingMyNutrition] = useState(false)

  // ── Coach own routines & goals ────────────────────────────────────────────
  const [ajustesTab, setAjustesTab] = useState<'datos'|'antropometria'|'nutricion'|'rutina'>('datos')
  const [myOwnRoutines, setMyOwnRoutines] = useState<Routine[]>([])
  const [myOwnSelectedRoutine, setMyOwnSelectedRoutine] = useState<Routine|null>(null)
  const [myOwnNewRoutineName, setMyOwnNewRoutineName] = useState('')
  const [myGoals, setMyGoals] = useState({ objetivo_principal: '', meta_peso: '', meta_grasa: '', nota: '' })

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toast = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 3000) }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 2500) }
  }

  // ── Users ────────────────────────────────────────────────────────────────
  const [coaches, setCoaches]         = useState<Profile[]>([])
  const [roleFilter, setRoleFilter]   = useState<'all'|'user'|'coach'|'mine'>('all')

  const loadUsers = async () => {
    let q = db.from('profiles').select('*')
    if (isCoach) q = q.eq('coach_id', currentUserId).eq('role', 'user')
    const { data } = await q
    setUsers(data || [])
    setLoading(false)
  }

  const loadCoaches = async () => {
    const { data } = await db.from('profiles').select('*').in('role', ['coach', 'admin'])
    setCoaches(data || [])
  }

  useEffect(() => {
    loadUsers()
    if (isAdmin) loadCoaches()
    if (isCoach || isAdmin) loadCoachLogo()
    if (isCoach) {
      // Restaurar desde localStorage antes de la carga async para evitar parpadeo
      try {
        const raw = localStorage.getItem(`coachSettings_${currentUserId}`)
        if (raw) {
          const s = JSON.parse(raw)
          if (s.whatsapp)           setCoachWhatsApp(s.whatsapp)
          if (s.indicativo)         setCoachIndicativo(s.indicativo)
          if (s.language)           setAppLanguage(s.language)
          if (s.coachNutritionPref) { setCoachNutritionPref(s.coachNutritionPref); setNutritionPrefSaved(true) }
        }
      } catch {}
      loadMyCoachProfile()
      loadAdminContact()
      loadMyNutrition()
      loadMyOwnRoutines()
    }
  }, [])

  // Mantener nutritionFormat fijo al preferido del coach
  useEffect(() => {
    if (isCoach) setNutritionFormat(coachNutritionPref)
  }, [coachNutritionPref, isCoach])

  const loadCoachLogo = async () => {
    const { data } = await db.from('profiles').select('logo_url').eq('id', currentUserId).single()
    if (data?.logo_url) setCoachLogo(data.logo_url)
  }

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast('Solo se permiten imágenes', true)
    setLogoUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${currentUserId}/logo.${ext}`
    const { error: uploadError } = await db.storage.from('coach-logos').upload(path, file, { upsert: true })
    if (uploadError) { toast(uploadError.message, true); setLogoUploading(false); return }
    const { data } = db.storage.from('coach-logos').getPublicUrl(path)
    const url = data.publicUrl
    await db.from('profiles').update({ logo_url: url }).eq('id', currentUserId)
    setCoachLogo(url)
    toast('Logo actualizado')
    setLogoUploading(false)
  }

  const removeLogo = async () => {
    await db.from('profiles').update({ logo_url: null }).eq('id', currentUserId)
    setCoachLogo(null)
    toast('Logo eliminado')
  }

  const loadMyCoachProfile = async () => {
    // Campos base (siempre existen en la tabla)
    const { data: base } = await db.from('profiles')
      .select('full_name,weight,height,age,gender,experience_level,training_days,injuries,diet_style,focus_areas,measurements')
      .eq('id', currentUserId).single()
    if (base) {
      setMyProfile(base)
      if ((base.measurements as any)?.goals) setMyGoals((base.measurements as any).goals)
    }

    // Campos nuevos — intentar DB, caer en localStorage si las columnas aún no existen
    const { data: ext, error: extErr } = await db.from('profiles')
      .select('whatsapp,indicativo,language,nutrition_format_pref')
      .eq('id', currentUserId).single()

    if (!extErr && ext) {
      setCoachWhatsApp(ext.whatsapp || '')
      setCoachIndicativo(ext.indicativo || '+57')
      setAppLanguage(ext.language || 'es')
      const pref = (ext.nutrition_format_pref as 'select'|'days') || 'select'
      setCoachNutritionPref(pref)
      if (ext.nutrition_format_pref) setNutritionPrefSaved(true)
    } else {
      // Fallback: localStorage (funciona aunque las columnas no existan en DB)
      try {
        const raw = localStorage.getItem(`coachSettings_${currentUserId}`)
        if (raw) {
          const s = JSON.parse(raw)
          if (s.whatsapp)           setCoachWhatsApp(s.whatsapp)
          if (s.indicativo)         setCoachIndicativo(s.indicativo)
          if (s.language)           setAppLanguage(s.language)
          if (s.coachNutritionPref) { setCoachNutritionPref(s.coachNutritionPref); setNutritionPrefSaved(true) }
        }
      } catch {}
    }
  }

  const loadAdminContact = async () => {
    const { data } = await db.from('profiles').select('whatsapp,indicativo').eq('role','admin').maybeSingle()
    if (data?.whatsapp) setAdminWhatsApp(`${(data.indicativo||'').replace(/\+/g,'')}${data.whatsapp}`)
  }

  const loadMyNutrition = async () => {
    const { data: nut } = await db.from('nutrition_plans').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (nut) {
      setMyMeals(nut.meals || MEAL_NAMES.map(n => ({ name: n, protein: [], carbs: [], fat: [] })))
      setMyWaterGoal(nut.water_goal || 8)
      setMyIncludeSalads(Array.isArray(nut.salads) && nut.salads.length > 0)
      setMyDaysMeals(nut.days_plan?.length ? nut.days_plan : emptyDaysPlan())
    }
  }

  const saveMyNutrition = async () => {
    setSavingMyNutrition(true)
    const salads = myIncludeSalads ? DEFAULT_SALADS : []
    const payload: any = { water_goal: myWaterGoal, salads, nutrition_format: coachNutritionPref }
    if (coachNutritionPref === 'days') payload.days_plan = myDaysMeals
    else payload.meals = myMeals
    const { data: ex } = await db.from('nutrition_plans').select('id').eq('user_id', currentUserId).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (ex) {
      const { error } = await db.from('nutrition_plans').update(payload).eq('id', ex.id)
      if (error) { toast('Error al guardar: ' + error.message, true); setSavingMyNutrition(false); return }
    } else {
      const { error } = await db.from('nutrition_plans').insert([{ user_id: currentUserId, ...payload }])
      if (error) { toast('Error al guardar: ' + error.message, true); setSavingMyNutrition(false); return }
    }
    setSavingMyNutrition(false)
    toast('Nutrición guardada')
  }

  const updateMyMeal = (i: number, type: 'protein'|'carbs'|'fat', val: string) =>
    setMyMeals(prev => prev.map((m, j) => j === i ? { ...m, [type]: val.split('\n').filter(Boolean) } : m))

  const updateMyDayMeal = (di: number, mi: number, type: 'protein'|'carbs'|'fat', val: string) =>
    setMyDaysMeals(prev => prev.map((d, i) => i !== di ? d : {
      ...d, meals: d.meals.map((m, j) => j !== mi ? m : { ...m, [type]: val.split('\n').filter(Boolean) })
    }))

  // ── Coach own routines ────────────────────────────────────────────────────
  const loadMyOwnRoutines = async () => {
    const { data } = await db.from('routines').select('id, name').eq('user_id', currentUserId).order('name')
    setMyOwnRoutines((data || []).map((r: any) => ({ ...r, exercises: [] })))
  }

  const openMyOwnRoutine = async (routine: Routine) => {
    const exercises = await loadRoutineExercises(routine.id)
    const full = { ...routine, exercises }
    setMyOwnSelectedRoutine(full)
    setMyOwnRoutines(prev => prev.map(r => r.id === routine.id ? full : r))
    setExSearch(''); setExResults([]); setSelectedEx(null)
    setExConfig({ sets: 3, reps: '10', rest_time: 60 })
    setShowCreateEx(false)
  }

  const createMyOwnRoutine = async () => {
    if (!myOwnNewRoutineName.trim()) return
    const { data, error } = await db.from('routines').insert([{ user_id: currentUserId, name: myOwnNewRoutineName.trim() }]).select().single()
    if (error) return toast('Error al crear rutina', true)
    setMyOwnNewRoutineName('')
    const newR: Routine = { id: data.id, name: data.name, exercises: [] }
    setMyOwnRoutines(prev => [...prev, newR])
    toast('Rutina creada')
    openMyOwnRoutine(newR)
  }

  const deleteMyOwnRoutine = async (id: string) => {
    if (!confirm('¿Eliminar esta rutina y todos sus ejercicios?')) return
    await db.from('routine_exercises').delete().eq('routine_id', id)
    await db.from('routines').delete().eq('id', id)
    setMyOwnRoutines(prev => prev.filter(r => r.id !== id))
    if (myOwnSelectedRoutine?.id === id) setMyOwnSelectedRoutine(null)
    toast('Rutina eliminada')
  }

  const addExerciseToMyOwnRoutine = async () => {
    if (!myOwnSelectedRoutine || !selectedEx) return
    setAddingEx(true)
    const maxOrder = myOwnSelectedRoutine.exercises.reduce((m, e) => Math.max(m, e.order ?? 0), 0)
    const { error } = await db.from('routine_exercises').insert([{
      routine_id: myOwnSelectedRoutine.id,
      exercise_id: selectedEx.id,
      sets: exConfig.sets,
      reps: String(exConfig.reps),
      rest_time: exConfig.rest_time,
      order: maxOrder + 1,
    }])
    if (error) toast(error.message || 'Error al añadir ejercicio', true)
    else {
      toast(`${selectedEx.name} añadido`)
      setExSearch(''); setSelectedEx(null); setExResults([])
      setExConfig({ sets: 3, reps: '10', rest_time: 60 })
      const exercises = await loadRoutineExercises(myOwnSelectedRoutine.id)
      setMyOwnSelectedRoutine(prev => prev ? { ...prev, exercises } : null)
    }
    setAddingEx(false)
  }

  const moveMyOwnExercise = async (idx: number, dir: -1 | 1) => {
    if (!myOwnSelectedRoutine) return
    const exs = [...myOwnSelectedRoutine.exercises]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= exs.length) return
    const a = { ...exs[idx], order: exs[swapIdx].order }
    const b = { ...exs[swapIdx], order: exs[idx].order }
    exs[idx] = a; exs[swapIdx] = b
    exs.sort((x, y) => x.order - y.order)
    setMyOwnSelectedRoutine(prev => prev ? { ...prev, exercises: exs } : null)
    await Promise.all([
      db.from('routine_exercises').update({ order: a.order }).eq('id', a.id),
      db.from('routine_exercises').update({ order: b.order }).eq('id', b.id),
    ])
  }

  const updateLocalMyOwnEx = (exId: number, field: string, value: any) => {
    setMyOwnSelectedRoutine(prev => {
      if (!prev) return prev
      return { ...prev, exercises: prev.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e) }
    })
  }

  const saveMyOwnExercise = async (ex: RoutineEx) => {
    await db.from('routine_exercises').update({ sets: ex.sets, reps: ex.reps, rest_time: ex.rest_time }).eq('id', ex.id)
  }

  const deleteMyOwnExercise = async (exId: number) => {
    await db.from('routine_exercises').delete().eq('id', exId)
    setMyOwnSelectedRoutine(prev => prev ? { ...prev, exercises: prev.exercises.filter(e => e.id !== exId) } : null)
    toast('Ejercicio eliminado')
  }

  const saveMyCoachProfile = async () => {
    setSavingMySettings(true)

    // Calcular resultados del coach
    const myResults = calcBodyResults({
      weight: myProfile.weight || '0', height: myProfile.height || '0',
      age: myProfile.age || 0, gender: myProfile.gender || 'Hombre',
      skinfolds: (myProfile.measurements as any)?.skinfolds,
      perimeters: (myProfile.measurements as any)?.perimeters,
      diameters: (myProfile.measurements as any)?.diameters,
    })

    const myMeasurementsWithResults = {
      ...(myProfile.measurements || {}),
      goals: myGoals,
      ...(myResults ? { results: myResults } : {}),
    }

    // Guardar campos base (siempre existen)
    await db.from('profiles').update({
      full_name: myProfile.full_name,
      weight: myProfile.weight,
      height: myProfile.height,
      age: myProfile.age,
      gender: myProfile.gender,
      experience_level: myProfile.experience_level,
      training_days: myProfile.training_days,
      injuries: myProfile.injuries,
      diet_style: myProfile.diet_style,
      focus_areas: myProfile.focus_areas,
      measurements: myMeasurementsWithResults,
      updated_at: new Date().toISOString(),
    }).eq('id', currentUserId)

    // Registrar en historial cuando se guarda desde la pestaña Medidas
    if (ajustesTab === 'antropometria') {
      await db.from('body_stats_history').insert([{
        user_id: currentUserId,
        weight: parseFloat(String(myProfile.weight)) || 0,
        measurements: {
          skinfolds: (myProfile.measurements as any)?.skinfolds || {},
          perimeters: (myProfile.measurements as any)?.perimeters || {},
          results: myResults || {},
        },
        date: new Date().toISOString(),
      }])
    }

    // Intentar guardar campos nuevos en DB
    await db.from('profiles').update({
      whatsapp: coachWhatsApp,
      indicativo: coachIndicativo,
      language: appLanguage,
      nutrition_format_pref: coachNutritionPref,
    }).eq('id', currentUserId)

    // Siempre guardar en localStorage como respaldo persistente
    try {
      localStorage.setItem(`coachSettings_${currentUserId}`, JSON.stringify({
        whatsapp: coachWhatsApp,
        indicativo: coachIndicativo,
        language: appLanguage,
        coachNutritionPref,
      }))
    } catch {}

    setSavingMySettings(false)
    setNutritionPrefSaved(true)
    toast('Configuración guardada')
  }

  const deleteUser = async (user: Profile) => {
    if (isCoach && user.coach_id !== currentUserId) return toast('Sin permiso para eliminar este usuario', true)
    if (!confirm(`¿Eliminar a ${user.full_name}? Esta acción no se puede deshacer.`)) return
    try {
      await db.from('routine_exercises').delete().in('routine_id',
        (await db.from('routines').select('id').eq('user_id', user.id)).data?.map((r: any) => r.id) || []
      )
      await db.from('routines').delete().eq('user_id', user.id)
      await db.from('nutrition_plans').delete().eq('user_id', user.id)
      await db.from('profiles').delete().eq('id', user.id)
      await db.auth.admin.deleteUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      setSelectedUser(null)
      toast(`${user.full_name} eliminado`)
    } catch (e: any) { toast(e.message || 'Error al eliminar usuario', true) }
  }

  const fetchClientBodyStats = async (userId: string) => {
    const { data } = await db.from('body_stats_history').select('*').eq('user_id', userId).order('date', { ascending: true })
    setClientBodyStats(data || [])
  }

  const selectUser = async (user: Profile) => {
    setSelectedUser(user)
    setEditProfile(user)
    openMembership(user)
    setActiveTab('profile')
    setSelectedRoutine(null)
    setNewPassword('')
    setShowPassword(false)
    setEmailCopied(false)
    setClientBodyStats([])
    fetchClientBodyStats(user.id)
    const { data: nut } = await db.from('nutrition_plans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    setMeals(nut?.meals || MEAL_NAMES.map(n => ({ name: n, protein: [], carbs: [], fat: [] })))
    setWaterGoal(nut?.water_goal || 8)
    setIncludeSalads(Array.isArray(nut?.salads) && nut.salads.length > 0)
    setNutritionFormat(isCoach ? coachNutritionPref : (nut?.nutrition_format === 'days' ? 'days' : 'select'))
    setDaysMeals(nut?.days_plan?.length ? nut.days_plan : emptyDaysPlan())
    setActiveDayIdx(0)
    await loadRoutines(user.id)
    const { data: logs } = await db.from('workout_logs').select('created_at, routine_name, duration, total_sets').eq('user_id', user.id).order('created_at', { ascending: false })
    setUserWorkoutLogs(logs || [])
    setControlMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    const coachId = user.coach_id || (isCoach ? currentUserId : null)
    if (coachId) {
      const { data: cData } = await db.from('profiles').select('whatsapp,indicativo').eq('id', coachId).single()
      setUserCoachWA(cData?.whatsapp ? `${(cData.indicativo||'').replace(/\+/g,'')}${cData.whatsapp}` : '')
    } else { setUserCoachWA('') }
  }

  // ── Routines ─────────────────────────────────────────────────────────────
  const loadRoutines = async (userId: string) => {
    const { data } = await db.from('routines').select('id, name').eq('user_id', userId).order('name')
    setRoutines((data || []).map((r: any) => ({ ...r, exercises: [] })))
  }

  const loadRoutineExercises = async (routineId: string): Promise<RoutineEx[]> => {
    const { data: rows } = await db
      .from('routine_exercises')
      .select('id, sets, reps, rest_time, exercise_id, order')
      .eq('routine_id', routineId)
      .order('order', { ascending: true })
    if (!rows?.length) return []

    const ids = rows.map((r: any) => r.exercise_id).filter(Boolean)
    const nameMap: Record<string, string> = {}
    const targetMap: Record<string, string> = {}

    const gifMap: Record<string, string> = {}

    if (ids.length) {
      const { data: customEx } = await db.from('custom_exercises').select('id, name, target').in('id', ids)
      ;(customEx || []).forEach((e: any) => { nameMap[e.id] = e.name; targetMap[e.id] = e.target })

      const { data: allEx } = await db.from('all_exercises').select('id, name, target, "gifUrl"').in('id', ids)
      ;(allEx || []).forEach((e: any) => {
        if (!nameMap[e.id]) { nameMap[e.id] = e.name; targetMap[e.id] = e.target }
        if (e.gifUrl) gifMap[e.id] = e.gifUrl
      })
    }

    return rows.map((re: any) => {
      const localEx = exercisesData.find(e => e.id === re.exercise_id)
      return {
        id: re.id,
        exercise_id: re.exercise_id,
        name: nameMap[re.exercise_id] || localEx?.name || 'Ejercicio',
        target: targetMap[re.exercise_id] || localEx?.muscle || '',
        gifUrl: gifMap[re.exercise_id] || '',
        sets: re.sets || 3,
        reps: re.reps || '10',
        rest_time: re.rest_time || 60,
        order: re.order ?? 0,
      }
    })
  }

  const openRoutine = async (routine: Routine) => {
    const exercises = await loadRoutineExercises(routine.id)
    const full = { ...routine, exercises }
    setSelectedRoutine(full)
    setRoutines(prev => prev.map(r => r.id === routine.id ? full : r))
    setExSearch(''); setExResults([]); setSelectedEx(null)
    setExConfig({ sets: 3, reps: '10', rest_time: 60 })
  }

  const refreshSelectedRoutine = async () => {
    if (!selectedRoutine) return
    const exercises = await loadRoutineExercises(selectedRoutine.id)
    setSelectedRoutine(prev => prev ? { ...prev, exercises } : null)
  }

  const createRoutine = async () => {
    if (!newRoutineName.trim() || !selectedUser) return
    const { data, error } = await db.from('routines').insert([{ user_id: selectedUser.id, name: newRoutineName.trim() }]).select().single()
    if (error) return toast('Error al crear rutina', true)
    setNewRoutineName('')
    const newR: Routine = { id: data.id, name: data.name, exercises: [] }
    setRoutines(prev => [...prev, newR])
    toast('Rutina creada')
    openRoutine(newR)
  }

  const deleteRoutine = async (id: string) => {
    if (!confirm('¿Eliminar esta rutina y todos sus ejercicios?')) return
    await db.from('routine_exercises').delete().eq('routine_id', id)
    await db.from('routines').delete().eq('id', id)
    setRoutines(prev => prev.filter(r => r.id !== id))
    if (selectedRoutine?.id === id) setSelectedRoutine(null)
    toast('Rutina eliminada')
  }

  // ── Exercise search ───────────────────────────────────────────────────────
  const searchExercises = async (q: string) => {
    setExSearch(q)
    setSelectedEx(null)
    if (q.trim().length < 2) { setExResults([]); return }

    const callId = ++exSearchIdRef.current

    const words = q.trim().split(/\s+/).filter(Boolean)
    let customQ = db.from('custom_exercises').select('id, name, target')
    let allQ = db.from('all_exercises').select('id, name, target, "gifUrl"')
    words.forEach(w => { customQ = customQ.ilike('name', `%${w}%`); allQ = allQ.ilike('name', `%${w}%`) })
    const [customExRes, allExRes, apiRes] = await Promise.allSettled([
      customQ.limit(5),
      allQ.limit(5),
      fetchExercises({ search: q.trim(), limit: 10 }),
    ])

    if (callId !== exSearchIdRef.current) return

    const customEx = customExRes.status === 'fulfilled' ? customExRes.value.data || [] : []
    const allEx    = allExRes.status === 'fulfilled'    ? allExRes.value.data || []    : []
    const apiEx = (() => {
      if (apiRes.status !== 'fulfilled') return []
      const raw = apiRes.value.data
      const list: any[] = Array.isArray(raw) ? raw : (raw as any)?.exercises || (raw as any)?.data || []
      return list.map((e: any) => ({
        id: e.exerciseId,
        name: e.name,
        target: e.targetMuscles?.[0] || '',
        gifUrl: e.gifUrl,
        _fromApi: true,
        _apiData: e,
      }))
    })()

    const seen = new Set<string>()
    const deduped = [...customEx, ...allEx, ...apiEx].filter((e: any) => {
      const key = String(e.id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    setExResults(deduped)
  }

  const pickExercise = async (ex: any) => {
    if (ex._fromApi) {
      // Guardar en exercises_library para tener un ID persistente
      await db.from('exercises_library').upsert({
        id: ex.id,
        name: ex.name,
        target: ex.target,
        bodyPart: ex._apiData.bodyParts?.[0]?.toLowerCase() || '',
        gifUrl: ex.gifUrl,
        equipment: ex._apiData.equipments?.[0] || '',
        instructions: ex._apiData.instructions || [],
        secondary_muscles: ex._apiData.secondaryMuscles || [],
      }, { onConflict: 'id' })
    }
    setSelectedEx(ex)
    setExSearch('')
    setExResults([])
  }

  const createCustomExercise = async () => {
    if (!newEx.name.trim()) return toast('Escribe un nombre', true)
    setCreatingEx(true)
    const { data, error } = await db.from('custom_exercises')
      .insert([{ name: newEx.name.trim(), target: newEx.target.trim() || 'General' }])
      .select().single()
    if (error) { toast('Error al crear ejercicio', true); setCreatingEx(false); return }
    toast(`"${data.name}" creado`)
    setNewEx({ name: '', target: '' })
    setShowCreateEx(false)
    // Auto-seleccionar el ejercicio recién creado
    pickExercise({ id: data.id, name: data.name, target: data.target })
    setCreatingEx(false)
  }

  const addExerciseToRoutine = async () => {
    if (!selectedRoutine || !selectedEx) return
    setAddingEx(true)
    const maxOrder = selectedRoutine.exercises.reduce((m, e) => Math.max(m, e.order ?? 0), 0)
    const { error } = await db.from('routine_exercises').insert([{
      routine_id: selectedRoutine.id,
      exercise_id: selectedEx.id,
      sets: exConfig.sets,
      reps: String(exConfig.reps),
      rest_time: exConfig.rest_time,
      order: maxOrder + 1,
    }])
    if (error) toast(error.message || 'Error al añadir ejercicio', true)
    else {
      toast(`${selectedEx.name} añadido`)
      setExSearch(''); setSelectedEx(null); setExResults([])
      setExConfig({ sets: 3, reps: '10', rest_time: 60 })
      await refreshSelectedRoutine()
    }
    setAddingEx(false)
  }

  // ── Exercise reorder ─────────────────────────────────────────────────────
  const moveExercise = async (idx: number, dir: -1 | 1) => {
    if (!selectedRoutine) return
    const exs = [...selectedRoutine.exercises]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= exs.length) return

    const a = { ...exs[idx], order: exs[swapIdx].order }
    const b = { ...exs[swapIdx], order: exs[idx].order }
    exs[idx] = a; exs[swapIdx] = b
    exs.sort((x, y) => x.order - y.order)
    setSelectedRoutine(prev => prev ? { ...prev, exercises: exs } : null)

    await Promise.all([
      db.from('routine_exercises').update({ order: a.order }).eq('id', a.id),
      db.from('routine_exercises').update({ order: b.order }).eq('id', b.id),
    ])
  }

  // ── Exercise edit (inline, saved on blur) ────────────────────────────────
  const updateLocalEx = (exId: number, field: string, value: any) => {
    setSelectedRoutine(prev => {
      if (!prev) return prev
      return { ...prev, exercises: prev.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e) }
    })
  }

  const saveExercise = async (ex: RoutineEx) => {
    await db.from('routine_exercises').update({ sets: ex.sets, reps: ex.reps, rest_time: ex.rest_time }).eq('id', ex.id)
  }

  const deleteExercise = async (exId: number) => {
    await db.from('routine_exercises').delete().eq('id', exId)
    setSelectedRoutine(prev => prev ? { ...prev, exercises: prev.exercises.filter(e => e.id !== exId) } : null)
    toast('Ejercicio eliminado')
  }

  // ── Membership ────────────────────────────────────────────────────────────
  const [membership, setMembership] = useState({ plan: 'Básico', membership_end: '' })

  const openMembership = (user: Profile) => {
    setMembership({ plan: user.plan || 'Básico', membership_end: user.membership_end || '' })
  }

  const extendMembership = (months: number) => {
    const base = membership.membership_end && new Date(membership.membership_end) > new Date()
      ? new Date(membership.membership_end)
      : new Date()
    base.setMonth(base.getMonth() + months)
    setMembership(p => ({ ...p, membership_end: base.toISOString().split('T')[0] }))
  }

  const saveMembership = async () => {
    if (!selectedUser) return
    const { error } = await db.from('profiles').update({
      plan: membership.plan,
      membership_end: membership.membership_end || null,
    }).eq('id', selectedUser.id)
    if (error) return toast(error.message || 'Error al guardar membresía', true)
    setSelectedUser(prev => prev ? { ...prev, plan: membership.plan, membership_end: membership.membership_end } : null)
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, plan: membership.plan, membership_end: membership.membership_end } : u))
    toast('Membresía actualizada')
  }

  const daysLeft = (end?: string) => {
    if (!end) return null
    const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000)
    return diff
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!selectedUser) return
    setSaving(true)

    // Calcular resultados con los datos actuales
    const results = calcBodyResults({
      weight: editProfile.weight || '0', height: editProfile.height || '0',
      age: editProfile.age || 0, gender: editProfile.gender || 'Hombre',
      skinfolds: (editProfile.measurements as any)?.skinfolds,
      perimeters: (editProfile.measurements as any)?.perimeters,
      diameters: (editProfile.measurements as any)?.diameters,
    })

    const measurementsWithResults = {
      ...(editProfile.measurements || {}),
      ...(results ? { results } : {}),
    }

    const { error } = await db.from('profiles').update({
      full_name: editProfile.full_name, weight: editProfile.weight, height: editProfile.height,
      age: editProfile.age, gender: editProfile.gender, experience_level: editProfile.experience_level,
      training_days: editProfile.training_days, injuries: editProfile.injuries,
      diet_style: editProfile.diet_style, focus_areas: editProfile.focus_areas,
      measurements: measurementsWithResults,
      updated_at: new Date().toISOString(),
    }).eq('id', selectedUser.id)

    if (!error) {
      // Registrar siempre en historial cuando hay peso o medidas
      const weight = parseFloat(String(editProfile.weight)) || 0
      await db.from('body_stats_history').insert([{
        user_id: selectedUser.id,
        weight,
        measurements: {
          skinfolds: (editProfile.measurements as any)?.skinfolds || {},
          perimeters: (editProfile.measurements as any)?.perimeters || {},
          results: results || {},
        },
        date: new Date().toISOString(),
      }])
      // Refrescar la pestaña Progreso del coach
      await fetchClientBodyStats(selectedUser.id)
    }

    setSaving(false)
    error ? toast(error.message, true) : toast('✓ Medidas guardadas en historial')
  }

  // ── Credentials ───────────────────────────────────────────────────────────
  const changePassword = async () => {
    if (!selectedUser) return
    if (newPassword.length < 6) return toast('La contraseña debe tener al menos 6 caracteres', true)
    setChangingPassword(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, password: newPassword }),
      })
      const result = await res.json()
      if (!res.ok || result.error) return toast(result.error || 'Error al cambiar contraseña', true)
      setNewPassword('')
      setShowPassword(false)
      toast('Contraseña actualizada correctamente')
    } catch (e: any) {
      toast(e.message || 'Error de red', true)
    } finally {
      setChangingPassword(false)
    }
  }

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch { toast('No se pudo copiar', true) }
  }

  // ── Nutrition ─────────────────────────────────────────────────────────────
  const saveNutrition = async () => {
    if (!selectedUser) return
    setSaving(true)
    const salads = includeSalads ? DEFAULT_SALADS : []
    const payload: any = { water_goal: waterGoal, salads, nutrition_format: nutritionFormat }
    if (nutritionFormat === 'days') payload.days_plan = daysMeals
    else payload.meals = meals
    const { data: ex } = await db.from('nutrition_plans').select('id').eq('user_id', selectedUser.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (ex) {
      const { error } = await db.from('nutrition_plans').update(payload).eq('id', ex.id)
      if (error) { toast('Error al guardar: ' + error.message, true); setSaving(false); return }
    } else {
      const { error } = await db.from('nutrition_plans').insert([{ user_id: selectedUser.id, ...payload }])
      if (error) { toast('Error al guardar: ' + error.message, true); setSaving(false); return }
    }
    setSaving(false); toast('Nutrición guardada')
  }
  const updateMeal = (i: number, type: 'protein'|'carbs'|'fat', val: string) =>
    setMeals(prev => prev.map((m, j) => j === i ? { ...m, [type]: val.split('\n').filter(Boolean) } : m))

  const updateDayMeal = (dayIdx: number, mealIdx: number, type: 'protein'|'carbs'|'fat', val: string) =>
    setDaysMeals(prev => prev.map((d, di) => di !== dayIdx ? d : {
      ...d, meals: d.meals.map((m, mi) => mi !== mealIdx ? m : { ...m, [type]: val.split('\n').filter(Boolean) })
    }))

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-sm font-bold uppercase tracking-widest animate-pulse" style={{ color: '#6B7895' }}>Cargando...</p>
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTINE DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (selectedUser && activeTab === 'routines' && selectedRoutine) {
    return (
      <div className="space-y-4 pb-28">
        <style>{`@keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedRoutine(null)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft size={18} style={{ color:'#A8B3CF' }} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color:'#6B7895' }}>{selectedUser.full_name}</p>
            <h2 className="text-lg font-black text-white break-words">{selectedRoutine.name}</h2>
          </div>
          <button onClick={() => deleteRoutine(selectedRoutine.id)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95 shrink-0"
            style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={16} style={{ color:'#ef4444' }} />
          </button>
        </div>

        {/* Toasts */}
        {success && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.25)', color:'#00E5A8' }}>✓ {success}</div>}
        {error   && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444' }}>✕ {error}</div>}

        {/* ── AÑADIR EJERCICIO ── */}
        <div className="p-4 space-y-3 rounded-[20px]" style={{ background:'rgba(0,229,168,0.04)', border:'1px solid rgba(0,229,168,0.2)' }}>
          <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#00E5A8' }}>Añadir ejercicio</p>

          {/* ── Tab bar Buscar / Crear ── */}
          <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(10,18,32,0.8)', border:'1px solid rgba(0,229,168,0.18)' }}>
            <div className="flex" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {[{ id: false, icon: <Search size={12}/>, label:'Buscar' }, { id: true, icon: <Plus size={12}/>, label:'Crear' }].map(tab => (
                <button key={String(tab.id)} onClick={() => { setShowCreateEx(tab.id); setExSearch(''); setExResults([]); setSelectedEx(null) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-black uppercase tracking-wider transition-all"
                  style={{
                    color: showCreateEx === tab.id ? '#00E5A8' : '#6B7895',
                    borderBottom: showCreateEx === tab.id ? '2px solid #00E5A8' : '2px solid transparent',
                    background: showCreateEx === tab.id ? 'rgba(0,229,168,0.06)' : 'transparent',
                  }}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            <div className="p-3 space-y-3">
              {showCreateEx ? (
                /* ── CREAR tab ── */
                <div className="space-y-2">
                  <input
                    style={{ ...inp, fontSize:13 } as React.CSSProperties}
                    placeholder="Nombre del ejercicio *"
                    value={newEx.name}
                    onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && createCustomExercise()}
                  />
                  <input
                    style={{ ...inp, fontSize:13 } as React.CSSProperties}
                    placeholder="Músculo / grupo (ej: Pecho, Pierna...)"
                    value={newEx.target}
                    onChange={e => setNewEx(p => ({ ...p, target: e.target.value }))}
                  />
                  <button onClick={createCustomExercise} disabled={creatingEx || !newEx.name.trim()}
                    className="w-full py-3 rounded-xl font-black uppercase text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                    style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)' }}>
                    {creatingEx ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
                    {creatingEx ? 'Creando...' : 'Crear y seleccionar'}
                  </button>
                </div>
              ) : (
                /* ── BUSCAR tab ── */
                <div className="space-y-3">
                  {/* Trigger button */}
                  <button
                    onClick={() => setExSearch(' ')}
                    className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all active:scale-[0.98]"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    <Search size={15} style={{ color:'#4A5568' }} />
                    <span className="flex-1 text-left text-sm font-normal" style={{ color: selectedEx ? '#fff' : '#4A5568' }}>
                      {selectedEx ? selectedEx.name : 'Buscar ejercicio…'}
                    </span>
                    {selectedEx
                      ? <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(0,229,168,0.15)', color:'#00E5A8' }}>Seleccionado</span>
                      : <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background:'rgba(255,255,255,0.06)', color:'#4A5568' }}>Toca aquí</span>
                    }
                  </button>

                  {/* ── MODAL DE BÚSQUEDA (fixed sobre todo) ── */}
                  {exSearch.length > 0 && (
                    <div className="fixed inset-0 z-[9999] flex flex-col justify-end"
                      style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)' }}
                      onClick={e => { if (e.target === e.currentTarget) { setExSearch(''); setExResults([]) } }}>
                      <div className="rounded-t-3xl flex flex-col overflow-hidden"
                        style={{ background:'#060e1a', border:'1px solid rgba(0,229,168,0.15)', borderBottom:'none', maxHeight:'85vh', boxShadow:'0 -20px 60px rgba(0,0,0,0.8)' }}>

                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                          <div className="w-10 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }} />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 pb-3 shrink-0">
                          <div>
                            <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#00E5A8' }}>Añadir ejercicio</p>
                            {exResults.length > 0 && (
                              <p className="text-xs font-bold mt-0.5" style={{ color:'#4A5568' }}>{exResults.length} resultado{exResults.length !== 1 ? 's' : ''}</p>
                            )}
                          </div>
                          <button onClick={() => { setExSearch(''); setExResults([]) }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-90"
                            style={{ background:'rgba(255,255,255,0.08)' }}>
                            <X size={14} style={{ color:'#A8B3CF' }} />
                          </button>
                        </div>

                        {/* Search bar */}
                        <div className="px-4 pb-3 shrink-0">
                          <div className="flex items-center gap-3 rounded-2xl px-4"
                            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(0,229,168,0.25)', boxShadow:'0 0 0 2px rgba(0,229,168,0.08)' }}>
                            <Search size={15} style={{ color:'#00E5A8', flexShrink:0 }} />
                            <input autoFocus
                              ref={searchRef}
                              className="flex-1 bg-transparent outline-none py-3.5 text-sm text-white font-bold placeholder:font-normal placeholder:text-slate-600"
                              style={{ caretColor:'#00E5A8' }}
                              placeholder="bench press, squat, curl…"
                              value={exSearch}
                              onChange={e => searchExercises(e.target.value)}
                            />
                            {exSearch.trim() && (
                              <button onClick={() => { setExSearch(''); setExResults([]) }}
                                className="w-6 h-6 flex items-center justify-center rounded-full"
                                style={{ background:'rgba(255,255,255,0.1)' }}>
                                <X size={10} style={{ color:'#A8B3CF' }} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Results list */}
                        <div className="overflow-y-auto flex-1">
                          {exResults.length === 0 && exSearch.trim().length >= 2 && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                              <Loader2 size={28} className="animate-spin" style={{ color:'#1E3A5F' }} />
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ color:'#1E3A5F' }}>Buscando…</p>
                            </div>
                          )}
                          {exResults.length === 0 && exSearch.trim().length < 2 && exSearch.trim().length > 0 && (
                            <div className="flex flex-col items-center justify-center py-16 gap-2">
                              <p className="text-sm font-bold" style={{ color:'#1E3A5F' }}>Escribe al menos 2 letras</p>
                            </div>
                          )}
                          {exResults.map((ex: any, i: number) => (
                            <button key={ex.id ?? `ex-${i}`} onClick={() => pickExercise(ex)}
                              className="w-full text-left flex items-center transition-all active:scale-[0.98]"
                              style={{ borderBottom: i < exResults.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                              onMouseEnter={e => (e.currentTarget.style.background='rgba(0,229,168,0.06)')}
                              onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                              <div className="relative shrink-0 m-3">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
                                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>
                                  {ex.gifUrl
                                    ? <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
                                    : <span className="text-2xl font-black" style={{ color:'#1E3A5F' }}>{ex.name?.charAt(0).toUpperCase()}</span>
                                  }
                                </div>
                                {ex._fromApi && (
                                  <span className="absolute -top-1 -right-1 text-[7px] font-black px-1.5 py-0.5 rounded-full" style={{ background:'#00C2FF', color:'#060e1a', lineHeight:'1.4' }}>API</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 py-3 pr-2">
                                <p className="text-sm font-black text-white leading-tight">{ex.name}</p>
                                {ex.target && (
                                  <span className="inline-block mt-1.5 text-[9px] uppercase font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(0,229,168,0.12)', color:'#00E5A8', border:'1px solid rgba(0,229,168,0.2)' }}>
                                    {ex.target}
                                  </span>
                                )}
                              </div>
                              <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl mr-3"
                                style={{ background:'rgba(0,229,168,0.08)', border:'1px solid rgba(0,229,168,0.15)' }}>
                                <Plus size={14} style={{ color:'#00E5A8' }} />
                              </div>
                            </button>
                          ))}
                          <div className="h-6" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected exercise card con GIF banner */}
                  {selectedEx && (
                    <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(0,229,168,0.2)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
                      <div className="relative" style={{ height:130, background:'#060e1a' }}>
                        {selectedEx.gifUrl
                          ? <img src={selectedEx.gifUrl} alt={selectedEx.name} className="w-full h-full object-contain" loading="lazy" style={{ filter:'brightness(0.85)' }} />
                          : <div className="w-full h-full flex items-center justify-center"><Dumbbell size={36} style={{ color:'#1E3A5F' }} /></div>
                        }
                        <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(6,14,26,1) 0%, rgba(6,14,26,0.4) 55%, transparent 100%)' }} />
                        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
                          <p className="font-black text-white text-sm leading-tight truncate">{selectedEx.name}</p>
                          {selectedEx.target && (
                            <span className="inline-block mt-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-full"
                              style={{ background:'rgba(0,229,168,0.2)', color:'#00E5A8', border:'1px solid rgba(0,229,168,0.3)' }}>
                              {selectedEx.target}
                            </span>
                          )}
                        </div>
                        <button onClick={() => { setSelectedEx(null); setExSearch('') }}
                          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-xl transition-all active:scale-90"
                          style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.1)' }}>
                          <X size={12} style={{ color:'#A8B3CF' }} />
                        </button>
                      </div>

                      {/* Steppers */}
                      <div className="p-3 space-y-3" style={{ background:'rgba(6,14,26,0.98)' }}>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { label:'Series',   field:'sets',      step:1,  min:1, max:20  },
                            { label:'Reps',     field:'reps',      isText:true             },
                            { label:'Descanso', field:'rest_time', step:15, min:0, max:300 },
                          ] as any[]).map(({ label, field, step, min, max, isText }) => (
                            <div key={field} className="rounded-xl p-2 flex flex-col items-center gap-1.5"
                              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                              <span className="text-[9px] uppercase font-black tracking-wider" style={{ color:'#4A5568' }}>{label}</span>
                              {isText ? (
                                <input type="text"
                                  className="w-full text-center font-black text-lg outline-none bg-transparent"
                                  style={{ color:'#00E5A8', caretColor:'#00E5A8' }}
                                  value={(exConfig as any)[field]}
                                  onChange={e => setExConfig(p => ({ ...p, [field]: e.target.value }))}
                                />
                              ) : (
                                <div className="flex items-center justify-between w-full">
                                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-lg font-black transition-all active:scale-90"
                                    style={{ background:'rgba(0,229,168,0.08)', color:'#00E5A8' }}
                                    onClick={() => setExConfig(p => ({ ...p, [field]: Math.max(min, Number((p as any)[field]) - step) }))}>−</button>
                                  <span className="font-black text-lg" style={{ color:'#00E5A8' }}>{(exConfig as any)[field]}</span>
                                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-lg font-black transition-all active:scale-90"
                                    style={{ background:'rgba(0,229,168,0.08)', color:'#00E5A8' }}
                                    onClick={() => setExConfig(p => ({ ...p, [field]: Math.min(max, Number((p as any)[field]) + step) }))}>+</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <button onClick={addExerciseToRoutine} disabled={addingEx}
                          className="w-full py-3.5 rounded-xl font-black uppercase text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                          style={{ background:'linear-gradient(135deg,#00E5A8 0%,#00C2FF 100%)', opacity: addingEx ? 0.6 : 1, boxShadow: addingEx ? 'none' : '0 4px 20px rgba(0,229,168,0.3)' }}>
                          {addingEx ? <Loader2 size={15} className="animate-spin"/> : <Plus size={15}/>}
                          {addingEx ? 'Añadiendo...' : 'Añadir a la rutina'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── LISTA DE EJERCICIOS ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#6B7895' }}>
              Ejercicios · {selectedRoutine.exercises.length}
            </p>
          </div>

          {selectedRoutine.exercises.length === 0 && (
            <div className="text-center py-12 rounded-[20px]" style={card}>
              <Dumbbell size={36} className="mx-auto mb-3 opacity-20" style={{ color:'#6B7895' }} />
              <p className="text-sm font-bold uppercase" style={{ color:'#6B7895' }}>Sin ejercicios</p>
              <p className="text-xs mt-1" style={{ color:'#6B7895' }}>Busca y añade ejercicios arriba</p>
            </div>
          )}

          {selectedRoutine.exercises.map((ex, idx) => (
            <div key={ex.id} className="rounded-[20px] overflow-hidden"
              style={{ ...card, animation:`fadeUp 0.3s ease-out ${idx * 0.04}s both` } as React.CSSProperties}>

              {/* Exercise header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center font-black text-sm"
                    style={{ background:'rgba(0,229,168,0.12)', color:'#00E5A8' }}>
                    {ex.gifUrl
                      ? <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
                      : idx + 1
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm text-white break-words">{ex.name}</p>
                    {ex.target && <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>{ex.target}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button onClick={() => moveExercise(idx, -1)} disabled={idx === 0}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', opacity: idx === 0 ? 0.25 : 1 }}>
                    <ChevronUp size={14} style={{ color:'#A8B3CF' }} />
                  </button>
                  <button onClick={() => moveExercise(idx, 1)} disabled={idx === selectedRoutine.exercises.length - 1}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', opacity: idx === selectedRoutine.exercises.length - 1 ? 0.25 : 1 }}>
                    <ChevronDown size={14} style={{ color:'#A8B3CF' }} />
                  </button>
                  <button onClick={() => deleteExercise(ex.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)' }}>
                    <Trash2 size={13} style={{ color:'#ef4444' }} />
                  </button>
                </div>
              </div>

              {/* Inline editable fields */}
              <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                {[
                  { label:'Series',   icon:<Hash size={10}/>,       field:'sets',      type:'number' },
                  { label:'Reps',     icon:<RotateCcw size={10}/>,  field:'reps',      type:'text'   },
                  { label:'Desc.(s)', icon:<Clock size={10}/>,      field:'rest_time', type:'number' },
                ].map(({ label, icon, field, type }) => (
                  <div key={field}>
                    <label style={{ ...lbl, marginBottom:4, display:'flex', alignItems:'center', gap:3 }}>{icon}{label}</label>
                    <input
                      type={type} inputMode={type === 'number' ? 'numeric' : 'text'}
                      className="text-center font-black text-base"
                      style={{ ...inp, padding:'10px 4px', color:'#fff', border:'1px solid rgba(255,255,255,0.1)' } as React.CSSProperties}
                      value={(ex as any)[field] ?? ''}
                      onChange={e => updateLocalEx(ex.id, field, type === 'number' ? Number(e.target.value) : e.target.value)}
                      onBlur={() => saveExercise(ex)}
                    />
                  </div>
                ))}
              </div>

              {/* Save hint */}
              <p className="text-center text-[9px] pb-2" style={{ color:'rgba(107,120,149,0.6)' }}>
                Se guarda automáticamente al salir del campo
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COACH OWN ROUTINE DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (isCoach && mainTab === 'miperfil' && ajustesTab === 'rutina' && myOwnSelectedRoutine) {
    return (
      <div className="space-y-4 pb-28">
        <style>{`@keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setMyOwnSelectedRoutine(null)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft size={18} style={{ color:'#A8B3CF' }} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color:'#6B7895' }}>Mi Rutina</p>
            <h2 className="text-lg font-black text-white break-words">{myOwnSelectedRoutine.name}</h2>
          </div>
          <button onClick={() => deleteMyOwnRoutine(myOwnSelectedRoutine.id)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95 shrink-0"
            style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={16} style={{ color:'#ef4444' }} />
          </button>
        </div>

        {/* Toasts */}
        {success && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.25)', color:'#00E5A8' }}>✓ {success}</div>}
        {error   && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444' }}>✕ {error}</div>}

        {/* Añadir ejercicio */}
        <div className="p-4 space-y-3 rounded-[20px]" style={{ background:'rgba(0,229,168,0.04)', border:'1px solid rgba(0,229,168,0.2)' }}>
          <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#00E5A8' }}>Añadir ejercicio</p>
          <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(10,18,32,0.8)', border:'1px solid rgba(0,229,168,0.18)' }}>
            <div className="flex" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {[{ id: false, icon: <Search size={12}/>, label:'Buscar' }, { id: true, icon: <Plus size={12}/>, label:'Crear' }].map(tab => (
                <button key={String(tab.id)} onClick={() => { setShowCreateEx(tab.id); setExSearch(''); setExResults([]); setSelectedEx(null) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-black uppercase tracking-wider transition-all"
                  style={{
                    color: showCreateEx === tab.id ? '#00E5A8' : '#6B7895',
                    borderBottom: showCreateEx === tab.id ? '2px solid #00E5A8' : '2px solid transparent',
                    background: showCreateEx === tab.id ? 'rgba(0,229,168,0.06)' : 'transparent',
                  }}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>
            <div className="p-3 space-y-3">
              {showCreateEx ? (
                <div className="space-y-2">
                  <input style={{ ...inp, fontSize:13 } as React.CSSProperties} placeholder="Nombre del ejercicio *"
                    value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && createCustomExercise()} />
                  <input style={{ ...inp, fontSize:13 } as React.CSSProperties} placeholder="Músculo / grupo"
                    value={newEx.target} onChange={e => setNewEx(p => ({ ...p, target: e.target.value }))} />
                  <button onClick={createCustomExercise} disabled={creatingEx || !newEx.name.trim()}
                    className="w-full py-3 rounded-xl font-black uppercase text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                    style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)' }}>
                    {creatingEx ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
                    {creatingEx ? 'Creando...' : 'Crear y seleccionar'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => setExSearch(' ')}
                    className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all active:scale-[0.98]"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    <Search size={15} style={{ color:'#4A5568' }} />
                    <span className="flex-1 text-left text-sm font-normal" style={{ color: selectedEx ? '#fff' : '#4A5568' }}>
                      {selectedEx ? selectedEx.name : 'Buscar ejercicio…'}
                    </span>
                    {selectedEx
                      ? <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(0,229,168,0.15)', color:'#00E5A8' }}>Seleccionado</span>
                      : <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background:'rgba(255,255,255,0.06)', color:'#4A5568' }}>Toca aquí</span>
                    }
                  </button>
                  {exSearch.length > 0 && (
                    <div className="fixed inset-0 z-[9999] flex flex-col justify-end"
                      style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)' }}
                      onClick={e => { if (e.target === e.currentTarget) { setExSearch(''); setExResults([]) } }}>
                      <div className="rounded-t-3xl flex flex-col overflow-hidden"
                        style={{ background:'#060e1a', border:'1px solid rgba(0,229,168,0.15)', borderBottom:'none', maxHeight:'85vh', boxShadow:'0 -20px 60px rgba(0,0,0,0.8)' }}>
                        <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }} /></div>
                        <div className="flex items-center justify-between px-4 pb-3 shrink-0">
                          <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#00E5A8' }}>Añadir ejercicio</p>
                          <button onClick={() => { setExSearch(''); setExResults([]) }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background:'rgba(255,255,255,0.08)' }}>
                            <X size={14} style={{ color:'#A8B3CF' }} />
                          </button>
                        </div>
                        <div className="px-4 pb-3 shrink-0">
                          <div className="flex items-center gap-3 rounded-2xl px-4" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(0,229,168,0.25)' }}>
                            <Search size={15} style={{ color:'#00E5A8', flexShrink:0 }} />
                            <input autoFocus className="flex-1 bg-transparent outline-none py-3.5 text-sm text-white font-bold placeholder:font-normal placeholder:text-slate-600"
                              style={{ caretColor:'#00E5A8' }} placeholder="bench press, squat, curl…"
                              value={exSearch} onChange={e => searchExercises(e.target.value)} />
                            {exSearch.trim() && (
                              <button onClick={() => { setExSearch(''); setExResults([]) }} className="w-6 h-6 flex items-center justify-center rounded-full" style={{ background:'rgba(255,255,255,0.1)' }}>
                                <X size={10} style={{ color:'#A8B3CF' }} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {exResults.length === 0 && exSearch.trim().length >= 2 && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                              <Loader2 size={28} className="animate-spin" style={{ color:'#1E3A5F' }} />
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ color:'#1E3A5F' }}>Buscando…</p>
                            </div>
                          )}
                          {exResults.map((ex: any, i: number) => (
                            <button key={ex.id ?? `ex-${i}`} onClick={() => pickExercise(ex)}
                              className="w-full text-left flex items-center transition-all active:scale-[0.98]"
                              style={{ borderBottom: i < exResults.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                              <div className="relative shrink-0 m-3">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
                                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>
                                  {ex.gifUrl ? <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
                                    : <span className="text-2xl font-black" style={{ color:'#1E3A5F' }}>{ex.name?.charAt(0).toUpperCase()}</span>}
                                </div>
                                {ex._fromApi && <span className="absolute -top-1 -right-1 text-[7px] font-black px-1.5 py-0.5 rounded-full" style={{ background:'#00C2FF', color:'#060e1a', lineHeight:'1.4' }}>API</span>}
                              </div>
                              <div className="flex-1 min-w-0 py-3 pr-2">
                                <p className="text-sm font-black text-white leading-tight">{ex.name}</p>
                                {ex.target && <span className="inline-block mt-1.5 text-[9px] uppercase font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(0,229,168,0.12)', color:'#00E5A8', border:'1px solid rgba(0,229,168,0.2)' }}>{ex.target}</span>}
                              </div>
                              <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl mr-3" style={{ background:'rgba(0,229,168,0.08)', border:'1px solid rgba(0,229,168,0.15)' }}>
                                <Plus size={14} style={{ color:'#00E5A8' }} />
                              </div>
                            </button>
                          ))}
                          <div className="h-6" />
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedEx && (
                    <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(0,229,168,0.2)' }}>
                      <div className="relative" style={{ height:130, background:'#060e1a' }}>
                        {selectedEx.gifUrl
                          ? <img src={selectedEx.gifUrl} alt={selectedEx.name} className="w-full h-full object-contain" loading="lazy" style={{ filter:'brightness(0.85)' }} />
                          : <div className="w-full h-full flex items-center justify-center"><Dumbbell size={36} style={{ color:'#1E3A5F' }} /></div>}
                        <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(6,14,26,1) 0%, rgba(6,14,26,0.4) 55%, transparent 100%)' }} />
                        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
                          <p className="font-black text-white text-sm leading-tight truncate">{selectedEx.name}</p>
                          {selectedEx.target && <span className="inline-block mt-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(0,229,168,0.2)', color:'#00E5A8', border:'1px solid rgba(0,229,168,0.3)' }}>{selectedEx.target}</span>}
                        </div>
                        <button onClick={() => { setSelectedEx(null); setExSearch('') }}
                          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-xl"
                          style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.1)' }}>
                          <X size={12} style={{ color:'#A8B3CF' }} />
                        </button>
                      </div>
                      <div className="p-3 space-y-3" style={{ background:'rgba(6,14,26,0.98)' }}>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { label:'Series',   field:'sets',      step:1,  min:1, max:20  },
                            { label:'Reps',     field:'reps',      isText:true             },
                            { label:'Descanso', field:'rest_time', step:15, min:0, max:300 },
                          ] as any[]).map(({ label, field, step, min, max, isText }) => (
                            <div key={field} className="rounded-xl p-2 flex flex-col items-center gap-1.5"
                              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                              <span className="text-[9px] uppercase font-black tracking-wider" style={{ color:'#4A5568' }}>{label}</span>
                              {isText ? (
                                <input type="text" className="w-full text-center font-black text-lg outline-none bg-transparent"
                                  style={{ color:'#00E5A8', caretColor:'#00E5A8' }}
                                  value={(exConfig as any)[field]} onChange={e => setExConfig(p => ({ ...p, [field]: e.target.value }))} />
                              ) : (
                                <div className="flex items-center justify-between w-full">
                                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-lg font-black transition-all active:scale-90"
                                    style={{ background:'rgba(0,229,168,0.08)', color:'#00E5A8' }}
                                    onClick={() => setExConfig(p => ({ ...p, [field]: Math.max(min, Number((p as any)[field]) - step) }))}>−</button>
                                  <span className="font-black text-lg" style={{ color:'#00E5A8' }}>{(exConfig as any)[field]}</span>
                                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-lg font-black transition-all active:scale-90"
                                    style={{ background:'rgba(0,229,168,0.08)', color:'#00E5A8' }}
                                    onClick={() => setExConfig(p => ({ ...p, [field]: Math.min(max, Number((p as any)[field]) + step) }))}>+</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <button onClick={addExerciseToMyOwnRoutine} disabled={addingEx}
                          className="w-full py-3.5 rounded-xl font-black uppercase text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                          style={{ background:'linear-gradient(135deg,#00E5A8 0%,#00C2FF 100%)', opacity: addingEx ? 0.6 : 1, boxShadow: addingEx ? 'none' : '0 4px 20px rgba(0,229,168,0.3)' }}>
                          {addingEx ? <Loader2 size={15} className="animate-spin"/> : <Plus size={15}/>}
                          {addingEx ? 'Añadiendo...' : 'Añadir a la rutina'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de ejercicios */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase font-black tracking-widest px-1" style={{ color:'#6B7895' }}>
            Ejercicios · {myOwnSelectedRoutine.exercises.length}
          </p>
          {myOwnSelectedRoutine.exercises.length === 0 && (
            <div className="text-center py-12 rounded-[20px]" style={card}>
              <Dumbbell size={36} className="mx-auto mb-3 opacity-20" style={{ color:'#6B7895' }} />
              <p className="text-sm font-bold uppercase" style={{ color:'#6B7895' }}>Sin ejercicios</p>
              <p className="text-xs mt-1" style={{ color:'#6B7895' }}>Busca y añade ejercicios arriba</p>
            </div>
          )}
          {myOwnSelectedRoutine.exercises.map((ex, idx) => (
            <div key={ex.id} className="rounded-[20px] overflow-hidden"
              style={{ ...card, animation:`fadeUp 0.3s ease-out ${idx * 0.04}s both` } as React.CSSProperties}>
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center font-black text-sm"
                    style={{ background:'rgba(0,229,168,0.12)', color:'#00E5A8' }}>
                    {ex.gifUrl ? <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" loading="lazy" /> : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm text-white break-words">{ex.name}</p>
                    {ex.target && <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>{ex.target}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button onClick={() => moveMyOwnExercise(idx, -1)} disabled={idx === 0}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', opacity: idx === 0 ? 0.25 : 1 }}>
                    <ChevronUp size={14} style={{ color:'#A8B3CF' }} />
                  </button>
                  <button onClick={() => moveMyOwnExercise(idx, 1)} disabled={idx === myOwnSelectedRoutine.exercises.length - 1}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', opacity: idx === myOwnSelectedRoutine.exercises.length - 1 ? 0.25 : 1 }}>
                    <ChevronDown size={14} style={{ color:'#A8B3CF' }} />
                  </button>
                  <button onClick={() => deleteMyOwnExercise(ex.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)' }}>
                    <Trash2 size={13} style={{ color:'#ef4444' }} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                {[
                  { label:'Series',   icon:<Hash size={10}/>,       field:'sets',      type:'number' },
                  { label:'Reps',     icon:<RotateCcw size={10}/>,  field:'reps',      type:'text'   },
                  { label:'Desc.(s)', icon:<Clock size={10}/>,      field:'rest_time', type:'number' },
                ].map(({ label, icon, field, type }) => (
                  <div key={field}>
                    <label style={{ ...lbl, marginBottom:4, display:'flex', alignItems:'center', gap:3 }}>{icon}{label}</label>
                    <input type={type} inputMode={type === 'number' ? 'numeric' : 'text'} className="text-center font-black text-base"
                      style={{ ...inp, padding:'10px 4px', color:'#fff', border:'1px solid rgba(255,255,255,0.1)' } as React.CSSProperties}
                      value={(ex as any)[field] ?? ''}
                      onChange={e => updateLocalMyOwnEx(ex.id, field, type === 'number' ? Number(e.target.value) : e.target.value)}
                      onBlur={() => saveMyOwnExercise(ex)} />
                  </div>
                ))}
              </div>
              <p className="text-center text-[9px] pb-2" style={{ color:'rgba(107,120,149,0.6)' }}>Se guarda automáticamente al salir del campo</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // USER DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (selectedUser) {
    // ── Vista simplificada para cuando admin selecciona un coach ──────────
    if (isAdmin && selectedUser.role === 'coach') {
      const coachUsers = users.filter(u => u.coach_id === selectedUser.id)
      const days = daysLeft(selectedUser.membership_end)
      const isExpired = days !== null && days <= 0
      const isWarning = days !== null && days > 0 && days <= 7
      const isActive  = days !== null && days > 7
      const statusColor  = isActive ? '#00E5A8' : isWarning ? '#F59E0B' : '#ef4444'
      const statusBg     = isActive ? 'rgba(0,229,168,0.08)' : isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'
      const statusBorder = isActive ? 'rgba(0,229,168,0.2)'  : isWarning ? 'rgba(245,158,11,0.2)'  : 'rgba(239,68,68,0.2)'

      return (
        <div className="space-y-5 pb-28">
          <style>{`@keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

          {/* Header */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedUser(null)}
              className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <ArrowLeft size={18} style={{ color:'#A8B3CF' }} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black uppercase text-white break-words">{selectedUser.full_name}</h1>
              <p className="text-[10px] uppercase font-bold" style={{ color:'#F59E0B' }}>Coach · {selectedUser.email || ''}</p>
            </div>
            <button onClick={() => deleteUser(selectedUser)}
              className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95 shrink-0"
              style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
              <UserX size={16} style={{ color:'#ef4444' }} />
            </button>
          </div>

          {success && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.25)', color:'#00E5A8' }}>✓ {success}</div>}
          {error   && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444' }}>✕ {error}</div>}

          {/* Membresía */}
          <div className="p-4 space-y-4 rounded-[20px]" style={{ background: statusBg, border: `1px solid ${statusBorder}` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown size={16} style={{ color: statusColor }} />
                <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: statusColor }}>Membresía</p>
              </div>
              <div className="px-3 py-1 rounded-xl text-[10px] font-black uppercase"
                style={{ background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor }}>
                {days === null ? 'Sin fecha' : isExpired ? 'Caducada' : isWarning ? `⚠ ${days}d restantes` : `✓ ${days}d restantes`}
              </div>
            </div>
            <div>
              <label style={lbl}>Plan</label>
              <div className="flex gap-2 flex-wrap">
                {['Básico','Premium','VIP','Élite'].map(p => (
                  <button key={p} type="button"
                    onClick={() => setMembership(prev => ({ ...prev, plan: p }))}
                    className="px-3 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                    style={membership.plan === p
                      ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                      : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Fecha de vencimiento</label>
              <input type="date" style={{ ...inp, colorScheme:'dark' } as React.CSSProperties}
                value={membership.membership_end}
                onChange={e => setMembership(p => ({ ...p, membership_end: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Extender acceso</label>
              <div className="grid grid-cols-4 gap-2">
                {[{ label:'+1m', months:1 },{ label:'+3m', months:3 },{ label:'+6m', months:6 },{ label:'+1a', months:12 }].map(({ label, months }) => (
                  <button key={label} type="button" onClick={() => extendMembership(months)}
                    className="py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#A8B3CF' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setMembership(p => ({ ...p, membership_end: new Date(Date.now() - 86400000).toISOString().split('T')[0] }))}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444' }}>
                Revocar acceso
              </button>
              <button type="button" onClick={saveMembership}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase text-white transition-all active:scale-95 flex items-center justify-center gap-1"
                style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow:'0 4px 16px rgba(0,229,168,0.3)' }}>
                <Save size={13} /> Guardar
              </button>
            </div>
          </div>

          {/* Usuarios del coach */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Users size={14} style={{ color:'#F59E0B' }} />
              <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#F59E0B' }}>
                Alumnos asignados ({coachUsers.length})
              </p>
            </div>
            {coachUsers.length === 0 ? (
              <div className="text-center py-8 rounded-[20px]" style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-bold uppercase" style={{ color:'#6B7895' }}>Sin alumnos asignados</p>
              </div>
            ) : (
              coachUsers.map((u, idx) => (
                <div key={u.id}
                  className="flex items-center gap-3 p-4 rounded-[20px]"
                  style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)', animation:`fadeUp 0.3s ease-out ${idx*0.05}s both` } as React.CSSProperties}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                    style={{ background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.2)', color:'#F59E0B' }}>
                    {(u.full_name||'?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-sm text-white truncate">{u.full_name}</p>
                    <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>
                      {u.gender} · {u.age} años · {u.weight}kg
                    </p>
                  </div>
                  {u.membership_end && (
                    <div className="text-right shrink-0">
                      <p className="text-[9px] uppercase font-black" style={{ color: daysLeft(u.membership_end) !== null && daysLeft(u.membership_end)! <= 0 ? '#ef4444' : '#00E5A8' }}>
                        {daysLeft(u.membership_end) !== null && daysLeft(u.membership_end)! <= 0 ? 'Caducada' : `${daysLeft(u.membership_end)}d`}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )
    }

    const TABS = [
      { key: 'profile',  label: 'Perfil'     },
      { key: 'progreso', label: 'Progreso'   },
      { key: 'nutrition',label: 'Nutrición'  },
      { key: 'routines', label: 'Rutinas'    },
      { key: 'notas',    label: 'Notas'      },
      { key: 'control',  label: 'Control'    },
      ...(isCoach ? [{ key: 'config', label: 'Configuración' }] : []),
    ] as const

    return (
      <div className="space-y-5 pb-28">
        <style>{`@keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedUser(null)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft size={18} style={{ color:'#A8B3CF' }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black uppercase text-white break-words">{selectedUser.full_name}</h1>
            <p className="text-[10px] uppercase font-bold" style={{ color: selectedUser.role === 'admin' ? '#00E5A8' : '#6B7895' }}>
              {selectedUser.role} · {selectedUser.email || ''}
            </p>
            {selectedUser.created_at && (
              <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color:'#6B7895' }}>
                <Calendar size={10} />
                Inscrito el {new Date(selectedUser.created_at).toLocaleDateString('es-ES', { day:'2-digit', month:'long', year:'numeric' })}
              </p>
            )}
          </div>
          <button onClick={() => deleteUser(selectedUser)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95 shrink-0"
            style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}
            title="Eliminar usuario">
            <UserX size={16} style={{ color:'#ef4444' }} />
          </button>
        </div>

        {/* Toasts */}
        {success && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.25)', color:'#00E5A8' }}>✓ {success}</div>}
        {error   && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444' }}>✕ {error}</div>}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key as any)}
              className="flex-shrink-0 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95"
              style={activeTab === key
                ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff', boxShadow:'0 4px 16px rgba(0,229,168,0.35)' }
                : { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', color:'#6B7895' }
              }>{label}</button>
          ))}
        </div>

        {/* ── TAB: PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Fecha de inscripción */}
            {selectedUser.created_at && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-[16px]"
                style={{ background:'rgba(124,92,255,0.08)', border:'1px solid rgba(124,92,255,0.2)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'rgba(124,92,255,0.15)' }}>
                  <Calendar size={15} style={{ color:'#7C5CFF' }} />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest" style={{ color:'#7C5CFF' }}>Fecha de inscripción</p>
                  <p className="text-sm font-black text-white">
                    {new Date(selectedUser.created_at).toLocaleDateString('es-ES', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
                  </p>
                  <p className="text-[10px]" style={{ color:'#6B7895' }}>
                    Hace {Math.floor((Date.now() - new Date(selectedUser.created_at).getTime()) / 86400000)} días
                  </p>
                </div>
              </div>
            )}
            {/* ── MEMBRESÍA (solo admin) ── */}
            {isAdmin && (() => {
              const days = daysLeft(membership.membership_end)
              const isExpired = days !== null && days <= 0
              const isWarning = days !== null && days > 0 && days <= 7
              const isActive  = days !== null && days > 7
              const statusColor = isActive ? '#00E5A8' : isWarning ? '#F59E0B' : '#ef4444'
              const statusBg    = isActive ? 'rgba(0,229,168,0.08)' : isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'
              const statusBorder= isActive ? 'rgba(0,229,168,0.2)'  : isWarning ? 'rgba(245,158,11,0.2)'  : 'rgba(239,68,68,0.2)'
              return (
                <div className="p-4 space-y-4 rounded-[20px]"
                  style={{ background: statusBg, border: `1px solid ${statusBorder}` }}>
                  {/* Status row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown size={16} style={{ color: statusColor }} />
                      <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: statusColor }}>Membresía</p>
                    </div>
                    <div className="px-3 py-1 rounded-xl text-[10px] font-black uppercase"
                      style={{ background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor }}>
                      {days === null ? 'Sin fecha' : isExpired ? 'Caducada' : isWarning ? `⚠ ${days}d restantes` : `✓ ${days}d restantes`}
                    </div>
                  </div>

                  {/* Plan selector */}
                  <div>
                    <label style={lbl}>Plan</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Básico','Premium','VIP','Élite'].map(p => (
                        <button key={p} type="button"
                          onClick={() => setMembership(prev => ({ ...prev, plan: p }))}
                          className="px-3 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                          style={membership.plan === p
                            ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                            : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fecha fin */}
                  <div>
                    <label style={lbl}>Fecha de vencimiento</label>
                    <input
                      type="date"
                      style={{ ...inp, colorScheme: 'dark' } as React.CSSProperties}
                      value={membership.membership_end}
                      onChange={e => setMembership(p => ({ ...p, membership_end: e.target.value }))}
                    />
                  </div>

                  {/* Botones rápidos */}
                  <div>
                    <label style={lbl}>Extender acceso</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[{ label:'+1m', months:1 },{ label:'+3m', months:3 },{ label:'+6m', months:6 },{ label:'+1a', months:12 }].map(({ label, months }) => (
                        <button key={label} type="button" onClick={() => extendMembership(months)}
                          className="py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#A8B3CF' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Revocar / Guardar */}
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setMembership(p => ({ ...p, membership_end: new Date(Date.now() - 86400000).toISOString().split('T')[0] }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                      style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444' }}>
                      Revocar acceso
                    </button>
                    <button type="button" onClick={saveMembership}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase text-white transition-all active:scale-95 flex items-center justify-center gap-1"
                      style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow:'0 4px 16px rgba(0,229,168,0.3)' }}>
                      <Save size={13} /> Guardar
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* ── WHATSAPP COACH ── */}
            {userCoachWA && (
              <a href={`https://wa.me/${userCoachWA}?text=${encodeURIComponent('Hola, quiero renovar mi membresía')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-[20px] transition-all active:scale-[0.98]"
                style={{ background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.25)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'rgba(37,211,102,0.15)' }}>
                  <span className="text-xl">📱</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#25D366' }}>WhatsApp Coach</p>
                  <p className="text-sm font-bold text-white">Contactar para renovar membresía</p>
                </div>
                <ChevronRight size={16} style={{ color:'#25D366' }} />
              </a>
            )}

            {/* ── ASIGNAR COACH (solo admin, solo para usuarios tipo user) ── */}
            {isAdmin && selectedUser.role === 'user' && (
              <div className="p-4 space-y-3 rounded-[20px]"
                style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)' }}>
                <div className="flex items-center gap-2">
                  <Users size={14} style={{ color:'#F59E0B' }} />
                  <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#F59E0B' }}>Coach asignado</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button type="button"
                    onClick={async () => {
                      await db.from('profiles').update({ coach_id: null }).eq('id', selectedUser.id)
                      setSelectedUser(prev => prev ? { ...prev, coach_id: undefined } : null)
                      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, coach_id: undefined } : u))
                      toast('Coach desasignado')
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                    style={!selectedUser.coach_id
                      ? { background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'#fff' }
                      : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                    Sin coach
                  </button>
                  {coaches.map(coach => (
                    <button key={coach.id} type="button"
                      onClick={async () => {
                        await db.from('profiles').update({ coach_id: coach.id }).eq('id', selectedUser.id)
                        setSelectedUser(prev => prev ? { ...prev, coach_id: coach.id } : null)
                        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, coach_id: coach.id } : u))
                        toast(`Asignado a ${coach.full_name}`)
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                      style={selectedUser.coach_id === coach.id
                        ? { background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'#fff' }
                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                      {coach.full_name}
                    </button>
                  ))}
                  {coaches.length === 0 && (
                    <p className="text-xs" style={{ color:'#6B7895' }}>No hay coaches creados aún</p>
                  )}
                </div>
              </div>
            )}

            <div className="p-5 space-y-4" style={card}>
              <div>
                <label style={lbl}>Nombre completo</label>
                <input style={inp} value={editProfile.full_name || ''} onChange={e => setEditProfile(p => ({...p, full_name: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Peso (kg)',    field:'weight',        type:'number' },
                  { label:'Altura (m)',   field:'height',        type:'number' },
                  { label:'Edad',         field:'age',           type:'number' },
                  { label:'Días entreno', field:'training_days', type:'number' },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label style={lbl}>{label}</label>
                    <input type={type} style={inp} value={(editProfile as any)[field] || ''}
                      onChange={e => setEditProfile(p => ({...p, [field]: e.target.value}))} />
                  </div>
                ))}
                <div>
                  <label style={lbl}>Género</label>
                  <select style={inp} value={editProfile.gender || ''} onChange={e => setEditProfile(p => ({...p, gender: e.target.value}))}>
                    <option value="Hombre">Hombre</option><option value="Mujer">Mujer</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Nivel</label>
                  <select style={inp} value={editProfile.experience_level || ''} onChange={e => setEditProfile(p => ({...p, experience_level: e.target.value}))}>
                    <option value="">—</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
                {isAdmin && (
                  <div>
                    <label style={lbl}>Rol</label>
                    <select style={inp} value={editProfile.role || 'user'} onChange={e => setEditProfile(p => ({...p, role: e.target.value}))}>
                      <option value="user">user</option>
                      <option value="coach">coach</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Áreas de enfoque</label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map(opt => {
                    const on = (editProfile.focus_areas || []).includes(opt)
                    return (
                      <button key={opt} type="button"
                        onClick={() => { const cur = editProfile.focus_areas||[]; setEditProfile(p => ({...p, focus_areas: cur.includes(opt)?cur.filter(f=>f!==opt):[...cur,opt]})) }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                        style={on ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                                  : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            {/* ── MEDIDAS CINEANTROPOMÉTRICAS ── */}
            <div className="p-5 space-y-5" style={card}>
              <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#00E5A8' }}>Medidas Cineantropométricas</p>

              {([
                { title: 'Diámetros (cm)', key: 'diameters', fields: ['humeral','radiocubital','femoral'] },
                { title: 'Pliegues (mm)',  key: 'skinfolds',  fields: ['biceps','triceps','subscapular','suprailiaco','abdominal','muslo','pierna','pectoral'] },
                { title: 'Perímetros (cm)',key: 'perimeters', fields: ['thorax','abdomen','cadera','bicepsR','bicepsC','muslo','pantorrilla'] },
              ] as const).map(({ title, key, fields }) => (
                <div key={key}>
                  <p className="text-[9px] uppercase font-black tracking-widest mb-3" style={{ color:'#6B7895', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:6 }}>{title}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {fields.map(f => (
                      <div key={f} className="flex items-center justify-between gap-2">
                        <span className="text-xs capitalize" style={{ color:'#A8B3CF' }}>{f}</span>
                        <input
                          type="number"
                          className="w-20 rounded-lg p-1.5 text-center text-xs font-bold text-white outline-none"
                          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
                          value={(editProfile.measurements as any)?.[key]?.[f] || ''}
                          onChange={e => setEditProfile(prev => ({
                            ...prev,
                            measurements: {
                              ...prev.measurements,
                              [key]: { ...(prev.measurements as any)?.[key], [f]: e.target.value }
                            }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={saveProfile} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 } as React.CSSProperties} className="transition-all active:scale-[0.97]">
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Perfil'}
            </button>

            {/* ── CREDENCIALES ── */}
            <div className="p-5 space-y-4 rounded-[20px]" style={{ background:'rgba(0,194,255,0.05)', border:'1px solid rgba(0,194,255,0.18)' }}>
              <div className="flex items-center gap-2">
                <KeyRound size={14} style={{ color:'#00C2FF' }} />
                <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#00C2FF' }}>Credenciales de acceso</p>
              </div>

              {/* Email */}
              <div>
                <label style={lbl}>Correo electrónico</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3 flex-1 rounded-xl px-4 py-3"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <Mail size={14} style={{ color:'#6B7895', flexShrink:0 }} />
                    <span className="text-sm font-bold text-white flex-1 truncate">{selectedUser.email || '—'}</span>
                  </div>
                  {selectedUser.email && (
                    <button
                      onClick={() => copyEmail(selectedUser.email!)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-90 shrink-0"
                      style={{ background: emailCopied ? 'rgba(0,229,168,0.15)' : 'rgba(255,255,255,0.05)', border: emailCopied ? '1px solid rgba(0,229,168,0.3)' : '1px solid rgba(255,255,255,0.08)' }}
                      title="Copiar email">
                      {emailCopied
                        ? <CheckCheck size={15} style={{ color:'#00E5A8' }} />
                        : <Copy size={15} style={{ color:'#6B7895' }} />
                      }
                    </button>
                  )}
                </div>
              </div>

              {/* Nueva contraseña */}
              <div>
                <label style={lbl}>Establecer nueva contraseña</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 rounded-xl px-4"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nueva contraseña (mín. 6 caracteres)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && changePassword()}
                      className="flex-1 bg-transparent outline-none py-3 text-sm font-bold text-white placeholder:font-normal placeholder:text-slate-600"
                    />
                    <button onClick={() => setShowPassword(p => !p)}
                      className="flex items-center justify-center w-7 h-7 shrink-0 transition-all active:scale-90">
                      {showPassword
                        ? <EyeOff size={14} style={{ color:'#6B7895' }} />
                        : <Eye size={14} style={{ color:'#6B7895' }} />
                      }
                    </button>
                  </div>
                  <button
                    onClick={changePassword}
                    disabled={changingPassword || newPassword.length < 6}
                    className="h-11 px-4 rounded-xl text-xs font-black uppercase text-white transition-all active:scale-95 disabled:opacity-40 flex items-center gap-2 shrink-0"
                    style={{ background:'linear-gradient(135deg,#00C2FF,#7C5CFF)', boxShadow:'0 4px 16px rgba(0,194,255,0.3)' }}>
                    {changingPassword ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
                    {changingPassword ? 'Guardando...' : 'Cambiar'}
                  </button>
                </div>
                <p className="text-[10px] mt-2" style={{ color:'#6B7895' }}>
                  El usuario deberá usar esta nueva contraseña en su próximo inicio de sesión.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: NUTRITION ── */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">

            {/* Selector de formato — solo admin */}
            {isAdmin && (
              <div style={card} className="p-4">
                <p className="text-[10px] uppercase font-black tracking-widest mb-3" style={{ color:'#6B7895' }}>Formato del Plan</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['select','days'] as const).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setNutritionFormat(fmt)}
                      className="py-3 px-3 rounded-2xl font-black text-xs uppercase tracking-wide transition-all active:scale-95"
                      style={nutritionFormat === fmt
                        ? { background:'rgba(0,229,168,0.15)', border:'1px solid #00E5A8', color:'#00E5A8' }
                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}
                    >
                      {fmt === 'select' ? '📋 Nutrición en Select' : '📅 Nutrición x Días'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Meta de agua */}
            <div style={card} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💧</span>
                  <label style={lbl} className="!mb-0">Meta de Agua (vasos/día)</label>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setWaterGoal(g => Math.max(1, g - 1))}
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>−</button>
                  <span className="w-8 text-center font-black text-white text-lg">{waterGoal}</span>
                  <button type="button" onClick={() => setWaterGoal(g => Math.min(20, g + 1))}
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>+</button>
                </div>
              </div>
            </div>

            {/* ── FORMATO: NUTRICIÓN EN SELECT ── */}
            {nutritionFormat === 'select' && meals.map((meal, i) => (
              <div key={i} style={card} className="overflow-hidden">
                <div className="px-5 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,229,168,0.05)' }}>
                  <h2 className="font-black uppercase text-sm" style={{ color:'#00E5A8' }}>{meal.name}</h2>
                </div>
                <div className="p-5 space-y-4">
                  {(['protein','carbs','fat'] as const).map(type => (
                    <div key={type}>
                      <label style={lbl}>{type==='protein'?'🥩 Proteína':type==='carbs'?'🌾 Carbohidrato':'🥑 Grasa'} — una por línea</label>
                      <textarea className="resize-none" style={{...inp, height:80, fontSize:13, lineHeight:'1.6'} as React.CSSProperties}
                        value={meal[type].join('\n')} onChange={e => updateMeal(i, type, e.target.value)} placeholder="Ej: Pollo (100g)" />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ── FORMATO: NUTRICIÓN X DÍAS ── */}
            {nutritionFormat === 'days' && (
              <div style={card} className="overflow-hidden">
                {/* Tabs de días */}
                <div className="flex overflow-x-auto scrollbar-hide" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  {DAY_NAMES.map((day, di) => (
                    <button key={day} type="button" onClick={() => setActiveDayIdx(di)}
                      className="flex-shrink-0 px-4 py-3 font-black text-xs uppercase tracking-wide transition-all"
                      style={activeDayIdx === di
                        ? { borderBottom:'2px solid #00E5A8', color:'#00E5A8', background:'rgba(0,229,168,0.05)' }
                        : { borderBottom:'2px solid transparent', color:'#6B7895' }}>
                      {day.slice(0,3)}
                    </button>
                  ))}
                </div>
                {/* Comidas del día activo */}
                <div className="p-4 space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color:'#00E5A8' }}>
                    {DAY_NAMES[activeDayIdx]}
                  </p>
                  {daysMeals[activeDayIdx]?.meals.map((meal, mi) => (
                    <div key={mi} className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.06)' }}>
                      <div className="px-4 py-2.5" style={{ background:'rgba(255,255,255,0.03)' }}>
                        <p className="font-black text-xs uppercase" style={{ color:'#A8B3CF' }}>{meal.name}</p>
                      </div>
                      <div className="p-4 space-y-3">
                        {(['protein','carbs','fat'] as const).map(type => (
                          <div key={type}>
                            <label style={lbl}>{type==='protein'?'🥩 Proteína':type==='carbs'?'🌾 Carbohidrato':'🥑 Grasa'} — una por línea</label>
                            <textarea className="resize-none" style={{...inp, height:70, fontSize:12, lineHeight:'1.6'} as React.CSSProperties}
                              value={meal[type].join('\n')}
                              onChange={e => updateDayMeal(activeDayIdx, mi, type, e.target.value)}
                              placeholder="Ej: Pollo (100g)" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggle Ensaladas */}
            <div style={card} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥗</span>
                  <div>
                    <p className="font-black text-sm text-white">Ensaladas Recomendadas</p>
                    <p className="text-[10px] font-bold" style={{ color:'#6B7895' }}>Incluir sección en el plan del usuario</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIncludeSalads(v => !v)}
                  className="w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0"
                  style={{ background: includeSalads ? '#00E5A8' : 'rgba(255,255,255,0.1)' }}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 shadow"
                    style={{ left: includeSalads ? '26px' : '2px' }} />
                </button>
              </div>
            </div>

            <button onClick={saveNutrition} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 } as React.CSSProperties} className="transition-all active:scale-[0.97]">
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Nutrición'}
            </button>
          </div>
        )}

        {/* ── TAB: ROUTINES ── */}
        {activeTab === 'routines' && (
          <div className="space-y-4">
            {/* Crear nueva rutina */}
            <div className="p-4 rounded-[20px]" style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] uppercase font-black tracking-widest mb-3" style={{ color:'#6B7895' }}>Nueva rutina</p>
              <div className="flex gap-2">
                <input
                  style={{ ...inp, flex:1 } as React.CSSProperties}
                  placeholder="Ej: Día 1 — Pecho y Espalda"
                  value={newRoutineName}
                  onChange={e => setNewRoutineName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createRoutine()}
                />
                <button onClick={createRoutine}
                  className="px-4 rounded-xl font-black text-white transition-all active:scale-95 shrink-0 flex items-center gap-1"
                  style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow:'0 4px 16px rgba(0,229,168,0.3)' }}>
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Lista de rutinas */}
            {routines.length === 0 ? (
              <div className="text-center py-12 rounded-[20px]" style={card}>
                <Dumbbell size={36} className="mx-auto mb-3 opacity-20" style={{ color:'#6B7895' }} />
                <p className="text-sm font-bold uppercase" style={{ color:'#6B7895' }}>Sin rutinas asignadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black tracking-widest px-1" style={{ color:'#6B7895' }}>
                  Rutinas · {routines.length}
                </p>
                {routines.map((routine, idx) => (
                  <button key={routine.id} onClick={() => openRoutine(routine)}
                    className="w-full flex items-center justify-between gap-3 p-4 rounded-[20px] text-left transition-all active:scale-[0.98]"
                    style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.06)', animation:`fadeUp 0.3s ease-out ${idx*0.05}s both` } as React.CSSProperties}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.2)' }}>
                        <Dumbbell size={16} style={{ color:'#00E5A8' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-white break-words">{routine.name}</p>
                        <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>
                          {routine.exercises?.length || 0} ejercicios · Toca para gestionar
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color:'#6B7895', flexShrink:0 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: PROGRESO ── */}
        {activeTab === 'progreso' && (() => {
          const wH  = clientBodyStats.filter(e => e.weight > 0).map((e: any) => ({ date: e.date, value: +e.weight }))
          const fH  = clientBodyStats.filter(e => e.measurements?.results?.fatPercentage > 0).map((e: any) => ({ date: e.date, value: +(+e.measurements.results.fatPercentage).toFixed(1) }))
          const mH  = clientBodyStats.filter(e => e.measurements?.results?.muscleMass > 0).map((e: any) => ({ date: e.date, value: +(+e.measurements.results.muscleMass).toFixed(1) }))
          const bH  = clientBodyStats.filter(e => e.measurements?.results?.bmi > 0).map((e: any) => ({ date: e.date, value: +(+e.measurements.results.bmi).toFixed(2) }))
          const first = clientBodyStats[0]
          const latest = clientBodyStats[clientBodyStats.length - 1]
          const diffVal = (a: any, b: any) => { const d = +(a - b).toFixed(1); return d > 0 ? `+${d}` : `${d}` }
          return (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="p-5 space-y-4 rounded-[20px]" style={card}>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#a78bfa' }}>📊 Análisis de Progreso</p>
                  <span className="text-[9px] font-black px-2 py-1 rounded-lg" style={{ background:'rgba(167,139,250,0.12)', color:'#a78bfa' }}>
                    {clientBodyStats.length} mediciones
                  </span>
                </div>

                {clientBodyStats.length === 0 && (
                  <p className="text-[11px] text-center py-4" style={{ color:'#6B7895' }}>
                    Aún no hay medidas registradas.<br/>Guarda el perfil del cliente en la pestaña <span style={{ color:'#00E5A8' }}>Perfil</span> para iniciar el historial.
                  </p>
                )}

                {clientBodyStats.length >= 1 && latest && (
                  <>
                    {/* Métricas actuales */}
                    <div>
                      <p className="text-[9px] uppercase font-bold mb-2" style={{ color:'#6B7895' }}>Última medición · {new Date(latest.date).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label:'Peso',       val: latest.weight ? `${latest.weight} kg` : '—',                                           color:'#60a5fa' },
                          { label:'% Grasa',    val: latest.measurements?.results?.fatPercentage ? `${parseFloat(latest.measurements.results.fatPercentage).toFixed(1)}%` : '—', color:'#f87171' },
                          { label:'Masa Magra', val: latest.measurements?.results?.muscleMass    ? `${parseFloat(latest.measurements.results.muscleMass).toFixed(1)} kg`  : '—', color:'#00E5A8' },
                          { label:'IMC',        val: latest.measurements?.results?.bmi           ? `${parseFloat(latest.measurements.results.bmi).toFixed(2)}`            : '—', color:'#a78bfa' },
                        ].map(({ label, val, color }) => (
                          <div key={label} className="p-3 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-[8px] uppercase font-bold mb-1" style={{ color:'#6B7895' }}>{label}</p>
                            <p className="text-base font-black" style={{ color }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progreso total si hay 2+ registros */}
                    {clientBodyStats.length >= 2 && first && (
                      <div>
                        <p className="text-[9px] uppercase font-bold mb-2" style={{ color:'#6B7895' }}>Desde el inicio · {new Date(first.date).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label:'Peso',    a: latest.weight, b: first.weight, unit:'kg', invertGood: false },
                            { label:'% Grasa', a: parseFloat(latest.measurements?.results?.fatPercentage||'0'), b: parseFloat(first.measurements?.results?.fatPercentage||'0'), unit:'%', invertGood: true },
                            { label:'Magra',   a: parseFloat(latest.measurements?.results?.muscleMass||'0'),    b: parseFloat(first.measurements?.results?.muscleMass||'0'),    unit:'kg', invertGood: false },
                          ].map(({ label, a, b, unit, invertGood }) => {
                            if (!a || !b) return (
                              <div key={label} className="p-3 rounded-2xl text-center" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-[8px] uppercase font-bold mb-1" style={{ color:'#6B7895' }}>{label}</p>
                                <p className="text-sm font-black" style={{ color:'#6B7895' }}>—</p>
                              </div>
                            )
                            const change = diffVal(a, b)
                            const isPos = change.startsWith('+')
                            const isGood = invertGood ? !isPos : isPos
                            return (
                              <div key={label} className="p-3 rounded-2xl text-center" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-[8px] uppercase font-bold mb-1" style={{ color:'#6B7895' }}>{label}</p>
                                <p className="text-sm font-black" style={{ color: isGood ? '#00E5A8' : '#f87171' }}>{change}{unit}</p>
                                <p className="text-[8px]" style={{ color: isGood ? '#00E5A8' : '#f87171' }}>{isGood ? '↑ mejora' : '↓ revisar'}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sparklines */}
                    <div className="space-y-4 pt-1">
                      {wH.length >= 2 && <AdminSparkLine data={wH}  color="#60a5fa" unit="kg" label="Evolución del Peso" />}
                      {fH.length >= 2 && <AdminSparkLine data={fH}  color="#f87171" unit="%" label="Evolución % Grasa" invertGood />}
                      {mH.length >= 2 && <AdminSparkLine data={mH}  color="#00E5A8" unit="kg" label="Evolución Masa Magra" />}
                      {bH.length >= 2 && <AdminSparkLine data={bH}  color="#a78bfa" unit=""  label="Evolución IMC" invertGood />}
                    </div>
                  </>
                )}
              </div>

              {/* Historial de mediciones */}
              {clientBodyStats.length > 0 && (
                <div className="p-5 space-y-3 rounded-[20px]" style={card}>
                  <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#00E5A8' }}>📋 Historial de Mediciones</p>
                  <div className="space-y-2">
                    {[...clientBodyStats].reverse().map((entry: any, i: number) => (
                      <div key={entry.id || i} className="p-3 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-black text-white">{new Date(entry.date).toLocaleDateString('es-ES', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}</p>
                          {i === 0 && <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(0,229,168,0.15)', color:'#00E5A8' }}>Última</span>}
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { label:'Peso', val: entry.weight ? `${entry.weight}kg` : '—', color:'#60a5fa' },
                            { label:'Grasa', val: entry.measurements?.results?.fatPercentage ? `${parseFloat(entry.measurements.results.fatPercentage).toFixed(1)}%` : '—', color:'#f87171' },
                            { label:'Magra', val: entry.measurements?.results?.muscleMass ? `${parseFloat(entry.measurements.results.muscleMass).toFixed(1)}kg` : '—', color:'#00E5A8' },
                            { label:'IMC', val: entry.measurements?.results?.bmi ? `${parseFloat(entry.measurements.results.bmi).toFixed(1)}` : '—', color:'#a78bfa' },
                          ].map(({ label, val, color }) => (
                            <div key={label} className="text-center">
                              <p className="text-[7px] uppercase font-bold" style={{ color:'#6B7895' }}>{label}</p>
                              <p className="text-[10px] font-black" style={{ color }}>{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* ── TAB: NOTAS ── */}
        {activeTab === 'notas' && (
          <div className="space-y-4">
            <div className="p-5 space-y-4" style={card}>
              <div>
                <label style={lbl}>Estilo de dieta</label>
                <input style={inp} value={editProfile.diet_style || ''} onChange={e => setEditProfile(p => ({...p, diet_style: e.target.value}))} />
              </div>
              <div>
                <label style={lbl}>Notas / Lesiones</label>
                <textarea className="resize-none" style={{...inp, height:120} as React.CSSProperties}
                  value={editProfile.injuries || ''} onChange={e => setEditProfile(p => ({...p, injuries: e.target.value}))} />
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} style={{ ...btnPrimary, opacity: saving?0.6:1 } as React.CSSProperties} className="transition-all active:scale-[0.97]">
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Notas'}
            </button>
          </div>
        )}

        {/* ── TAB: CONTROL ── */}
        {activeTab === 'control' && (() => {
          const trainedDates = new Set(userWorkoutLogs.map(l => new Date(l.created_at).toDateString()))
          const year  = controlMonth.getFullYear()
          const month = controlMonth.getMonth()
          const firstDay = new Date(year, month, 1).getDay() // 0=Sun
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          const startOffset = (firstDay + 6) % 7 // start week on Monday
          const cells = startOffset + daysInMonth
          const totalRows = Math.ceil(cells / 7)

          const totalTrainings = userWorkoutLogs.length
          const now = new Date()
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const thisMonthCount = userWorkoutLogs.filter(l => new Date(l.created_at) >= startOfMonth).length
          const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
          const thisWeekCount = userWorkoutLogs.filter(l => new Date(l.created_at) >= startOfWeek).length

          const monthName = controlMonth.toLocaleDateString('es-ES', { month:'long', year:'numeric' })

          return (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:'Esta semana', value: thisWeekCount, icon:'💪' },
                  { label:'Este mes',    value: thisMonthCount, icon:'📅' },
                  { label:'Total',       value: totalTrainings, icon:'🏆' },
                ].map(s => (
                  <div key={s.label} style={card} className="p-3 text-center">
                    <p className="text-xl mb-1">{s.icon}</p>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color:'#6B7895' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Calendario */}
              <div style={card} className="overflow-hidden">
                {/* Cabecera mes */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <button type="button"
                    onClick={() => setControlMonth(new Date(year, month - 1, 1))}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.06)' }}>
                    <ChevronUp size={14} style={{ color:'#A8B3CF', transform:'rotate(-90deg)' }} />
                  </button>
                  <p className="font-black text-sm uppercase tracking-wider text-white capitalize">{monthName}</p>
                  <button type="button"
                    onClick={() => setControlMonth(new Date(year, month + 1, 1))}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.06)' }}>
                    <ChevronDown size={14} style={{ color:'#A8B3CF', transform:'rotate(-90deg)' }} />
                  </button>
                </div>

                {/* Días de semana */}
                <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                  {['L','M','X','J','V','S','D'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black uppercase" style={{ color:'#6B7895' }}>{d}</div>
                  ))}
                </div>

                {/* Celdas */}
                <div className="grid grid-cols-7 gap-1 px-3 pb-4">
                  {Array.from({ length: totalRows * 7 }).map((_, idx) => {
                    const dayNum = idx - startOffset + 1
                    if (dayNum < 1 || dayNum > daysInMonth) return <div key={idx} />
                    const dateObj = new Date(year, month, dayNum)
                    const trained = trainedDates.has(dateObj.toDateString())
                    const isToday = dateObj.toDateString() === new Date().toDateString()
                    return (
                      <div key={idx} className="aspect-square flex items-center justify-center rounded-xl relative"
                        style={trained
                          ? { background:'rgba(0,229,168,0.18)', border:'1px solid rgba(0,229,168,0.4)' }
                          : isToday
                          ? { border:'1px solid rgba(255,255,255,0.15)' }
                          : {}}>
                        <span className="text-xs font-bold" style={{ color: trained ? '#00E5A8' : isToday ? '#fff' : '#4A5568' }}>{dayNum}</span>
                        {trained && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />}
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )
        })()}

        {/* ── TAB: CONFIGURACIÓN (solo coach) ── */}
        {activeTab === 'config' && isCoach && (
          <div className="space-y-5">

            {(() => {
              const days = daysLeft(membership.membership_end)
              const isExpired = days !== null && days <= 0
              const isWarning = days !== null && days > 0 && days <= 7
              const isActive  = days !== null && days > 7
              const statusColor = isActive ? '#00E5A8' : isWarning ? '#F59E0B' : '#ef4444'
              const statusBg    = isActive ? 'rgba(0,229,168,0.08)' : isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'
              const statusBorder= isActive ? 'rgba(0,229,168,0.2)'  : isWarning ? 'rgba(245,158,11,0.2)'  : 'rgba(239,68,68,0.2)'
              return (
                <div className="p-4 space-y-4 rounded-[20px]"
                  style={{ background: statusBg, border: `1px solid ${statusBorder}` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown size={16} style={{ color: statusColor }} />
                      <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: statusColor }}>Membresía</p>
                    </div>
                    <div className="px-3 py-1 rounded-xl text-[10px] font-black uppercase"
                      style={{ background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor }}>
                      {days === null ? 'Sin fecha' : isExpired ? 'Caducada' : isWarning ? `⚠ ${days}d restantes` : `✓ ${days}d restantes`}
                    </div>
                  </div>

                  <div>
                    <label style={lbl}>Plan</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Básico','Premium','VIP','Élite'].map(p => (
                        <button key={p} type="button"
                          onClick={() => setMembership(prev => ({ ...prev, plan: p }))}
                          className="px-3 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                          style={membership.plan === p
                            ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                            : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={lbl}>Fecha de vencimiento</label>
                    <input type="date"
                      style={{ ...inp, colorScheme: 'dark' } as React.CSSProperties}
                      value={membership.membership_end}
                      onChange={e => setMembership(p => ({ ...p, membership_end: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label style={lbl}>Extender acceso</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[{ label:'+1m', months:1 },{ label:'+3m', months:3 },{ label:'+6m', months:6 },{ label:'+1a', months:12 }].map(({ label, months }) => (
                        <button key={label} type="button" onClick={() => extendMembership(months)}
                          className="py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#A8B3CF' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setMembership(p => ({ ...p, membership_end: new Date(Date.now() - 86400000).toISOString().split('T')[0] }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                      style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444' }}>
                      Revocar acceso
                    </button>
                    <button type="button" onClick={saveMembership}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase text-white transition-all active:scale-95 flex items-center justify-center gap-1"
                      style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow:'0 4px 16px rgba(0,229,168,0.3)' }}>
                      <Save size={13} /> Guardar
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* ── MI NUTRICIÓN COACH ── */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase font-black tracking-widest px-1" style={{ color:'#00E5A8' }}>
                Mi Nutrición — {coachNutritionPref === 'select' ? '📋 En Select' : '📅 Por Días'}
              </p>

              {/* Meta de agua */}
              <div style={card} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💧</span>
                    <label style={lbl} className="!mb-0">Meta de Agua (vasos/día)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setMyWaterGoal(g => Math.max(1, g - 1))}
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white transition-all active:scale-95"
                      style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>−</button>
                    <span className="w-8 text-center font-black text-white text-lg">{myWaterGoal}</span>
                    <button type="button" onClick={() => setMyWaterGoal(g => Math.min(20, g + 1))}
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white transition-all active:scale-95"
                      style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>+</button>
                  </div>
                </div>
              </div>

              {/* Formato select */}
              {coachNutritionPref === 'select' && myMeals.map((meal, i) => (
                <div key={i} style={card} className="overflow-hidden">
                  <div className="px-5 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,229,168,0.05)' }}>
                    <h2 className="font-black uppercase text-sm" style={{ color:'#00E5A8' }}>{meal.name}</h2>
                  </div>
                  <div className="p-5 space-y-4">
                    {(['protein','carbs','fat'] as const).map(type => (
                      <div key={type}>
                        <label style={lbl}>{type==='protein'?'🥩 Proteína':type==='carbs'?'🌾 Carbohidrato':'🥑 Grasa'} — una por línea</label>
                        <textarea className="resize-none" style={{...inp, height:80, fontSize:13, lineHeight:'1.6'} as React.CSSProperties}
                          value={meal[type].join('\n')} onChange={e => updateMyMeal(i, type, e.target.value)} placeholder="Ej: Pollo (100g)" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Formato días */}
              {coachNutritionPref === 'days' && (
                <div style={card} className="overflow-hidden">
                  <div className="flex overflow-x-auto scrollbar-hide" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    {DAY_NAMES.map((day, di) => (
                      <button key={day} type="button" onClick={() => setMyActiveDayIdx(di)}
                        className="flex-shrink-0 px-4 py-3 font-black text-xs uppercase tracking-wide transition-all"
                        style={myActiveDayIdx === di
                          ? { borderBottom:'2px solid #00E5A8', color:'#00E5A8', background:'rgba(0,229,168,0.05)' }
                          : { borderBottom:'2px solid transparent', color:'#6B7895' }}>
                        {day.slice(0,3)}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color:'#00E5A8' }}>{DAY_NAMES[myActiveDayIdx]}</p>
                    {myDaysMeals[myActiveDayIdx]?.meals.map((meal, mi) => (
                      <div key={mi} className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div className="px-4 py-2.5" style={{ background:'rgba(255,255,255,0.03)' }}>
                          <p className="font-black text-xs uppercase" style={{ color:'#A8B3CF' }}>{meal.name}</p>
                        </div>
                        <div className="p-4 space-y-3">
                          {(['protein','carbs','fat'] as const).map(type => (
                            <div key={type}>
                              <label style={lbl}>{type==='protein'?'🥩 Proteína':type==='carbs'?'🌾 Carbohidrato':'🥑 Grasa'} — una por línea</label>
                              <textarea className="resize-none" style={{...inp, height:70, fontSize:12, lineHeight:'1.6'} as React.CSSProperties}
                                value={meal[type].join('\n')}
                                onChange={e => updateMyDayMeal(myActiveDayIdx, mi, type, e.target.value)}
                                placeholder="Ej: Pollo (100g)" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle Ensaladas */}
              <div style={card} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥗</span>
                    <div>
                      <p className="font-black text-sm text-white">Ensaladas Recomendadas</p>
                      <p className="text-[10px] font-bold" style={{ color:'#6B7895' }}>Incluir sección en mi plan</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setMyIncludeSalads(v => !v)}
                    className="w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0"
                    style={{ background: myIncludeSalads ? '#00E5A8' : 'rgba(255,255,255,0.1)' }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 shadow"
                      style={{ left: myIncludeSalads ? '26px' : '2px' }} />
                  </button>
                </div>
              </div>

              <button onClick={saveMyNutrition} disabled={savingMyNutrition}
                style={{ ...btnPrimary, opacity: savingMyNutrition ? 0.6 : 1 } as React.CSSProperties}
                className="transition-all active:scale-[0.97]">
                <Save size={16} /> {savingMyNutrition ? 'Guardando...' : 'Guardar Mi Nutrición'}
              </button>
            </div>

          </div>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // USER LIST
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5 pb-28">
      <style>{`@keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color:'#6B7895' }}>Panel</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">{isCoach ? 'Mis Alumnos' : 'Administración'}</h1>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: isCoach ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : 'linear-gradient(135deg,#7C5CFF,#00C2FF)', boxShadow: isCoach ? '0 4px 20px rgba(245,158,11,0.35)' : '0 4px 20px rgba(124,92,255,0.35)' }}>
          {isCoach ? <Users size={22} className="text-white" /> : <Shield size={22} className="text-white" />}
        </div>
      </div>

      {/* Toasts */}
      {success && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.25)', color:'#00E5A8' }}>✓ {success}</div>}
      {error   && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444' }}>✕ {error}</div>}

      {/* Tab switcher (solo coach) */}
      {isCoach && (
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'alumnos',  label: 'Mis Alumnos' },
            { key: 'miperfil', label: 'Mi Perfil'   },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setMainTab(key)}
              className="py-2.5 rounded-2xl text-xs font-black uppercase tracking-wide transition-all active:scale-95"
              style={mainTab === key
                ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff', boxShadow:'0 4px 16px rgba(0,229,168,0.35)' }
                : { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', color:'#6B7895' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── CONTENIDO: MIS ALUMNOS ── */}
      {(!isCoach || mainTab === 'alumnos') && (
        <>
          {/* Stats + Crear */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-[20px] flex items-center gap-3" style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 10px 30px rgba(0,0,0,0.4)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(124,92,255,0.15)' }}>
                <Users size={18} style={{ color:'#7C5CFF' }} />
              </div>
              <div>
                <p className="text-2xl font-black text-white leading-none">{users.length}</p>
                <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>{isCoach ? 'Alumnos' : 'Usuarios'}</p>
              </div>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="p-4 rounded-[20px] flex items-center gap-3 transition-all active:scale-[0.97]"
              style={{ background:'linear-gradient(135deg,rgba(0,229,168,0.15),rgba(0,194,255,0.1))', border:'1px solid rgba(0,229,168,0.25)', boxShadow:'0 10px 30px rgba(0,0,0,0.3)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(0,229,168,0.15)' }}>
                <UserPlus size={18} style={{ color:'#00E5A8' }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-white leading-none">Crear</p>
                <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#00E5A8' }}>Nuevo usuario</p>
              </div>
            </button>
          </div>

          {/* Coach branding (solo admin) */}
          {isAdmin && (
            <div className="p-4 rounded-[20px] space-y-3" style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 10px 30px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#6B7895' }}>Mi Marca</p>
                  <p className="text-sm font-bold text-white">Logo como marca de agua</p>
                </div>
                {coachLogo && (
                  <button onClick={removeLogo} className="p-2 rounded-xl transition-all active:scale-95" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
                    <X size={14} style={{ color:'#ef4444' }} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden shrink-0"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  {coachLogo ? <img src={coachLogo} alt="Logo" className="w-full h-full object-contain p-1" /> : <Image size={28} style={{ color:'#6B7895' }} />}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs" style={{ color:'#6B7895' }}>Aparecerá como marca de agua en el inicio de tus alumnos. Usa PNG con fondo transparente para mejor resultado.</p>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }} />
                  <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95 disabled:opacity-50"
                    style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }}>
                    <Upload size={13} />
                    {logoUploading ? 'Subiendo...' : coachLogo ? 'Cambiar logo' : 'Subir logo'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Role filter (admin only) */}
          {isAdmin && (
            <div className="flex gap-2 flex-wrap">
              {([
                { key: 'all',   label: 'Todos' },
                { key: 'mine',  label: 'Mis Alumnos' },
                { key: 'user',  label: 'Usuarios' },
                { key: 'coach', label: 'Coaches' },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setRoleFilter(f.key)}
                  className="flex-1 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.97]"
                  style={roleFilter === f.key
                    ? f.key === 'mine'
                      ? { background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'#fff', boxShadow:'0 4px 14px rgba(245,158,11,0.35)' }
                      : { background:'linear-gradient(135deg,#7C5CFF,#00C2FF)', color:'#fff', boxShadow:'0 4px 14px rgba(124,92,255,0.35)' }
                    : { background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.07)', color:'#6B7895' }}>
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* User list */}
          <div className="space-y-3">
            {users.filter(u => {
              if (roleFilter === 'all') return true
              if (roleFilter === 'mine') return u.coach_id === currentUserId
              return u.role === roleFilter
            }).map((user, idx) => (
              <button key={user.id} onClick={() => selectUser(user)}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-[20px] text-left transition-all active:scale-[0.98]"
                style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 10px 30px rgba(0,0,0,0.3)', animation:`fadeUp 0.4s ease-out ${idx*0.05}s both` } as React.CSSProperties}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
                    style={user.role==='admin'
                      ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                      : { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                    {(user.full_name||'?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm text-white truncate">{user.full_name}</p>
                    <p className="text-[10px] uppercase font-bold mt-0.5 truncate" style={{ color:'#6B7895' }}>
                      {user.gender} · {user.age} años · {user.weight}kg
                      {' · '}<span style={{ color: user.role==='admin'?'#00E5A8':'#6B7895' }}>{user.role}</span>
                    </p>
                    {user.created_at && (
                      <p className="text-[9px] mt-0.5 flex items-center gap-1" style={{ color:'rgba(107,120,149,0.7)' }}>
                        <Calendar size={9} />
                        {new Date(user.created_at).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' })}
                      </p>
                    )}
                    {isAdmin && user.coach_id && (
                      <p className="text-[9px] mt-0.5 font-bold" style={{ color:'#F59E0B' }}>
                        Coach: {coaches.find(c => c.id === user.coach_id)?.full_name || '—'}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color:'#6B7895', flexShrink:0 }} />
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── CONTENIDO: MI PERFIL (solo coach) ── */}
      {isCoach && mainTab === 'miperfil' && (
        <div className="space-y-4">

          {/* ── AJUSTES PERSONALES ── */}
          <div style={card} className="overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#00E5A8' }}>Ajustes Personales</p>
            </div>

            {/* Sub-tabs */}
            <div className="flex overflow-x-auto scrollbar-hide" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {([
                { key:'datos',         label:'Datos',     icon:'👤' },
                { key:'antropometria', label:'Medidas',   icon:'📏' },
                { key:'nutricion',     label:'Nutrición', icon:'🥗' },
                { key:'rutina',        label:'Rutina',    icon:'💪' },
              ] as const).map(({ key, label, icon }) => (
                <button key={key} onClick={() => setAjustesTab(key)}
                  className="flex-shrink-0 px-4 py-3 font-black text-xs uppercase tracking-wide transition-all flex items-center gap-1.5"
                  style={ajustesTab === key
                    ? { borderBottom:'2px solid #00E5A8', color:'#00E5A8', background:'rgba(0,229,168,0.05)' }
                    : { borderBottom:'2px solid transparent', color:'#6B7895' }}>
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">

              {/* ── DATOS ── */}
              {ajustesTab === 'datos' && (
                <>
                  <div>
                    <label style={lbl}>Nombre completo</label>
                    <input style={inp} value={myProfile.full_name || ''} onChange={e => setMyProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="Tu nombre completo" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { label:'Peso (kg)',    field:'weight',        type:'number' },
                      { label:'Altura (m)',   field:'height',        type:'number' },
                      { label:'Edad',         field:'age',           type:'number' },
                      { label:'Días entreno', field:'training_days', type:'number' },
                    ] as const).map(({ label, field, type }) => (
                      <div key={field}>
                        <label style={lbl}>{label}</label>
                        <input type={type} style={inp} value={(myProfile as any)[field] || ''}
                          onChange={e => setMyProfile(p => ({ ...p, [field]: e.target.value }))} />
                      </div>
                    ))}
                    <div>
                      <label style={lbl}>Género</label>
                      <select style={inp} value={myProfile.gender || ''} onChange={e => setMyProfile(p => ({ ...p, gender: e.target.value }))}>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Nivel</label>
                      <select style={inp} value={myProfile.experience_level || ''} onChange={e => setMyProfile(p => ({ ...p, experience_level: e.target.value }))}>
                        <option value="">—</option>
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Áreas de enfoque</label>
                    <div className="flex flex-wrap gap-2">
                      {FOCUS_OPTIONS.map(opt => {
                        const on = (myProfile.focus_areas || []).includes(opt)
                        return (
                          <button key={opt} type="button"
                            onClick={() => { const cur = myProfile.focus_areas||[]; setMyProfile(p => ({ ...p, focus_areas: cur.includes(opt) ? cur.filter(f => f !== opt) : [...cur, opt] })) }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                            style={on ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                                       : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Estilo de dieta</label>
                    <input style={inp} value={myProfile.diet_style || ''} onChange={e => setMyProfile(p => ({ ...p, diet_style: e.target.value }))} placeholder="Ej: Mediterránea, Cetogénica..." />
                  </div>
                  <div>
                    <label style={lbl}>Notas / Lesiones</label>
                    <textarea className="resize-none" style={{ ...inp, height:80 } as React.CSSProperties}
                      value={myProfile.injuries || ''} onChange={e => setMyProfile(p => ({ ...p, injuries: e.target.value }))}
                      placeholder="Lesiones, restricciones o cualquier observación..." />
                  </div>
                  <button onClick={saveMyCoachProfile} disabled={savingMySettings}
                    style={{ ...btnPrimary, opacity: savingMySettings ? 0.6 : 1 } as React.CSSProperties}
                    className="transition-all active:scale-[0.97]">
                    <Save size={16} /> {savingMySettings ? 'Guardando...' : 'Guardar Datos'}
                  </button>
                </>
              )}

              {/* ── ANTROPOMETRÍA ── */}
              {ajustesTab === 'antropometria' && (
                <>
                  {([
                    { title:'Pliegues (mm)',   key:'skinfolds',  fields:['biceps','triceps','subscapular','suprailiaco','abdominal','muslo','pierna','pectoral'] },
                    { title:'Perímetros (cm)', key:'perimeters', fields:['thorax','abdomen','cadera','bicepsR','bicepsC','muslo','pantorrilla'] },
                  ] as const).map(({ title, key, fields }) => (
                    <div key={key}>
                      <p className="text-[9px] uppercase font-black tracking-widest mb-3" style={{ color:'#6B7895', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:6 }}>{title}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {fields.map(f => (
                          <div key={f} className="flex items-center justify-between gap-2">
                            <span className="text-xs capitalize" style={{ color:'#A8B3CF' }}>{f}</span>
                            <input type="number"
                              className="w-20 rounded-lg p-1.5 text-center text-xs font-bold text-white outline-none"
                              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
                              value={(myProfile.measurements as any)?.[key]?.[f] || ''}
                              onChange={e => setMyProfile(prev => ({
                                ...prev,
                                measurements: { ...prev.measurements, [key]: { ...(prev.measurements as any)?.[key], [f]: e.target.value } }
                              }))} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={saveMyCoachProfile} disabled={savingMySettings}
                    style={{ ...btnPrimary, opacity: savingMySettings ? 0.6 : 1 } as React.CSSProperties}
                    className="transition-all active:scale-[0.97]">
                    <Save size={16} /> {savingMySettings ? 'Guardando...' : 'Guardar Medidas'}
                  </button>
                </>
              )}

              {/* ── NUTRICIÓN ── */}
              {ajustesTab === 'nutricion' && (
                <>
                  {/* Meta de agua */}
                  <div className="p-4 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💧</span>
                        <label style={lbl} className="!mb-0">Meta de Agua (vasos/día)</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setMyWaterGoal(g => Math.max(1, g - 1))}
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white transition-all active:scale-95"
                          style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>−</button>
                        <span className="w-8 text-center font-black text-white text-lg">{myWaterGoal}</span>
                        <button type="button" onClick={() => setMyWaterGoal(g => Math.min(20, g + 1))}
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white transition-all active:scale-95"
                          style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>+</button>
                      </div>
                    </div>
                  </div>
                  {/* Formato select */}
                  {coachNutritionPref === 'select' && myMeals.map((meal, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.06)' }}>
                      <div className="px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,229,168,0.05)' }}>
                        <h2 className="font-black uppercase text-sm" style={{ color:'#00E5A8' }}>{meal.name}</h2>
                      </div>
                      <div className="p-4 space-y-4">
                        {(['protein','carbs','fat'] as const).map(type => (
                          <div key={type}>
                            <label style={lbl}>{type==='protein'?'🥩 Proteína':type==='carbs'?'🌾 Carbohidrato':'🥑 Grasa'} — una por línea</label>
                            <textarea className="resize-none" style={{...inp, height:80, fontSize:13, lineHeight:'1.6'} as React.CSSProperties}
                              value={meal[type].join('\n')} onChange={e => updateMyMeal(i, type, e.target.value)} placeholder="Ej: Pollo (100g)" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Formato días */}
                  {coachNutritionPref === 'days' && (
                    <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex overflow-x-auto scrollbar-hide" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                        {DAY_NAMES.map((day, di) => (
                          <button key={day} type="button" onClick={() => setMyActiveDayIdx(di)}
                            className="flex-shrink-0 px-4 py-3 font-black text-xs uppercase tracking-wide transition-all"
                            style={myActiveDayIdx === di
                              ? { borderBottom:'2px solid #00E5A8', color:'#00E5A8', background:'rgba(0,229,168,0.05)' }
                              : { borderBottom:'2px solid transparent', color:'#6B7895' }}>
                            {day.slice(0,3)}
                          </button>
                        ))}
                      </div>
                      <div className="p-4 space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest" style={{ color:'#00E5A8' }}>{DAY_NAMES[myActiveDayIdx]}</p>
                        {myDaysMeals[myActiveDayIdx]?.meals.map((meal, mi) => (
                          <div key={mi} className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.06)' }}>
                            <div className="px-4 py-2.5" style={{ background:'rgba(255,255,255,0.03)' }}>
                              <p className="font-black text-xs uppercase" style={{ color:'#A8B3CF' }}>{meal.name}</p>
                            </div>
                            <div className="p-4 space-y-3">
                              {(['protein','carbs','fat'] as const).map(type => (
                                <div key={type}>
                                  <label style={lbl}>{type==='protein'?'🥩 Proteína':type==='carbs'?'🌾 Carbohidrato':'🥑 Grasa'} — una por línea</label>
                                  <textarea className="resize-none" style={{...inp, height:70, fontSize:12, lineHeight:'1.6'} as React.CSSProperties}
                                    value={meal[type].join('\n')}
                                    onChange={e => updateMyDayMeal(myActiveDayIdx, mi, type, e.target.value)}
                                    placeholder="Ej: Pollo (100g)" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Toggle ensaladas */}
                  <div className="p-4 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🥗</span>
                        <div>
                          <p className="font-black text-sm text-white">Ensaladas Recomendadas</p>
                          <p className="text-[10px] font-bold" style={{ color:'#6B7895' }}>Incluir en mi plan</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setMyIncludeSalads(v => !v)}
                        className="w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0"
                        style={{ background: myIncludeSalads ? '#00E5A8' : 'rgba(255,255,255,0.1)' }}>
                        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 shadow"
                          style={{ left: myIncludeSalads ? '26px' : '2px' }} />
                      </button>
                    </div>
                  </div>
                  <button onClick={saveMyNutrition} disabled={savingMyNutrition}
                    style={{ ...btnPrimary, opacity: savingMyNutrition ? 0.6 : 1 } as React.CSSProperties}
                    className="transition-all active:scale-[0.97]">
                    <Save size={16} /> {savingMyNutrition ? 'Guardando...' : 'Guardar Nutrición'}
                  </button>
                </>
              )}

              {/* ── RUTINA ── */}
              {ajustesTab === 'rutina' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      style={{ ...inp, flex:1 } as React.CSSProperties}
                      placeholder="Ej: Día 1 — Pecho y Espalda"
                      value={myOwnNewRoutineName}
                      onChange={e => setMyOwnNewRoutineName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && createMyOwnRoutine()}
                    />
                    <button onClick={createMyOwnRoutine}
                      className="px-4 rounded-xl font-black text-white transition-all active:scale-95 shrink-0 flex items-center"
                      style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow:'0 4px 16px rgba(0,229,168,0.3)' }}>
                      <Plus size={18} />
                    </button>
                  </div>
                  {myOwnRoutines.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
                      <Dumbbell size={32} className="mx-auto mb-2 opacity-20" style={{ color:'#6B7895' }} />
                      <p className="text-xs font-bold uppercase" style={{ color:'#6B7895' }}>Sin rutinas propias</p>
                    </div>
                  ) : (
                    myOwnRoutines.map((r, idx) => (
                      <button key={r.id} onClick={() => openMyOwnRoutine(r)}
                        className="w-full flex items-center justify-between gap-3 p-4 rounded-[20px] text-left transition-all active:scale-[0.98]"
                        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', animation:`fadeUp 0.3s ease-out ${idx*0.05}s both` } as React.CSSProperties}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.2)' }}>
                            <Dumbbell size={15} style={{ color:'#00E5A8' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-sm text-white break-words">{r.name}</p>
                            <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>{r.exercises?.length || 0} ejercicios</p>
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color:'#6B7895', flexShrink:0 }} />
                      </button>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Logo */}
          <div style={card} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#6B7895' }}>Mi Marca</p>
                <p className="text-sm font-bold text-white">Logo como marca de agua</p>
              </div>
              {coachLogo && (
                <button onClick={removeLogo} className="p-2 rounded-xl transition-all active:scale-95" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
                  <X size={14} style={{ color:'#ef4444' }} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden shrink-0"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                {coachLogo ? <img src={coachLogo} alt="Logo" className="w-full h-full object-contain p-1" /> : <Image size={28} style={{ color:'#6B7895' }} />}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs" style={{ color:'#6B7895' }}>Aparecerá como marca de agua en el inicio de tus alumnos. Usa PNG con fondo transparente.</p>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }} />
                <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95 disabled:opacity-50"
                  style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }}>
                  <Upload size={13} />
                  {logoUploading ? 'Subiendo...' : coachLogo ? 'Cambiar logo' : 'Subir logo'}
                </button>
              </div>
            </div>
          </div>

          {/* Idioma */}
          <div style={card} className="p-5 space-y-3">
            <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#6B7895' }}>Idioma de la App</p>
            <div className="grid grid-cols-2 gap-2">
              {(['es','en'] as const).map(lang => (
                <button key={lang} type="button" onClick={() => setAppLanguage(lang)}
                  className="py-3 rounded-2xl font-black text-xs uppercase tracking-wide transition-all active:scale-95"
                  style={appLanguage === lang
                    ? { background:'rgba(0,229,168,0.15)', border:'1px solid #00E5A8', color:'#00E5A8' }
                    : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                  {lang === 'es' ? '🇪🇸 Español' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
          <div style={card} className="p-5 space-y-3">
            <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#6B7895' }}>Mi WhatsApp</p>
            <p className="text-xs" style={{ color:'#6B7895' }}>Aparecerá en el perfil de tus alumnos para contactarte.</p>
            <div className="flex gap-2">
              <div style={{ width: 90 }}>
                <label style={lbl}>Indicativo</label>
                <input style={inp} value={coachIndicativo} onChange={e => setCoachIndicativo(e.target.value)} placeholder="+57" />
              </div>
              <div className="flex-1">
                <label style={lbl}>Número</label>
                <input style={inp} type="tel" value={coachWhatsApp} onChange={e => setCoachWhatsApp(e.target.value)} placeholder="3001234567" />
              </div>
            </div>
          </div>

          {/* Formato de nutrición */}
          <div style={card} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#6B7895' }}>Formato de Nutrición</p>
              {nutritionPrefSaved && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.2)', color:'#00E5A8' }}>🔒 Fijado</span>
              )}
            </div>
            {!nutritionPrefSaved && <p className="text-xs" style={{ color:'#6B7895' }}>Elige cómo gestionar los planes nutricionales de tus alumnos.</p>}
            <div className="grid grid-cols-2 gap-2">
              {(['select','days'] as const).map(fmt => (
                <button key={fmt} type="button"
                  onClick={() => { if (!nutritionPrefSaved) setCoachNutritionPref(fmt) }}
                  disabled={nutritionPrefSaved}
                  className="py-3 rounded-2xl font-black text-xs uppercase tracking-wide transition-all"
                  style={coachNutritionPref === fmt
                    ? { background:'rgba(0,229,168,0.15)', border:'1px solid #00E5A8', color:'#00E5A8' }
                    : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color: nutritionPrefSaved ? 'rgba(107,120,149,0.4)' : '#6B7895' }}>
                  {fmt === 'select' ? '📋 En Select' : '📅 Por Días'}
                </button>
              ))}
            </div>
          </div>

          {/* Guardar configuración */}
          <button onClick={saveMyCoachProfile} disabled={savingMySettings}
            style={{ ...btnPrimary, opacity: savingMySettings ? 0.6 : 1 } as React.CSSProperties}
            className="transition-all active:scale-[0.97]">
            <Save size={16} /> {savingMySettings ? 'Guardando...' : 'Guardar Configuración'}
          </button>

          {/* Renovar / Mejorar plan */}
          {adminWhatsApp && (
            <a href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent('Hola, quiero renovar o mejorar mi plan como coach')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-[20px] transition-all active:scale-[0.98]"
              style={{ background:'rgba(124,92,255,0.08)', border:'1px solid rgba(124,92,255,0.25)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(124,92,255,0.15)' }}>
                <Crown size={18} style={{ color:'#7C5CFF' }} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#7C5CFF' }}>Plan & Membresía</p>
                <p className="text-sm font-bold text-white">Renovar o mejorar mi plan</p>
              </div>
              <ChevronRight size={16} style={{ color:'#7C5CFF' }} />
            </a>
          )}

        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-[1500] flex items-end justify-center p-4 pb-8" style={{ background:'rgba(11,18,32,0.85)', backdropFilter:'blur(16px)' }}>
          <div className="w-full max-w-sm rounded-[24px] p-6 space-y-5"
            style={{ background:'rgba(18,26,42,0.98)', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', animation:'fadeUp 0.35s ease-out both' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color:'#6B7895' }}>Admin</p>
                <h2 className="text-lg font-black uppercase text-white">Nuevo Usuario</h2>
              </div>
              <button onClick={() => setShowCreate(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <X size={16} style={{ color:'#A8B3CF' }} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label:'Nombre completo', field:'full_name', type:'text',     placeholder:'Ej: Alejandro Gómez' },
                { label:'Email',           field:'email',     type:'email',    placeholder:'correo@ejemplo.com'  },
                { label:'Contraseña',      field:'password',  type:'password', placeholder:'Mínimo 6 caracteres' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label style={lbl}>{label}</label>
                  <input type={type} placeholder={placeholder} style={inp}
                    value={(newUser as any)[field]}
                    onChange={e => setNewUser(p => ({...p, [field]: e.target.value}))} />
                </div>
              ))}
              {isAdmin && (
                <div>
                  <label style={lbl}>Rol</label>
                  <div className="flex gap-2">
                    {['user','coach','admin'].map(r => (
                      <button key={r} type="button" onClick={() => setNewUser(p => ({...p, role: r}))}
                        className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                        style={newUser.role===r
                          ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                          : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={async () => {
              if (!newUser.email || !newUser.password || !newUser.full_name) return toast('Completa todos los campos', true)
              setCreating(true)
              try {
                // 1. Crear usuario en Auth
                const { data: authData, error: authError } = await db.auth.admin.createUser({ email: newUser.email, password: newUser.password, email_confirm: true })
                if (authError) throw new Error(authError.message)

                // 2. Esperar a que el trigger de Supabase cree el perfil vacío
                await new Promise(r => setTimeout(r, 800))

                // 3. Upsert del perfil — funciona tanto si el trigger ya creó la fila como si no
                const role = isCoach ? 'user' : (newUser.role || 'user')
                const upsertData: any = { id: authData.user.id, full_name: newUser.full_name, email: newUser.email, role }
                if (isCoach) upsertData.coach_id = currentUserId
                await db.from('profiles').upsert(upsertData, { onConflict: 'id' })

                // 3b. Segundo update para garantizar coach_id si el trigger corrió después del upsert
                if (isCoach) {
                  await new Promise(r => setTimeout(r, 500))
                  await db.from('profiles').update({ coach_id: currentUserId, full_name: newUser.full_name, role }).eq('id', authData.user.id)
                }

                // 4. Cerrar modal y recargar lista
                const createdName  = newUser.full_name
                const createdEmail = newUser.email
                const createdRole  = isCoach ? 'user' : (newUser.role || 'user')
                setShowCreate(false)
                setNewUser({ full_name: '', email: '', password: '', role: 'user' })
                await loadUsers()
                if (isAdmin) loadCoaches()

                // 5. Navegar al perfil del nuevo usuario
                const { data: newProfile } = await db.from('profiles').select('*').eq('id', authData.user.id).single()
                if (newProfile) {
                  toast(`✓ ${createdName} creado`)
                  // Forzar nombre/email en caso de que el trigger haya dejado el perfil vacío
                  selectUser({ ...newProfile, full_name: newProfile.full_name || createdName, email: newProfile.email || createdEmail, role: newProfile.role || createdRole })
                }
              } catch (e: any) { toast(e.message || 'Error al crear usuario', true) }
              finally { setCreating(false) }
            }} disabled={creating} style={{ ...btnPrimary, opacity: creating?0.6:1 } as React.CSSProperties} className="transition-all active:scale-[0.97]">
              <UserPlus size={16} /> {creating ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
