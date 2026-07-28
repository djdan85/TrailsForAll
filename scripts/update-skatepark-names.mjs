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
const genericNames = new Set(['skatepark bez názvu', 'skatepark', 'skate park'])

function pickPlace(address = {}) {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.suburb ||
    address.city_district ||
    null
  )
}

async function reverseGeocode(lat, lng) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('zoom', '14')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', 'cs')

  const response = await fetch(url, {
    headers: {
      'user-agent': 'TrailsForAll skatepark name updater (pasek-art.cz)',
      accept: 'application/json',
    },
  })

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.json()
}

async function main() {
  const { data, error } = await supabase
    .from('trails')
    .select('id,name,location_name,lat,lng')
    .eq('trail_type', 'skatepark')
    .eq('source', 'openstreetmap')
    .eq('status', 'approved')

  if (error) throw error

  const rows = (data ?? []).filter(
    (row) => genericNames.has(String(row.name ?? '').trim().toLowerCase()) && Number.isFinite(row.lat) && Number.isFinite(row.lng),
  )

  console.log(`Generických názvů k prověření: ${rows.length}`)

  let changed = 0
  let skipped = 0
  let failed = 0

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]

    try {
      const result = await reverseGeocode(row.lat, row.lng)
      const countryCode = String(result.address?.country_code ?? '').toLowerCase()
      const place = pickPlace(result.address)

      if (countryCode !== 'cz' || !place) {
        skipped += 1
        console.log(`${index + 1}/${rows.length}: přeskočeno (${row.lat}, ${row.lng})`)
      } else {
        const newName = `Skatepark ${place}`
        console.log(`${index + 1}/${rows.length}: ${row.name} -> ${newName}`)

        if (!DRY_RUN) {
          const { error: updateError } = await supabase
            .from('trails')
            .update({ name: newName, location_name: place })
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

  console.log(`Nalezený název obce: ${changed}`)
  console.log(`Přeskočeno: ${skipped}`)
  console.log(`Chyby: ${failed}`)
  console.log(DRY_RUN ? 'DRY_RUN je zapnutý. Nic se nezměnilo.' : 'Aktualizace názvů dokončena.')
}

main().catch((error) => {
  console.error('Aktualizace selhala:', error)
  process.exit(1)
})
