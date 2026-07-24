'use client'

import type { ImgHTMLAttributes } from 'react'

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

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  discipline: RiderDiscipline | string
  alt?: string
}

function isRiderDiscipline(value: string): value is RiderDiscipline {
  return value in riderDisciplineLabels
}

export default function RiderIcon({ discipline, alt = '', className = '', ...props }: Props) {
  const resolvedDiscipline: RiderDiscipline = isRiderDiscipline(discipline) ? discipline : 'other'

  return (
    <img
      src={`/rider-icons/${resolvedDiscipline}.png`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      className={`object-contain select-none ${className}`}
      {...props}
    />
  )
}
