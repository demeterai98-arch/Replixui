'use client';

import { useState, useEffect } from 'react';
import { createCheckoutSession } from '@/lib/stripe/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserCredits } from '@/hooks/useUserCredits';

export default function BillingPage() {
  const { credits, refetch } = useUserCredits();
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (amount: number) => {
    setLoading(true);
    const { url } = await createCheckoutSession(amount);
    window.location.href = url;
  };

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Billing & Credits</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="col-span-1 bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/30">
          <CardHeader>
            <CardTitle>Your Balance</CardTitle>
            <CardDescription>Platform credits for workflow executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-indigo-400">{credits}</div>
            <div className="text-sm text-muted-foreground mt-2">credits remaining</div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleTopUp(100)} disabled={loading}>
              <Coins className="w-4 h-4 mr-2" /> Top-up 100 credits ($10)
            </Button>
          </CardFooter>
        </Card>

        {/* Subscription plans */}
        <Card>
          <CardHeader><CardTitle>Pro Plan</CardTitle></CardHeader>
          <CardContent>500 credits/month + priority queue</CardContent>
          <CardFooter><Button variant="outline">Subscribe $29/mo</Button></CardFooter>
        </Card>
        <Card>
          <CardHeader><CardTitle>Enterprise</CardTitle></CardHeader>
          <CardContent>Unlimited credits + dedicated support</CardContent>
          <CardFooter><Button variant="outline">Contact Sales</Button></CardFooter>
        </Card>
      </div>
    </div>
  );
}