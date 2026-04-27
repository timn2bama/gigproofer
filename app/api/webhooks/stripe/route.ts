import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { sendAdminNotification, getPurchaseNotificationHtml } from '@/lib/notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err?.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) break;

        // For one-time payment, simply activate the user
        if (session.mode === 'payment' && session.payment_status === 'paid') {
          // Get user info for notification
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
          });

          // Create or update subscription record to track payment
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubscriptionId: session.id, // Use session ID for one-time payment
              stripeCustomerId: session.customer as string || '',
              status: 'active',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date('2099-12-31'), // Lifetime access
            },
            update: {
              status: 'active',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date('2099-12-31'), // Lifetime access
            },
          });

          // Update user subscription status to active (lifetime)
          await prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: 'active' },
          });

          // Send admin notification for new purchase
          sendAdminNotification({
            notificationId: process.env.NOTIF_ID_NEW_PURCHASE || '',
            subject: `💰 New Purchase: ${user?.name || 'User'} bought lifetime access!`,
            htmlBody: getPurchaseNotificationHtml({
              name: user?.name || 'N/A',
              email: user?.email || session.customer_email || 'N/A',
              amount: '$9.99',
            }),
          }).catch(err => console.error('Failed to send purchase notification:', err));
        }

        break;
      }

      // Keep these handlers for backward compatibility if any old subscriptions exist
      case 'customer.subscription.updated': {
        const subscription: any = event.data.object;

        const existingSub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!existingSub) break;

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date((subscription.current_period_start ?? 0) * 1000),
            currentPeriodEnd: new Date((subscription.current_period_end ?? 0) * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
          },
        });

        // Update user status
        const userStatus = subscription.status === 'active' ? 'active' : 'inactive';
        await prisma.user.update({
          where: { id: existingSub.userId },
          data: { subscriptionStatus: userStatus },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const existingSub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!existingSub) break;

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'cancelled',
            cancelAtPeriodEnd: false,
          },
        });

        await prisma.user.update({
          where: { id: existingSub.userId },
          data: { subscriptionStatus: 'cancelled' },
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
