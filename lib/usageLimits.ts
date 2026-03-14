import { SupabaseClient } from '@supabase/supabase-js'

export type UsageFeature = 'assessment' | 'chat' | 'plan' | 'resume' | 'job_parse' | 'diagnostic' | 'role_clarity' | 'strategy'

const FREE_LIMITS: Record<UsageFeature, number> = {
  assessment: 3,   // per month
  chat: 10,        // per month
  plan: 1,         // per month
  resume: 3,       // per month
  job_parse: 5,    // per month
  diagnostic: 1,   // per month
  role_clarity: 1,  // per month
  strategy: 0,     // Pro only
}

const PAID_LIMITS: Record<UsageFeature, number> = {
  assessment: 25,
  chat: 100,
  plan: 3,
  resume: 10,
  job_parse: 50,
  diagnostic: 10,
  role_clarity: 10,
  strategy: 5,
}

const USAGE_COLUMNS: Record<UsageFeature, string> = {
  assessment: 'usage_assessments_month',
  chat: 'usage_chat_month',
  plan: 'usage_plan_count',
  resume: 'usage_resume_month',
  job_parse: 'usage_job_parse_month',
  diagnostic: 'usage_diagnostic_month',
  role_clarity: 'usage_role_clarity_month',
  strategy: 'usage_strategy_month',
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
    .select('is_paid, usage_assessments_month, usage_chat_month, usage_plan_count, usage_resume_month, usage_job_parse_month, usage_diagnostic_month, usage_role_clarity_month, usage_strategy_month, usage_reset_date')
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

  if (needsReset) {
    // Reset all monthly counters
    await adminClient.from('profiles').update({
      usage_assessments_month: 0,
      usage_chat_month: 0,
      usage_plan_count: 0,
      usage_resume_month: 0,
      usage_job_parse_month: 0,
      usage_diagnostic_month: 0,
      usage_role_clarity_month: 0,
      usage_strategy_month: 0,
      usage_reset_date: firstOfMonth,
    }).eq('id', userId)
  }

  const limit = limits[feature]

  // Atomic increment: only increment if under the limit
  // This prevents race conditions where concurrent requests bypass limits
  const { data: updated, error: updateError } = await adminClient
    .from('profiles')
    .update({ [col]: needsReset ? 1 : (profile[col as keyof typeof profile] as number ?? 0) + 1 })
    .eq('id', userId)
    .lt(col, limit)
    .select(col)
    .single()

  if (updateError || !updated) {
    // Update failed = user is at or over the limit
    const current = needsReset ? 0 : (profile[col as keyof typeof profile] as number ?? 0)
    return { allowed: false, current, limit, isPaid }
  }

  const newCount = (updated as any)[col] as number
  return { allowed: true, current: newCount, limit, isPaid }
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
