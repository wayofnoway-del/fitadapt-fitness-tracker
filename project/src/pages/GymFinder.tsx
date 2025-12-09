import { useState } from 'react'
import { MapPin, Search, Dumbbell, Users, Clock, Phone, ExternalLink, TreePine, Waves, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Location = {
  name: string
  address: string
  distance?: string
  rating?: number
  phone?: string
  website?: string
  hours?: string
  type: 'gym' | 'fitness_group' | 'studio' | 'park' | 'trail' | 'lake' | 'outdoor'
  amenities?: string[]
  free?: boolean
}

export default function GymFinder() {
  const [location, setLocation] = useState('')
  const [searchRadius, setSearchRadius] = useState('5')
  const [searchType, setSearchType] = useState<'all' | 'gym' | 'fitness_group' | 'studio' | 'outdoor' | 'free'>('all')
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location')
      return
    }

    setLoading(true)
    setError('')
    setLocations([])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/find-locations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            location,
            radius: parseInt(searchRadius),
            type: searchType,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search for locations')
      }

      setLocations(result.locations || [])
    } catch (err: any) {
      setError(err.message || 'Failed to search for gyms')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gym':
        return <Dumbbell className="h-5 w-5" />
      case 'fitness_group':
        return <Users className="h-5 w-5" />
      case 'studio':
        return <MapPin className="h-5 w-5" />
      case 'park':
      case 'trail':
        return <TreePine className="h-5 w-5" />
      case 'lake':
      case 'outdoor':
        return <Waves className="h-5 w-5" />
      default:
        return <Dumbbell className="h-5 w-5" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'gym':
        return 'bg-blue-100 text-blue-700'
      case 'fitness_group':
        return 'bg-green-100 text-green-700'
      case 'studio':
        return 'bg-purple-100 text-purple-700'
      case 'park':
      case 'trail':
        return 'bg-emerald-100 text-emerald-700'
      case 'lake':
      case 'outdoor':
        return 'bg-cyan-100 text-cyan-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Find Workout Locations</h1>
        <p className="text-gray-600 mt-1">Discover gyms, studios, parks, trails, and outdoor spaces for your fitness journey</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city, zip code, or address"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Radius (miles)
            </label>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1">1 mile</option>
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="25">25 miles</option>
              <option value="50">50 miles</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="gym">Gyms</option>
              <option value="studio">Studios</option>
              <option value="outdoor">Parks & Trails</option>
              <option value="free">Free Locations</option>
              <option value="fitness_group">Fitness Groups</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Searching...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Search
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {locations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Found {locations.length} {locations.length === 1 ? 'result' : 'results'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      {getTypeIcon(loc.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{loc.name}</h3>
                        {loc.free && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            <DollarSign className="h-3 w-3" />
                            Free
                          </span>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getTypeBadgeColor(loc.type)}`}>
                        {loc.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {loc.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">{loc.rating}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{loc.address}</span>
                  </div>

                  {loc.distance && (
                    <div className="text-gray-600">
                      <span className="font-medium">{loc.distance}</span> away
                    </div>
                  )}

                  {loc.amenities && loc.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {loc.amenities.map((amenity, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}

                  {loc.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${loc.phone}`} className="hover:text-blue-600">
                        {loc.phone}
                      </a>
                    </div>
                  )}

                  {loc.hours && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{loc.hours}</span>
                    </div>
                  )}

                  {loc.website && (
                    <div className="pt-2">
                      <a
                        href={loc.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Visit Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && locations.length === 0 && location && !error && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No locations found in this area.</p>
          <p className="text-gray-400 text-sm mt-2">Try increasing the search radius or changing the location.</p>
        </div>
      )}
    </div>
  )
}
