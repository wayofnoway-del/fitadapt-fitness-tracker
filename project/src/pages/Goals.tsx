import { useEffect, useState, FormEvent } from 'react'
import { Target, Plus, Edit, Trash2, X } from 'lucide-react'
import { supabase, Goal } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalType, setGoalType] = useState('distance')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('km')
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
    } else {
      setGoals(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setGoalType('distance')
    setTargetValue('')
    setUnit('km')
    setDeadline('')
    setEditingGoal(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    const goalData = {
      user_id: user.id,
      title,
      description,
      goal_type: goalType,
      target_value: parseFloat(targetValue),
      unit,
      deadline: deadline || null,
      status: 'active',
    }

    if (editingGoal) {
      // Update existing goal
      const { error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', editingGoal.id)

      if (error) {
        alert('Error updating goal: ' + error.message)
      } else {
        fetchGoals()
        resetForm()
      }
    } else {
      // Create new goal
      const { error } = await supabase.from('goals').insert([goalData])

      if (error) {
        alert('Error creating goal: ' + error.message)
      } else {
        fetchGoals()
        resetForm()
      }
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setTitle(goal.title)
    setDescription(goal.description || '')
    setGoalType(goal.goal_type || 'distance')
    setTargetValue(goal.target_value.toString())
    setUnit(goal.unit || 'km')
    setDeadline(goal.deadline || '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    const { error } = await supabase.from('goals').delete().eq('id', id)

    if (error) {
      alert('Error deleting goal: ' + error.message)
    } else {
      fetchGoals()
    }
  }

  const handleUpdateProgress = async (goal: Goal) => {
    const newValue = prompt(`Enter new progress value (current: ${goal.current_value} ${goal.unit}):`)
    if (newValue === null) return

    const numValue = parseFloat(newValue)
    if (isNaN(numValue) || numValue < 0) {
      alert('Please enter a valid positive number')
      return
    }

    const { error } = await supabase
      .from('goals')
      .update({ current_value: numValue })
      .eq('id', goal.id)

    if (error) {
      alert('Error updating progress: ' + error.message)
    } else {
      fetchGoals()
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-1">Set and track your fitness goals</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Goal
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Run 5km"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="distance">Distance</option>
                  <option value="weight">Weight Loss</option>
                  <option value="duration">Duration</option>
                  <option value="frequency">Frequency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., km, kg, sessions"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
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

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progress = (goal.current_value / goal.target_value) * 100
          return (
            <div key={goal.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{progress.toFixed(0)}% complete</p>
              </div>

              {goal.deadline && (
                <p className="text-xs text-gray-500 mt-2">Deadline: {goal.deadline}</p>
              )}

              <button
                onClick={() => handleUpdateProgress(goal)}
                className="mt-4 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-sm font-medium"
              >
                Update Progress
              </button>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No goals yet. Create your first goal to get started!</p>
        </div>
      )}
    </div>
  )
}
