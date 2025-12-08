import { useEffect, useState, FormEvent } from 'react'
import { Activity, Plus, Edit, Trash2, X } from 'lucide-react'
import { supabase, Workout } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Workouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [filter, setFilter] = useState<string>('all')

  // Form state
  const [workoutDate, setWorkoutDate] = useState('')
  const [workoutType, setWorkoutType] = useState('running')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [calories, setCalories] = useState('')
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'intense'>('moderate')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (user) {
      fetchWorkouts()
    }
  }, [user])

  const fetchWorkouts = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('workout_date', { ascending: false })

    if (error) {
      console.error('Error fetching workouts:', error)
    } else {
      setWorkouts(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setWorkoutDate('')
    setWorkoutType('running')
    setDuration('')
    setDistance('')
    setCalories('')
    setIntensity('moderate')
    setNotes('')
    setEditingWorkout(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    const workoutData = {
      user_id: user.id,
      workout_date: workoutDate,
      workout_type: workoutType,
      duration: duration ? parseInt(duration) : null,
      distance: distance ? parseFloat(distance) : null,
      calories: calories ? parseInt(calories) : null,
      intensity,
      notes: notes || null,
    }

    if (editingWorkout) {
      // Update existing workout
      const { error } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', editingWorkout.id)

      if (error) {
        alert('Error updating workout: ' + error.message)
      } else {
        fetchWorkouts()
        resetForm()
      }
    } else {
      // Create new workout
      const { error } = await supabase.from('workouts').insert([workoutData])

      if (error) {
        alert('Error logging workout: ' + error.message)
      } else {
        fetchWorkouts()
        resetForm()
      }
    }
  }

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout)
    setWorkoutDate(workout.workout_date)
    setWorkoutType(workout.workout_type)
    setDuration(workout.duration?.toString() || '')
    setDistance(workout.distance?.toString() || '')
    setCalories(workout.calories?.toString() || '')
    setIntensity(workout.intensity || 'moderate')
    setNotes(workout.notes || '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return

    const { error } = await supabase.from('workouts').delete().eq('id', id)

    if (error) {
      alert('Error deleting workout: ' + error.message)
    } else {
      fetchWorkouts()
    }
  }

  const filteredWorkouts = workouts.filter((workout) => {
    if (filter === 'all') return true
    return workout.workout_type === filter
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-600 mt-1">Log and track your fitness activities</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Log Workout
        </button>
      </div>

      {/* Log Workout Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingWorkout ? 'Edit Workout' : 'Log New Workout'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workout Type</label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="running">Running</option>
                  <option value="cycling">Cycling</option>
                  <option value="gym">Gym</option>
                  <option value="swimming">Swimming</option>
                  <option value="yoga">Yoga</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="5.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="250"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as 'light' | 'moderate' | 'intense')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="How did it feel? Any observations?"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                {editingWorkout ? 'Update Workout' : 'Log Workout'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {['all', 'running', 'cycling', 'gym', 'swimming', 'yoga', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Workouts History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'all'
                ? 'No workouts logged yet. Start tracking your fitness!'
                : `No ${filter} workouts found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Distance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Calories</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Intensity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkouts.map((workout) => (
                  <tr key={workout.id} className="border-b last:border-b-0">
                    <td className="py-3 px-4 text-sm">{workout.workout_date}</td>
                    <td className="py-3 px-4 text-sm capitalize">{workout.workout_type}</td>
                    <td className="py-3 px-4 text-sm">{workout.duration || '-'} min</td>
                    <td className="py-3 px-4 text-sm">{workout.distance || '-'} km</td>
                    <td className="py-3 px-4 text-sm">{workout.calories || '-'}</td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          workout.intensity === 'intense'
                            ? 'bg-red-100 text-red-700'
                            : workout.intensity === 'moderate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {workout.intensity || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(workout)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
