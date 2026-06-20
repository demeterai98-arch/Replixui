// app/api/v1/workspace/[workspaceId]/execute/route.ts
// نقطة نهاية API لتنفيذ الـ Workflow
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeWorkflow } from '@/lib/workflow-engine/executor'
import crypto from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const { workspaceId } = params
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  // 1. التحقق من وجود التوكن
  if (!token) {
    return NextResponse.json(
      { error: 'Missing authorization token' },
      { status: 401 }
    )
  }

  const supabase = createClient()

  // 2. التحقق من صحة التوكن
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const { data: validToken, error: tokenError } = await supabase
    .from('workspace_tokens')
    .select('workspace_id')
    .eq('token_hash', tokenHash)
    .single()

  if (tokenError || !validToken || validToken.workspace_id !== workspaceId) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // 3. جلب المدخلات
  const { input } = await req.json()
  if (!input) {
    return NextResponse.json(
      { error: 'Missing input field' },
      { status: 400 }
    )
  }

  // 4. جلب المستخدم الحالي
  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    )
  }

  // 5. التحقق من الرصيد (للمستخدمين العاديين)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits_balance, role')
    .eq('id', user.user.id)
    .single()

  if (!profileError && profile && profile.role !== 'developer') {
    // جلب تكلفة التنفيذ من الإعدادات
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'credit_cost_per_execution')
      .single()

    const costPerStep = settings?.value?.value || 10
    if (profile.credits_balance < costPerStep) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          balance: profile.credits_balance,
          required: costPerStep,
        },
        { status: 402 }
      )
    }
  }
  // 6. جلب الـ Workflow ID
const { data: workflow, error: workflowError } = await supabase
  .from('workflows')
  .select('id')
  .eq('workspace_id', workspaceId)
  .single()

if (workflowError || !workflow) {
  return NextResponse.json(
    { error: 'No workflow found for this workspace' },
    { status: 404 }
  )
}

const result = await executeWorkflow({
  workspaceId,
  workflowId: workflow.id, // الآن هذه القيمة صحيحة
  input,
  executionId: execution.id,
  userId: user.user.id,
})

  // 6. إنشاء سجل تنفيذ جديد
  const { data: execution, error: execError } = await supabase
    .from('executions')
    .insert({
      workspace_id: workspaceId,
      input_text: input,
      status: 'running',
    })
    .select()
    .single()

  if (execError) {
    return NextResponse.json(
      { error: 'Failed to create execution record' },
      { status: 500 }
    )
  }
  

  try {
    // 7. تنفيذ الـ Workflow (تمرير كائن)
    const result = await executeWorkflow({
      workspaceId,
      workflowId: '', // سيتم جلبها داخل executor
      input,
      executionId: execution.id,
      userId: user.user.id,
      token,
    })

    // 8. التعامل مع حالة التوقف (Manager Approval)
    if (result.paused) {
      return NextResponse.json({
        message: result.message,
        approvalId: result.approvalId,
        executionId: execution.id,
        status: 'pending',
      })
    }

    // 9. النجاح
    return NextResponse.json({
      success: true,
      output: result.output,
      creditsUsed: result.creditsUsed,
      steps: result.steps,
      executionId: execution.id,
    })
  } catch (error: any) {
    // 10. معالجة الأخطاء
    await supabase
      .from('executions')
      .update({ status: 'failed' })
      .eq('id', execution.id)

    return NextResponse.json(
      {
        error: error.message || 'Workflow execution failed',
        executionId: execution.id,
      },
      { status: 500 }
    )
  }
}

//مش متاكد من جدو بش يل ان شاء الله يشتغل
