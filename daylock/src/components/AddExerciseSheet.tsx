import { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'

interface Exercise {
  id: string
  name: string
  muscle_group: string
}

const MUSCLE_GROUPS = ['All', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE']

interface Props {
  userId: string
  onSelect: (name: string, muscleGroup: string) => void
  onClose: () => void
}

export function AddExerciseSheet({ userId, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [exercises] = useState<Exercise[]>(() => {
    const cached = sessionStorage.getItem('ff-exercises')
    if (cached) return JSON.parse(cached)
    supabase
      .from('exercises')
      .select('id, name, muscle_group')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('name')
      .then(({ data }) => {
        if (data) {
          sessionStorage.setItem('ff-exercises', JSON.stringify(data))
          window.location.reload()
        }
      })
    return []
  })

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || ex.muscle_group === category
      return matchesSearch && matchesCategory
    })
  }, [exercises, search, category])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-[#161616] rounded-t-xl pt-3 pb-safe w-full max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-ff-border rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between px-md mb-4">
          <h2 className="font-display text-headline-md text-white">Add Exercise</h2>
          <button onClick={onClose} className="text-ff-muted">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-md mb-4">
          <div className="bg-surface-container-high border border-ff-border rounded-xl px-md py-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-ff-muted text-[20px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="bg-transparent text-white outline-none flex-1 font-body-md"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-ff-muted">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 px-md mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setCategory(g)}
              className={`whitespace-nowrap ${
                category === g
                  ? 'bg-ff-accent text-white px-4 py-1.5 rounded-full font-label-caps text-label-caps'
                  : 'ff-pill'
              }`}
            >
              {g === 'All' ? 'All' : g.charAt(0) + g.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 px-md overflow-y-auto max-h-[50vh]">
          {filtered.length === 0 && (
            <p className="text-ff-muted font-body-md text-center py-8">No exercises found.</p>
          )}
          {filtered.map((ex) => (
            <div key={ex.id} className="ff-card px-md py-sm flex items-center justify-between">
              <div>
                <p className="font-body-lg text-white font-bold">{ex.name}</p>
                <p className="font-label-caps text-label-caps text-ff-muted mt-1">
                  {ex.muscle_group.charAt(0) + ex.muscle_group.slice(1).toLowerCase()}
                </p>
              </div>
              <button
                onClick={() => onSelect(ex.name, ex.muscle_group)}
                className="w-10 h-10 rounded-full bg-surface-container-high border border-ff-border flex items-center justify-center text-ff-accent active:bg-ff-accent active:text-white transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          ))}
        </div>

        <div className="px-md mt-4 pb-4">
          <button className="ff-btn-secondary">
            <span className="material-symbols-outlined text-[18px]">add</span>
            ADD CUSTOM EXERCISE
          </button>
        </div>
      </div>
    </div>
  )
}
