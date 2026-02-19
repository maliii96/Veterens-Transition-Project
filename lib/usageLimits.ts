import { SupabaseClient } from '@supabase/supabase-js'

export type UsageFeature = 'assessment' | 'chat' | 'plan' | 'resume'

const FREE_LIMITS: Record<UsageFeature, number> = {
  assessment: 3,   // per month
  chat: 10,        // per month
  plan: 1,         // per month
  resume: 2,       // per month
}

const PAID_LIMITS: Record<UsageFeature, number> = {
  assessment: 25,
  chat: 100,
  plan: 3,
  resume: 10,
}

const USAGE_COLUMNS: Record<UsageFeature, string> = {
  assessment: 'usage_assessments_month',
  chat: 'usage_chat_month',
  plan: 'usage_plan_count',
  resume: 'usage_resume_month',
}

function getFirstOfMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export async function checkAndIncrementUsage(
  adminClient: SupabaseClient,
  userId: string,
  feature: UsageFeature
): Promise<{ allowed: boolean; current: number; limit: number; isPaid: boolean }> {
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_paid, usage_assessments_month, usage_chat_month, usage_plan_count, usage_resume_month, usage_reset_date')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { allowed: false, current: 0, limit: 0, isPaid: false }
  }

  const isPaid = profile.is_paid ?? false
  const limits = isPaid ? PAID_LIMITS : FREE_LIMITS
  const col = USAGE_COLUMNS[feature]

  // Reset monthly counters if we're in a new month (plan count is monthly too)
  const firstOfMonth = getFirstOfMonth()
  const needsReset = !profile.usage_reset_date || profile.usage_reset_date < firstOfMonth

  let current: number
  if (needsReset) {
    // Reset all monthly counters
    await adminClient.from('profiles').update({
      usage_assessments_month: 0,
      usage_chat_month: 0,
      usage_plan_count: 0,
      usage_resume_month: 0,
      usage_reset_date: firstOfMonth,
    }).eq('id', userId)
    current = 0
  } else {
    current = (profile[col as keyof typeof profile] as number) ?? 0
  }

  const limit = limits[feature]

  if (current >= limit) {
    return { allowed: false, current, limit, isPaid }
  }

  // Increment
  await adminClient.from('profiles')
    .update({ [col]: current + 1 })
    .eq('id', userId)

  return { allowed: true, current: current + 1, limit, isPaid }
}

export function usageLimitResponse(current: number, limit: number, isPaid: boolean, feature: UsageFeature) {
  const upgradeMsg = isPaid
    ? `You've reached your ${limit}/month limit for this feature.`
    : `Free plan limit reached (${limit}/${limit}). Upgrade to Pro for ${PAID_LIMITS[feature]}x more usage.`

  return {
    error: 'Usage limit reached',
    message: upgradeMsg,
    current,
    limit,
    isPaid,
    upgrade: !isPaid,
  }
}
