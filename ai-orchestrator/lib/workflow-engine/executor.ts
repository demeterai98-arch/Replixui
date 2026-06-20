
‏const supabase = await createClient()
import { decrypt } from '@/lib/encryption';
import { callOpenAI } from '@/lib/llm/openai';
import { callAnthropic } from '@/lib/llm/anthropic';
import { callGemini } from '@/lib/llm/gemini';

interface ExecuteWorkflowParams {
  workspaceId: string;
  workflowId: string;      // إضافة workflowId
  input: string;
  executionId: string;
  userId: string;          // معرف المستخدم من التوكن
  token: string;           // تمرير التوكن لـ supabase
}

export async function executeWorkflow({
  workspaceId,
  workflowId,
  input,
  executionId,
  userId,
  token,
}: ExecuteWorkflowParams): Promise<ExecuteWorkflowResult> {
  // التحقق من وجود workflowId
  if (!workflowId) {
    throw new Error('workflowId is required')
  }

  const supabase = await createClient()

  // جلب الـ workflow مع الخطوات
  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .select(`
      id,
      name,
      steps:workflow_steps(
        id,
        step_order,
        step_type,
        agent_id,
        approval_webhook_url,
        agent:agents(
          id,
          name,
          provider,
          model,
          system_prompt,
          temperature,
          max_tokens
        )
      )
    `)
    .eq('id', workflowId) // الآن لدينا workflowId صحيح
    .single()
}

export async function executeWorkflow({
  workspaceId,
  workflowId,
  input,
  executionId,
  userId,
  token,
}: ExecuteWorkflowParams) {
  // إنشاء عميل Supabase مع التوكن لضبط السياق
  const supabase = createClient(token);

  // 1. جلب خطوات سير العمل المحدد
  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .select(`
      id,
      steps:workflow_steps(
        *,
        agent:agents(*)
      )
    `)
    .eq('workspace_id', workspaceId)
    .eq('id', workflowId)
    .single();

  if (workflowError || !workflow) {
    throw new Error(`Workflow not found: ${workflowId}`);
  }

  if (!workflow.steps || workflow.steps.length === 0) {
    throw new Error('No workflow steps defined');
  }

  let currentOutput = input;
  let totalCredits = 0;
  const sortedSteps = [...workflow.steps].sort((a, b) => a.step_order - b.step_order);

  for (const step of sortedSteps) {
    if (step.step_type === 'manager_approval') {
      // إدراج طلب موافقة
      await supabase.from('pending_approvals').insert({
        execution_id: executionId,
        step_id: step.id,
        input_payload: { currentOutput },
        status: 'pending',
        webhook_sent: true,
      });

      await supabase
        .from('executions')
        .update({ status: 'pending' })
        .eq('id', executionId);

      return { paused: true, approvalId: step.id };
    }

    // خطوة وكيل
    const agent = step.agent;
    if (!agent) throw new Error(`Agent missing for step ${step.id}`);

    // جلب مفتاح API للمستخدم
    const { data: apiKeyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('profile_id', userId)
      .eq('provider', agent.provider)
      .single();

    if (keyError || !apiKeyRecord) {
      throw new Error(`API key not found for provider: ${agent.provider}`);
    }

    let decryptedKey: string;
    try {
      decryptedKey = decrypt(apiKeyRecord.encrypted_key);
    } catch (err) {
      throw new Error('Failed to decrypt API key');
    }

    // استدعاء LLM
    let llmOutput = '';
    try {
      switch (agent.provider) {
        case 'openai':
          llmOutput = await callOpenAI(decryptedKey, currentOutput, agent.model, agent.temperature, agent.max_tokens);
          break;
        case 'anthropic':
          llmOutput = await callAnthropic(decryptedKey, currentOutput, agent.model, agent.temperature, agent.max_tokens);
          break;
        case 'gemini':
          llmOutput = await callGemini(decryptedKey, currentOutput, agent.model, agent.temperature, agent.max_tokens);
          break;
        default:
          throw new Error(`Unsupported provider: ${agent.provider}`);
      }
    } catch (llmError: any) {
      await supabase
        .from('executions')
        .update({ status: 'failed', output_text: `LLM error: ${llmError.message}` })
        .eq('id', executionId);
      throw llmError;
    }

    currentOutput = llmOutput;
    totalCredits += 10;
  }

  // خصم الرصيد
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single();

  if (profileError || !profile) throw new Error('User profile not found');

  const newBalance = profile.credits_balance - totalCredits;
  if (newBalance < 0) {
    await supabase
      .from('executions')
      .update({ status: 'failed', output_text: 'Insufficient credits' })
      .eq('id', executionId);
    throw new Error('Insufficient credits');
  }

  await supabase.from('profiles').update({ credits_balance: newBalance }).eq('id', userId);
  await supabase.from('credit_transactions').insert({
    profile_id: userId,
    amount: -totalCredits,
    type: 'usage',
  });

  await supabase
    .from('executions')
    .update({
      status: 'completed',
      output_text: currentOutput,
      credits_used: totalCredits,
      completed_at: new Date().toISOString(),
    })
    .eq('id', executionId);

  return { output: currentOutput, creditsUsed: totalCredits };
}
