'use client'
import { Home, Dumbbell, Library, User } from 'lucide-react'

const NAV_ITEMS = [
  { view: 'home', icon: Home, label: 'Inicio', activeColor: 'text-blue-500' },
  { view: 'myRoutines', icon: Dumbbell, label: 'Rutinas', activeColor: 'text-emerald-500' },
  { view: 'library', icon: Library, label: 'Librería', activeColor: 'text-purple-500' },
  { view: 'profile', icon: User, label: 'Perfil', activeColor: 'text-orange-500' },
]

export default function BottomNav({ currentView, onNavigate }: { currentView: string, onNavigate: (view: any) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-20 bg-[#1a1f2e] border-t border-gray-800 pb-4">
      <div className="grid h-full w-full max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon
          return (
            <button 
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className="flex flex-col items-center justify-center relative"
            >
              {isActive && <div className="absolute -top-3 w-10 h-1 bg-current rounded-full" style={{ color: item.activeColor }} />}
              <Icon className={`${isActive ? item.activeColor : 'text-gray-400'} transition-colors`} size={24} />
              <span className={`text-xs mt-1 ${isActive ? 'text-white' : 'text-gray-500'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
