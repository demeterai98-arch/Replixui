import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  const supabase = createClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id; // set when creating checkout
    const credits = parseInt(session.metadata.credits, 10);

    await supabase.rpc('add_credits', { user_id: userId, amount: credits });
    await supabase.from('credit_transactions').insert({
      profile_id: userId,
      amount: credits,
      type: 'purchase',
      stripe_payment_intent_id: session.payment_intent,
    });
  }

  return NextResponse.json({ received: true });
}