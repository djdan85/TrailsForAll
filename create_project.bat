@echo off
mkdir app\api\trails\filters app\api\trails\[id] app\api\reviews app\api\upload app\api\stats app\admin app\trail\[id] app\trail\new app\rules app\gdpr components public\icons lib

echo { > package.json
echo   "name": "trailsforall", >> package.json
echo   "version": "0.1.0", >> package.json
echo   "private": true, >> package.json
echo   "scripts": { >> package.json
echo     "dev": "next dev", >> package.json
echo     "build": "next build", >> package.json
echo     "start": "next start", >> package.json
echo     "lint": "next lint" >> package.json
echo   }, >> package.json
echo   "dependencies": { >> package.json
echo     "@clerk/nextjs": "^5.0.0", >> package.json
echo     "@vercel/postgres": "^0.7.2", >> package.json
echo     "@vercel/analytics": "^1.0.0", >> package.json
echo     "@we-gold/gpxjs": "^0.3.1", >> package.json
echo     "leaflet": "^1.9.4", >> package.json
echo     "next": "15.0.0", >> package.json
echo     "react": "^18", >> package.json
echo     "react-dom": "^18", >> package.json
echo     "react-leaflet": "^4.2.1", >> package.json
echo     "react-bottom-sheet": "^1.0.4", >> package.json
echo     "react-cookie-consent": "^8.0.1" >> package.json
echo   }, >> package.json
echo   "devDependencies": { >> package.json
echo     "@types/leaflet": "^1.9.8", >> package.json
echo     "@types/node": "^20", >> package.json
echo     "@types/react": "^18", >> package.json
echo     "@types/react-dom": "^18", >> package.json
echo     "eslint": "^8", >> package.json
echo     "eslint-config-next": "15.0.0", >> package.json
echo     "next-pwa": "^5.6.0", >> package.json
echo     "postcss": "^8", >> package.json
echo     "tailwindcss": "^3.4.1", >> package.json
echo     "typescript": "^5" >> package.json
echo   } >> package.json
echo } >> package.json

echo const withPWA = require('next-pwa')({ >> next.config.js
echo   dest: 'public', >> next.config.js
echo   register: true, >> next.config.js
echo   skipWaiting: true, >> next.config.js
echo }); >> next.config.js
echo. >> next.config.js
echo module.exports = withPWA({ >> next.config.js
echo   reactStrictMode: true, >> next.config.js
echo }); >> next.config.js

echo { >> tsconfig.json
echo   "compilerOptions": { >> tsconfig.json
echo     "target": "es5", >> tsconfig.json
echo     "lib": ["dom", "dom.iterable", "esnext"], >> tsconfig.json
echo     "allowJs": true, >> tsconfig.json
echo     "skipLibCheck": true, >> tsconfig.json
echo     "strict": true, >> tsconfig.json
echo     "forceConsistentCasingInFileNames": true, >> tsconfig.json
echo     "noEmit": true, >> tsconfig.json
echo     "esModuleInterop": true, >> tsconfig.json
echo     "module": "esnext", >> tsconfig.json
echo     "moduleResolution": "node", >> tsconfig.json
echo     "resolveJsonModule": true, >> tsconfig.json
echo     "isolatedModules": true, >> tsconfig.json
echo     "jsx": "preserve", >> tsconfig.json
echo     "incremental": true, >> tsconfig.json
echo     "baseUrl": ".", >> tsconfig.json
echo     "paths": { >> tsconfig.json
echo       "@/*": ["./*"] >> tsconfig.json
echo     } >> tsconfig.json
echo   }, >> tsconfig.json
echo   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"], >> tsconfig.json
echo   "exclude": ["node_modules"] >> tsconfig.json
echo } >> tsconfig.json

echo /** @type {import('tailwindcss').Config} */ > tailwind.config.js
echo module.exports = { >> tailwind.config.js
echo   content: [ >> tailwind.config.js
echo     './app/**/*.{js,ts,jsx,tsx}', >> tailwind.config.js
echo     './components/**/*.{js,ts,jsx,tsx}', >> tailwind.config.js
echo   ], >> tailwind.config.js
echo   theme: { >> tailwind.config.js
echo     extend: {}, >> tailwind.config.js
echo   }, >> tailwind.config.js
echo   plugins: [], >> tailwind.config.js
echo } >> tailwind.config.js

echo # Clerk > .env.local
echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key >> .env.local
echo CLERK_SECRET_KEY=your_clerk_secret_key >> .env.local
echo. >> .env.local
echo # Vercel Postgres >> .env.local
echo POSTGRES_URL=your_postgres_url >> .env.local
echo POSTGRES_PRISMA_URL=your_postgres_prisma_url >> .env.local
echo POSTGRES_URL_NO_SSL=your_postgres_url_no_ssl >> .env.local
echo POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling >> .env.local
echo POSTGRES_USER=your_postgres_user >> .env.local
echo POSTGRES_HOST=your_postgres_host >> .env.local
echo POSTGRES_PASSWORD=your_postgres_password >> .env.local
echo POSTGRES_DATABASE=your_postgres_database >> .env.local
echo. >> .env.local
echo # Admin heslo >> .env.local
echo ADMIN_PASSWORD=your_secure_admin_password >> .env.local
echo. >> .env.local
echo # Invite code pro testovací provoz >> .env.local
echo INVITE_CODE=test123 >> .env.local
echo. >> .env.local
echo # Vercel Analytics >> .env.local
echo NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id >> .env.local

echo node_modules > .gitignore
echo .env.local >> .gitignore
echo .env.development.local >> .gitignore
echo .env.test.local >> .gitignore
echo .env.production.local >> .gitignore
echo .next >> .gitignore
echo out >> .gitignore

echo @tailwind base; > app\global.css
echo @tailwind components; >> app\global.css
echo @tailwind utilities; >> app\global.css
echo. >> app\global.css
echo @import 'leaflet/dist/leaflet.css'; >> app\global.css
echo. >> app\global.css
echo body { >> app\global.css
echo   margin: 0; >> app\global.css
echo   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; >> app\global.css
echo } >> app\global.css

echo import { ClerkProvider } from '@clerk/nextjs'; > app\layout.tsx
echo import './global.css'; >> app\layout.tsx
echo. >> app\layout.tsx
echo export const metadata = { >> app\layout.tsx
echo   title: 'TrailsForAll', >> app\layout.tsx
echo   description: 'Discover and share hiking trails in CZ, SK, and more!', >> app\layout.tsx
echo   manifest: '/manifest.json', >> app\layout.tsx
echo }; >> app\layout.tsx
echo. >> app\layout.tsx
echo export default function RootLayout({ >> app\layout.tsx
echo   children, >> app\layout.tsx
echo }: { >> app\layout.tsx
echo   children: React.ReactNode; >> app\layout.tsx
echo }) { >> app\layout.tsx
echo   return ( >> app\layout.tsx
echo     <ClerkProvider> >> app\layout.tsx
echo       <html lang="cs"> >> app\layout.tsx
echo         <head> >> app\layout.tsx
echo           <meta name="viewport" content="width=device-width, initial-scale=1" /> >> app\layout.tsx
echo           <meta name="theme-color" content="#000000" /> >> app\layout.tsx
echo         </head> >> app\layout.tsx
echo         <body> >> app\layout.tsx
echo           {children} >> app\layout.tsx
echo           <footer className="p-4 text-center"> >> app\layout.tsx
echo             <a href="/rules" className="mx-2">Kodex chování</a> |  >> app\layout.tsx
echo             <a href="/gdpr" className="mx-2">GDPR</a> |  >> app\layout.tsx
echo             <a href="mailto:dalibor.pasek@gmail.com" className="mx-2">Kontakt</a> >> app\layout.tsx
echo             <div id="ad-slot" className="mt-4"> >> app\layout.tsx
echo               <a href="https://example.com/affiliate?ref=trailsforall">Kupte vybavení na túry</a> >> app\layout.tsx
echo             </div> >> app\layout.tsx
echo           </footer> >> app\layout.tsx
echo         </body> >> app\layout.tsx
echo       </html> >> app\layout.tsx
echo     </ClerkProvider> >> app\layout.tsx
echo   ); >> app\layout.tsx
echo } >> app\layout.tsx

echo 'use client'; > app\page.tsx
echo import { useState, useEffect } from 'react'; >> app\page.tsx
echo import MapComponent from '@/components/MapComponent'; >> app\page.tsx
echo import BottomSheet from '@/components/BottomSheet'; >> app\page.tsx
echo import Filters from '@/components/Filters'; >> app\page.tsx
echo import ConsentBanner from '@/components/ConsentBanner'; >> app\page.tsx
echo import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'; >> app\page.tsx
echo. >> app\page.tsx
echo export default function Home() { >> app\page.tsx
echo   const [trails, setTrails] = useState([]); >> app\page.tsx
echo. >> app\page.tsx
echo   useEffect(() => { >> app\page.tsx
echo     fetch('/api/trails') >> app\page.tsx
echo       .then((res) => res.json()) >> app\page.tsx
echo       .then((data) => setTrails(data)); >> app\page.tsx
echo   }, []); >> app\page.tsx
echo. >> app\page.tsx
echo   return ( >> app\page.tsx
echo     <div className="flex flex-col h-screen"> >> app\page.tsx
echo       <header className="p-4"> >> app\page.tsx
echo         <h1 className="text-2xl font-bold">TrailsForAll</h1> >> app\page.tsx
echo         <SignedOut> >> app\page.tsx
echo           <SignInButton mode="modal" /> >> app\page.tsx
echo         </SignedOut> >> app\page.tsx
echo         <SignedIn> >> app\page.tsx
echo           <a href="/trail/new?invite=test123" className="text-blue-500">Přidat trail</a> >> app\page.tsx
echo         </SignedIn> >> app\page.tsx
echo       </header> >> app\page.tsx
echo       <Filters setTrails={setTrails} /> >> app\page.tsx
echo       <MapComponent trails={trails} /> >> app\page.tsx
echo       <BottomSheet trails={trails} /> >> app\page.tsx
echo       <ConsentBanner /> >> app\page.tsx
echo     </div> >> app\page.tsx
echo   ); >> app\page.tsx
echo } >> app\page.tsx

echo 'use client'; > app\trail\[id]\page.tsx
echo import { useEffect, useState } from 'react'; >> app\trail\[id]\page.tsx
echo import { useParams } from 'next/navigation'; >> app\trail\[id]\page.tsx
echo import { useUser } from '@clerk/nextjs'; >> app\trail\[id]\page.tsx
echo. >> app\trail\[id]\page.tsx
echo export default function TrailDetail() { >> app\trail\[id]\page.tsx
echo   const { id } = useParams(); >> app\trail\[id]\page.tsx
echo   const { user } = useUser(); >> app\trail\[id]\page.tsx
echo   const [trail, setTrail] = useState(null); >> app\trail\[id]\page.tsx
echo   const [review, setReview] = useState({ content: '', authorName: '', authorEmail: '' }); >> app\trail\[id]\page.tsx
echo. >> app\trail\[id]\page.tsx
echo   useEffect(() => { >> app\trail\[id]\page.tsx
echo     fetch(`/api/trails/${id}`) >> app\trail\[id]\page.tsx
echo       .then((res) => res.json()) >> app\trail\[id]\page.tsx
echo       .then((data) => setTrail(data)); >> app\trail\[id]\page.tsx
echo   }, [id]); >> app\trail\[id]\page.tsx
echo. >> app\trail\[id]\page.tsx
echo   const handleReviewSubmit = async (e: React.FormEvent) => { >> app\trail\[id]\page.tsx
echo     e.preventDefault(); >> app\trail\[id]\page.tsx
echo     await fetch('/api/reviews', { >> app\trail\[id]\page.tsx
echo       method: 'POST', >> app\trail\[id]\page.tsx
echo       headers: { 'Content-Type': 'application/json' }, >> app\trail\[id]\page.tsx
echo       body: JSON.stringify({ trailId: id, ...review }), >> app\trail\[id]\page.tsx
echo     }); >> app\trail\[id]\page.tsx
echo     setReview({ content: '', authorName: '', authorEmail: '' }); >> app\trail\[id]\page.tsx
echo   }; >> app\trail\[id]\page.tsx
echo. >> app\trail\[id]\page.tsx
echo   if (!trail) return <div>Loading...</div>; >> app\trail\[id]\page.tsx
echo. >> app\trail\[id]\page.tsx
echo   return ( >> app\trail\[id]\page.tsx
echo     <div className="p-4"> >> app\trail\[id]\page.tsx
echo       <h1 className="text-2xl font-bold">{trail.name}</h1> >> app\trail\[id]\page.tsx
echo       <p>Náročnost: {trail.difficulty}</p> >> app\trail\[id]\page.tsx
echo       <p>Délka: {trail.length} km</p> >> app\trail\[id]\page.tsx
echo       <p>Země: {trail.country}</p> >> app\trail\[id]\page.tsx
echo       <h2>Recenze</h2> >> app\trail\[id]\page.tsx
echo       <ul> >> app\trail\[id]\page.tsx
echo         {trail.reviews?.map((review: any) => ( >> app\trail\[id]\page.tsx
echo           <li key={review.id}> >> app\trail\[id]\page.tsx
echo             {review.author_name} ({review.author_email.split('@')[0]}@...): {review.content} >> app\trail\[id]\page.tsx
echo           </li> >> app\trail\[id]\page.tsx
echo         ))} >> app\trail\[id]\page.tsx
echo       </ul> >> app\trail\[id]\page.tsx
echo       {user && ( >> app\trail\[id]\page.tsx
echo         <form onSubmit={handleReviewSubmit} className="mt-4"> >> app\trail\[id]\page.tsx
echo           <input >> app\trail\[id]\page.tsx
echo             type="text" >> app\trail\[id]\page.tsx
echo             value={review.authorName} >> app\trail\[id]\page.tsx
echo             onChange={(e) => setReview({ ...review, authorName: e.target.value })} >> app\trail\[id]\page.tsx
echo             placeholder="Celé jméno" >> app\trail\[id]\page.tsx
echo             className="border p-2 mb-2 w-full" >> app\trail\[id]\page.tsx
echo             required >> app\trail\[id]\page.tsx
echo           /> >> app\trail\[id]\page.tsx
echo           <input >> app\trail\[id]\page.tsx
echo             type="email" >> app\trail\[id]\page.tsx
echo             value={review.authorEmail} >> app\trail\[id]\page.tsx
echo             onChange={(e) => setReview({ ...review, authorEmail: e.target.value })} >> app\trail\[id]\page.tsx
echo             placeholder="E-mail" >> app\trail\[id]\page.tsx
echo             className="border p-2 mb-2 w-full" >> app\trail\[id]\page.tsx
echo             required >> app\trail\[id]\page.tsx
echo           /> >> app\trail\[id]\page.tsx
echo           <textarea >> app\trail\[id]\page.tsx
echo             value={review.content} >> app\trail\[id]\page.tsx
echo             onChange={(e) => setReview({ ...review, content: e.target.value })} >> app\trail\[id]\page.tsx
echo             placeholder="Vaše recenze" >> app\trail\[id]\page.tsx
echo             className="border p-2 mb-2 w-full" >> app\trail\[id]\page.tsx
echo             required >> app\trail\[id]\page.tsx
echo           /> >> app\trail\[id]\page.tsx
echo           <button type="submit" className="bg-blue-500 text-white p-2">Odeslat recenzi</button> >> app\trail\[id]\page.tsx
echo         </form> >> app\trail\[id]\page.tsx
echo       )} >> app\trail\[id]\page.tsx
echo     </div> >> app\trail\[id]\page.tsx
echo   ); >> app\trail\[id]\page.tsx
echo } >> app\trail\[id]\page.tsx

echo 'use client'; > app\trail\new\page.tsx
echo import { useState } from 'react'; >> app\trail\new\page.tsx
echo import { useRouter } from 'next/navigation'; >> app\trail\new\page.tsx
echo import { useUser } from '@clerk/nextjs'; >> app\trail\new\page.tsx
echo. >> app\trail\new\page.tsx
echo export default function NewTrail() { >> app\trail\new\page.tsx
echo   const { user } = useUser(); >> app\trail\new\page.tsx
echo   const router = useRouter(); >> app\trail\new\page.tsx
echo   const [form, setForm] = useState({ name: '', difficulty: 'Easy', country: 'CZ', gpx: null }); >> app\trail\new\page.tsx
echo. >> app\trail\new\page.tsx
echo   const handleSubmit = async (e: React.FormEvent) => { >> app\trail\new\page.tsx
echo     e.preventDefault(); >> app\trail\new\page.tsx
echo     const formData = new FormData(); >> app\trail\new\page.tsx
echo     formData.append('name', form.name); >> app\trail\new\page.tsx
echo     formData.append('difficulty', form.difficulty); >> app\trail\new\page.tsx
echo     formData.append('country', form.country); >> app\trail\new\page.tsx
echo     formData.append('gpx', form.gpx); >> app\trail\new\page.tsx
echo. >> app\trail\new\page.tsx
echo     await fetch('/api/upload', { >> app\trail\new\page.tsx
echo       method: 'POST', >> app\trail\new\page.tsx
echo       body: formData, >> app\trail\new\page.tsx
echo     }); >> app\trail\new\page.tsx
echo     router.push('/'); >> app\trail\new\page.tsx
echo   }; >> app\trail\new\page.tsx
echo. >> app\trail\new\page.tsx
echo   if (!user) return <div>Přihlaste se pro přidání trailu.</div>; >> app\trail\new\page.tsx
echo. >> app\trail\new\page.tsx
echo   return ( >> app\trail\new\page.tsx
echo     <div className="p-4"> >> app\trail\new\page.tsx
echo       <h1 className="text-2xl font-bold">Přidat nový trail</h1> >> app\trail\new\page.tsx
echo       <form onSubmit={handleSubmit} className="mt-4"> >> app\trail\new\page.tsx
echo         <input >> app\trail\new\page.tsx
echo           type="text" >> app\trail\new\page.tsx
echo           value={form.name} >> app\trail\new\page.tsx
echo           onChange={(e) => setForm({ ...form, name: e.target.value })} >> app\trail\new\page.tsx
echo           placeholder="Název trailu" >> app\trail\new\page.tsx
echo           className="border p-2 mb-2 w-full" >> app\trail\new\page.tsx
echo           required >> app\trail\new\page.tsx
echo         /> >> app\trail\new\page.tsx
echo         <select >> app\trail\new\page.tsx
echo           value={form.difficulty} >> app\trail\new\page.tsx
echo           onChange={(e) => setForm({ ...form, difficulty: e.target.value })} >> app\trail\new\page.tsx
echo           className="border p-2 mb-2 w-full" >> app\trail\new\page.tsx
echo         > >> app\trail\new\page.tsx
echo           <option value="Easy">Lehká</option> >> app\trail\new\page.tsx
echo           <option value="Intermediate">Střední</option> >> app\trail\new\page.tsx
echo           <option value="Hard">Těžká</option> >> app\trail\new\page.tsx
echo         </select> >> app\trail\new\page.tsx
echo         <select >> app\trail\new\page.tsx
echo           value={form.country} >> app\trail\new\page.tsx
echo           onChange={(e) => setForm({ ...form, country: e.target.value })} >> app\trail\new\page.tsx
echo           className="border p-2 mb-2 w-full" >> app\trail\new\page.tsx
echo         > >> app\trail\new\page.tsx
echo           <option value="CZ">Česko</option> >> app\trail\new\page.tsx
echo           <option value="SK">Slovensko</option> >> app\trail\new\page.tsx
echo           <option value="PL">Polsko</option> >> app\trail\new\page.tsx
echo           <option value="DE">Německo</option> >> app\trail\new\page.tsx
echo           <option value="AT">Rakousko</option> >> app\trail\new\page.tsx
echo         </select> >> app\trail\new\page.tsx
echo         <input >> app\trail\new\page.tsx
echo           type="file" >> app\trail\new\page.tsx
echo           accept=".gpx" >> app\trail\new\page.tsx
echo           onChange={(e) => setForm({ ...form, gpx: e.target.files[0] })} >> app\trail\new\page.tsx
echo           className="border p-2 mb-2 w-full" >> app\trail\new\page.tsx
echo           required >> app\trail\new\page.tsx
echo         /> >> app\trail\new\page.tsx
echo         <button type="submit" className="bg-blue-500 text-white p-2">Přidat trail</button> >> app\trail\new\page.tsx
echo       </form> >> app\trail\new\page.tsx
echo     </div> >> app\trail\new\page.tsx
echo   ); >> app\trail\new\page.tsx
echo } >> app\trail\new\page.tsx

echo import { sql } from '@vercel/postgres'; > app\api\trails\route.ts
echo import { NextResponse } from 'next/server'; >> app\api\trails\route.ts
echo. >> app\api\trails\route.ts
echo export async function GET() { >> app\api\trails\route.ts
echo   const { rows } = await sql`SELECT * FROM trails WHERE status = 'approved'`; >> app\api\trails\route.ts
echo   return NextResponse.json(rows); >> app\api\trails\route.ts
echo } >> app\api\trails\route.ts
echo. >> app\api\trails\route.ts
echo export async function POST(request: Request) { >> app\api\trails\route.ts
echo   const { name, difficulty, length, gpxData, country } = await request.json(); >> app\api\trails\route.ts
echo   await sql` >> app\api\trails\route.ts
echo     INSERT INTO trails (name, difficulty, length, gpx_data, status, country, lat, lng) >> app\api\trails\route.ts
echo     VALUES (${name}, ${difficulty}, ${length}, ${JSON.stringify(gpxData)}, 'pending', ${country}, 50.0755, 14.4378) >> app\api\trails\route.ts
echo   `; >> app\api\trails\route.ts
echo   return NextResponse.json({ success: true }); >> app\api\trails\route.ts
echo } >> app\api\trails\route.ts

echo import { sql } from '@vercel/postgres'; > app\api\trails\[id]\route.ts
echo import { NextResponse } from 'next/server'; >> app\api\trails\[id]\route.ts
echo. >> app\api\trails\[id]\route.ts
echo export async function GET(request: Request, { params }: { params: { id: string } }) { >> app\api\trails\[id]\route.ts
echo   const { rows } = await sql` >> app\api\trails\[id]\route.ts
echo     SELECT t.*, array_agg( >> app\api\trails\[id]\route.ts
echo       json_build_object( >> app\api\trails\[id]\route.ts
echo         'id', r.id, >> app\api\trails\[id]\route.ts
echo         'author_name', r.author_name, >> app\api\trails\[id]\route.ts
echo         'author_email', r.author_email, >> app\api\trails\[id]\route.ts
echo         'content', r.content >> app\api\trails\[id]\route.ts
echo       ) >> app\api\trails\[id]\route.ts
echo     ) as reviews >> app\api\trails\[id]\route.ts
echo     FROM trails t >> app\api\trails\[id]\route.ts
echo     LEFT JOIN reviews r ON t.id = r.trail_id >> app\api\trails\[id]\route.ts
echo     WHERE t.id = ${params.id} AND t.status = 'approved' >> app\api\trails\[id]\route.ts
echo     GROUP BY t.id >> app\api\trails\[id]\route.ts
echo   `; >> app\api\trails\[id]\route.ts
echo   return NextResponse.json(rows[0]); >> app\api\trails\[id]\route.ts
echo } >> app\api\trails\[id]\route.ts
echo. >> app\api\trails\[id]\route.ts
echo export async function PATCH(request: Request, { params }: { params: { id: string } }) { >> app\api\trails\[id]\route.ts
echo   const { status } = await request.json(); >> app\api\trails\[id]\route.ts
echo   await sql`UPDATE trails SET status = ${status} WHERE id = ${params.id}`; >> app\api\trails\[id]\route.ts
echo   return NextResponse.json({ success: true }); >> app\api\trails\[id]\route.ts
echo } >> app\api\trails\[id]\route.ts
echo. >> app\api\trails\[id]\route.ts
echo export async function DELETE(request: Request, { params }: { params: { id: string } }) { >> app\api\trails\[id]\route.ts
echo   await sql`DELETE FROM trails WHERE id = ${params.id}`; >> app\api\trails\[id]\route.ts
echo   return NextResponse.json({ success: true }); >> app\api\trails\[id]\route.ts
echo } >> app\api\trails\[id]\route.ts

echo import { sql } from '@vercel/postgres'; > app\api\reviews\route.ts
echo import { NextResponse } from 'next/server'; >> app\api\reviews\route.ts
echo import { auth } from '@clerk/nextjs/server'; >> app\api\reviews\route.ts
echo. >> app\api\reviews\route.ts
echo export async function GET() { >> app\api\reviews\route.ts
echo   const { rows } = await sql`SELECT * FROM reviews WHERE status = 'pending'`; >> app\api\reviews\route.ts
echo   return NextResponse.json(rows); >> app\api\reviews\route.ts
echo } >> app\api\reviews\route.ts
echo. >> app\api\reviews\route.ts
echo export async function POST(request: Request) { >> app\api\reviews\route.ts
echo   const { userId } = auth(); >> app\api\reviews\route.ts
echo   if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); >> app\api\reviews\route.ts
echo. >> app\api\reviews\route.ts
echo   const { trailId, content, authorName, authorEmail } = await request.json(); >> app\api\reviews\route.ts
echo   await sql` >> app\api\reviews\route.ts
echo     INSERT INTO reviews (trail_id, author_name, author_email, content, status) >> app\api\reviews\route.ts
echo     VALUES (${trailId}, ${authorName}, ${authorEmail}, ${content}, 'pending') >> app\api\reviews\route.ts
echo   `; >> app\api\reviews\route.ts
echo   return NextResponse.json({ success: true }); >> app\api\reviews\route.ts
echo } >> app\api\reviews\route.ts
echo. >> app\api\reviews\route.ts
echo export async function PATCH(request: Request, { params }: { params: { id: string } }) { >> app\api\reviews\route.ts
echo   const { status } = await request.json(); >> app\api\reviews\route.ts
echo   await sql`UPDATE reviews SET status = ${status} WHERE id = ${params.id}`; >> app\api\reviews\route.ts
echo   return NextResponse.json({ success: true }); >> app\api\reviews\route.ts
echo } >> app\api\reviews\route.ts
echo. >> app\api\reviews\route.ts
echo export async function DELETE(request: Request, { params }: { params: { id: string } }) { >> app\api\reviews\route.ts
echo   await sql`DELETE FROM reviews WHERE id = ${params.id}`; >> app\api\reviews\route.ts
echo   return NextResponse.json({ success: true }); >> app\api\reviews\route.ts
echo } >> app\api\reviews\route.ts

echo import { parseGPX } from '@we-gold/gpxjs'; > app\api\upload\route.ts
echo import { sql } from '@vercel/postgres'; >> app\api\upload\route.ts
echo import { NextResponse } from 'next/server'; >> app\api\upload\route.ts
echo import { auth } from '@clerk/nextjs/server'; >> app\api\upload\route.ts
echo. >> app\api\upload\route.ts
echo export async function POST(request: Request) { >> app\api\upload\route.ts
echo   const { userId } = auth(); >> app\api\upload\route.ts
echo   if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); >> app\api\upload\route.ts
echo. >> app\api\upload\route.ts
echo   const formData = await request.formData(); >> app\api\upload\route.ts
echo   const file = formData.get('gpx') as File; >> app\api\upload\route.ts
echo   const name = formData.get('name') as string; >> app\api\upload\route.ts
echo   const difficulty = formData.get('difficulty') as string; >> app\api\upload\route.ts
echo   const country = formData.get('country') as string; >> app\api\upload\route.ts
echo   const content = await file.text(); >> app\api\upload\route.ts
echo   const gpxData = await parseGPX(content); >> app\api\upload\route.ts
echo. >> app\api\upload\route.ts
echo   const length = gpxData.tracks[0]?.length || 0; >> app\api\upload\route.ts
echo   const lat = gpxData.tracks[0]?.points[0]?.latitude || 50.0755; >> app\api\upload\route.ts
echo   const lng = gpxData.tracks[0]?.points[0]?.longitude || 14.4378; >> app\api\upload\route.ts
echo. >> app\api\upload\route.ts
echo   await sql` >> app\api\upload\route.ts
echo     INSERT INTO trails (name, difficulty, length, gpx_data, status, country, lat, lng) >> app\api\upload\route.ts
echo     VALUES (${name}, ${difficulty}, ${length}, ${JSON.stringify(gpxData)}, 'pending', ${country}, ${lat}, ${lng}) >> app\api\upload\route.ts
echo   `; >> app\api\upload\route.ts
echo   return NextResponse.json({ success: true }); >> app\api\upload\route.ts
echo } >> app\api\upload\route.ts

echo import { sql } from '@vercel/postgres'; > app\api\filters\route.ts
echo import { NextResponse } from 'next/server'; >> app\api\filters\route.ts
echo. >> app\api\filters\route.ts
echo export async function GET(request: Request) { >> app\api\filters\route.ts
echo   const { searchParams } = new URL(request.url); >> app\api\filters\route.ts
echo   const difficulty = searchParams.get('difficulty'); >> app\api\filters\route.ts
echo   const country = searchParams.get('country'); >> app\api\filters\route.ts
echo   const lengthMin = searchParams.get('lengthMin'); >> app\api\filters\route.ts
echo   const lengthMax = searchParams.get('lengthMax'); >> app\api\filters\route.ts
echo. >> app\api\filters\route.ts
echo   let query = `SELECT * FROM trails WHERE status = 'approved'`; >> app\api\filters\route.ts
echo   const params: string[] = []; >> app\api\filters\route.ts
echo. >> app\api\filters\route.ts
echo   if (difficulty) { >> app\api\filters\route.ts
echo     query += ` AND difficulty = $${params.length + 1}`; >> app\api\filters\route.ts
echo     params.push(difficulty); >> app\api\filters\route.ts
echo   } >> app\api\filters\route.ts
echo   if (country) { >> app\api\filters\route.ts
echo     query += ` AND country = $${params.length + 1}`; >> app\api\filters\route.ts
echo     params.push(country); >> app\api\filters\route.ts
echo   } >> app\api\filters\route.ts
echo   if (lengthMin && lengthMax) { >> app\api\filters\route.ts
echo     query += ` AND length BETWEEN $${params.length + 1} AND $${params.length + 2}`; >> app\api\filters\route.ts
echo     params.push(lengthMin, lengthMax); >> app\api\filters\route.ts
echo   } >> app\api\filters\route.ts
echo. >> app\api\filters\route.ts
echo   const { rows } = await sql.query(query, params); >> app\api\filters\route.ts
echo   return NextResponse.json(rows); >> app\api\filters\route.ts
echo } >> app\api\filters\route.ts

echo import { getStats } from '@/lib/analytics'; > app\api\stats\route.ts
echo import { NextResponse } from 'next/server'; >> app\api\stats\route.ts
echo. >> app\api\stats\route.ts
echo export async function GET() { >> app\api\stats\route.ts
echo   const stats = await getStats(); >> app\api\stats\route.ts
echo   return NextResponse.json(stats); >> app\api\stats\route.ts
echo } >> app\api\stats\route.ts

echo 'use client'; > app\admin\page.tsx
echo import { useState, useEffect } from 'react'; >> app\admin\page.tsx
echo import { redirect } from 'next/navigation'; >> app\admin\page.tsx
echo import { getStats } from '@/lib/analytics'; >> app\admin\page.tsx
echo. >> app\admin\page.tsx
echo export default function AdminPanel() { >> app\admin\page.tsx
echo   const [trails, setTrails] = useState([]); >> app\admin\page.tsx
echo   const [reviews, setReviews] = useState([]); >> app\admin\page.tsx
echo   const [stats, setStats] = useState(null); >> app\admin\page.tsx
echo   const [password, setPassword] = useState(''); >> app\admin\page.tsx
echo   const [isAuthenticated, setIsAuthenticated] = useState(false); >> app\admin\page.tsx
echo. >> app\admin\page.tsx
echo   useEffect(() => { >> app\admin\page.tsx
echo     if (password === process.env.ADMIN_PASSWORD) { >> app\admin\page.tsx
echo       setIsAuthenticated(true); >> app\admin\page.tsx
echo       fetch('/api/trails?status=pending').then((res) => res.json()).then(setTrails); >> app\admin\page.tsx
echo       fetch('/api/reviews').then((res) => res.json()).then(setReviews); >> app\admin\page.tsx
echo       getStats().then(setStats); >> app\admin\page.tsx
echo     } >> app\admin\page.tsx
echo   }, [password]); >> app\admin\page.tsx
echo. >> app\admin\page.tsx
echo   if (!isAuthenticated) { >> app\admin\page.tsx
echo     return ( >> app\admin\page.tsx
echo       <div className="p-4"> >> app\admin\page.tsx
echo         <input >> app\admin\page.tsx
echo           type="password" >> app\admin\page.tsx
echo           value={password} >> app\admin\page.tsx
echo           onChange={(e) => setPassword(e.target.value)} >> app\admin\page.tsx
echo           placeholder="Admin heslo" >> app\admin\page.tsx
echo           className="border p-2" >> app\admin\page.tsx
echo         /> >> app\admin\page.tsx
echo       </div> >> app\admin\page.tsx
echo     ); >> app\admin\page.tsx
echo   } >> app\admin\page.tsx
echo. >> app\admin\page.tsx
echo   return ( >> app\admin\page.tsx
echo     <div className="p-4"> >> app\admin\page.tsx
echo       <h1 className="text-2xl font-bold">Admin Panel</h1> >> app\admin\page.tsx
echo       <h2>Čekající traily</h2> >> app\admin\page.tsx
echo       <ul> >> app\admin\page.tsx
echo         {trails.map((trail: any) => ( >> app\admin\page.tsx
echo           <li key={trail.id}> >> app\admin\page.tsx
echo             {trail.name} >> app\admin\page.tsx
echo             <button >> app\admin\page.tsx
echo               onClick={() => approveTrail(trail.id)} >> app\admin\page.tsx
echo               className="ml-2 text-green-500" >> app\admin\page.tsx
echo             > >> app\admin\page.tsx
echo               Schválit >> app\admin\page.tsx
echo             </button> >> app\admin\page.tsx
echo             <button >> app\admin\page.tsx
echo               onClick={() => deleteTrail(trail.id)} >> app\admin\page.tsx
echo               className="ml-2 text-red-500" >> app\admin\page.tsx
echo             > >> app\admin\page.tsx
echo               Smazat >> app\admin\page.tsx
echo             </button> >> app\admin\page.tsx
echo           </li> >> app\admin\page.tsx
echo         ))} >> app\admin\page.tsx
echo       </ul> >> app\admin\page.tsx
echo       <h2>Čekající recenze</h2> >> app\admin\page.tsx
echo       <ul> >> app\admin\page.tsx
echo         {reviews.map((review: any) => ( >> app\admin\page.tsx
echo           <li key={review.id}> >> app\admin\page.tsx
echo             {review.content} ({review.author_name}) >> app\admin\page.tsx
echo             <button >> app\admin\page.tsx
echo               onClick={() => approveReview(review.id)} >> app\admin\page.tsx
echo               className="ml-2 text-green-500" >> app\admin\page.tsx
echo             > >> app\admin\page.tsx
echo               Schválit >> app\admin\page.tsx
echo             </button> >> app\admin\page.tsx
echo             <button >> app\admin\page.tsx
echo               onClick={() => deleteReview(review.id)} >> app\admin\page.tsx
echo               className="ml-2 text-red-500" >> app\admin\page.tsx
echo             > >> app\admin\page.tsx
echo               Smazat >> app\admin\page.tsx
echo             </button> >> app\admin\page.tsx
echo           </li> >> app\admin\page.tsx
echo         ))} >> app\admin\page.tsx
echo       </ul> >> app\admin\page.tsx
echo       <h2>Statistiky</h2> >> app\admin\page.tsx
echo       {stats && ( >> app\admin\page.tsx
echo         <div> >> app\admin\page.tsx
echo           <p>Počet uživatelů: {stats.userCount}</p> >> app\admin\page.tsx
echo           <p>Celkový čas strávený: {stats.totalTime} sekund</p> >> app\admin\page.tsx
echo           <h3>Top traily:</h3> >> app\admin\page.tsx
echo           <ul> >> app\admin\page.tsx
echo             {stats.topTrails.map((trail: any) => ( >> app\admin\page.tsx
echo               <li key={trail.trail_id}>Trail ID {trail.trail_id}: {trail.visits} návštěv</li> >> app\admin\page.tsx
echo             ))} >> app\admin\page.tsx
echo           </ul> >> app\admin\page.tsx
echo         </div> >> app\admin\page.tsx
echo       )} >> app\admin\page.tsx
echo     </div> >> app\admin\page.tsx
echo   ); >> app\admin\page.tsx
echo } >> app\admin\page.tsx
echo. >> app\admin\page.tsx
echo async function approveTrail(id: number) { >> app\admin\page.tsx
echo   await fetch(`/api/trails/${id}`, { >> app\admin\page.tsx
echo     method: 'PATCH', >> app\admin\page.tsx
echo     body: JSON.stringify({ status: 'approved' }), >> app\admin\page.tsx
echo   }); >> app\admin\page.tsx
echo } >> app\admin\page.tsx
echo. >> app\admin\page.tsx
echo async function deleteTrail(id: number) { >> app\admin\page.tsx
echo   await fetch(`/api/trails/${id}`, { method: 'DELETE' }); >> app\admin\page.tsx
echo } >> app\admin\page.tsx
echo. >> app\admin\page.tsx
echo async function approveReview(id: number) { >> app\admin\page.tsx
echo   await fetch(`/api/reviews/${id}`, { >> app\admin\page.tsx
echo     method: 'PATCH', >> app\admin\page.tsx
echo     body: JSON.stringify({ status: 'approved' }), >> app\admin\page.tsx
echo   }); >> app\admin\page.tsx
echo } >> app\admin\page.tsx
echo. >> app\admin\page.tsx
echo async function deleteReview(id: number) { >> app\admin\page.tsx
echo   await fetch(`/api/reviews/${id}`, { method: 'DELETE' }); >> app\admin\page.tsx
echo } >> app\admin\page.tsx

echo export default function Rules() { > app\rules\page.tsx
echo   return ( >> app\rules\page.tsx
echo     <div className="p-4"> >> app\rules\page.tsx
echo       <h1 className="text-2xl font-bold">Kodex chování</h1> >> app\rules\page.tsx
echo       <p>1. Respektujte ostatní uživatele.</p> >> app\rules\page.tsx
echo       <p>2. Nepřidávejte nevhodný obsah.</p> >> app\rules\page.tsx
echo       <p>Kontakt: <a href="mailto:dalibor.pasek@gmail.com">dalibor.pasek@gmail.com</a></p> >> app\rules\page.tsx
echo     </div> >> app\rules\page.tsx
echo   ); >> app\rules\page.tsx
echo } >> app\rules\page.tsx

echo export default function GDPR() { > app\gdpr\page.tsx
echo   return ( >> app\gdpr\page.tsx
echo     <div className="p-4"> >> app\gdpr\page.tsx
echo       <h1 className="text-2xl font-bold">GDPR Zásady</h1> >> app\gdpr\page.tsx
echo       <p>Ukládáme pouze nezbytná data (email, jméno, příspěvky).</p> >> app\gdpr\page.tsx
echo       <p>Pro export nebo smazání dat kontaktujte: <a href="mailto:dalibor.pasek@gmail.com">dalibor.pasek@gmail.com</a>.</p> >> app\gdpr\page.tsx
echo       <p>Souhlas s cookies můžete spravovat v nastavení prohlížeče.</p> >> app\gdpr\page.tsx
echo     </div> >> app\gdpr\page.tsx
echo   ); >> app\gdpr\page.tsx
echo } >> app\gdpr\page.tsx

echo 'use client'; > components\MapComponent.tsx
echo import { MapContainer, TileLayer, Marker } from 'react-leaflet'; >> components\MapComponent.tsx
echo import 'leaflet/dist/leaflet.css'; >> components\MapComponent.tsx
echo. >> components\MapComponent.tsx
echo export default function MapComponent({ trails }: { trails: any[] }) { >> components\MapComponent.tsx
echo   return ( >> components\MapComponent.tsx
echo     <MapContainer center={[50.0755, 14.4378]} zoom={10} style={{ height: '100vh' }}> >> components\MapComponent.tsx
echo       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> >> components\MapComponent.tsx
echo       {trails.map((trail) => ( >> components\MapComponent.tsx
echo         <Marker key={trail.id} position={[trail.lat, trail.lng]} /> >> components\MapComponent.tsx
echo       ))} >> components\MapComponent.tsx
echo     </MapContainer> >> components\MapComponent.tsx
echo   ); >> components\MapComponent.tsx
echo } >> components\MapComponent.tsx

echo 'use client'; > components\BottomSheet.tsx
echo import { BottomSheet } from 'react-bottom-sheet'; >> components\BottomSheet.tsx
echo. >> components\BottomSheet.tsx
echo export default function TrailBottomSheet({ trails }: { trails: any[] }) { >> components\BottomSheet.tsx
echo   return ( >> components\BottomSheet.tsx
echo     <BottomSheet> >> components\BottomSheet.tsx
echo       <div className="p-4"> >> components\BottomSheet.tsx
echo         <h2 className="text-xl font-bold">Seznam trailů</h2> >> components\BottomSheet.tsx
echo         <ul> >> components\BottomSheet.tsx
echo           {trails.map((trail) => ( >> components\BottomSheet.tsx
echo             <li key={trail.id}> >> components\BottomSheet.tsx
echo               <a href={`/trail/${trail.id}`} className="text-blue-500">{trail.name}</a> >> components\BottomSheet.tsx
echo             </li> >> components\BottomSheet.tsx
echo           ))} >> components\BottomSheet.tsx
echo         </ul> >> components\BottomSheet.tsx
echo       </div> >> components\BottomSheet.tsx
echo     </BottomSheet> >> components\BottomSheet.tsx
echo   ); >> components\BottomSheet.tsx
echo } >> components\BottomSheet.tsx

echo 'use client'; > components\Filters.tsx
echo import { useState } from 'react'; >> components\Filters.tsx
echo import { useRouter } from 'next/navigation'; >> components\Filters.tsx
echo. >> components\Filters.tsx
echo export default function Filters({ setTrails }: { setTrails: (trails: any[]) => void }) { >> components\Filters.tsx
echo   const [difficulty, setDifficulty] = useState(''); >> components\Filters.tsx
echo   const [country, setCountry] = useState(''); >> components\Filters.tsx
echo   const [lengthMin, setLengthMin] = useState(''); >> components\Filters.tsx
echo   const [lengthMax, setLengthMax] = useState(''); >> components\Filters.tsx
echo   const router = useRouter(); >> components\Filters.tsx
echo. >> components\Filters.tsx
echo   const applyFilters = async () => { >> components\Filters.tsx
echo     const params = new URLSearchParams(); >> components\Filters.tsx
echo     if (difficulty) params.set('difficulty', difficulty); >> components\Filters.tsx
echo     if (country) params.set('country', country); >> components\Filters.tsx
echo     if (lengthMin && lengthMax) { >> components\Filters.tsx
echo       params.set('lengthMin', lengthMin); >> components\Filters.tsx
echo       params.set('lengthMax', lengthMax); >> components\Filters.tsx
echo     } >> components\Filters.tsx
echo     const res = await fetch(`/api/filters?${params.toString()}`); >> components\Filters.tsx
echo     const data = await res.json(); >> components\Filters.tsx
echo     setTrails(data); >> components\Filters.tsx
echo     router.push(`/?${params.toString()}`); >> components\Filters.tsx
echo   }; >> components\Filters.tsx
echo. >> components\Filters.tsx
echo   return ( >> components\Filters.tsx
echo     <div className="p-4 bg-gray-100"> >> components\Filters.tsx
echo       <select >> components\Filters.tsx
echo         value={difficulty} >> components\Filters.tsx
echo         onChange={(e) => setDifficulty(e.target.value)} >> components\Filters.tsx
echo         className="border p-2 mr-2" >> components\Filters.tsx
echo       > >> components\Filters.tsx
echo         <option value="">Všechny náročnosti</option> >> components\Filters.tsx
echo         <option value="Easy">Lehká</option> >> components\Filters.tsx
echo         <option value="Intermediate">Střední</option> >> components\Filters.tsx
echo         <option value="Hard">Těžká</option> >> components\Filters.tsx
echo       </select> >> components\Filters.tsx
echo       <select >> components\Filters.tsx
echo         value={country} >> components\Filters.tsx
echo         onChange={(e) => setCountry(e.target.value)} >> components\Filters.tsx
echo         className="border p-2 mr-2" >> components\Filters.tsx
echo       > >> components\Filters.tsx
echo         <option value="">Všechny země</option> >> components\Filters.tsx
echo         <option value="CZ">Česko</option> >> components\Filters.tsx
echo         <option value="SK">Slovensko</option> >> components\Filters.tsx
echo         <option value="PL">Polsko</option> >> components\Filters.tsx
echo         <option value="DE">Německo</option> >> components\Filters.tsx
echo         <option value="AT">Rakousko</option> >> components\Filters.tsx
echo       </select> >> components\Filters.tsx
echo       <input >> components\Filters.tsx
echo         type="number" >> components\Filters.tsx
echo         value={lengthMin} >> components\Filters.tsx
echo         onChange={(e) => setLengthMin(e.target.value)} >> components\Filters.tsx
echo         placeholder="Délka od (km)" >> components\Filters.tsx
echo         className="border p-2 mr-2" >> components\Filters.tsx
echo       /> >> components\Filters.tsx
echo       <input >> components\Filters.tsx
echo         type="number" >> components\Filters.tsx
echo         value={lengthMax} >> components\Filters.tsx
echo         onChange={(e) => setLengthMax(e.target.value)} >> components\Filters.tsx
echo         placeholder="Délka do (km)" >> components\Filters.tsx
echo         className="border p-2 mr-2" >> components\Filters.tsx
echo       /> >> components\Filters.tsx
echo       <button onClick={applyFilters} className="bg-blue-500 text-white p-2"> >> components\Filters.tsx
echo         Filtrovat >> components\Filters.tsx
echo       </button> >> components\Filters.tsx
echo     </div> >> components\Filters.tsx
echo   ); >> components\Filters.tsx
echo } >> components\Filters.tsx

echo 'use client'; > components\ConsentBanner.tsx
echo import CookieConsent from 'react-cookie-consent'; >> components\ConsentBanner.tsx
echo. >> components\ConsentBanner.tsx
echo export default function ConsentBanner() { >> components\ConsentBanner.tsx
echo   return ( >> components\ConsentBanner.tsx
echo     <CookieConsent >> components\ConsentBanner.tsx
echo       location="bottom" >> components\ConsentBanner.tsx
echo       buttonText="Souhlasím" >> components\ConsentBanner.tsx
echo       cookieName="trailsforall-consent" >> components\ConsentBanner.tsx
echo       style={{ background: '#2B373B' }} >> components\ConsentBanner.tsx
echo       buttonStyle={{ color: '#4e503b', fontSize: '13px' }} >> components\ConsentBanner.tsx
echo     > >> components\ConsentBanner.tsx
echo       Tato stránka používá cookies pro analytiku a personalizované reklamy. Více na <a href="/gdpr">GDPR</a>. >> components\ConsentBanner.tsx
echo     </CookieConsent> >> components\ConsentBanner.tsx
echo   ); >> components\ConsentBanner.tsx
echo } >> components\ConsentBanner.tsx

echo import { sql } from '@vercel/postgres'; > lib\db.ts
echo. >> lib\db.ts
echo export async function initDb() { >> lib\db.ts
echo   await sql` >> lib\db.ts
echo     CREATE TABLE IF NOT EXISTS trails ( >> lib\db.ts
echo       id SERIAL PRIMARY KEY, >> lib\db.ts
echo       name TEXT NOT NULL, >> lib\db.ts
echo       difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Intermediate', 'Hard')), >> lib\db.ts
echo       length FLOAT NOT NULL, >> lib\db.ts
echo       gpx_data JSONB, >> lib\db.ts
echo       status TEXT DEFAULT 'pending', >> lib\db.ts
echo       lat FLOAT, >> lib\db.ts
echo       lng FLOAT, >> lib\db.ts
echo       country TEXT NOT NULL CHECK (country IN ('CZ', 'SK', 'PL', 'DE', 'AT')), >> lib\db.ts
echo       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP >> lib\db.ts
echo     ) >> lib\db.ts
echo   `; >> lib\db.ts
echo   await sql` >> lib\db.ts
echo     CREATE TABLE IF NOT EXISTS reviews ( >> lib\db.ts
echo       id SERIAL PRIMARY KEY, >> lib\db.ts
echo       trail_id INTEGER REFERENCES trails(id), >> lib\db.ts
echo       author_name TEXT NOT NULL, >> lib\db.ts
echo       author_email TEXT NOT NULL, >> lib\db.ts
echo       content TEXT NOT NULL, >> lib\db.ts
echo       status TEXT DEFAULT 'pending', >> lib\db.ts
echo       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP >> lib\db.ts
echo     ) >> lib\db.ts
echo   `; >> lib\db.ts
echo   await sql` >> lib\db.ts
echo     CREATE TABLE IF NOT EXISTS analytics ( >> lib\db.ts
echo       id SERIAL PRIMARY KEY, >> lib\db.ts
echo       user_id TEXT, >> lib\db.ts
echo       trail_id INTEGER REFERENCES trails(id), >> lib\db.ts
echo       time_spent INTEGER, >> lib\db.ts
echo       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP >> lib\db.ts
echo     ) >> lib\db.ts
echo   `; >> lib\db.ts
echo } >> lib\db.ts

echo import { sql } from '@vercel/postgres'; > lib\analytics.ts
echo. >> lib\analytics.ts
echo export async function logVisit(userId: string, trailId: number, timeSpent: number) { >> lib\analytics.ts
echo   await sql` >> lib\analytics.ts
echo     INSERT INTO analytics (user_id, trail_id, time_spent) >> lib\analytics.ts
echo     VALUES (${userId}, ${trailId}, ${timeSpent}) >> lib\analytics.ts
echo   `; >> lib\analytics.ts
echo } >> lib\analytics.ts
echo. >> lib\analytics.ts
echo export async function getStats() { >> lib\analytics.ts
echo   const userCount = await sql`SELECT COUNT(DISTINCT user_id) as count FROM analytics`; >> lib\analytics.ts
echo   const totalTime = await sql`SELECT SUM(time_spent) as total FROM analytics`; >> lib\analytics.ts
echo   const topTrails = await sql` >> lib\analytics.ts
echo     SELECT trail_id, COUNT(*) as visits >> lib\analytics.ts
echo     FROM analytics >> lib\analytics.ts
echo     GROUP BY trail_id >> lib\analytics.ts
echo     ORDER BY visits DESC >> lib\analytics.ts
echo     LIMIT 5 >> lib\analytics.ts
echo   `; >> lib\analytics.ts
echo   return { >> lib\analytics.ts
echo     userCount: userCount.rows[0].count, >> lib\analytics.ts
echo     totalTime: totalTime.rows[0].total, >> lib\analytics.ts
echo     topTrails: topTrails.rows, >> lib\analytics.ts
echo   }; >> lib\analytics.ts
echo } >> lib\analytics.ts

echo { > public\manifest.json
echo   "name": "TrailsForAll", >> public\manifest.json
echo   "short_name": "Trails", >> public\manifest.json
echo   "start_url": "/", >> public\manifest.json
echo   "display": "standalone", >> public\manifest.json
echo   "background_color": "#ffffff", >> public\manifest.json
echo   "theme_color": "#000000", >> public\manifest.json
echo   "icons": [ >> public\manifest.json
echo     { >> public\manifest.json
echo       "src": "/icons/icon-192x192.png", >> public\manifest.json
echo       "sizes": "192x192", >> public\manifest.json
echo       "type": "image/png" >> public\manifest.json
echo     }, >> public\manifest.json
echo     { >> public\manifest.json
echo       "src": "/icons/icon-512x512.png", >> public\manifest.json
echo       "sizes": "512x512", >> public\manifest.json
echo       "type": "image/png" >> public\manifest.json
echo     } >> public\manifest.json
echo   ] >> public\manifest.json
echo } >> public\manifest.json

echo self.addEventListener('install', (event) => { > public\sw.js
echo   event.waitUntil( >> public\sw.js
echo     caches.open('trailsforall').then((cache) => { >> public\sw.js
echo       return cache.addAll(['/', '/manifest.json']); >> public\sw.js
echo     }) >> public\sw.js
echo   ); >> public\sw.js
echo }); >> public\sw.js
echo. >> public\sw.js
echo self.addEventListener('fetch', (event) => { >> public\sw.js
echo   event.respondWith( >> public\sw.js
echo     caches.match(event.request).then((response) => { >> public\sw.js
echo       return response || fetch(event.request); >> public\sw.js
echo     }) >> public\sw.js
echo   ); >> public\sw.js
echo }); >> public\sw.js

echo import { NextResponse } from 'next/server'; > middleware.ts
echo. >> middleware.ts
echo export function middleware(request: Request) { >> middleware.ts
echo   const { pathname, searchParams } = new URL(request.url); >> middleware.ts
echo   if (pathname.startsWith('/admin') || pathname.startsWith('/trail/new')) { >> middleware.ts
echo     const inviteCode = searchParams.get('invite'); >> middleware.ts
echo     if (inviteCode !== process.env.INVITE_CODE) { >> middleware.ts
echo       return NextResponse.redirect(new URL('/rules', request.url)); >> middleware.ts
echo     } >> middleware.ts
echo   } >> middleware.ts
echo   return NextResponse.next(); >> middleware.ts
echo } >> middleware.ts
echo. >> middleware.ts
echo export const config = { >> middleware.ts
echo   matcher: ['/admin/:path*', '/trail/new/:path*'], >> middleware.ts
echo }; >> middleware.ts

echo # TrailsForAll > README.md
echo. >> README.md
echo Webová aplikace pro sdílení a objevování turistických tras v ČR, SR a příhraničí (PL, DE, AT). Používá Next.js, Leaflet, Clerk a Vercel Postgres. >> README.md
echo. >> README.md
echo ## Instalace >> README.md
echo 1. `npm install` >> README.md
echo 2. Nastav `.env.local` s klíči pro Clerk, Vercel Postgres a Analytics. >> README.md
echo 3. `npm run dev` >> README.md
echo. >> README.md
echo ## Nasazení >> README.md
echo - Pushni na GitHub: `git push origin main`. >> README.md
echo - Propoj s Vercel pro automatické nasazení. >> README.md
echo. >> README.md
echo ## Testovací provoz >> README.md
echo - Přístup omezen na `?invite=test123`. >> README.md
echo. >> README.md
echo ## Kontakt >> README.md
echo Dalibor Pasek - dalibor.pasek@gmail.com >> README.md
