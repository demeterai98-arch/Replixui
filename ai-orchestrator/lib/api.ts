// lib/api.ts
// دوال مساعدة للتفاعل مع واجهات برمجة التطبيقات الداخلية
import { createClient } from './supabase/server'
import crypto from 'crypto'
import { encrypt } from './encryption'

/**
 * إنشاء وكيل جديد في مساحة العمل
 */
export async function createAgent(workspaceId: string, data: any) {
  const supabase = createClient()
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      workspace_id: workspaceId,
      ...data,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return agent
}

/**
 * تحديث بيانات وكيل
 */
export async function updateAgent(agentId: string, data: any) {
  const supabase = createClient()
  const { data: agent, error } = await supabase
    .from('agents')
    .update(data)
    .eq('id', agentId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return agent
}

/**
 * حذف وكيل
 */
export async function deleteAgent(agentId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)

  if (error) throw new Error(error.message)
  return true
}

/**
 * توليد رمز وصول (Token) لمساحة العمل
 */
export async function generateWorkspaceToken(workspaceId: string) {
  const supabase = createClient()
  const token = `platform_sec_${crypto.randomBytes(24).toString('hex')}`
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const { data, error } = await supabase
    .from('workspace_tokens')
    .insert({
      workspace_id: workspaceId,
      token_hash: tokenHash,
      label: `Token ${new Date().toISOString()}`,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return { token, record: data }
}

/**
 * جلب جميع الوكلاء في مساحة العمل
 */
export async function getWorkspaceAgents(workspaceId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

/**
 * جلب جميع مساحات العمل للمستخدم الحالي
 */
export async function getUserWorkspaces() {
  const supabase = createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) throw new Error('غير مسجل دخول')

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('profile_id', user.user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

/**
 * إضافة مفتاح API للمطور (يُشفر قبل التخزين)
 */
export async function saveDeveloperApiKey(profileId: string, provider: string, apiKey: string) {
  const supabase = createClient()
  const encrypted = encrypt(apiKey)

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      profile_id: profileId,
      provider,
      encrypted_key: encrypted,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * جلب مفتاح API للمطور لفك تشفيره
 */
export async function getDeveloperApiKey(profileId: string, provider: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('api_keys')
    .select('encrypted_key')
    .eq('profile_id', profileId)
    .eq('provider', provider)
    .single()

  if (error) throw new Error(error.message)
  return data.encrypted_key
}
