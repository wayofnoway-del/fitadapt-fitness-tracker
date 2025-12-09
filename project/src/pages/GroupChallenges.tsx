import { useEffect, useState } from 'react'
import { Users, Plus, Calendar, MapPin, Clock, Trophy, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type GroupChallenge = {
  id: string
  creator_id: string
  title: string
  description: string
  challenge_type: string
  difficulty: 'easy' | 'medium' | 'hard'
  meetup_date: string
  meetup_time: string
  location_name: string
  location_address: string
  max_participants: number
  created_at: string
  participant_count?: number
  user_status?: 'pending' | 'accepted' | 'declined' | null
}

export default function GroupChallenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<GroupChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [challengeType, setChallengeType] = useState('running')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [meetupDate, setMeetupDate] = useState('')
  const [meetupTime, setMeetupTime] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(10)

  useEffect(() => {
    if (user) {
      fetchChallenges()
    }
  }, [user])

  const fetchChallenges = async () => {
    if (!user) return

    try {
      // Fetch all group challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('group_challenges')
        .select('*')
        .gte('meetup_date', new Date().toISOString())
        .order('meetup_date', { ascending: true })

      if (challengesError) throw challengesError

      // Fetch participant counts and user's participation status
      const challengesWithDetails = await Promise.all(
        (challengesData || []).map(async (challenge) => {
          // Get participant count
          const { count } = await supabase
            .from('group_challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id)
            .eq('status', 'accepted')

          // Get user's participation status
          const { data: userParticipation } = await supabase
            .from('group_challenge_participants')
            .select('status')
            .eq('challenge_id', challenge.id)
            .eq('user_id', user.id)
            .single()

          return {
            ...challenge,
            participant_count: count || 0,
            user_status: userParticipation?.status || null,
          }
        })
      )

      setChallenges(challengesWithDetails)
    } catch (err: any) {
      console.error('Error fetching challenges:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createChallenge = async () => {
    if (!user) return

    if (!title || !description || !meetupDate || !meetupTime || !locationName || !locationAddress) {
      setError('Please fill in all fields')
      return
    }

    setError('')
    setSuccess('')

    try {
      const { error: insertError } = await supabase
        .from('group_challenges')
        .insert({
          creator_id: user.id,
          title,
          description,
          challenge_type: challengeType,
          difficulty,
          meetup_date: meetupDate,
          meetup_time: meetupTime,
          location_name: locationName,
          location_address: locationAddress,
          max_participants: maxParticipants,
        })

      if (insertError) throw insertError

      setSuccess('Group challenge created successfully!')
      setShowCreateModal(false)
      resetForm()
      fetchChallenges()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to create challenge')
    }
  }

  const joinChallenge = async (challengeId: string) => {
    if (!user) return

    try {
      const { error: insertError } = await supabase
        .from('group_challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          status: 'accepted',
        })

      if (insertError) throw insertError

      setSuccess('Successfully joined the challenge!')
      fetchChallenges()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to join challenge')
    }
  }

  const leaveChallenge = async (challengeId: string) => {
    if (!user) return

    try {
      const { error: deleteError } = await supabase
        .from('group_challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      setSuccess('Left the challenge')
      fetchChallenges()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to leave challenge')
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setChallengeType('running')
    setDifficulty('medium')
    setMeetupDate('')
    setMeetupTime('')
    setLocationName('')
    setLocationAddress('')
    setMaxParticipants(10)
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'hard':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'easy':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Challenges</h1>
          <p className="text-gray-600 mt-1">Create or join fitness challenges with nearby members</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Challenge
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming group challenges. Create one to get started!</p>
          </div>
        ) : (
          challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{challenge.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {challenge.challenge_type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{challenge.participant_count}/{challenge.max_participants}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{challenge.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(challenge.meetup_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{challenge.meetup_time}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{challenge.location_name}</div>
                    <div className="text-xs">{challenge.location_address}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                {challenge.creator_id === user?.id ? (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    You created this challenge
                  </div>
                ) : challenge.user_status === 'accepted' ? (
                  <button
                    onClick={() => leaveChallenge(challenge.id)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Leave Challenge
                  </button>
                ) : challenge.participant_count! >= challenge.max_participants ? (
                  <div className="w-full bg-gray-100 text-gray-500 py-2 rounded-lg text-sm font-medium text-center">
                    Challenge Full
                  </div>
                ) : (
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className="w-full bg-green-50 hover:bg-green-100 text-green-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Join Challenge
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Group Challenge</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Morning 5K Run"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the challenge..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Type
                  </label>
                  <select
                    value={challengeType}
                    onChange={(e) => setChallengeType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="running">Running</option>
                    <option value="cycling">Cycling</option>
                    <option value="hiking">Hiking</option>
                    <option value="yoga">Yoga</option>
                    <option value="workout">Workout</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meetup Date
                  </label>
                  <input
                    type="date"
                    value={meetupDate}
                    onChange={(e) => setMeetupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meetup Time
                  </label>
                  <input
                    type="time"
                    value={meetupTime}
                    onChange={(e) => setMeetupTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g., Central Park"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Address
                </label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g., 123 Park Ave, New York, NY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  min={2}
                  max={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createChallenge}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                >
                  Create Challenge
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
