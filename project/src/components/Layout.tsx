import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Target, Activity, Trophy, Users, MapPin, User, LogOut, Dumbbell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/workouts', label: 'Workouts', icon: Activity },
    { path: '/challenges', label: 'Challenges', icon: Trophy },
    { path: '/group-challenges', label: 'Group', icon: Users },
    { path: '/gym-finder', label: 'Find Gyms', icon: MapPin },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* MomentumAI Logo */}
                <img
                  src="/runner-logo.png"
                  alt="MomentumAI Logo"
                  className="w-10 h-10 rounded-full"
                />
                <span className="ml-2 text-xl font-bold" style={{ letterSpacing: '0.01em' }}>
                  <span style={{
                    background: 'linear-gradient(to bottom, #1e3a8a 0%, #3b82f6 40%, #1e40af 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Momentum</span>
                  <span className="text-blue-600">AI</span>
                </span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-md">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-md ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
