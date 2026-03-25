'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Lang = 'es' | 'en'
type Theme = 'dark' | 'light'

interface Translations {
  [key: string]: string
}

const translations: Record<Lang, Translations> = {
  es: {
    home: 'Inicio', library: 'Librería', settings: 'Configuración', profile: 'Perfil', nutrition: 'Nutrición', admin: 'Admin',
    welcome: 'Bienvenido', lastWorkout: 'Último Entrenamiento', streak: 'Racha', days: 'Días',
    weight: 'Peso', height: 'Altura', myRoutines: 'Mis Rutinas', exercises: 'Ejercicios',
    save: 'Guardar', general: 'General', objetivos: 'Objetivos', antropometria: 'Antropometría',
    rutinas: 'Rutinas', fat: 'Grasa', muscle: 'Músculo', imc: 'IMC', tmb: 'TMB',
    idealWeight: 'Peso Ideal', icc: 'Cintura/Cadera', somatotype: 'Somatotipo',
    focusAreas: 'Áreas de Enfoque', dietStyle: 'Estilo de Dieta', Additionals: 'Adicionales',
    createEx: 'Crear Ejercicio', search: 'Buscar...', finish: 'Finalizar', rest: 'Descanso',
    composition: 'Composición', logout: 'Cerrar Sesión',
    startWorkout: 'Empezar Mi Entreno', routinesAvailable: 'rutinas disponibles',
    noRoutines: 'No hay rutinas', createRoutine: 'Crear Rutina',
    selectRoutine: 'Selecciona una rutina', noHistory: 'Sin historial aún',
    startFirstWorkout: '¡Inicia tu primer entrenamiento!',
    workout: 'Entreno', restTime: 'Descanso', series: 'Series', reps: 'Reps', weightKg: 'Peso (Kg)',
    complete: 'Completar', skip: 'Saltar', cancel: 'Cancelar', confirm: 'Confirmar',
    delete: 'Eliminar', edit: 'Editar', add: 'Añadir', remove: 'Quitar',
    name: 'Nombre', email: 'Email', password: 'Contraseña', login: 'Iniciar Sesión',
    register: 'Registrarse', noAccount: '¿No tienes cuenta?', hasAccount: '¿Ya tienes cuenta?',
    settingsTab: 'Configuración', personalInfo: 'Información Personal',
    antropometricData: 'Datos Antropométricos', measurements: 'Medidas',
    skinfolds: 'Pliegues Cutáneos', diameters: 'Diámetros Óseos',
    perimeters: 'Perímetros', results: 'Resultados',
    fatPercentage: '% Grasa', muscleMass: 'Masa Muscular', bmi: 'BMI', bmr: 'BMR',
    waistHip: 'Cintura/Cadera', active: 'Activo', inactive: 'Inactivo',
    membership: 'Membresía', expiresIn: 'Expira en', expired: 'Expirada',
    daysLeft: 'días restantes', adminPanel: 'Panel de Admin',
    users: 'Usuarios', totalUsers: 'Total Usuarios', premiumUsers: 'Premium',
    totalWorkouts: 'Entrenamientos Totales', thisMonthWorkout: 'Este Mes',
    volume: 'Volumen', personalRecords: 'Récords Personales',
    exercise: 'Ejercicio', muscleGroup: 'Grupo Muscular', difficulty: 'Dificultad',
    addExercise: 'Añadir Ejercicio', removeExercise: 'Quitar Ejercicio',
    sets: 'Series', repsNumber: 'Repeticiones', restSeconds: 'Descanso (seg)',
    notes: 'Notas', noNotes: 'Sin notas', personalInfoPreference: 'Información personal y de preferencia',
    yourAccount: 'Tu cuenta', athlete: 'Atleta activo', coach: 'Coach', administrator: 'Administrador',
    basic: 'Básico', pro: 'Pro', premium: 'Premium',
    trainingDays: 'Días de Entrenamiento', experienceLevel: 'Nivel de Experiencia',
    injuries: 'Lesiones',
    male: 'Hombre', female: 'Mujer', other: 'Otro', age: 'Edad',
    create: 'Crear', update: 'Actualizar', submit: 'Enviar', back: 'Volver',
    success: 'Éxito', error: 'Error', loading: 'Cargando...',
    noExercises: 'No hay ejercicios', searchExercises: 'Buscar ejercicios...',
    selectExercises: 'Seleccionar Ejercicios', noResults: 'Sin resultados',
    viewAll: 'Ver Todos', seeMore: 'Ver más', seeLess: 'Ver menos',
    today: 'Hoy', yesterday: 'Ayer', thisWeek: 'Esta Semana', thisMonthLabel: 'Este Mes',
    total: 'Total', average: 'Promedio', best: 'Mejor', worst: 'Peor',
    time: 'Tiempo', duration: 'Duración', calories: 'Calorías',
    darkMode: 'Modo Oscuro', lightMode: 'Modo Claro',
    language: 'Idioma', spanish: 'Español', english: 'English',
  },
  en: {
    home: 'Home', library: 'Library', settings: 'Settings', profile: 'Profile', nutrition: 'Nutrition', admin: 'Admin',
    welcome: 'Welcome', lastWorkout: 'Last Workout', streak: 'Streak', days: 'Days',
    weight: 'Weight', height: 'Height', myRoutines: 'My Routines', exercises: 'Exercises',
    save: 'Save', general: 'General', objetivos: 'Goals', antropometria: 'Anthro',
    rutinas: 'Routines', fat: 'Fat', muscle: 'Muscle', imc: 'BMI', tmb: 'BMR',
    idealWeight: 'Ideal Weight', icc: 'Waist/Hip', somatotype: 'Somatotype',
    focusAreas: 'Focus Areas', dietStyle: 'Diet Style', Additionals: 'Adicionales',
    createEx: 'Create Exercise', search: 'Search...', finish: 'Finish', rest: 'Rest',
    composition: 'Composition', logout: 'Log Out',
    startWorkout: 'Start My Workout', routinesAvailable: 'routines available',
    noRoutines: 'No routines', createRoutine: 'Create Routine',
    selectRoutine: 'Select a routine', noHistory: 'No history yet',
    startFirstWorkout: 'Start your first workout!',
    workout: 'Workout', restTime: 'Rest', series: 'Sets', reps: 'Reps', weightKg: 'Weight (Kg)',
    complete: 'Complete', skip: 'Skip', cancel: 'Cancel', confirm: 'Confirm',
    delete: 'Delete', edit: 'Edit', add: 'Add', remove: 'Remove',
    name: 'Name', email: 'Email', password: 'Password', login: 'Login',
    register: 'Register', noAccount: "Don't have an account?", hasAccount: 'Already have an account?',
    settingsTab: 'Settings', personalInfo: 'Personal Info',
    antropometricData: 'Anthropometric Data', measurements: 'Measurements',
    skinfolds: 'Skinfolds', diameters: 'Bone Diameters',
    perimeters: 'Perimeters', results: 'Results',
    fatPercentage: '% Fat', muscleMass: 'Muscle Mass', bmi: 'BMI', bmr: 'BMR',
    waistHip: 'Waist/Hip', active: 'Active', inactive: 'Inactive',
    membership: 'Membership', expiresIn: 'Expires in', expired: 'Expired',
    daysLeft: 'days left', adminPanel: 'Admin Panel',
    users: 'Users', totalUsers: 'Total Users', premiumUsers: 'Premium',
    totalWorkouts: 'Total Workouts', thisMonthWorkout: 'This Month',
    volume: 'Volume', personalRecords: 'Personal Records',
    exercise: 'Exercise', muscleGroup: 'Muscle Group', difficulty: 'Difficulty',
    addExercise: 'Add Exercise', removeExercise: 'Remove Exercise',
    sets: 'Sets', repsNumber: 'Repetitions', restSeconds: 'Rest (sec)',
    notes: 'Notes', noNotes: 'No notes', personalInfoPreference: 'Personal information and preferences',
    yourAccount: 'Your Account', athlete: 'Active Athlete', coach: 'Coach', administrator: 'Administrator',
    basic: 'Basic', pro: 'Pro', premium: 'Premium',
    trainingDays: 'Training Days', experienceLevel: 'Experience Level',
    injuries: 'Injuries',
    male: 'Male', female: 'Female', other: 'Other', age: 'Age',
    create: 'Create', update: 'Update', submit: 'Submit', back: 'Back',
    success: 'Success', error: 'Error', loading: 'Loading...',
    noExercises: 'No exercises', searchExercises: 'Search exercises...',
    selectExercises: 'Select Exercises', noResults: 'No results',
    viewAll: 'View All', seeMore: 'See more', seeLess: 'See less',
    today: 'Today', yesterday: 'Yesterday', thisWeek: 'This Week', thisMonthLabel: 'This Month',
    total: 'Total', average: 'Average', best: 'Best', worst: 'Worst',
    time: 'Time', duration: 'Duration', calories: 'Calories',
    darkMode: 'Dark Mode', lightMode: 'Light Mode',
    language: 'Language', spanish: 'Español', english: 'English',
  }
}

const Context = createContext<{
  t: (key: string) => string
  lang: Lang
  setLang: (lang: Lang) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleLang: () => void
  toggleTheme: () => void
} | null>(null)

export function LangThemeProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const savedLang = localStorage.getItem('gympro_lang') as Lang
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      setLangState(savedLang)
    }
    const savedTheme = localStorage.getItem('gympro_theme') as Theme
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setThemeState(savedTheme)
    }
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('gympro_lang', newLang)
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('gympro_theme', newTheme)
  }

  const toggleLang = () => {
    setLang(lang === 'es' ? 'en' : 'es')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const t = (key: string): string => {
    return translations[lang][key] || key
  }

  return (
    <Context.Provider value={{ t, lang, setLang, theme, setTheme, toggleLang, toggleTheme }}>
      {children}
    </Context.Provider>
  )
}

export function useLang() {
  const context = useContext(Context)
  if (!context) throw new Error('useLang must be used within LangThemeProvider')
  return context
}
