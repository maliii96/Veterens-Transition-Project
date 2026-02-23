import { supabase } from './supabase'

export type SubscriptionTier = 'free' | 'pro'
export type FeatureType = 'assessments' | 'chat' | 'plans' | 'resumes'

// Usage limits for each tier
export const USAGE_LIMITS = {
  free: {
    assessments: 3,
    chat: 10,
    plans: 1,
    resumes: 2,
  },
  pro: {
    assessments: 50,
    chat: 500,
    plans: 5,
    resumes: 5,
  },
} as const

// Get user's current subscription tier and usage
export async function getUserUsage(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier, usage_assessments_month, usage_chat_month, usage_plan_count, usage_resume_count, usage_reset_date')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user usage:', error)
    return null
  }

  const tier = (data.subscription_tier || 'free') as SubscriptionTier
  const limits = USAGE_LIMITS[tier]

  return {
    tier,
    usage: {
      assessments: data.usage_assessments_month || 0,
      chat: data.usage_chat_month || 0,
      plans: data.usage_plan_count || 0,
      resumes: data.usage_resume_count || 0,
    },
    limits,
    resetDate: data.usage_reset_date,
  }
}

// Check if user can perform an action (has not reached limit)
export async function canUseFeature(userId: string, feature: FeatureType): Promise<boolean> {
  const usage = await getUserUsage(userId)
  if (!usage) return false

  const currentUsage = usage.usage[feature]
  const limit = usage.limits[feature]

  return currentUsage < limit
}

// Increment usage counter for a feature
export async function incrementUsage(userId: string, feature: FeatureType): Promise<boolean> {
  const fieldMap = {
    assessments: 'usage_assessments_month',
    chat: 'usage_chat_month',
    plans: 'usage_plan_count',
    resumes: 'usage_resume_count',
  }

  const field = fieldMap[feature]

  // First, get current value
  const { data: currentData } = await supabase
    .from('profiles')
    .select(field)
    .eq('id', userId)
    .single()

  if (!currentData) return false

  const currentValue = (currentData as any)[field] || 0

  // Increment
  const { error } = await supabase
    .from('profiles')
    .update({ [field]: currentValue + 1 })
    .eq('id', userId)

  if (error) {
    console.error('Error incrementing usage:', error)
    return false
  }

  return true
}

// Get remaining usage for all features
export async function getRemainingUsage(userId: string) {
  const usage = await getUserUsage(userId)
  if (!usage) return null

  return {
    tier: usage.tier,
    assessments: {
      used: usage.usage.assessments,
      limit: usage.limits.assessments,
      remaining: Math.max(0, usage.limits.assessments - usage.usage.assessments),
    },
    chat: {
      used: usage.usage.chat,
      limit: usage.limits.chat,
      remaining: Math.max(0, usage.limits.chat - usage.usage.chat),
    },
    plans: {
      used: usage.usage.plans,
      limit: usage.limits.plans,
      remaining: Math.max(0, usage.limits.plans - usage.usage.plans),
    },
    resumes: {
      used: usage.usage.resumes,
      limit: usage.limits.resumes,
      remaining: Math.max(0, usage.limits.resumes - usage.usage.resumes),
    },
    resetDate: usage.resetDate,
  }
}

// Check if user has active Pro subscription
export async function hasProSubscription(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', userId)
    .single()

  if (error) return false

  return data.subscription_tier === 'pro' && data.subscription_status === 'active'
}
