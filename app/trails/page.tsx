'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const trailTypeLabel: { [key: string]: string } = {
  singltrek: '🚵 Singltrek',
  pumptrack: '🔁 Pumptrack',
  skatepark: '🛹 Skatepark',
  bikepark: '🏔️ Bikepark',
  crosscountry: '🛤️ Cross-country',
}

const skillLevelLabel: { [key: string]: string } = {
  zacatecnik: '🟢 Začátečník',
  pokrocily: '🔵 Pokročilý',
  zkuseny: '🟠 Zkušený',
  zabijak: '⚫ Zabiják',
  easy: '🟢 Lehká',
  medium: '🟡 Střední',
  hard: '🔴 Těžká',
  expert: '⚫ Expert',
}

function FilterSection({
  title,
  value,
  valueLabel,
  open,
  onToggle,
  children,
}: {
  title: string
  value: string
  valueLabel: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-800 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{title}</span>
          {value !== 'all' && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              {valueLabel}
            </span>
          )}
        </div>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap border-t border-gray-800 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

export default function Trails() {
  const router = useRouter()
  const [trails, setTrails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [skillFilter, setSkillFilter] = useState('all')
  const [trailTypeFilterVal, setTrailTypeFilterVal] = useState('all')
  const [officialFilter, setOfficialFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [canSeeUnofficial, setCanSeeUnofficial] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('can_see_unofficial')
          .eq('id', userData.user.id)
          .single()
        setCanSeeUnofficial(profileData?.can_see_unofficial || false)
      }

      const { data, error } = await supabase
        .from('trails_with_profiles')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setTrails(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const regions = ['all', ...Array.from(new Set(trails.map(t => t.region).filter(Boolean))).sort()]

  const filtered = trails.filter((t) => {
    const skillMatch = skillFilter === 'all' || (t.skill_level || t.difficulty) === skillFilter
    const typeMatch = trailTypeFilterVal === 'all' || t.trail_type === trailTypeFilterVal
    const officialMatch = officialFilter === 'all'
      || (officialFilter === 'official' && t.is_official)
      || (officialFilter === 'unofficial' && !t.is_official)
    const regionMatch = regionFilter === 'all' || t.region === regionFilter
    return skillMatch && typeMatch && officialMatch && regionMatch
  })

  const toggleSection = (name: string) => {
    setOpenSection(prev => prev === name ? null : name)
  }

  const activeFiltersCount = [
    skillFilter !== 'all',
    trailTypeFilterVal !== 'all',
    officialFilter !== 'all',
    regionFilter !== 'all',
  ].filter(Boolean).length

  const resetFilters = () => {
    setSkillFilter('all')
    setTrailTypeFilterVal('all')
    setOfficialFilter('all')
    setRegionFilter('all')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Načítám...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Traily</h1>
        <p className="text-gray-400 mb-6">Všechny schválené traily v databázi.</p>

        {/* Filtry — řada karet vedle sebe */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">

          {/* Typ místa */}
          <div className="relative">
            <button
              onClick={() => toggleSection('type')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${
                trailTypeFilterVal !== 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="font-medium truncate">
                {trailTypeFilterVal === 'all' ? 'Typ místa' : trailTypeLabel[trailTypeFilterVal]}
              </span>
              <span className="ml-1 text-xs opacity-70">{openSection === 'type' ? '▲' : '▼'}</span>
            </button>
            {openSection === 'type' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl z-50 overflow-hidden shadow-xl">
                {['all', 'singltrek', 'pumptrack', 'skatepark', 'bikepark', 'crosscountry'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTrailTypeFilterVal(t); setOpenSection(null) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      trailTypeFilterVal === t
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {t === 'all' ? 'Vše' : trailTypeLabel[t]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pro koho */}
          <div className="relative">
            <button
              onClick={() => toggleSection('skill')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${
                skillFilter !== 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="font-medium truncate">
                {skillFilter === 'all' ? 'Pro koho' : skillLevelLabel[skillFilter]}
              </span>
              <span className="ml-1 text-xs opacity-70">{openSection === 'skill' ? '▲' : '▼'}</span>
            </button>
            {openSection === 'skill' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl z-50 overflow-hidden shadow-xl">
                {['all', 'zacatecnik', 'pokrocily', 'zkuseny', 'zabijak'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSkillFilter(s); setOpenSection(null) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      skillFilter === s
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {s === 'all' ? 'Všechny úrovně' : skillLevelLabel[s]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kraj */}
          <div className="relative">
            <button
              onClick={() => toggleSection('region')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${
                regionFilter !== 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="font-medium truncate">
                {regionFilter === 'all' ? '🗺️ Kraj' : regionFilter}
              </span>
              <span className="ml-1 text-xs opacity-70">{openSection === 'region' ? '▲' : '▼'}</span>
            </button>
            {openSection === 'region' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl z-50 overflow-hidden shadow-xl">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRegionFilter(r); setOpenSection(null) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      regionFilter === r
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {r === 'all' ? '🗺️ Všechny kraje' : r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Viditelnost — jen pro oprávněné */}
          {canSeeUnofficial && (
            <div className="relative">
              <button
                onClick={() => toggleSection('official')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${
                  officialFilter !== 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span className="font-medium truncate">
                  {officialFilter === 'all' ? 'Viditelnost' : officialFilter === 'official' ? '✅ Oficiální' : '☠️ Neoficiální'}
                </span>
                <span className="ml-1 text-xs opacity-70">{openSection === 'official' ? '▲' : '▼'}</span>
              </button>
              {openSection === 'official' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl z-50 overflow-hidden shadow-xl">
                  {[
                    { value: 'all', label: 'Vše' },
                    { value: 'official', label: '✅ Oficiální' },
                    { value: 'unofficial', label: '☠️ Neoficiální' },
                  ].map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { setOfficialFilter(o.value); setOpenSection(null) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${
                        officialFilter === o.value
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reset + počet */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 text-sm">
            Nalezeno: {filtered.length} {filtered.length === 1 ? 'místo' : filtered.length < 5 ? 'místa' : 'míst'}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-red-400 text-xs hover:text-red-300 transition"
            >
              ✕ Zrušit filtry ({activeFiltersCount})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.length === 0 && (
            <p className="text-gray-400 col-span-4">Žádné traily nenalezeny.</p>
          )}
          {filtered.map((trail) => (
            <div
              key={trail.id}
              onClick={() => router.push(`/trail/${trail.id}`)}
              className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-800 transition"
            >
              <div className="relative">
                <img
                  src={trail.photo_url || '/logo.png'}
                  alt={trail.name}
                  className="w-full h-28 object-cover bg-gray-800"
                />
                {!trail.is_official && (
                  <span className="absolute top-2 left-2 bg-gray-900 text-orange-400 text-xs font-semibold px-2 py-1 rounded-lg border border-orange-400/30">
                    ☠️
                  </span>
                )}
              </div>
              <div className="p-3">
                <h2 className="text-white font-bold text-sm mb-1 line-clamp-1">{trail.name}</h2>
                <p className="text-gray-400 text-xs mb-1 line-clamp-1">{trail.location_name}</p>
                <p className="text-orange-500 text-xs font-semibold mb-1">
                  {trailTypeLabel[trail.trail_type] || '🚵 Singltrek'}
                </p>
                <p className="text-gray-400 text-xs mb-1">
                  {skillLevelLabel[trail.skill_level || trail.difficulty] || '🟢 Začátečník'}
                </p>
                <div className="flex gap-2 text-xs items-center">
                  <span className="text-gray-500">{trail.length_km} km</span>
                  {trail.region && (
                    <span className="text-gray-600">· {trail.region}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
