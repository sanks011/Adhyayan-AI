import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * API route to verify Razorpay payment signature
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId,
      amount,
      currency
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    console.log('✅ Payment signature verified successfully');

    // Record payment in database
    if (userId && planId && amount) {
      try {
        const recordResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/record`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            transactionHash: razorpay_payment_id,
            planId,
            amount,
            paymentMethod: 'razorpay',
            status: 'completed',
          }),
        });

        if (!recordResponse.ok) {
          console.error('Failed to record payment in database');
        } else {
          console.log('✅ Payment recorded in database successfully');
        }
      } catch (error) {
        console.error('Error recording payment:', error);
        // Don't fail the verification if recording fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
