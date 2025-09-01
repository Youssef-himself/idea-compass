import { createServerSupabaseClient, createServiceRoleClient } from './supabase'
import { Database } from './supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Plan configurations
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    users: 1,
    researchCredits: 3,
    features: ['Basic research tools', 'Reddit data scraping', 'Basic reports'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    users: 1,
    researchCredits: 50,
    features: ['Advanced research tools', 'Priority support', 'Detailed analytics', 'Export to multiple formats'],
  },
  premium: {
    name: 'Premium',
    price: 99,
    users: 3,
    researchCredits: -1, // Unlimited
    features: ['All Pro features', 'Team collaboration', 'Unlimited research', 'Custom branding', 'API access'],
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// Authentication helpers
export class AuthHelpers {
  static async getCurrentUser() {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  }

  static async getUserProfile(userId?: string) {
    const supabase = await createServerSupabaseClient()
    
    // If no userId provided, get current user
    if (!userId) {
      const user = await this.getCurrentUser()
      if (!user) return null
      userId = user.id
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return profile
  }

  static async createUserProfile(userData: {
    userId: string
    email: string
    fullName?: string
  }): Promise<Profile | null> {
    const supabase = createServiceRoleClient()

    const profileData: ProfileInsert = {
      user_id: userData.userId,
      email: userData.email,
      full_name: userData.fullName || null,
      plan: 'free',
      research_credits: SUBSCRIPTION_PLANS.free.researchCredits,
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return profile
  }

  static async updateUserProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    const supabase = createServiceRoleClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    return profile
  }

  static async hasResearchCredits(userId: string): Promise<{ hasCredits: boolean; remainingCredits: number }> {
    const profile = await this.getUserProfile(userId)
    
    if (!profile) {
      return { hasCredits: false, remainingCredits: 0 }
    }

    // Premium plan has unlimited credits
    if (profile.plan === 'premium') {
      return { hasCredits: true, remainingCredits: -1 }
    }

    return {
      hasCredits: profile.research_credits > 0,
      remainingCredits: profile.research_credits,
    }
  }

  static async consumeResearchCredit(userId: string, action: string = 'research'): Promise<boolean> {
    const profile = await this.getUserProfile(userId)
    
    if (!profile) {
      return false
    }

    // Premium plan has unlimited credits
    if (profile.plan === 'premium') {
      await this.logUsage(userId, action, 0)
      return true
    }

    if (profile.research_credits <= 0) {
      return false
    }

    const supabase = createServiceRoleClient()

    // Decrement credit and log usage in a transaction
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        research_credits: profile.research_credits - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error consuming research credit:', updateError)
      return false
    }

    await this.logUsage(userId, action, 1)
    return true
  }

  static async logUsage(userId: string, action: string, creditsUsed: number, metadata?: Record<string, any>) {
    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        action,
        credits_used: creditsUsed,
        metadata: metadata || null,
      })

    if (error) {
      console.error('Error logging usage:', error)
    }
  }

  static async resetMonthlyCredits() {
    const supabase = createServiceRoleClient()

    // Reset credits for Pro plan users (50 credits per month)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        research_credits: SUBSCRIPTION_PLANS.pro.researchCredits,
        updated_at: new Date().toISOString()
      })
      .eq('plan', 'pro')

    if (error) {
      console.error('Error resetting monthly credits:', error)
    }
  }

  static async getUserUsageStats(userId: string, days: number = 30) {
    const supabase = createServiceRoleClient()
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data: usageLogs, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching usage stats:', error)
      return null
    }

    const totalCreditsUsed = usageLogs.reduce((sum, log) => sum + log.credits_used, 0)
    const actionCounts = usageLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalCreditsUsed,
      totalActions: usageLogs.length,
      actionCounts,
      recentLogs: usageLogs.slice(0, 10),
    }
  }
}

// Email validation helpers
export class EmailValidator {
  private static disposableDomains: Set<string> | null = null

  static async loadDisposableDomains(): Promise<Set<string>> {
    if (this.disposableDomains) {
      return this.disposableDomains
    }

    try {
      // Import the disposable domains list
      const disposableEmailDomains = await import('disposable-email-domains')
      this.disposableDomains = new Set(disposableEmailDomains.default)
      return this.disposableDomains
    } catch (error) {
      console.error('Error loading disposable domains:', error)
      // Fallback to a basic list
      this.disposableDomains = new Set([
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
        'mailinator.com', 'throwaway.email', 'temp-mail.org'
      ])
      return this.disposableDomains
    }
  }

  static async isDisposableEmail(email: string): Promise<boolean> {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return true

    const disposableDomains = await this.loadDisposableDomains()
    return disposableDomains.has(domain)
  }

  static async isAllowedEmail(email: string): Promise<boolean> {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return false

    // Check if it's a disposable email
    if (await this.isDisposableEmail(email)) {
      return false
    }

    // Allow common professional domains
    const allowedDomains = new Set([
      'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com',
      'protonmail.com', 'icloud.com', 'aol.com', 'live.com'
    ])

    // Allow if it's in the allowed list or has a company domain (more than one dot)
    return allowedDomains.has(domain) || domain.split('.').length > 2
  }

  static validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}