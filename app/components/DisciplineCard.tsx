'use client'

import RiderIcon, {
  riderDisciplineColors,
  riderDisciplineLabels,
  type RiderDiscipline,
} from './RiderIcon'

type Props = {
  discipline: RiderDiscipline
  selected: boolean
  onSelect: (discipline: RiderDiscipline) => void
}

export default function DisciplineCard({ discipline, selected, onSelect }: Props) {
  const color = riderDisciplineColors[discipline]

  return (
    <button
      type="button"
      onClick={() => onSelect(discipline)}
      aria-pressed={selected}
      className={`group relative min-h-44 overflow-hidden rounded-2xl border px-4 pb-4 pt-3 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ${
        selected
          ? 'border-orange-500 bg-orange-500/10 shadow-[0_12px_34px_rgba(249,115,22,0.18)]'
          : 'border-slate-700 bg-slate-800/70 hover:-translate-y-1 hover:border-slate-500 hover:bg-slate-800 hover:shadow-xl hover:shadow-black/25'
      }`}
    >
      <span
        className="pointer-events-none absolute inset-x-5 top-2 h-28 rounded-full opacity-0 blur-3xl transition duration-300 group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />

      {selected && (
        <span className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-orange-500 text-sm font-black text-gray-950 shadow-lg shadow-orange-950/50">
          ✓
        </span>
      )}

      <span className="relative flex h-full flex-col items-center justify-center gap-1.5">
        <RiderIcon
          discipline={discipline}
          className={`h-24 w-full max-w-[220px] overflow-visible transition duration-300 group-hover:scale-[1.04] ${selected ? 'scale-[1.04]' : ''}`}
          style={{ color, filter: `drop-shadow(0 0 7px ${color}38)` }}
        />
        <span className={`text-center text-sm font-bold transition ${selected ? 'text-white' : 'text-slate-100'}`}>
          {riderDisciplineLabels[discipline]}
        </span>
        <span
          className={`mt-1 h-1 rounded-full transition-all duration-300 ${selected ? 'w-8' : 'w-5 group-hover:w-7'}`}
          style={{ backgroundColor: selected ? '#f97316' : color }}
        />
      </span>
    </button>
  )
}
