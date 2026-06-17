// lib/supabase/server.ts
// خادم Supabase للاستخدام في Server Components و API Routes
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * إنشاء عميل Supabase من جهة الخادم مع إدارة الكوكيز تلقائياً
 * يستخدم في Server Components و API Routes
 */
export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // تجاهل الأخطاء في حال عدم توفر الكوكيز
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // تجاهل الأخطاء
          }
        },
      },
    }
  )
}

/**
 * التحقق من صلاحيات المستخدم (سواء كان مشرفاً أو مطوراً أو مستخدم عادي)
 */
export const getUserRole = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role || 'user'
}

/**
 * التحقق من أن المستخدم مشرف
 */
export const isAdmin = async () => {
  const role = await getUserRole()
  return role === 'admin'
}
