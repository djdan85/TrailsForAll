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

function Bike({ x = 0, y = 0, scale = 1, wheelie = false }: { x?: number; y?: number; scale?: number; wheelie?: boolean }) {
  const transform = `translate(${x} ${y}) scale(${scale})${wheelie ? ' rotate(-18 42 48)' : ''}`
  return (
    <g transform={transform}>
      <circle cx="24" cy="55" r="13" />
      <circle cx="67" cy="55" r="13" />
      <path d="M24 55l16-25 15 25M40 30h15l12 25M31 27h17l10 7M40 30L29 46M55 34l10-10" />
      <circle cx="47" cy="12" r="7" />
      <path d="M47 19l-7 13 14 5 8-8M40 31l-12 11M53 37l-2 10M43 20l-11 7M52 20l9 4" />
    </g>
  )
}

export default function RiderIcon({ discipline, ...props }: Props) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    vectorEffect: 'non-scaling-stroke' as const,
  }

  const icon = (() => {
    switch (discipline) {
      case 'mtb':
        return <>
          <path d="M3 78h154M6 72c18-6 34-7 50-4 19 4 40 4 58-2 15-5 29-4 43 2" opacity=".65" />
          <path d="M9 58l12-20 12 20M15 48h12M17 42h8M127 60l11-20 12 20M132 51h12M134 45h8" />
          <path d="M31 59l19-29 16 22 15-27 27 33" opacity=".7" />
          <path d="M45 64c7-5 14-7 22-6M104 65c8-4 16-4 24-1" opacity=".7" />
          <Bike x={35} y={12} scale={.92} />
        </>
      case 'enduro':
        return <>
          <path d="M2 76c21-15 43-21 66-20 28 1 51 9 89 20" />
          <path d="M6 68l14-3m-9 9 18-4M111 64l13 5m-7-10 18 7M132 72l10 3" opacity=".65" />
          <path d="M25 61c7-7 15-12 24-15M102 57c10 1 19 4 29 10" opacity=".45" />
          <Bike x={40} y={8} scale={.9} />
        </>
      case 'downhill':
        return <>
          <path d="M3 74c25-2 46-7 65-17 19-11 35-24 50-38 12 1 24 3 39 8" opacity=".7" />
          <path d="M3 34h22M1 43h17M9 52h20M126 37h21" opacity=".65" />
          <path d="M35 69c10-3 18-7 26-12M113 47c9-3 17-3 27 0" opacity=".5" />
          <g transform="translate(42 8) scale(.9)">
            <circle cx="24" cy="55" r="13" /><circle cx="67" cy="55" r="13" />
            <path d="M24 55l17-24 14 24M41 31h15l11 24M32 28h17l10 7M41 31L30 47M55 35l11-10" />
            <path d="M40 8c9-7 20-4 24 4l-3 10-13 2-10-8 2-8Z" />
            <path d="M47 24l-7 10 15 4 9-8M40 34L29 45M55 38l-3 10M61 13l10 4" />
          </g>
        </>
      case 'bikepark':
        return <>
          <path d="M3 77h154M8 70h28l19-24h25l18 24h24l18-28h17" />
          <path d="M11 63h20l18-22M101 64h16l18-27" opacity=".65" />
          <path d="M8 19h86M15 19v15m70-15v15" />
          <rect x="46" y="12" width="22" height="17" rx="3" />
          <path d="M111 18l18 10-18 10M129 28h25" />
          <g transform="translate(42 32) scale(.55) rotate(-7 42 48)"><Bike /></g>
        </>
      case 'pumptrack':
        return <>
          <path d="M2 68c14 0 15-25 34-25s20 25 38 25 20-31 40-31 20 31 43 31" />
          <path d="M2 77h155M10 61c8-2 15-1 22 3M82 62c9-4 17-4 25-1M132 59c8 1 14 4 20 8" opacity=".55" />
          <g transform="translate(53 10) scale(.62)"><Bike /></g>
        </>
      case 'skatepark':
        return <>
          <path d="M2 77h156" />
          <path d="M6 70h36c0-18 10-31 29-31h18" />
          <path d="M89 70h66V18h-23M132 28h23M132 39h23" />
          <path d="M8 61h27M13 54h22M18 47h18" opacity=".6" />
          <path d="M69 27h38M75 27v13m25-13v13M133 18l13-13" />
          <rect x="25" y="65" width="14" height="6" rx="1" />
        </>
      case 'bmx':
        return <>
          <path d="M4 70h153M3 49h24M9 58h20M126 45h26M134 55h20" opacity=".65" />
          <g transform="translate(39 5) scale(.95) rotate(-17 42 48)"><Bike /></g>
        </>
      case 'skateboard':
        return <>
          <path d="M20 45c4 14 15 21 33 21h51c17 0 29-7 35-21" />
          <path d="M23 43h112M30 35c19 5 37 5 54 1 17-4 31-12 43-24" opacity=".7" />
          <circle cx="52" cy="72" r="5" /><circle cx="109" cy="72" r="5" />
          <path d="M45 61v9m70-9v9M13 30h15m105 7h22m-13 10h15" opacity=".75" />
          <path d="M52 32l8-4m13 6 7-3m15 0 7-4" opacity=".55" />
        </>
      case 'scooter':
        return <>
          <circle cx="37" cy="68" r="11" /><circle cx="116" cy="68" r="11" />
          <path d="M37 68h54l20-48h24M111 20h24V5h-20M75 54h28" />
          <path d="M50 58h38l7-17M111 5h29" />
          <path d="M5 48h25M1 58h24M126 45h29M132 55h22" opacity=".65" />
          <path d="M18 65c5-6 10-8 18-8M118 57c8 0 14 3 20 9" opacity=".5" />
        </>
      default:
        return <>
          <path d="M80 6l17 35 39 6-28 27 7 39-35-18-35 18 7-39-28-27 39-6L80 6Z" transform="translate(0 -14) scale(1 .88)" />
        </>
    }
  })()

  return (
    <svg viewBox="0 0 160 90" aria-hidden="true" {...common} {...props}>
      {icon}
    </svg>
  )
}
