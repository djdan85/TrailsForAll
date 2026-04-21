'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '../components/ImageUpload'
import GpxUpload from '../components/GpxUpload'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('../components/RouteMap'), { ssr: false })

const trailTypes = [
  {
    value: 'singltrek',
    label: '🚵 Singltrek / Trail',
    desc: 'Úzká stezka v terénu, většinou v lese. Technické sekce, kořeny, kameny. Klasika pro MTB.'
  },
  {
    value: 'pumptrack',
    label: '🔁 Pumptrack',
    desc: 'Okruh s vlnami a zatáčkami. Jedeš bez šlapání — jen pumpuješ tělem. Baví všechny věkové kategorie.'
  },
  {
    value: 'skatepark',
    label: '🛹 Skatepark',
    desc: 'Betonový nebo dřevěný park s rampami, bowlem nebo překážkami. Ideální pro BMX, dirt a triky.'
  },
  {
    value: 'bikepark',
    label: '🏔️ Bikepark',
    desc: 'Organizovaný areál s vyznačenými sjezdovkami a flow traily. Většinou lanovka nahoru, dolů na kole.'
  },
  {
    value: 'crosscountry',
    label: '🛤️ Cross-country trasa',
    desc: 'Delší okruh nebo trasa krajinou — les, louky, kopce. Mix cest a singltreku. Důraz na vzdálenost a kondici.'
  },
]

const skillLevels = [
  {
    value: 'zacatecnik',
    label: '🟢 Začátečník',
    desc: 'První kilometry na kole, žádné riziko. Rovný terén, žádné technické překážky.'
  },
  {
    value: 'pokrocily',
    label: '🔵 Pokročilý biker',
    desc: 'Trochu praxe za sebou, základní technika jízdy. Zvládne mírné kopce a jednoduché terénní nerovnosti.'
  },
  {
    value: 'zkuseny',
    label: '🟠 Zkušený biker',
    desc: 'Technické sekce, slušná kondice, kořeny a kameny nejsou problém. Jezdí pravidelně a ví co dělá.'
  },
  {
    value: 'zabijak',
    label: '⚫ Zabijácký BIKER',
    desc: 'Jen pro ostřílené matadory. Pořádná dřina, technické výzvy, adrenalin na maximum. Slabší povahy ať raději jedou domů.'
  },
]

export default function AddTrail() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [routePoints, setRoutePoints] = useState<[number, number][]>([])
  const [gpxUrl, setGpxUrl] = useState('')
  const [region, setRegion] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    trail_type: 'singltrek',
    skill_level: 'zacatecnik',
    length_km: '',
    location_name: '',
    photo_url: '',
    maps_url: '',
    website_url: '',
    is_official: true,
  })

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) router.push('/login')
      else setUser(data.user)
    }
    getUser()
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGpxUpload = (url: string, points: [number, number][]) => {
    setGpxUrl(url)
    if (points.length > 0) {
      setRoutePoints([points[0]])
    } else {
      setRoutePoints([])
    }
  }

  const handleSubmit = async () => {
    if (routePoints.length === 0) {
      setMessage('Označ start trailu na mapě nebo nahraj GPX soubor.')
      return
    }

    setLoading(true)
    setMessage('')

    const startPoint = routePoints[0]

    const { error } = await supabase.from('trails').insert({
      name: form.name,
      description: form.description,
      trail_type: form.trail_type,
      skill_level: form.skill_level,
      length_km: parseFloat(form.length_km),
      location_name: form.location_name,
      lat: startPoint[0],
      lng: startPoint[1],
      gpx_url: gpxUrl || null,
      photo_url: form.photo_url || null,
      maps_url: form.maps_url || null,
      website_url: form.website_url || null,
      is_official: form.is_official,
      region: region || null,
      created_by: user.id,
      status: 'pending'
    })

    if (error) setMessage('Chyba: ' + error.message)
    else setMessage('Trail byl odeslán ke schválení!')

    setLoading(false)
  }

  const selectedType = trailTypes.find(t => t.value === form.trail_type)
  const selectedSkill = skillLevels.find(s => s.value === form.skill_level)

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Přidat místo</h1>
        <p className="text-gray-400 mb-8">Místo bude po odeslání čekat na schválení adminem.</p>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Název</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Název trailu / pumptracku / skateparku..."
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Popis</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Popiš místo..."
            />
          </div>

          {/* Typ místa */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Typ místa</label>
            <div className="flex flex-col gap-2">
              {trailTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, trail_type: type.value }))}
                  className={`w-full text-left px-4 py-3 rounded-xl transition ${
                    form.trail_type === type.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <p className="font-semibold text-sm">{type.label}</p>
                  <p className={`text-xs mt-0.5 ${form.trail_type === type.value ? 'text-orange-100' : 'text-gray-600'}`}>
                    {type.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Úroveň dovednosti */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Pro koho je vhodné</label>
            <div className="flex flex-col gap-2">
              {skillLevels.map(skill => (
                <button
                  key={skill.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, skill_level: skill.value }))}
                  className={`w-full text-left px-4 py-3 rounded-xl transition ${
                    form.skill_level === skill.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <p className="font-semibold text-sm">{skill.label}</p>
                  <p className={`text-xs mt-0.5 ${form.skill_level === skill.value ? 'text-orange-100' : 'text-gray-600'}`}>
                    {skill.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Délka (km)</label>
            <input
              name="length_km"
              value={form.length_km}
              onChange={handleChange}
              type="number"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="12.5"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Lokalita</label>
            <input
              name="location_name"
              value={form.location_name}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Město, Region"
            />
          </div>

          {/* Oficiální / Neoficiální */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Viditelnost</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, is_official: true }))}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                  form.is_official
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ✅ Oficiální
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, is_official: false }))}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                  !form.is_official
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ☠️ Neoficiální
              </button>
            </div>
            {!form.is_official && (
              <p className="text-gray-600 text-xs mt-2">
                Neoficiální traily vidí pouze členové komunity s přístupem od admina.
              </p>
            )}
          </div>

          {/* Mapa */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Poloha
              <span className="text-gray-600 ml-1">— klikni na mapu, nebo se doplní z GPX</span>
            </label>
            <RouteMap
              points={routePoints}
              onChange={(pts, reg) => {
                setRoutePoints(pts)
                if (reg) setRegion(reg)
              }}
            />
            {routePoints.length > 0 && (
              <p className="text-gray-600 text-xs mt-1">
                📍 {routePoints[0][0].toFixed(5)}, {routePoints[0][1].toFixed(5)}
                {region && <span className="ml-2">· {region}</span>}
              </p>
            )}
          </div>

          <GpxUpload onUpload={handleGpxUpload} />

          <ImageUpload
            label="Fotografie (nepovinné)"
            onUpload={url => setForm(prev => ({ ...prev, photo_url: url }))}
          />

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Mapy.com odkaz
              <span className="text-gray-600 ml-1">(nepovinné)</span>
            </label>
            <input
              name="maps_url"
              value={form.maps_url}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://mapy.com/..."
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Web místa
              <span className="text-gray-600 ml-1">(nepovinné)</span>
            </label>
            <input
              name="website_url"
              value={form.website_url}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://..."
            />
          </div>

          {message && (
            <p className="text-orange-400 text-sm">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'Odesílám...' : 'Odeslat ke schválení'}
          </button>

        </div>
      </div>
    </div>
  )
}

