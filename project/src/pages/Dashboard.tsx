import { useEffect, useState } from 'react'
import { Activity, Target, TrendingUp, Calendar, Award, Flame } from 'lucide-react'
import { supabase, Goal, Workout, FitnessSummary } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<FitnessSummary | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch stats summary
      const { data: statsData } = await supabase
        .rpc('get_user_fitness_summary', { user_uuid: user.id })

      if (statsData) {
        setStats(statsData as FitnessSummary)
      }

      // Fetch active goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5)

      if (goalsData) setGoals(goalsData)

      // Fetch recent workouts
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(5)

      if (workoutsData) setRecentWorkouts(workoutsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      icon: Activity,
      label: 'Total Workouts',
      value: stats?.total_workouts || 0,
      color: 'bg-blue-500',
    },
    {
      icon: TrendingUp,
      label: 'Total Distance',
      value: `${(stats?.total_distance || 0).toFixed(1)} km`,
      color: 'bg-green-500',
    },
    {
      icon: Calendar,
      label: 'Total Duration',
      value: `${stats?.total_duration || 0} min`,
      color: 'bg-purple-500',
    },
    {
      icon: Flame,
      label: 'Total Calories',
      value: stats?.total_calories || 0,
      color: 'bg-orange-500',
    },
    {
      icon: Target,
      label: 'Active Goals',
      value: stats?.active_goals || 0,
      color: 'bg-pink-500',
    },
    {
      icon: Award,
      label: 'Current Streak',
      value: `${stats?.recent_streak || 0} days`,
      color: 'bg-yellow-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your fitness progress at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Active Goals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Goals</h2>
        {goals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No active goals. Create a goal to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = (goal.current_value / goal.target_value) * 100
              return (
                <div key={goal.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% complete</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Workouts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Workouts</h2>
        {recentWorkouts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No workouts logged yet. Start tracking your fitness!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Duration</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Distance</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Intensity</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkouts.map((workout) => (
                  <tr key={workout.id} className="border-b last:border-b-0">
                    <td className="py-3 px-4 text-sm">{workout.workout_date}</td>
                    <td className="py-3 px-4 text-sm capitalize">{workout.workout_type}</td>
                    <td className="py-3 px-4 text-sm">{workout.duration || '-'} min</td>
                    <td className="py-3 px-4 text-sm">{workout.distance || '-'} km</td>
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
