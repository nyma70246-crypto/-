/**
 * Money Transfer Service - Advanced payment transfer methods
 * Supports: Vodafone Cash, Cards, Digital Wallets, Bank Transfers
 */

export type TransferMethod = 
  | 'vodafone_cash' 
  | 'card' 
  | 'bank_transfer' 
  | 'digital_wallet'
  | 'apple_pay'
  | 'google_pay';

export interface TransferRecipient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  accountNumber?: string;
  bankName?: string;
  walletProvider?: string;
}

export interface MoneyTransfer {
  id: string;
  senderId: string;
  recipientId: string;
  recipient: TransferRecipient;
  amount: number;
  currency: string;
  method: TransferMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  fee: number;
  totalAmount: number;
  description?: string;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

export interface TransferHistory {
  id: string;
  userId: string;
  transfers: MoneyTransfer[];
  totalTransferred: number;
  totalFees: number;
}

/**
 * Initialize Vodafone Cash transfer
 */
export async function initializeVodafoneCashTransfer(
  recipientPhone: string,
  amount: number,
  description?: string
): Promise<MoneyTransfer | null> {
  try {
    const response = await fetch('/api/transfers/vodafone-cash/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientPhone,
        amount,
        description,
      }),
    });

    if (!response.ok) throw new Error('Failed to initialize Vodafone Cash transfer');

    const data = await response.json();
    return {
      id: data.id,
      senderId: data.senderId,
      recipientId: data.recipientId,
      recipient: {
        id: data.recipientId,
        name: data.recipientName,
        phone: recipientPhone,
      },
      amount,
      currency: 'EGP',
      method: 'vodafone_cash',
      status: 'pending',
      fee: data.fee || 0,
      totalAmount: amount + (data.fee || 0),
      description,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Money Transfer] Vodafone Cash init error:', error);
    return null;
  }
}

/**
 * Confirm Vodafone Cash transfer with OTP
 */
export async function confirmVodafoneCashTransfer(
  transferId: string,
  otp: string
): Promise<MoneyTransfer | null> {
  try {
    const response = await fetch('/api/transfers/vodafone-cash/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferId, otp }),
    });

    if (!response.ok) throw new Error('Failed to confirm Vodafone Cash transfer');

    const data = await response.json();
    return {
      id: data.id,
      senderId: data.senderId,
      recipientId: data.recipientId,
      recipient: data.recipient,
      amount: data.amount,
      currency: 'EGP',
      method: 'vodafone_cash',
      status: data.status,
      fee: data.fee,
      totalAmount: data.totalAmount,
      createdAt: new Date(data.createdAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    };
  } catch (error) {
    console.error('[Money Transfer] Vodafone Cash confirm error:', error);
    return null;
  }
}

/**
 * Initialize card transfer
 */
export async function initializeCardTransfer(
  recipientEmail: string,
  amount: number,
  cardToken: string,
  description?: string
): Promise<MoneyTransfer | null> {
  try {
    const response = await fetch('/api/transfers/card/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail,
        amount,
        cardToken,
        description,
      }),
    });

    if (!response.ok) throw new Error('Failed to initialize card transfer');

    const data = await response.json();
    return {
      id: data.id,
      senderId: data.senderId,
      recipientId: data.recipientId,
      recipient: {
        id: data.recipientId,
        name: data.recipientName,
        email: recipientEmail,
      },
      amount,
      currency: 'EGP',
      method: 'card',
      status: 'processing',
      fee: data.fee || 0,
      totalAmount: amount + (data.fee || 0),
      description,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Money Transfer] Card transfer init error:', error);
    return null;
  }
}

/**
 * Initialize bank transfer
 */
export async function initializeBankTransfer(
  recipientName: string,
  accountNumber: string,
  bankName: string,
  amount: number,
  description?: string
): Promise<MoneyTransfer | null> {
  try {
    const response = await fetch('/api/transfers/bank/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientName,
        accountNumber,
        bankName,
        amount,
        description,
      }),
    });

    if (!response.ok) throw new Error('Failed to initialize bank transfer');

    const data = await response.json();
    return {
      id: data.id,
      senderId: data.senderId,
      recipientId: data.recipientId,
      recipient: {
        id: data.recipientId,
        name: recipientName,
        accountNumber,
        bankName,
      },
      amount,
      currency: 'EGP',
      method: 'bank_transfer',
      status: 'pending',
      fee: data.fee || 0,
      totalAmount: amount + (data.fee || 0),
      description,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Money Transfer] Bank transfer init error:', error);
    return null;
  }
}

/**
 * Initialize digital wallet transfer
 */
export async function initializeDigitalWalletTransfer(
  recipientWalletId: string,
  walletProvider: string,
  amount: number,
  description?: string
): Promise<MoneyTransfer | null> {
  try {
    const response = await fetch('/api/transfers/wallet/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientWalletId,
        walletProvider,
        amount,
        description,
      }),
    });

    if (!response.ok) throw new Error('Failed to initialize wallet transfer');

    const data = await response.json();
    return {
      id: data.id,
      senderId: data.senderId,
      recipientId: data.recipientId,
      recipient: {
        id: data.recipientId,
        name: data.recipientName,
        walletProvider,
      },
      amount,
      currency: 'EGP',
      method: 'digital_wallet',
      status: 'processing',
      fee: data.fee || 0,
      totalAmount: amount + (data.fee || 0),
      description,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Money Transfer] Wallet transfer init error:', error);
    return null;
  }
}

/**
 * Get transfer fees
 */
export async function getTransferFees(
  method: TransferMethod,
  amount: number
): Promise<{ fee: number; percentage: number } | null> {
  try {
    const response = await fetch(
      `/api/transfers/fees?method=${method}&amount=${amount}`
    );

    if (!response.ok) throw new Error('Failed to get transfer fees');

    return await response.json();
  } catch (error) {
    console.error('[Money Transfer] Get fees error:', error);
    return null;
  }
}

/**
 * Get transfer history
 */
export async function getTransferHistory(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<MoneyTransfer[]> {
  try {
    const response = await fetch(
      `/api/transfers/history?userId=${userId}&limit=${limit}&offset=${offset}`
    );

    if (!response.ok) throw new Error('Failed to get transfer history');

    const data = await response.json();
    return data.transfers || [];
  } catch (error) {
    console.error('[Money Transfer] Get history error:', error);
    return [];
  }
}

/**
 * Cancel transfer
 */
export async function cancelTransfer(transferId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/transfers/${transferId}/cancel`, {
      method: 'POST',
    });

    return response.ok;
  } catch (error) {
    console.error('[Money Transfer] Cancel transfer error:', error);
    return false;
  }
}

/**
 * Get transfer status
 */
export async function getTransferStatus(
  transferId: string
): Promise<MoneyTransfer | null> {
  try {
    const response = await fetch(`/api/transfers/${transferId}/status`);

    if (!response.ok) throw new Error('Failed to get transfer status');

    const data = await response.json();
    return {
      id: data.id,
      senderId: data.senderId,
      recipientId: data.recipientId,
      recipient: data.recipient,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      status: data.status,
      fee: data.fee,
      totalAmount: data.totalAmount,
      description: data.description,
      createdAt: new Date(data.createdAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      failureReason: data.failureReason,
    };
  } catch (error) {
    console.error('[Money Transfer] Get status error:', error);
    return null;
  }
}

/**
 * Add recipient
 */
export async function addRecipient(
  recipient: Partial<TransferRecipient>
): Promise<TransferRecipient | null> {
  try {
    const response = await fetch('/api/transfers/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipient),
    });

    if (!response.ok) throw new Error('Failed to add recipient');

    return await response.json();
  } catch (error) {
    console.error('[Money Transfer] Add recipient error:', error);
    return null;
  }
}

/**
 * Get recipients
 */
export async function getRecipients(userId: string): Promise<TransferRecipient[]> {
  try {
    const response = await fetch(`/api/transfers/recipients?userId=${userId}`);

    if (!response.ok) throw new Error('Failed to get recipients');

    const data = await response.json();
    return data.recipients || [];
  } catch (error) {
    console.error('[Money Transfer] Get recipients error:', error);
    return [];
  }
}

/**
 * Delete recipient
 */
export async function deleteRecipient(recipientId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/transfers/recipients/${recipientId}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('[Money Transfer] Delete recipient error:', error);
    return false;
  }
}
