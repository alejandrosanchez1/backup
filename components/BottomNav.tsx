'use client'
import { Home, Dumbbell, Library, User } from 'lucide-react'

const NAV_ITEMS = [
  { view: 'home',       icon: Home,     label: 'Inicio'   },
  { view: 'myRoutines', icon: Dumbbell, label: 'Rutinas'  },
  { view: 'library',    icon: Library,  label: 'Librería' },
  { view: 'profile',    icon: User,     label: 'Perfil'   },
]

export default function BottomNav({ currentView, onNavigate }: { currentView: string, onNavigate: (view: any) => void }) {
  return (
    <nav
      className="fixed bottom-0 left-0 z-50 w-full h-20 pb-4"
      style={{ background: '#0B1220', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="grid grid-cols-4 h-full w-full max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className="flex flex-col items-center justify-center relative transition-all active:scale-95"
            >
              {isActive && (
                <div
                  className="absolute top-0 w-8 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)' }}
                />
              )}
              <Icon
                size={22}
                style={{ color: isActive ? '#00E5A8' : '#6B7895', transition: 'color 0.2s ease' }}
              />
              <span
                className="text-[11px] mt-1 font-semibold"
                style={{ color: isActive ? '#00E5A8' : '#6B7895', transition: 'color 0.2s ease' }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
