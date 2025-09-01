'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { CreditCard, Activity, User, Settings, BarChart3, Clock } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/auth'
import { UsageStats } from '@/types'

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchUsageStats()
    }
  }, [user])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/auth/usage-stats')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUsageStats(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const currentPlan = SUBSCRIPTION_PLANS[profile.plan]
  const creditsRemaining = profile.plan === 'premium' ? '∞' : profile.researchCredits
  const creditsTotal = profile.plan === 'premium' ? '∞' : currentPlan.researchCredits

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.fullName || user.email}
          </h1>
          <p className="text-gray-600">
            Manage your research projects and account settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Plan Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentPlan.name}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ${currentPlan.price}/month
            </p>
          </div>

          {/* Credits Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Research Credits</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {creditsRemaining}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {profile.plan === 'premium' ? 'Unlimited' : `of ${creditsTotal} total`}
            </p>
          </div>

          {/* Usage Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actions This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '...' : usageStats?.totalActions || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Research activities
            </p>
          </div>

          {/* Account Age Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Account created
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/research')}
                    className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                  >
                    <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Start New Research</h3>
                      <p className="text-sm text-gray-600">Begin a new market research project</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/pricing')}
                    className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                  >
                    <CreditCard className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Upgrade Plan</h3>
                      <p className="text-sm text-gray-600">Get more credits and features</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <User className="w-8 h-8 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {profile.fullName || 'No name set'}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <button className="text-blue-600 text-sm hover:text-blue-700">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Plan Features */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Plan Features</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                {profile.plan !== 'premium' && (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {usageStats && usageStats.recentLogs.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {usageStats.recentLogs.slice(0, 5).map((log, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      -{log.creditsUsed} credit{log.creditsUsed !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}