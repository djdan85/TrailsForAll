'use client'

import type { SVGProps } from 'react'

export type RiderDiscipline =
  | 'mtb'
  | 'enduro'
  | 'downhill'
  | 'bikepark'
  | 'pumptrack'
  | 'skatepark'
  | 'bmx'
  | 'skateboard'
  | 'scooter'
  | 'other'

export const riderDisciplineLabels: Record<RiderDiscipline, string> = {
  mtb: 'MTB / Trail',
  enduro: 'Enduro',
  downhill: 'Downhill',
  bikepark: 'Bikepark',
  pumptrack: 'Pumptrack',
  skatepark: 'Skatepark',
  bmx: 'BMX',
  skateboard: 'Skateboard',
  scooter: 'Freestyle koloběžka',
  other: 'Jiné',
}

export const riderDisciplineColors: Record<RiderDiscipline, string> = {
  mtb: '#65d52e',
  enduro: '#ff7a00',
  downhill: '#ff4057',
  bikepark: '#a970ff',
  pumptrack: '#10c9e8',
  skatepark: '#ffc53d',
  bmx: '#12d8d2',
  skateboard: '#ff4f8b',
  scooter: '#a970ff',
  other: '#9aa9bd',
}

export const riderDisciplines = Object.keys(riderDisciplineLabels) as RiderDiscipline[]

type Props = SVGProps<SVGSVGElement> & {
  discipline: RiderDiscipline | string
}

export default function RiderIcon({ discipline, ...props }: Props) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    vectorEffect: 'non-scaling-stroke' as const,
  }

  const icon = (() => {
    switch (discipline) {
      case 'mtb':
        return <>
          <path d="M7 49h50M10 42l6-11 5 7 7-15 7 10 7-18 12 27" opacity=".55" />
          <path d="M9 34l5-9 5 9M12 29h4M48 29l5-10 5 10M51 24h4" />
          <circle cx="22" cy="43" r="8" /><circle cx="46" cy="43" r="8" />
          <path d="M22 43l9-15 8 15m-8-15h10l5 15M27 23h8l5 5M31 28l-5 8M39 28l4-5" />
          <circle cx="34" cy="18" r="4" /><path d="M34 22l-3 6" />
        </>
      case 'enduro':
        return <>
          <path d="M5 50c10-5 18-8 28-8 11 0 19 4 26 8M7 54h50" opacity=".5" />
          <circle cx="22" cy="43" r="8" /><circle cx="47" cy="43" r="8" />
          <path d="M22 43l10-15 8 15m-8-15h10l5 15M26 25h10l6 5M31 28l-5 8M40 29l5-5" />
          <circle cx="35" cy="18" r="4" /><path d="M35 22l-4 6M13 36h-6m8 5H8m43-8h6" />
          <path d="M8 47l4-2m43 2-4-2" opacity=".65" />
        </>
      case 'downhill':
        return <>
          <path d="M5 51c13-2 23-7 31-14 8-7 14-13 23-14" opacity=".55" />
          <circle cx="23" cy="43" r="8" /><circle cx="47" cy="43" r="8" />
          <path d="M23 43l10-14 7 14m-7-14h9l5 14M28 25h10l6 5M33 29l-6 7" />
          <path d="M32 13c5-4 12-2 14 3l-2 6-8 1-5-5 1-5Z" /><path d="M39 23l-5 7M45 17l5 2" />
          <path d="M7 32h8M4 38h10M52 31h7" opacity=".7" />
        </>
      case 'bikepark':
        return <>
          <path d="M5 50h54M7 45h12l10-14h12l8 14h10" />
          <path d="M10 39h8l8-11M42 32h8l6 13" opacity=".6" />
          <path d="M8 15h27M11 15v8m21-8v8" />
          <rect x="18" y="9" width="11" height="9" rx="2" />
          <path d="M42 12l8 5-8 5M50 17h8" />
          <circle cx="31" cy="38" r="4" /><circle cx="43" cy="38" r="4" /><path d="M31 38l5-7 4 7m-4-7h5l2 7" />
        </>
      case 'pumptrack':
        return <>
          <path d="M4 47c8 0 8-17 18-17s10 17 20 17 8-12 18-12" />
          <path d="M4 53h56" opacity=".55" />
          <circle cx="28" cy="31" r="5" /><circle cx="43" cy="31" r="5" /><path d="M28 31l6-9 5 9m-5-9h6l3 9" />
          <circle cx="36" cy="14" r="3.5" /><path d="M36 18l-2 4M17 23c3-5 7-8 12-10M47 22c4 1 7 3 10 6" opacity=".7" />
        </>
      case 'skatepark':
        return <>
          <path d="M4 50h56" />
          <path d="M6 45h16c0-9 5-15 14-15h8" />
          <path d="M38 45h20V17H47M46 24h12M46 31h12" />
          <path d="M8 38h10M10 34h8" opacity=".6" />
          <path d="M21 27h17M25 27v6m9-6v6" />
          <path d="M47 17l6-6" />
        </>
      case 'bmx':
        return <>
          <circle cx="20" cy="43" r="9" /><circle cx="47" cy="43" r="9" />
          <path d="M20 43l10-16 9 16m-9-16h11l6 16M25 24h10l7 5M30 27l-6 9M40 28l5-6" />
          <circle cx="34" cy="15" r="4" /><path d="M34 19l-4 8M12 27h8M8 33h8M51 27h7" />
          <path d="M34 22l8 6" />
        </>
      case 'skateboard':
        return <>
          <path d="M8 35c2 8 8 12 17 12h15c8 0 13-4 16-12" />
          <path d="M10 34h44M15 29c8 2 16 2 24 0 6-2 11-5 15-9" opacity=".55" />
          <circle cx="22" cy="50" r="3" /><circle cx="44" cy="50" r="3" />
          <path d="M19 42v5m28-5v5M13 24h5m33 7h8m-5 5h6" />
        </>
      case 'scooter':
        return <>
          <circle cx="18" cy="47" r="6" /><circle cx="48" cy="47" r="6" />
          <path d="M18 47h20l8-25h8M46 22h8V10h-7M33 39h10" />
          <path d="M24 41h14l3-8M45 10h11" />
          <path d="M8 34h8M5 40h8M53 37h7" opacity=".65" />
        </>
      default:
        return <>
          <path d="M32 7l7.4 15 16.6 2.4-12 11.7 2.8 16.5L32 44.8 17.2 52.6 20 36.1 8 24.4 24.6 22 32 7Z" />
          <path d="M32 17v20M22 27h20" opacity=".45" />
        </>
    }
  })()

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...common} {...props}>
      {icon}
    </svg>
  )
}
