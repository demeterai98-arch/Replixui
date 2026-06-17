// lib/stripe/client.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

// المفتاح العمومي لـ Stripe (يبدأ بـ pk_)
// ضعه في متغير البيئة NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// دالة لإنشاء جلسة دفع (تتصل بواجهة API الخاصة بك)
export async function createCheckoutSession(priceId: string, successUrl?: string, cancelUrl?: string) {
  const response = await fetch('/api/v1/stripe/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      successUrl: successUrl || `${window.location.origin}/dashboard/billing?success=true`,
      cancelUrl: cancelUrl || `${window.location.origin}/dashboard/billing?canceled=true`,
    }),
  });

  const { sessionId } = await response.json();
  const stripe = await getStripe();
  const { error } = await stripe!.redirectToCheckout({ sessionId });
  if (error) console.error('Stripe redirect error:', error);
}

// دالة مبسطة لشراء رصيد (credits) مباشرة
export async function purchaseCredits(amount: number) {
  // يمكنك تعديل priceId بناءً على المبلغ
  const priceId = process.env.NEXT_PUBLIC_STRIPE_CREDITS_PRICE_ID;
  if (!priceId) throw new Error('Missing price ID');
  await createCheckoutSession(priceId);
}