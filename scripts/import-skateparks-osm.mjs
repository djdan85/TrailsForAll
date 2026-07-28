import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const IMPORT_CREATED_BY = process.env.IMPORT_CREATED_BY
const DRY_RUN = process.env.DRY_RUN !== 'false'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !IMPORT_CREATED_BY) {
  console.error('Chybí SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY nebo IMPORT_CREATED_BY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const regions = [
  { name: 'severozapad', bbox: '49.75,12.00,51.10,15.55' },
  { name: 'severovychod', bbox: '49.75,15.40,51.10,18.90' },
  { name: 'jihozapad', bbox: '48.50,12.00,49.85,15.55' },
  { name: 'jihovychod', bbox: '48.50,15.40,49.85,18.90' },
]

const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

function buildQuery(bbox) {
  return `[out:json][timeout:120];
(
  nwr["leisure"="skate_park"](${bbox});
  nwr["leisure"="skatepark"](${bbox});
  nwr["leisure"="pitch"]["sport"~"(^|;)skateboard(;|$)"](${bbox});
);
out center tags;`
}

async function fetchRegion(region) {
  const body = new URLSearchParams({ data: buildQuery(region.bbox) })

  for (const endpoint of overpassEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'user-agent': 'TrailsForAll skatepark importer',
        },
        body,
      })

      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      const data = await response.json()
      console.log(`${region.name}: ${data.elements?.length ?? 0} prvků`)
      return data.elements ?? []
    } catch (error) {
      console.warn(`${region.name}: endpoint ${endpoint} selhal: ${error.message}`)
    }
  }

  throw new Error(`Nepodařilo se stáhnout oblast ${region.name}.`)
}

function normalizeElement(element) {
  const lat = element.lat ?? element.center?.lat
  const lng = element.lon ?? element.center?.lon
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const tags = element.tags ?? {}
  const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || ''
  const name = String(tags.name || (city ? `Skatepark ${city}` : 'Skatepark bez názvu')).trim()
  const sourceId = `${element.type}/${element.id}`

  return {
    name,
    description: 'Skatepark importovaný z OpenStreetMap. Údaje může komunita doplnit nebo opravit.',
    trail_type: 'skatepark',
    skill_level: 'zacatecnik',
    length_km: null,
    location_name: city || 'Česká republika',
    lat,
    lng,
    gpx_url: null,
    gpx_color: '#f97316',
    photo_url: null,
    maps_url: `https://www.openstreetmap.org/${sourceId}`,
    website_url: tags.website || tags['contact:website'] || null,
    is_official: true,
    region: tags['addr:region'] || null,
    created_by: IMPORT_CREATED_BY,
    status: 'approved',
    source: 'openstreetmap',
    source_id: sourceId,
    source_url: `https://www.openstreetmap.org/${sourceId}`,
  }
}

function distanceMeters(a, b) {
  const earthRadius = 6371000
  const toRad = (value) => (value * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earthRadius * Math.asin(Math.sqrt(h))
}

function deduplicate(items) {
  const bySource = new Map()
  for (const item of items) bySource.set(item.source_id, item)

  const unique = []
  for (const item of bySource.values()) {
    const duplicate = unique.find(
      (existing) =>
        distanceMeters(existing, item) <= 80 &&
        (existing.name.toLowerCase() === item.name.toLowerCase() ||
          existing.name === 'Skatepark bez názvu' ||
          item.name === 'Skatepark bez názvu'),
    )
    if (!duplicate) unique.push(item)
  }
  return unique
}

async function loadExisting() {
  const { data, error } = await supabase
    .from('trails')
    .select('id,name,lat,lng,source,source_id')
    .eq('trail_type', 'skatepark')

  if (error) throw error
  return data ?? []
}

function removeExisting(imported, existing) {
  const knownSourceIds = new Set(existing.map((item) => item.source_id).filter(Boolean))
  return imported.filter((item) => {
    if (knownSourceIds.has(item.source_id)) return false
    return !existing.some((saved) => {
      if (!Number.isFinite(saved.lat) || !Number.isFinite(saved.lng)) return false
      return distanceMeters(item, saved) <= 80
    })
  })
}

async function insertBatches(rows) {
  const batchSize = 100
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize)
    const { error } = await supabase.from('trails').insert(batch)
    if (error) throw error
    console.log(`Uloženo ${Math.min(offset + batch.length, rows.length)} / ${rows.length}`)
  }
}

async function main() {
  const allElements = []
  for (const region of regions) {
    allElements.push(...(await fetchRegion(region)))
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  const normalized = allElements.map(normalizeElement).filter(Boolean)
  const deduplicated = deduplicate(normalized)
  const existing = await loadExisting()
  const newRows = removeExisting(deduplicated, existing)

  console.log(`Staženo: ${allElements.length}`)
  console.log(`Platné body: ${normalized.length}`)
  console.log(`Po odstranění duplicit: ${deduplicated.length}`)
  console.log(`Již existuje: ${deduplicated.length - newRows.length}`)
  console.log(`K importu: ${newRows.length}`)

  if (DRY_RUN) {
    console.log('DRY_RUN je zapnutý. Do databáze se nic nezapsalo.')
    console.table(newRows.slice(0, 20).map(({ name, lat, lng, source_id }) => ({ name, lat, lng, source_id })))
    return
  }

  await insertBatches(newRows)
  console.log('Import dokončen.')
}

main().catch((error) => {
  console.error('Import selhal:', error)
  process.exit(1)
})
