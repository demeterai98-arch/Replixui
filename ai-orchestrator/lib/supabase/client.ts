// lib/supabase/client.ts
/**
 * عميل Supabase من جهة المتصفح (Browser Client)
 * يستخدم في Components التي تحمل 'use client'
 * يعتمد على anon key، آمن للاستخدام في المتصفح
 * مزود بدوال مساعدة لإدارة المستخدم والجلسة والرصيد
 */

import { createBrowserClient } from "@supabase/ssr"
import { type SupabaseClient, type User } from "@supabase/supabase-js"

// تعريف نوع موسع لعميل Supabase مع دوال مساعدة
export interface ExtendedSupabaseClient extends SupabaseClient {
  /** جلب المستخدم الحالي مع تخزين مؤقت (TTL 1 دقيقة) */
  getCurrentUser: () => Promise<User | null>
  /** تسجيل الخروج مع تنظيف التخزين المؤقت و localStorage */
  signOutAndClear: () => Promise<void>
  /** التحقق من صحة الجلسة (صلاحية وانتهاء) */
  isSessionValid: () => Promise<boolean>
  /** جلب الرصيد الحالي للمستخدم من جدول profiles */
  getCredits: () => Promise<number>
}

/**
 * إنشاء عميل Supabase من جهة العميل مع دوال مساعدة
 */
export const createClient = (): ExtendedSupabaseClient => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // تمديد العميل بدوال مساعدة
  const extendedClient = supabase as ExtendedSupabaseClient

  // تخزين مؤقت للمستخدم
  let cachedUser: User | null = null
  let userCacheTime = 0
  const CACHE_TTL = 60000 // 1 دقيقة

  extendedClient.getCurrentUser = async (): Promise<User | null> => {
    const now = Date.now()
    if (cachedUser && now - userCacheTime < CACHE_TTL) {
      return cachedUser
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      cachedUser = user
      userCacheTime = now
      return user
    } catch (error) {
      console.error("[Supabase Client] فشل جلب المستخدم:", error)
      return null
    }
  }

  extendedClient.signOutAndClear = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      cachedUser = null
      userCacheTime = 0
      if (typeof window !== "undefined") {
        localStorage.removeItem("workspace-storage")
      }
    } catch (error) {
      console.error("[Supabase Client] فشل تسجيل الخروج:", error)
      throw error
    }
  }

  extendedClient.isSessionValid = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) return false
      const expiresAt = session.expires_at
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000)
        if (expiresAt < now) return false
      }
      return true
    } catch {
      return false
    }
  }

  extendedClient.getCredits = async (): Promise<number> => {
    try {
      const user = await extendedClient.getCurrentUser()
      if (!user) return 0

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("credits_balance")
        .eq("id", user.id)
        .single()

      if (error) throw error
      return profile?.credits_balance ?? 0
    } catch (error) {
      console.error("[Supabase Client] فشل جلب الرصيد:", error)
      return 0
    }
  }

  return extendedClient
}

/**
 * هوك React لإنشاء عميل Supabase (يُستخدم في Client Components)
 * يمكن استبداله بـ useMemo أو useContext حسب الحاجة
 */
export const useSupabaseClient = (): ExtendedSupabaseClient => {
  return createClient()
}

/**
 * عميل Supabase مُعد مسبقاً للاستخدام المباشر (مثالي للاستخدام في non-React contexts)
 */
export const supabaseClient = createClient()

// تصدير الأنواع للاستخدام الخارجي
export type { SupabaseClient, User }
