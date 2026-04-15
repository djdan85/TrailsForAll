'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Komunita() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
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
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single()
        setCurrentProfile(profileData)

        const { data: friendsData } = await supabase
          .from('friendships')
          .select('*')
          .or(`user_id.eq.${userData.user.id},friend_id.eq.${userData.user.id}`)
        setFriendships(friendsData || [])
      }

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const teamRoles = ['superadmin', 'admin', 'editor']
      setTeam((allProfiles || []).filter(p => teamRoles.includes(p.role)))
      setMembers((allProfiles || []).filter(p => !teamRoles.includes(p.role)))
      setLoading(false)
    }
    fetchData()
  }, [])

  const sendFriendRequest = async (friendId: string) => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    await supabase.from('friendships').insert({
      user_id: currentUser.id,
      friend_id: friendId,
      status: 'pending'
    })
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`)
    setFriendships(data || [])
  }

  const respondToRequest = async (friendshipId: string, status: string) => {
    await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId)
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`)
    setFriendships(data || [])
  }

  const getFriendshipStatus = (profileId: string) => {
    const friendship = friendships.find(f =>
      (f.user_id === currentUser?.id && f.friend_id === profileId) ||
      (f.friend_id === currentUser?.id && f.user_id === profileId)
    )
    if (!friendship) return null
    return { ...friendship, isSender: friendship.user_id === currentUser?.id }
  }

  const roleLabel: any = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    editor: 'Redaktor',
    moderator: 'Moderátor',
    member: 'Člen',
    user: 'Uživatel'
  }

  const roleColor: any = {
    superadmin: 'bg-orange-900 text-orange-300',
    admin: 'bg-red-900 text-red-300',
    editor: 'bg-purple-900 text-purple-300',
    moderator: 'bg-blue-900 text-blue-300',
    member: 'bg-green-900 text-green-300',
    user: 'bg-gray-700 text-gray-300'
  }

  const bikeTypeLabel: any = {
    xc: 'XC',
    trail: 'Trail',
    enduro: 'Enduro',
    dh: 'DH',
    ebike: 'E-bike',
    other: 'Jiné'
  }

  const riderLevelLabel: any = {
    beginner: 'Začátečník',
    intermediate: 'Pokročilý',
    advanced: 'Zdatný',
    expert: 'Expert'
  }

  const filteredMembers = members.filter(m =>
    m.username?.toLowerCase().includes(search.toLowerCase()) ||
    m.city?.toLowerCase().includes(search.toLowerCase()) ||
    m.bio?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingRequests = friendships.filter(f =>
    f.friend_id === currentUser?.id && f.status === 'pending'
  )

  const ProfileCard = ({ profile, isTeam = false }: { profile: any, isTeam?: boolean }) => {
    const friendship = getFriendshipStatus(profile.id)
    const isMe = currentUser?.id === profile.id

    return (
      <div className="bg-gray-900 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-bold text-lg">{profile.username || profile.email?.split('@')[0]}</h3>
            {profile.city && <p className="text-gray-400 text-sm">{profile.city}</p>}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${roleColor[profile.role] || roleColor.user}`}>
            {roleLabel[profile.role] || 'Uživatel'}
          </span>
        </div>

        {profile.bio && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{profile.bio}</p>
        )}

        <div className="flex gap-2 flex-wrap mb-4">
          {profile.bike_type && (
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-lg">
              {bikeTypeLabel[profile.bike_type]}
            </span>
          )}
          {profile.rider_level && (
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-lg">
              {riderLevelLabel[profile.rider_level]}
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {profile.strava_url && (
            <button
              onClick={() => window.open(profile.strava_url, '_blank')}
              className="bg-orange-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 transition"
            >
              Strava
            </button>
          )}
          {profile.instagram_url && (
            <button
              onClick={() => window.open(profile.instagram_url, '_blank')}
              className="bg-purple-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-purple-700 transition"
            >
              Instagram
            </button>
          )}

          {currentUser && !isMe && !isTeam && (
            <>
              {!friendship && (
                <button
                  onClick={() => sendFriendRequest(profile.id)}
                  className="bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 transition"
                >
                  Přidat přítele
                </button>
              )}
              {friendship && friendship.status === 'pending' && friendship.isSender && (
                <span className="bg-gray-700 text-gray-400 text-xs px-3 py-1.5 rounded-lg">
                  Žádost odeslána
                </span>
              )}
              {friendship && friendship.status === 'pending' && !friendship.isSender && (
                <div className="flex gap-2">
                  <button
                    onClick={() => respondToRequest(friendship.id, 'accepted')}
                    className="bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 transition"
                  >
                    Přijmout
                  </button>
                  <button
                    onClick={() => respondToRequest(friendship.id, 'rejected')}
                    className="bg-red-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
                  >
                    Odmítnout
                  </button>
                </div>
              )}
              {friendship && friendship.status === 'accepted' && (
                <span className="bg-green-900 text-green-400 text-xs px-3 py-1.5 rounded-lg">
                  Přátelé
                </span>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Načítám...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-16">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-white mb-2">Komunita</h1>
        <p className="text-gray-400 mb-10">Poznej lidi za Trails for All.</p>

        {/* Čekající žádosti o přátelství */}
        {pendingRequests.length > 0 && (
          <div className="bg-orange-950 border border-orange-800 rounded-2xl p-4 mb-8">
            <h3 className="text-orange-400 font-semibold mb-2">
              Žádosti o přátelství ({pendingRequests.length})
            </h3>
            <p className="text-gray-400 text-sm">Podívej se níže na karty uživatelů kteří tě chtějí přidat.</p>
          </div>
        )}

        {/* Tým */}
        {team.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">Náš tým</h2>
            <p className="text-gray-400 mb-6">Lidé kteří stojí za Trails for All.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map(profile => (
                <ProfileCard key={profile.id} profile={profile} isTeam={true} />
              ))}
            </div>
          </div>
        )}

        {/* Členové */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Bikeři</h2>
              <p className="text-gray-400">Komunita Trails for All ({members.length} členů)</p>
            </div>
          </div>

          <div className="mb-6">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Hledat podle username, města nebo bio..."
            />
          </div>

          {filteredMembers.length === 0 && (
            <p className="text-gray-400">Žádní bikeři nenalezeni.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}