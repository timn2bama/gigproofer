import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendAdminNotification, getSignupNotificationHtml } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (role && role !== 'Worker' && role !== 'Lender') {
      return NextResponse.json(
        { error: 'Invalid role. Must be Worker or Lender' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role || 'Worker';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        subscriptionStatus: 'inactive',
      },
    });

    // Send admin notification (don't await - fire and forget)
    sendAdminNotification({
      notificationId: process.env.NOTIF_ID_NEW_USER_SIGNUP || '',
      subject: `🎉 New ${userRole} Signup: ${name}`,
      htmlBody: getSignupNotificationHtml({ name, email, role: userRole }),
    }).catch(err => console.error('Failed to send signup notification:', err));

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
