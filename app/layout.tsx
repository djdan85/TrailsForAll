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
