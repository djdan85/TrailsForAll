'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import RiderIcon, { riderDisciplineLabels, type RiderDiscipline } from '../components/RiderIcon'

export default function Komunita() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [team, setTeam] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [friendships, setFriendships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        setCurrentUser(userData.user)
        const { data: friendsData } = await supabase
          .from('friendships')
          .select('*')
          .or(`user_id.eq.${userData.user.id},friend_id.eq.${userData.user.id}`)
        setFriendships(friendsData || [])
      }

      const { data: publicProfiles } = await supabase
        .from('profiles')
        .select('id, username, city, bio, role, primary_discipline, equipment_text, rider_level, strava_url, instagram_url, created_at')
        .eq('show_in_community', true)
        .not('username', 'is', null)
        .order('created_at', { ascending: false })

      const teamRoles = ['superadmin', 'admin', 'editor']
      setTeam((publicProfiles || []).filter(profile => teamRoles.includes(profile.role)))
      setMembers((publicProfiles || []).filter(profile => !teamRoles.includes(profile.role)))
      setLoading(false)
    }

    fetchData()
  }, [])

  const refreshFriendships = async () => {
    if (!currentUser) return
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`)
    setFriendships(data || [])
  }

  const sendFriendRequest = async (friendId: string) => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    await supabase.from('friendships').insert({ user_id: currentUser.id, friend_id: friendId, status: 'pending' })
    await refreshFriendships()
  }

  const respondToRequest = async (friendshipId: string, status: string) => {
    await supabase.from('friendships').update({ status }).eq('id', friendshipId)
    await refreshFriendships()
  }

  const getFriendshipStatus = (profileId: string) => {
    const friendship = friendships.find(friendship =>
      (friendship.user_id === currentUser?.id && friendship.friend_id === profileId) ||
      (friendship.friend_id === currentUser?.id && friendship.user_id === profileId)
    )
    if (!friendship) return null
    return { ...friendship, isSender: friendship.user_id === currentUser?.id }
  }

  const roleLabel: Record<string, string> = {
    superadmin: 'Super Admin', admin: 'Admin', editor: 'Redaktor', moderator: 'Moderátor', member: 'RIDER', user: 'Rider'
  }

  const roleColor: Record<string, string> = {
    superadmin: 'bg-orange-900 text-orange-300', admin: 'bg-red-900 text-red-300', editor: 'bg-purple-900 text-purple-300',
    moderator: 'bg-blue-900 text-blue-300', member: 'bg-green-900 text-green-300', user: 'bg-gray-700 text-gray-300'
  }

  const riderLevelLabel: Record<string, string> = {
    beginner: 'Začátečník', intermediate: 'Pokročilý', advanced: 'Zdatný', expert: 'Expert'
  }

  const filteredMembers = members.filter(member =>
    member.username?.toLowerCase().includes(search.toLowerCase()) ||
    member.city?.toLowerCase().includes(search.toLowerCase()) ||
    member.bio?.toLowerCase().includes(search.toLowerCase()) ||
    member.equipment_text?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingRequests = friendships.filter(friendship =>
    friendship.friend_id === currentUser?.id && friendship.status === 'pending'
  )

  const ProfileCard = ({ profile, isTeam = false }: { profile: any, isTeam?: boolean }) => {
    const friendship = getFriendshipStatus(profile.id)
    const isMe = currentUser?.id === profile.id
    const discipline = (profile.primary_discipline || 'mtb') as RiderDiscipline

    return (
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/25 flex items-center justify-center shrink-0">
              <RiderIcon discipline={discipline} className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-bold text-lg truncate">{profile.username}</h3>
              {profile.city && <p className="text-gray-400 text-sm truncate">{profile.city}</p>}
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${roleColor[profile.role] || roleColor.user}`}>
            {roleLabel[profile.role] || 'Rider'}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <span className="bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs px-2.5 py-1 rounded-full">
            {riderDisciplineLabels[discipline] || 'Jiné'}
          </span>
          {profile.rider_level && (
            <span className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full">{riderLevelLabel[profile.rider_level]}</span>
          )}
        </div>

        {profile.bio && <p className="text-gray-300 text-sm mb-4 line-clamp-3">{profile.bio}</p>}

        {profile.equipment_text && (
          <div className="bg-gray-800/70 rounded-2xl p-3 mb-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5">Na čem jezdím</p>
            <p className="text-gray-200 text-sm whitespace-pre-line line-clamp-3">{profile.equipment_text}</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {profile.strava_url && (
            <button onClick={() => window.open(profile.strava_url, '_blank', 'noopener,noreferrer')} className="bg-orange-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 transition">Strava</button>
          )}
          {profile.instagram_url && (
            <button onClick={() => window.open(profile.instagram_url, '_blank', 'noopener,noreferrer')} className="bg-purple-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-purple-700 transition">Instagram</button>
          )}
          {currentUser && !isMe && !isTeam && (
            <>
              {!friendship && <button onClick={() => sendFriendRequest(profile.id)} className="bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 transition">Přidat přítele</button>}
              {friendship?.status === 'pending' && friendship.isSender && <span className="bg-gray-700 text-gray-400 text-xs px-3 py-1.5 rounded-lg">Žádost odeslána</span>}
              {friendship?.status === 'pending' && !friendship.isSender && (
                <div className="flex gap-2">
                  <button onClick={() => respondToRequest(friendship.id, 'accepted')} className="bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 transition">Přijmout</button>
                  <button onClick={() => respondToRequest(friendship.id, 'rejected')} className="bg-red-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-700 transition">Odmítnout</button>
                </div>
              )}
              {friendship?.status === 'accepted' && <span className="bg-green-900 text-green-400 text-xs px-3 py-1.5 rounded-lg">Přátelé</span>}
            </>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-orange-500 text-xl">Načítám...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-2">Trails For All</p>
        <h1 className="text-4xl font-bold text-white mb-2">Komunita riderů</h1>
        <p className="text-gray-400 mb-10">MTB, BMX, skateboard i freestyle koloběžka na jednom místě. Zobrazeny jsou pouze dobrovolně zveřejněné profily.</p>

        {pendingRequests.length > 0 && (
          <div className="bg-orange-950 border border-orange-800 rounded-2xl p-4 mb-8">
            <h3 className="text-orange-400 font-semibold mb-2">Žádosti o přátelství ({pendingRequests.length})</h3>
            <p className="text-gray-400 text-sm">Podívej se níže na profily uživatelů, kteří tě chtějí přidat.</p>
          </div>
        )}

        {team.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">Náš tým</h2>
            <p className="text-gray-400 mb-6">Lidé, kteří stojí za Trails For All.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{team.map(profile => <ProfileCard key={profile.id} profile={profile} isTeam />)}</div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Rideři</h2>
              <p className="text-gray-400">Veřejné profily komunity ({members.length})</p>
            </div>
          </div>
          <div className="mb-6">
            <input value={search} onChange={event => setSearch(event.target.value)} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Hledat podle přezdívky, města, bio nebo vybavení..." />
          </div>
          {filteredMembers.length === 0 && <p className="text-gray-400">Žádné veřejné profily nebyly nalezeny.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredMembers.map(profile => <ProfileCard key={profile.id} profile={profile} />)}</div>
        </div>
      </div>
    </div>
  )
}
