// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * إنشاء عميل Supabase من جهة الخادم (Server Client)
 * يستخدم في Server Components و API Routes
 * يتولى إدارة الكوكيز الخاصة بالجلسة بشكل آمن
 * متوافق مع Next.js 16 (يتطلب await مع cookies)
 */
export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * قراءة قيمة كوكيز معينة
         */
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        /**
         * تعيين قيمة كوكيز (تُستخدم أثناء تسجيل الدخول)
         */
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        /**
         * حذف كوكيز (تُستخدم أثناء تسجيل الخروج)
         */
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
