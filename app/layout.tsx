<<<<<<< HEAD
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Trails for All',
  description: 'Komunitní mapa trailů pro bikery',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
=======
import { ClerkProvider } from '@clerk/nextjs'; 
import './global.css'; 
 
export const metadata = { 
  title: 'TrailsForAll', 
  description: 'Discover and share hiking trails in CZ, SK, and more!', 
  manifest: '/manifest.json', 
}; 
 
export default function RootLayout({ 
  children, 
}: { 
  children: React.ReactNode; 
}) { 
  return ( 
>>>>>>> 59562808d512318ac5e266f14a554445f91e22f6
