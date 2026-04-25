'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import MultiImageUpload, { UploadedPhoto } from '../components/MultiImageUpload'
import GpxUpload from '../components/GpxUpload'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('../components/RouteMap'), { ssr: false })
const TrailMap = dynamic(() => import('../components/TrailMap'), { ssr: false })

const DEFAULT_TRAIL_COLOR = '#f97316'

const colorOptions = [
  { label: 'Zelená', value: '#22c55e' },
  { label: 'Modrá', value: '#3b82f6' },
  { label: 'Červená', value: '#ef4444' },
  { label: 'Černá', value: '#111827' },
  { label: 'Žlutá', value: '#eab308' },
  { label: 'Oranžová', value: '#f97316' },
  { label: 'Bílá', value: '#ffffff' },
]

const trailTypes = [
  { value: 'singltrek', label: '🚵 Singltrek / Trail', desc: 'Úzká stezka v terénu, většinou v lese. Technické sekce, kořeny, kameny. Klasika pro MTB.' },
  { value: 'pumptrack', label: '🔁 Pumptrack', desc: 'Okruh s vlnami a zatáčkami. Jedeš bez šlapání — jen pumpuješ tělem. Baví všechny věkové kategorie.' },
  { value: 'skatepark', label: '🛹 Skatepark', desc: 'Betonový nebo dřevěný park s rampami, bowlem nebo překážkami. Ideální pro BMX, dirt a triky.' },
  { value: 'bikepark', label: '🏔️ Bikepark', desc: 'Organizovaný areál s vyznačenými sjezdovkami a flow traily. Většinou lanovka nahoru, dolů na kole.' },
  { value: 'crosscountry', label: '🛤️ Cross-country trasa', desc: 'Delší okruh nebo trasa krajinou — les, louky, kopce. Mix cest a singltreku. Důraz na vzdálenost a kondici.' },
]

const skillLevels = [
  { value: 'zacatecnik', label: '🟢 Začátečník', desc: 'První kilometry na kole, žádné riziko. Rovný terén, žádné technické překážky.' },
  { value: 'pokrocily', label: '🔵 Pokročilý biker', desc: 'Trochu praxe za sebou, základní technika jízdy. Zvládne mírné kopce a jednoduché terénní nerovnosti.' },
  { value: 'zkuseny', label: '🟠 Zkušený biker', desc: 'Technické sekce, slušná kondice, kořeny a kameny nejsou problém. Jezdí pravidelně a ví co dělá.' },
  { value: 'zabijak', label: '⚫ Zabijácký BIKER', desc: 'Jen pro ostřílené matadory. Pořádná dřina, technické výzvy, adrenalin na maximum. Slabší povahy ať raději jedou domů.' },
]

export default function AddTrail() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [routePoints, setRoutePoints] = useState<[number, number][]>([])
  const [gpxUrl, setGpxUrl] = useState('')
  const [gpxColor, setGpxColor] = useState(DEFAULT_TRAIL_COLOR)
  const [gpxPoints, setGpxPoints] = useState<[number, number][]>([])
  const [region, setRegion] = useState('')
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [previewKey, setPreviewKey] = useState(0)

  const [form, setForm] = useState({
    name: '',
    description: '',
    trail_type: 'singltrek',
    skill_level: 'zacatecnik',
    length_km: '',
    location_name: '',
    maps_url: '',
    website_url: '',
    is_official: true,
  })

  const isBikepark = form.trail_type === 'bikepark'

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) router.push('/login')
      else setUser(data.user)
    }

    getUser()
  }, [router])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleTrailTypeChange = (trailType: string) => {
    setForm((prev) => ({ ...prev, trail_type: trailType }))

    if (trailType !== 'bikepark') {
      setGpxColor(DEFAULT_TRAIL_COLOR)
      setPreviewKey((k) => k + 1)
    }
  }

  const handleGpxUpload = (url: string, points: [number, number][]) => {
    setGpxUrl(url)
    setGpxPoints(points)

    if (points.length > 0) {
      setRoutePoints([points[0]])
    } else {
      setRoutePoints([])
      setGpxPoints([])
      setGpxUrl('')
    }

    setPreviewKey((k) => k + 1)
  }

  const handleSubmit = async () => {
    if (!user) {
      setMessage('Nejsi přihlášený.')
      return
    }

    if (routePoints.length === 0) {
      setMessage('Označ start trailu na mapě nebo nahraj GPX soubor.')
      return
    }

    setLoading(true)
    setMessage('')

    const startPoint = routePoints[0]
    const primaryPhoto = photos.find((p) => p.is_primary) || photos[0] || null
    const finalGpxColor = isBikepark ? gpxColor : DEFAULT_TRAIL_COLOR

    const { data: trailData, error: trailError } = await supabase
      .from('trails')
      .insert({
        name: form.name,
        description: form.description,
        trail_type: form.trail_type,
        skill_level: form.skill_level,
        length_km: form.length_km ? parseFloat(form.length_km) : null,
        location_name: form.location_name,
        lat: startPoint[0],
        lng: startPoint[1],
        gpx_url: gpxUrl || null,
        gpx_color: finalGpxColor,
        photo_url: primaryPhoto?.url || null,
        maps_url: form.maps_url || null,
        website_url: form.website_url || null,
        is_official: form.is_official,
        region: region || null,
        created_by: user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (trailError) {
      setMessage('Chyba: ' + trailError.message)
      setLoading(false)
      return
    }

    if (photos.length > 0) {
      const photosToInsert = photos.map((p) => ({
        trail_id: trailData.id,
        url: p.url,
        is_primary: p.is_primary,
        display_order: p.display_order,
      }))

      const { error: photosError } = await supabase
        .from('trail_photos')
        .insert(photosToInsert)

      if (photosError) {
        console.error('Chyba při ukládání fotek:', photosError.message)
      }
    }

    setMessage('Místo bylo odesláno ke schválení! ✅')
    setLoading(false)

    setTimeout(() => router.push('/trails'), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Přidat místo</h1>
        <p className="text-gray-400 mb-8">
          Místo bude po odeslání čekat na schválení adminem.
        </p>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-6">
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

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Typ místa</label>
            <div className="flex flex-col gap-2">
              {trailTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTrailTypeChange(type.value)}
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

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Pro koho je vhodné</label>
            <div className="flex flex-col gap-2">
              {skillLevels.map((skill) => (
                <button
                  key={skill.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, skill_level: skill.value }))}
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

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Viditelnost</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, is_official: true }))}
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
                onClick={() => setForm((prev) => ({ ...prev, is_official: false }))}
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

          <GpxUpload onUpload={handleGpxUpload} />

          {isBikepark ? (
            <div>
              <label className="text-gray-400 text-sm mb-2 block">
                Barva trasy v bikeparku
              </label>

              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setGpxColor(color.value)
                      setPreviewKey((k) => k + 1)
                    }}
                    title={color.label}
                    style={{ backgroundColor: color.value }}
                    className={`w-10 h-10 rounded-full border-4 transition ${
                      gpxColor === color.value
                        ? 'border-orange-500 scale-110'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-600 text-xs mt-1">
                Vybraná: {colorOptions.find((c) => c.value === gpxColor)?.label}
              </p>

              <p className="text-gray-600 text-xs mt-1">
                Barvy používejte hlavně u bikeparků, kde bývají jednotlivé trasy značené podle obtížnosti nebo systému areálu.
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl px-4 py-3">
              <p className="text-gray-400 text-sm">
                Barva trasy
              </p>
              <p className="text-gray-600 text-xs mt-1">
                U tohoto typu místa se trasa zobrazí automaticky oranžově. Výběr barvy je dostupný jen pro bikepark.
              </p>
            </div>
          )}

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Poloha
              <span className="text-gray-600 ml-1">
                {gpxUrl ? '— trasa z GPX souboru' : '— klikni na mapu pro označení startu'}
              </span>
            </label>

            {gpxUrl && gpxPoints.length > 0 && routePoints.length > 0 ? (
              <div style={{ height: '380px', borderRadius: '12px', overflow: 'hidden' }}>
                <TrailMap
                  key={previewKey}
                  lat={routePoints[0][0]}
                  lng={routePoints[0][1]}
                  name={form.name || 'Nový trail'}
                  isOfficial={form.is_official}
                  gpxUrl={gpxUrl}
                  gpxColor={isBikepark ? gpxColor : DEFAULT_TRAIL_COLOR}
                />
              </div>
            ) : (
              <RouteMap
                points={routePoints}
                onChange={(pts, reg) => {
                  setRoutePoints(pts)
                  if (reg) setRegion(reg)
                }}
              />
            )}

            {routePoints.length > 0 && (
              <p className="text-gray-600 text-xs mt-1">
                📍 {routePoints[0][0].toFixed(5)}, {routePoints[0][1].toFixed(5)}
                {region && <span className="ml-2">· {region}</span>}
              </p>
            )}

            {gpxUrl && (
              <button
                type="button"
                onClick={() => {
                  setGpxUrl('')
                  setGpxPoints([])
                  setRoutePoints([])
                  setPreviewKey((k) => k + 1)
                }}
                className="mt-2 text-red-400 text-xs hover:text-red-300 transition"
              >
                ✕ Zrušit GPX a označit start ručně
              </button>
            )}
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Fotografie
              <span className="text-gray-600 ml-1">(nepovinné, max 10)</span>
            </label>

            <div className="bg-gray-800 rounded-xl p-4">
              <MultiImageUpload value={photos} onChange={setPhotos} maxPhotos={10} />
            </div>
          </div>

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
            <p className={`text-sm ${message.includes('✅') ? 'text-green-400' : 'text-orange-400'}`}>
              {message}
            </p>
          )}

          <button
            type="button"
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