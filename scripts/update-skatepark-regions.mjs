import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DRY_RUN = process.env.DRY_RUN !== 'false'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const regionAliases = new Map([
  ['Hlavní město Praha', 'Hlavní město Praha'],
  ['Praha', 'Hlavní město Praha'],
  ['Praha, hlavní město', 'Hlavní město Praha'],
  ['Středočeský kraj', 'Středočeský kraj'],
  ['Jihočeský kraj', 'Jihočeský kraj'],
  ['Plzeňský kraj', 'Plzeňský kraj'],
  ['Karlovarský kraj', 'Karlovarský kraj'],
  ['Ústecký kraj', 'Ústecký kraj'],
  ['Liberecký kraj', 'Liberecký kraj'],
  ['Královéhradecký kraj', 'Královéhradecký kraj'],
  ['Pardubický kraj', 'Pardubický kraj'],
  ['Kraj Vysočina', 'Kraj Vysočina'],
  ['Vysočina', 'Kraj Vysočina'],
  ['Jihomoravský kraj', 'Jihomoravský kraj'],
  ['Olomoucký kraj', 'Olomoucký kraj'],
  ['Moravskoslezský kraj', 'Moravskoslezský kraj'],
  ['Zlínský kraj', 'Zlínský kraj'],
])

async function reverseGeocode(lat, lng) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('zoom', '8')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', 'cs')

  const response = await fetch(url, {
    headers: {
      'user-agent': 'TrailsForAll skatepark region updater (pasek-art.cz)',
      accept: 'application/json',
    },
  })

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.json()
}

function pickRegion(address = {}) {
  const candidates = [
    address.state,
    address.region,
    address.state_district,
    address.city,
    address.municipality,
  ]

  for (const value of candidates) {
    if (!value) continue
    const normalized = String(value).trim()
    const mapped = regionAliases.get(normalized)
    if (mapped) return mapped

    if (/^(hlavní město )?praha$/i.test(normalized) || /praha,\s*hlavní město/i.test(normalized)) {
      return 'Hlavní město Praha'
    }
  }

  return null
}

async function main() {
  const { data, error } = await supabase
    .from('trails')
    .select('id,name,region,lat,lng')
    .eq('trail_type', 'skatepark')
    .eq('source', 'openstreetmap')
    .eq('status', 'approved')

  if (error) throw error

  const rows = (data ?? []).filter(
    (row) => !row.region && Number.isFinite(row.lat) && Number.isFinite(row.lng),
  )

  console.log(`Skateparků bez kraje: ${rows.length}`)

  let changed = 0
  let skipped = 0
  let failed = 0

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]

    try {
      const result = await reverseGeocode(row.lat, row.lng)
      const countryCode = String(result.address?.country_code ?? '').toLowerCase()
      const region = pickRegion(result.address)

      if (countryCode !== 'cz' || !region) {
        skipped += 1
        console.log(`${index + 1}/${rows.length}: přeskočeno ${row.name} (${row.lat}, ${row.lng})`)
      } else {
        console.log(`${index + 1}/${rows.length}: ${row.name} -> ${region}`)

        if (!DRY_RUN) {
          const { error: updateError } = await supabase
            .from('trails')
            .update({ region })
            .eq('id', row.id)

          if (updateError) throw updateError
        }

        changed += 1
      }
    } catch (error) {
      failed += 1
      console.warn(`${index + 1}/${rows.length}: chyba: ${error.message}`)
    }

    await sleep(1200)
  }

  console.log(`Nalezený kraj: ${changed}`)
  console.log(`Přeskočeno: ${skipped}`)
  console.log(`Chyby: ${failed}`)
  console.log(DRY_RUN ? 'DRY_RUN je zapnutý. Nic se nezměnilo.' : 'Aktualizace krajů dokončena.')
}

main().catch((error) => {
  console.error('Aktualizace krajů selhala:', error)
  process.exit(1)
})