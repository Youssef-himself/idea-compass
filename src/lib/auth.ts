import { createServerSupabaseClient, createServiceRoleClient } from './supabase'
import { Database } from './supabase'
import { PLAN_DETAILS, getFreeplan, getProPlan, getPremiumPlan } from '../config/plans'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Plan configurations - using centralized config
export const SUBSCRIPTION_PLANS = {
  free: {
    name: getFreeplan().name,
    price: 0, // Keep as number for internal calculations
    users: 1,
    researchCredits: getFreeplan().credits,
    dailyLimit: getFreeplan().dailyCreditLimit!,
    features: getFreeplan().features,
  },
  pro: {
    name: getProPlan().name,
    price: 29, // Keep as number for internal calculations
    users: 1,
    researchCredits: getProPlan().credits,
    features: getProPlan().features,
  },
  premium: {
    name: getPremiumPlan().name,
    price: 99, // Keep as number for internal calculations
    users: 5,
    researchCredits: getPremiumPlan().credits, // This is 150, not -1
    features: getPremiumPlan().features,
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
      daily_credits_used: 0,
      last_credit_reset_at: new Date().toISOString(),
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

  static async hasResearchCredits(userId: string): Promise<{ hasCredits: boolean; remainingCredits: number; dailyRemaining: number }> {
    const profile = await this.getUserProfile(userId)
    
    if (!profile) {
      return { hasCredits: false, remainingCredits: 0, dailyRemaining: 0 }
    }

    // Admin users have unlimited access
    if (profile.role === 'ADMIN') {
      return { hasCredits: true, remainingCredits: -1, dailyRemaining: -1 }
    }

    // Premium plan has high credit limit (150 credits)
    if (profile.plan === 'premium') {
      return { hasCredits: profile.research_credits > 0, remainingCredits: profile.research_credits, dailyRemaining: -1 }
    }

    // Check if daily reset is needed
    const needsReset = this.needsDailyReset(profile.last_credit_reset_at)
    let dailyUsed = profile.daily_credits_used
    
    if (needsReset) {
      dailyUsed = 0
    }

    // For free plan, check both monthly and daily limits
    if (profile.plan === 'free' && profile.role !== 'ADMIN') {
      const dailyLimit = SUBSCRIPTION_PLANS.free.dailyLimit
      const dailyRemaining = Math.max(0, dailyLimit - dailyUsed)
      const hasCredits = profile.research_credits > 0 && dailyRemaining > 0
      
      return {
        hasCredits,
        remainingCredits: profile.research_credits,
        dailyRemaining,
      }
    }

    // For Pro plan, no daily limit
    return {
      hasCredits: profile.research_credits > 0,
      remainingCredits: profile.research_credits,
      dailyRemaining: -1,
    }
  }

  static async consumeResearchCredit(userId: string, action: string = 'research'): Promise<{ success: boolean; reason?: string }> {
    const profile = await this.getUserProfile(userId)
    
    if (!profile) {
      return { success: false, reason: 'Profile not found' }
    }

    // Admin users have unlimited access
    if (profile.role === 'ADMIN') {
      await this.logUsage(userId, action, 0)
      return { success: true }
    }

    // Premium plan has high credit limit but still consumes credits
    if (profile.plan === 'premium') {
      if (profile.research_credits <= 0) {
        return { success: false, reason: 'No research credits remaining' }
      }
      // Premium users still consume credits but have a high limit
    }

    if (profile.research_credits <= 0) {
      return { success: false, reason: 'No research credits remaining' }
    }

    const supabase = createServiceRoleClient()
    const now = new Date()
    
    // Check if daily reset is needed
    const needsReset = this.needsDailyReset(profile.last_credit_reset_at)
    let dailyUsed = profile.daily_credits_used
    
    if (needsReset) {
      dailyUsed = 0
    }

    // For free plan, check daily limit
    if (profile.plan === 'free' && profile.role !== 'ADMIN') {
      const dailyLimit = SUBSCRIPTION_PLANS.free.dailyLimit
      if (dailyUsed >= dailyLimit) {
        return { success: false, reason: 'Daily credit limit reached' }
      }
    }

    // Prepare update data
    const updateData: any = {
      research_credits: profile.research_credits - 1,
      daily_credits_used: dailyUsed + 1,
      updated_at: now.toISOString(),
    }

    // If reset was needed, update the reset timestamp
    if (needsReset) {
      updateData.last_credit_reset_at = now.toISOString()
    }

    // Update profile with new credit counts
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error consuming research credit:', updateError)
      return { success: false, reason: 'Database update failed' }
    }

    await this.logUsage(userId, action, 1)
    return { success: true }
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

    // Reset credits for Pro plan users
    const { error: proError } = await supabase
      .from('profiles')
      .update({ 
        research_credits: SUBSCRIPTION_PLANS.pro.researchCredits,
        updated_at: new Date().toISOString()
      })
      .eq('plan', 'pro')

    // Reset credits for Premium plan users
    const { error: premiumError } = await supabase
      .from('profiles')
      .update({ 
        research_credits: SUBSCRIPTION_PLANS.premium.researchCredits,
        updated_at: new Date().toISOString()
      })
      .eq('plan', 'premium')

    if (proError) {
      console.error('Error resetting Pro monthly credits:', proError)
    }
    if (premiumError) {
      console.error('Error resetting Premium monthly credits:', premiumError)
    }
  }

  static needsDailyReset(lastResetAt: string | null): boolean {
    if (!lastResetAt) return true
    
    const lastReset = new Date(lastResetAt)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    
    return lastReset < yesterday
  }

  static async resetDailyCreditsIfNeeded(userId: string): Promise<void> {
    const profile = await this.getUserProfile(userId)
    if (!profile) return
    
    if (this.needsDailyReset(profile.last_credit_reset_at)) {
      const supabase = createServiceRoleClient()
      
      await supabase
        .from('profiles')
        .update({
          daily_credits_used: 0,
          last_credit_reset_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
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