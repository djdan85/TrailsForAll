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

export const riderDisciplines = Object.keys(riderDisciplineLabels) as RiderDiscipline[]

type Props = SVGProps<SVGSVGElement> & {
  discipline: RiderDiscipline | string
}

export default function RiderIcon({ discipline, ...props }: Props) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  const icon = (() => {
    switch (discipline) {
      case 'mtb':
        return <><path d="M3 17l5-7 3 4 2-3 8 6" /><circle cx="7" cy="18" r="3" /><circle cx="17" cy="18" r="3" /><path d="M7 18l4-6 3 6m-3-6h4l2 6M9 9h3" /></>
      case 'enduro':
        return <><path d="M2.5 18L8 9l3 4 2-3 8.5 8" /><circle cx="7" cy="18" r="2.8" /><circle cx="17" cy="18" r="2.8" /><path d="M7 18l4-6 3 6m-3-6h4l2 6M9 9h3" /></>
      case 'downhill':
        return <><path d="M5 5.5C8 2.5 14 2 18 5l2 4-5 2-1 7H8l-2-5-2-2 1-5.5Z" /><path d="M8 9h7l3-1M9 18v2m5-2v2" /></>
      case 'bikepark':
        return <><path d="M3 18h7l4-6h7v6" /><path d="M5 8h12M7 8v4m8-4v4" /><rect x="9" y="4" width="6" height="4" rx="1" /></>
      case 'pumptrack':
        return <><path d="M2 16c3 0 3-7 7-7s4 7 7 7 3-4 6-4" /><path d="M2 19h20" /></>
      case 'skatepark':
        return <><path d="M3 18h6c0-5 3-8 7-8h5" /><path d="M15 18h6V7h-5" /><path d="M4 14h4" /></>
      case 'bmx':
        return <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17l4-7 4 7m-4-7h5l3 7M8 7h4m3 0 2 3" /></>
      case 'skateboard':
        return <><path d="M4 14c1 2 3 3 5 3h6c2 0 4-1 5-3" /><path d="M5 13h14" /><circle cx="8" cy="18" r="1" /><circle cx="16" cy="18" r="1" /></>
      case 'scooter':
        return <><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /><path d="M7 18h8l2-9h3M17 9h3V5h-3" /><path d="M9 14h7" /></>
      default:
        return <><path d="M12 3l2.8 5.7L21 9.6l-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></>
    }
  })()

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common} {...props}>
      {icon}
    </svg>
  )
}
