// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

/**
 * عميل Supabase بصلاحيات Service Role (مشرف)
 * يستخدم فقط في Server-side (API Routes, Webhooks, Cron Jobs)
 * يمتلك صلاحيات كاملة على قاعدة البيانات
 * لا يُستخدم في Client-side مطلقاً لأسباب أمنية
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * التحقق من وجود المفتاح في البيئة
 */
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Admin features will not work.'
  )
}
