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

async function ensureProfileExists(
  adminClient: SupabaseClient,
  userId: string
): Promise<void> {
  const { data } = await adminClient
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!data) {
    // Auto-create profile for users who don't have one yet
    const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
    await adminClient.from('profiles').upsert({
      id: userId,
      email: authUser?.user?.email || '',
      name: authUser?.user?.user_metadata?.name || authUser?.user?.email || '',
      branch: authUser?.user?.user_metadata?.branch || null,
      mos: authUser?.user?.user_metadata?.mos || null,
      separation_date: authUser?.user?.user_metadata?.separation_date || null,
      subscription_tier: 'free',
      usage_assessments_month: 0,
      usage_chat_month: 0,
      usage_plan_count: 0,
      usage_resume_month: 0,
      usage_job_parse_month: 0,
      usage_diagnostic_month: 0,
      usage_role_clarity_month: 0,
      usage_strategy_month: 0,
      usage_reset_date: getFirstOfMonth(),
    }, { onConflict: 'id' })
  }
}

export async function checkAndIncrementUsage(
  adminClient: SupabaseClient,
  userId: string,
  feature: UsageFeature
): Promise<{ allowed: boolean; current: number; limit: number; isPaid: boolean }> {
  // Ensure profile exists before checking usage
  await ensureProfileExists(adminClient, userId)

  const { data: profile } = await adminClient
    .from('profiles')
    .select('subscription_tier, usage_assessments_month, usage_chat_month, usage_plan_count, usage_resume_month, usage_job_parse_month, usage_diagnostic_month, usage_role_clarity_month, usage_strategy_month, usage_reset_date')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { allowed: false, current: 0, limit: 0, isPaid: false }
  }

  const isPaid = profile.subscription_tier === 'pro'
  const limits = isPaid ? PAID_LIMITS : FREE_LIMITS
  const col = USAGE_COLUMNS[feature]

  // Reset monthly counters if we're in a new month
  const firstOfMonth = getFirstOfMonth()
  const needsReset = !profile.usage_reset_date || profile.usage_reset_date < firstOfMonth

  if (needsReset) {
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

  // If limit is 0 (Pro-only feature), block immediately
  if (limit === 0) {
    return { allowed: false, current: 0, limit: 0, isPaid }
  }

  // Get the current value, treating NULL as 0
  const currentVal = needsReset ? 0 : ((profile[col as keyof typeof profile] as number) ?? 0)

  // Check if under limit before trying to update
  if (currentVal >= limit) {
    return { allowed: false, current: currentVal, limit, isPaid }
  }

  // Increment the counter
  const { data: updated, error: updateError } = await adminClient
    .from('profiles')
    .update({ [col]: currentVal + 1 })
    .eq('id', userId)
    .select(col)
    .single()

  if (updateError || !updated) {
    return { allowed: false, current: currentVal, limit, isPaid }
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
