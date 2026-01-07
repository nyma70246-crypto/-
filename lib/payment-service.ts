/**
 * Payment Service - Handles multiple payment methods
 * Supports: Stripe, PayPal, Apple Pay, Google Pay
 */

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: PaymentMethod;
  createdAt: Date;
  description?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  paymentMethod: PaymentMethod;
  createdAt: Date;
  dueDate: Date;
  description: string;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

/**
 * Initialize Stripe payment
 */
export async function initializeStripePayment(
  amount: number,
  currency: string = 'SAR'
): Promise<PaymentIntent | null> {
  try {
    // In production, call your backend to create a payment intent
    const response = await fetch('/api/payments/stripe/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) throw new Error('Failed to create payment intent');

    const data = await response.json();
    return {
      id: data.id,
      amount,
      currency,
      status: 'pending',
      method: {
        id: 'stripe',
        type: 'card',
        name: 'بطاقة ائتمان',
        isDefault: false,
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Payment] Stripe initialization error:', error);
    return null;
  }
}

/**
 * Process Stripe payment
 */
export async function processStripePayment(
  paymentIntentId: string,
  cardToken: string
): Promise<PaymentIntent | null> {
  try {
    const response = await fetch('/api/payments/stripe/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId, cardToken }),
    });

    if (!response.ok) throw new Error('Payment failed');

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      method: {
        id: 'stripe',
        type: 'card',
        name: 'بطاقة ائتمان',
        lastFour: data.lastFour,
        isDefault: false,
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Payment] Stripe payment error:', error);
    return null;
  }
}

/**
 * Initialize PayPal payment
 */
export async function initializePayPalPayment(
  amount: number,
  currency: string = 'SAR'
): Promise<PaymentIntent | null> {
  try {
    const response = await fetch('/api/payments/paypal/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) throw new Error('Failed to create PayPal order');

    const data = await response.json();
    return {
      id: data.id,
      amount,
      currency,
      status: 'pending',
      method: {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        isDefault: false,
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Payment] PayPal initialization error:', error);
    return null;
  }
}

/**
 * Capture PayPal payment
 */
export async function capturePayPalPayment(
  orderId: string
): Promise<PaymentIntent | null> {
  try {
    const response = await fetch('/api/payments/paypal/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) throw new Error('Failed to capture PayPal payment');

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      method: {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        isDefault: false,
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Payment] PayPal capture error:', error);
    return null;
  }
}

/**
 * Initialize Apple Pay payment
 */
export async function initializeApplePayPayment(
  amount: number,
  currency: string = 'SAR'
): Promise<PaymentIntent | null> {
  try {
    const response = await fetch('/api/payments/apple-pay/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) throw new Error('Failed to create Apple Pay session');

    const data = await response.json();
    return {
      id: data.id,
      amount,
      currency,
      status: 'pending',
      method: {
        id: 'apple_pay',
        type: 'apple_pay',
        name: 'Apple Pay',
        isDefault: false,
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Payment] Apple Pay initialization error:', error);
    return null;
  }
}

/**
 * Process Apple Pay payment
 */
export async function processApplePayPayment(
  sessionId: string,
  token: string
): Promise<PaymentIntent | null> {
  try {
    const response = await fetch('/api/payments/apple-pay/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, token }),
    });

    if (!response.ok) throw new Error('Apple Pay payment failed');

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      method: {
        id: 'apple_pay',
        type: 'apple_pay',
        name: 'Apple Pay',
        isDefault: false,
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Payment] Apple Pay processing error:', error);
    return null;
  }
}

/**
 * Initialize Google Pay payment
 */
export async function initializeGooglePayPayment(
  amount: number,
  currency: string = 'SAR'
): Promise<PaymentIntent | null> {
  try {
    const response = await fetch('/api/payments/google-pay/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) throw new Error('Failed to create Google Pay session');

    const data = await response.json();
    return {
      id: data.id,
      amount,
      currency,
      status: 'pending',
      method: {
        id: 'google_pay',
        type: 'google_pay',
        name: 'Google Pay',
        isDefault: false,
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Payment] Google Pay initialization error:', error);
    return null;
  }
}

/**
 * Process Google Pay payment
 */
export async function processGooglePayPayment(
  sessionId: string,
  token: string
): Promise<PaymentIntent | null> {
  try {
    const response = await fetch('/api/payments/google-pay/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, token }),
    });

    if (!response.ok) throw new Error('Google Pay payment failed');

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      method: {
        id: 'google_pay',
        type: 'google_pay',
        name: 'Google Pay',
        isDefault: false,
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Payment] Google Pay processing error:', error);
    return null;
  }
}

/**
 * Get payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const response = await fetch('/api/payments/methods');
    if (!response.ok) throw new Error('Failed to fetch payment methods');

    const data = await response.json();
    return data.methods || [];
  } catch (error) {
    console.error('[Payment] Fetch methods error:', error);
    return [];
  }
}

/**
 * Add payment method
 */
export async function addPaymentMethod(
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay',
  details: Record<string, any>
): Promise<PaymentMethod | null> {
  try {
    const response = await fetch('/api/payments/methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, details }),
    });

    if (!response.ok) throw new Error('Failed to add payment method');

    return await response.json();
  } catch (error) {
    console.error('[Payment] Add method error:', error);
    return null;
  }
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(methodId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/payments/methods/${methodId}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('[Payment] Delete method error:', error);
    return false;
  }
}

/**
 * Get invoices
 */
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const response = await fetch('/api/payments/invoices');
    if (!response.ok) throw new Error('Failed to fetch invoices');

    const data = await response.json();
    return data.invoices || [];
  } catch (error) {
    console.error('[Payment] Fetch invoices error:', error);
    return [];
  }
}

/**
 * Download invoice
 */
export async function downloadInvoice(invoiceId: string): Promise<Blob | null> {
  try {
    const response = await fetch(`/api/payments/invoices/${invoiceId}/download`);
    if (!response.ok) throw new Error('Failed to download invoice');

    return await response.blob();
  } catch (error) {
    console.error('[Payment] Download invoice error:', error);
    return null;
  }
}
