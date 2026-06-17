import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { executeWorkflow } from '@/lib/workflow-engine/executor';
import crypto from 'crypto';

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const supabase = createClient();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const { data: validToken } = await supabase
    .from('workspace_tokens')
    .select('workspace_id')
    .eq('token_hash', tokenHash)
    .single();

  if (!validToken || validToken.workspace_id !== workspaceId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { input } = await req.json();
  if (!input) return NextResponse.json({ error: 'Missing input' }, { status: 400 });

  // Check credits balance
  const { data: profile } = await supabase.from('profiles').select('credits_balance').single();
  if (profile.credits_balance < 10) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  // Create execution record
  const { data: execution } = await supabase.from('executions').insert({
    workspace_id: workspaceId,
    input_text: input,
    status: 'running',
  }).select().single();

  try {
    const result = await executeWorkflow(workspaceId, input, execution.id);
    if (result.paused) {
      return NextResponse.json({ message: 'Workflow paused for manager approval', approvalId: result.approvalId });
    }
    return NextResponse.json({ output: result.output, creditsUsed: result.creditsUsed });
  } catch (err) {
    await supabase.from('executions').update({ status: 'failed' }).eq('id', execution.id);
    return NextResponse.json({ error: 'Workflow failed' }, { status: 500 });
  }
}