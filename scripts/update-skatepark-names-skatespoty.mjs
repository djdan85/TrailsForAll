import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DRY_RUN = process.env.DRY_RUN !== 'false'
const MAX_DISTANCE_METERS = Number(process.env.MAX_MATCH_DISTANCE_METERS || 350)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const genericNames = new Set(['skatepark bez názvu', 'skatepark', 'skate park'])

function stripHtml(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
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

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'TrailsForAll skatepark name matcher (contact: pasek-art.cz)' },
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.text()
}

function extractSpotLinks(html) {
  const links = new Set()
  for (const match of html.matchAll(/href=["'](\/spot\/[a-z0-9-]+)["']/gi)) {
    links.add(`https://skatespoty.cz${match[1]}`)
  }
  return [...links]
}

function extractName(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  return match ? stripHtml(match[1]) : null
}

function extractAddress(html) {
  const text = stripHtml(html)
  const match = text.match(/([^|]{4,140},\s*\d{3}\s*\d{2}[^|]{0,100}Czechia)/i)
  return match ? match[1].trim() : null
}

async function geocodeAddress(address) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'cz')
  url.searchParams.set('q', address)
  const response = await fetch(url, {
    headers: { 'user-agent': 'TrailsForAll skatepark name matcher (contact: pasek-art.cz)' },
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  const data = await response.json()
  if (!data[0]) return null
  return { lat: Number(data[0].lat), lng: Number(data[0].lon) }
}

async function loadGenericSkateparks() {
  const { data, error } = await supabase
    .from('trails')
    .select('id,name,lat,lng,source')
    .eq('trail_type', 'skatepark')
    .eq('source', 'openstreetmap')
    .eq('status', 'approved')

  if (error) throw error
  return (data || []).filter((item) => genericNames.has(String(item.name || '').trim().toLowerCase()))
}

async function main() {
  const generic = await loadGenericSkateparks()
  console.log(`Generických názvů v databázi: ${generic.length}`)

  const indexHtml = await fetchText('https://skatespoty.cz/location/Czechia')
  const links = extractSpotLinks(indexHtml)
  console.log(`Nalezených detailů na skatespoty.cz: ${links.length}`)

  const candidates = []
  for (let index = 0; index < links.length; index += 1) {
    const link = links[index]
    try {
      const html = await fetchText(link)
      const name = extractName(html)
      const address = extractAddress(html)
      if (!name || !address || !name.toLowerCase().includes('skate')) continue
      await sleep(1100)
      const point = await geocodeAddress(address)
      if (!point) continue
      candidates.push({ name, address, url: link, ...point })
      console.log(`${index + 1}/${links.length}: ${name}`)
    } catch (error) {
      console.warn(`${link}: ${error.message}`)
    }
    await sleep(500)
  }

  const proposals = []
  const usedTrailIds = new Set()
  for (const candidate of candidates) {
    let best = null
    for (const trail of generic) {
      if (usedTrailIds.has(trail.id)) continue
      const distance = distanceMeters(candidate, trail)
      if (!best || distance < best.distance) best = { trail, distance }
    }
    if (best && best.distance <= MAX_DISTANCE_METERS) {
      proposals.push({
        id: best.trail.id,
        old_name: best.trail.name,
        new_name: candidate.name,
        distance_m: Math.round(best.distance),
        source_url: candidate.url,
      })
      usedTrailIds.add(best.trail.id)
    }
  }

  proposals.sort((a, b) => a.distance_m - b.distance_m)
  console.table(proposals)
  console.log(`Navržených změn: ${proposals.length}`)
  console.log(`Limit vzdálenosti: ${MAX_DISTANCE_METERS} m`)

  if (DRY_RUN) {
    console.log('DRY_RUN je zapnutý. Nic se nezměnilo.')
    return
  }

  for (let index = 0; index < proposals.length; index += 1) {
    const proposal = proposals[index]
    const { error } = await supabase
      .from('trails')
      .update({ name: proposal.new_name })
      .eq('id', proposal.id)
    if (error) throw error
    console.log(`Aktualizováno ${index + 1}/${proposals.length}: ${proposal.new_name}`)
  }

  console.log('Hromadná aktualizace názvů dokončena.')
}

main().catch((error) => {
  console.error('Aktualizace selhala:', error)
  process.exit(1)
})
