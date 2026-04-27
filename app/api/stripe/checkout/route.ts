import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil' as any,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user?.email;

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Check if user already has a subscription
    const existingSub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSub?.status === 'active') {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session for one-time payment
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment', // Changed from 'subscription' to 'payment'
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'GigProofer Lifetime Access',
              description: 'One-time payment for unlimited income verification',
            },
            unit_amount: 999, // $9.99 one-time payment in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/subscription?canceled=true`,
      customer_email: userEmail ?? undefined,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
