export default function ProgressPage() {
    const prs = [
      { exercise: 'Press Banca', weight: '100kg', date: '2 feb' },
      { exercise: 'Sentadilla', weight: '140kg', date: '5 feb' },
    ]
  
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Mi Progreso</h1>
        <div className="space-y-4">
          {prs.map(pr => (
            <div key={pr.exercise} className="bg-slate-900 p-4 rounded-xl flex justify-between">
              <span className="text-slate-300">{pr.exercise}</span>
              <span className="font-bold text-green-400">{pr.weight}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  