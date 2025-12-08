import { useEffect, useState } from 'react'
import { Trophy, Plus, Check, X, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type Challenge = {
  id: string
  user_id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  start_date: string
  end_date: string
  completed: boolean
  completed_date: string | null
  ai_generated: boolean
  challenge_data: any
  created_at: string
}

export default function Challenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      fetchChallenges()
    }
  }, [user])

  const fetchChallenges = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching challenges:', error)
    } else {
      setChallenges(data || [])
    }
    setLoading(false)
  }

  const generateChallenge = async () => {
    setGenerating(true)
    setError('')
    setSuccess('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-challenge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate challenge')
      }

      setSuccess('AI challenge generated successfully!')
      fetchChallenges()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to generate challenge')
    } finally {
      setGenerating(false)
    }
  }

  const markAsComplete = async (challengeId: string) => {
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('challenges')
      .update({ completed: true, completed_date: today })
      .eq('id', challengeId)

    if (error) {
      alert('Error updating challenge: ' + error.message)
    } else {
      fetchChallenges()
    }
  }

  const deleteChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return

    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challengeId)

    if (error) {
      alert('Error deleting challenge: ' + error.message)
    } else {
      fetchChallenges()
    }
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const activeChallenges = challenges.filter(c => !c.completed)
  const completedChallenges = challenges.filter(c => c.completed)

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
          <h1 className="text-3xl font-bold text-gray-900">My Challenges</h1>
          <p className="text-gray-600 mt-1">AI-powered personalized fitness challenges</p>
        </div>
        <button
          onClick={generateChallenge}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Generate AI Challenge
            </>
          )}
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

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-4 font-medium transition ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Challenges ({activeChallenges.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-2 px-4 font-medium transition ${
            activeTab === 'completed'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedChallenges.length})
        </button>
      </div>

      {/* Active Challenges */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeChallenges.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active challenges. Generate one to get started!</p>
            </div>
          ) : (
            activeChallenges.map((challenge) => {
              const daysRemaining = getDaysRemaining(challenge.end_date)
              return (
                <div
                  key={challenge.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Trophy className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                            challenge.difficulty === 'hard'
                              ? 'bg-red-100 text-red-700'
                              : challenge.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteChallenge(challenge.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-gray-700 mb-4">{challenge.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Start Date:</span>
                      <span className="font-medium">{challenge.start_date}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>End Date:</span>
                      <span className="font-medium">{challenge.end_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Remaining:</span>
                      <span
                        className={`font-medium ${
                          daysRemaining < 0
                            ? 'text-red-600'
                            : daysRemaining < 3
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {daysRemaining < 0 ? 'Overdue' : daysRemaining + ' days'}
                      </span>
                    </div>
                  </div>

                  {challenge.challenge_data && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-600 mb-2">Target Metrics:</p>
                      <div className="text-sm space-y-1">
                        {challenge.challenge_data.workout_count && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Workouts:</span>
                            <span className="font-medium">{challenge.challenge_data.workout_count}</span>
                          </div>
                        )}
                        {challenge.challenge_data.total_distance && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Distance:</span>
                            <span className="font-medium">{challenge.challenge_data.total_distance} km</span>
                          </div>
                        )}
                        {challenge.challenge_data.total_duration && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{challenge.challenge_data.total_duration} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => markAsComplete(challenge.id)}
                    className="mt-4 w-full bg-green-50 hover:bg-green-100 text-green-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Mark as Complete
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Completed Challenges */}
      {activeTab === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedChallenges.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No completed challenges yet. Complete one to see it here!</p>
            </div>
          ) : (
            completedChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-gray-50 rounded-lg shadow p-6 opacity-75"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Trophy className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium mt-1">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{challenge.description}</p>

                <div className="text-sm text-gray-600">
                  <p>Completed on: {challenge.completed_date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
