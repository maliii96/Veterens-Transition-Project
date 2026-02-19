import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

// For API routes - pass request and response
export async function createClient(request?: NextRequest) {
  const cookieStore = request ? {
    get(name: string) {
      return request.cookies.get(name)?.value
    },
    set() {}, // No-op for read-only request cookies
    remove() {}, // No-op for read-only request cookies
  } : {
    async get(name: string) {
      const c = await cookies()
      return c.get(name)?.value
    },
    async set(name: string, value: string, options: CookieOptions) {
      try {
        const c = await cookies()
        c.set({ name, value, ...options })
      } catch (error) {}
    },
    async remove(name: string, options: CookieOptions) {
      try {
        const c = await cookies()
        c.set({ name, value: '', ...options })
      } catch (error) {}
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore as any,
    }
  )
}

// Admin client with service role key - bypasses RLS
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
