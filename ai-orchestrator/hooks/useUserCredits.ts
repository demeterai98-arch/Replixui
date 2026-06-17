// hooks/useUserCredits.ts
// جلب رصيد المستخدم وتحديثه مع إعادة التحقق التلقائي
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CreditsState {
  balance: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addCredits: (amount: number) => Promise<boolean>
  deductCredits: (amount: number) => Promise<boolean>
}

/**
 * هوك لإدارة رصيد المستخدم مع إعادة تحميل تلقائي عند التغيير
 */
export function useUserCredits(): CreditsState {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchCredits = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) {
        setError('الرجاء تسجيل الدخول')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', user.user.id)
        .single()

      if (profileError) throw profileError
      setBalance(profile?.credits_balance ?? 0)
    } catch (err: any) {
      setError(err.message || 'فشل جلب الرصيد')
    } finally {
      setLoading(false)
    }
  }

  // إضافة رصيد (للاستخدام بعد عملية شراء)
  const addCredits = async (amount: number): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) return false

      const { error: updateError } = await supabase.rpc('add_credits', {
        user_id: user.user.id,
        amount,
      })

      if (updateError) throw updateError
      await fetchCredits() // إعادة تحميل
      return true
    } catch (err) {
      console.error('فشل إضافة الرصيد:', err)
      return false
    }
  }

  // خصم رصيد (للاستخدام بعد تنفيذ workflow)
  const deductCredits = async (amount: number): Promise<boolean> => {
    if (balance < amount) {
      setError('رصيد غير كافٍ')
      return false
    }
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) return false

      const { error: updateError } = await supabase.rpc('deduct_credits', {
        user_id: user.user.id,
        amount,
      })

      if (updateError) throw updateError
      await fetchCredits() // إعادة تحميل
      return true
    } catch (err) {
      console.error('فشل خصم الرصيد:', err)
      return false
    }
  }

  useEffect(() => {
    fetchCredits()
    // إعداد استماع لتغييرات الرصيد عبر realtime (اختياري)
  }, [])

  return {
    balance,
    loading,
    error,
    refetch: fetchCredits,
    addCredits,
    deductCredits,
  }
}
