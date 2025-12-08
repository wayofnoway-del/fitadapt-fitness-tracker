import { useEffect, useState, FormEvent } from 'react'
import { User } from 'lucide-react'
import { supabase, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Form state
  const [fullName, setFullName] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [preferredActivities, setPreferredActivities] = useState<string[]>([])

  const activityOptions = ['running', 'cycling', 'swimming', 'gym', 'yoga', 'other']

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // Profile doesn't exist yet, that's okay
      console.log('No profile found, will create on save')
    } else if (data) {
      setFullName(data.full_name || '')
      setFitnessLevel(data.fitness_level || 'beginner')
      setAge(data.age?.toString() || '')
      setWeight(data.weight?.toString() || '')
      setHeight(data.height?.toString() || '')
      setPreferredActivities(data.preferred_activities || [])
    }
    setLoading(false)
  }

  const handleActivityToggle = (activity: string) => {
    if (preferredActivities.includes(activity)) {
      setPreferredActivities(preferredActivities.filter((a) => a !== activity))
    } else {
      setPreferredActivities([...preferredActivities, activity])
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setMessage('')
    setSaving(true)

    const profileData = {
      id: user.id,
      email: user.email,
      full_name: fullName || null,
      fitness_level: fitnessLevel,
      age: age ? parseInt(age) : null,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      preferred_activities: preferredActivities,
    }

    // Try to update first
    let { error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)

    // If update fails (no rows), insert instead
    if (updateError) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])

      if (insertError) {
        setError('Error saving profile: ' + insertError.message)
        setSaving(false)
        return
      }
    }

    setMessage('Profile saved successfully!')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your fitness profile and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="bg-blue-100 p-4 rounded-full">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{fullName || 'Your Profile'}</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
            <select
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="175"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Activities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {activityOptions.map((activity) => (
                <label
                  key={activity}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={preferredActivities.includes(activity)}
                    onChange={() => handleActivityToggle(activity)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{activity}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
