'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./components/Map'), { ssr: false })

export default function Home() {
  const [trails, setTrails] = useState<any[]>([])

  useEffect(() => {
    const fetchTrails = async () => {
      const { data, error } = await supabase
        .from('trails')
        .select('*')
        .eq('status', 'approved')
      
      if (error) console.error(error)
      else setTrails(data || [])
    }

    fetchTrails()
  }, [])

  return (
    <main className="w-full h-screen">
      <Map trails={trails} />
    </main>
  )
}