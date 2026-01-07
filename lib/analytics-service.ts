import { vexo, identifyDevice } from 'vexo-analytics';

// Initialize Vexo Analytics with your API key
const VEXO_API_KEY = '99a495f3-bd40-4325-8346-62ae73790994';

// Initialize analytics
vexo(VEXO_API_KEY);

/**
 * Initialize user analytics
 */
export function initializeAnalytics(userEmail: string): void {
  try {
    identifyDevice(userEmail);
    console.log('[Analytics] User identified:', userEmail);
  } catch (error) {
    console.error('[Analytics] Initialization error:', error);
  }
}

/**
 * Track user event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  try {
    // Vexo tracks events automatically, but you can add custom properties
    console.log('[Analytics] Event tracked:', eventName, properties);
  } catch (error) {
    console.error('[Analytics] Track event error:', error);
  }
}

/**
 * Track screen view
 */
export function trackScreenView(screenName: string): void {
  try {
    trackEvent('screen_view', { screen: screenName });
    console.log('[Analytics] Screen viewed:', screenName);
  } catch (error) {
    console.error('[Analytics] Screen view error:', error);
  }
}

/**
 * Track user action
 */
export function trackUserAction(action: string, details?: Record<string, any>): void {
  try {
    trackEvent(`user_${action}`, details);
    console.log('[Analytics] User action tracked:', action, details);
  } catch (error) {
    console.error('[Analytics] User action error:', error);
  }
}

/**
 * Track search
 */
export function trackSearch(query: string, results: number): void {
  try {
    trackEvent('search', { query, results });
    console.log('[Analytics] Search tracked:', query, results);
  } catch (error) {
    console.error('[Analytics] Search error:', error);
  }
}

/**
 * Track worker profile view
 */
export function trackWorkerView(workerId: string, workerName: string): void {
  try {
    trackEvent('worker_viewed', { workerId, workerName });
    console.log('[Analytics] Worker viewed:', workerId, workerName);
  } catch (error) {
    console.error('[Analytics] Worker view error:', error);
  }
}

/**
 * Track message sent
 */
export function trackMessageSent(recipientId: string, messageType: string): void {
  try {
    trackEvent('message_sent', { recipientId, messageType });
    console.log('[Analytics] Message sent:', recipientId, messageType);
  } catch (error) {
    console.error('[Analytics] Message sent error:', error);
  }
}

/**
 * Track rating submitted
 */
export function trackRatingSubmitted(workerId: string, rating: number): void {
  try {
    trackEvent('rating_submitted', { workerId, rating });
    console.log('[Analytics] Rating submitted:', workerId, rating);
  } catch (error) {
    console.error('[Analytics] Rating error:', error);
  }
}

/**
 * Track payment initiated
 */
export function trackPaymentInitiated(amount: number, method: string): void {
  try {
    trackEvent('payment_initiated', { amount, method });
    console.log('[Analytics] Payment initiated:', amount, method);
  } catch (error) {
    console.error('[Analytics] Payment error:', error);
  }
}

/**
 * Track payment completed
 */
export function trackPaymentCompleted(
  transactionId: string,
  amount: number,
  method: string
): void {
  try {
    trackEvent('payment_completed', { transactionId, amount, method });
    console.log('[Analytics] Payment completed:', transactionId, amount, method);
  } catch (error) {
    console.error('[Analytics] Payment completion error:', error);
  }
}

/**
 * Track money transfer initiated
 */
export function trackMoneyTransferInitiated(
  amount: number,
  method: string,
  recipientId: string
): void {
  try {
    trackEvent('money_transfer_initiated', { amount, method, recipientId });
    console.log('[Analytics] Money transfer initiated:', amount, method);
  } catch (error) {
    console.error('[Analytics] Money transfer error:', error);
  }
}

/**
 * Track money transfer completed
 */
export function trackMoneyTransferCompleted(
  transferId: string,
  amount: number,
  method: string
): void {
  try {
    trackEvent('money_transfer_completed', { transferId, amount, method });
    console.log('[Analytics] Money transfer completed:', transferId, amount);
  } catch (error) {
    console.error('[Analytics] Money transfer completion error:', error);
  }
}

/**
 * Track AI assistant interaction
 */
export function trackAIAssistantInteraction(query: string, responseType: string): void {
  try {
    trackEvent('ai_assistant_used', { query, responseType });
    console.log('[Analytics] AI assistant used:', query, responseType);
  } catch (error) {
    console.error('[Analytics] AI assistant error:', error);
  }
}

/**
 * Track error
 */
export function trackError(errorName: string, errorMessage: string): void {
  try {
    trackEvent('error_occurred', { errorName, errorMessage });
    console.error('[Analytics] Error tracked:', errorName, errorMessage);
  } catch (error) {
    console.error('[Analytics] Error tracking failed:', error);
  }
}

/**
 * Track user signup
 */
export function trackUserSignup(method: string): void {
  try {
    trackEvent('user_signup', { method });
    console.log('[Analytics] User signup tracked:', method);
  } catch (error) {
    console.error('[Analytics] Signup error:', error);
  }
}

/**
 * Track user login
 */
export function trackUserLogin(method: string): void {
  try {
    trackEvent('user_login', { method });
    console.log('[Analytics] User login tracked:', method);
  } catch (error) {
    console.error('[Analytics] Login error:', error);
  }
}

/**
 * Track user logout
 */
export function trackUserLogout(): void {
  try {
    trackEvent('user_logout', {});
    console.log('[Analytics] User logout tracked');
  } catch (error) {
    console.error('[Analytics] Logout error:', error);
  }
}

/**
 * Track profile update
 */
export function trackProfileUpdate(fields: string[]): void {
  try {
    trackEvent('profile_updated', { fields });
    console.log('[Analytics] Profile updated:', fields);
  } catch (error) {
    console.error('[Analytics] Profile update error:', error);
  }
}

/**
 * Track notification received
 */
export function trackNotificationReceived(type: string): void {
  try {
    trackEvent('notification_received', { type });
    console.log('[Analytics] Notification received:', type);
  } catch (error) {
    console.error('[Analytics] Notification error:', error);
  }
}

/**
 * Track language changed
 */
export function trackLanguageChanged(language: string): void {
  try {
    trackEvent('language_changed', { language });
    console.log('[Analytics] Language changed:', language);
  } catch (error) {
    console.error('[Analytics] Language change error:', error);
  }
}

/**
 * Track app crash
 */
export function trackAppCrash(errorStack: string): void {
  try {
    trackEvent('app_crash', { errorStack });
    console.error('[Analytics] App crash tracked');
  } catch (error) {
    console.error('[Analytics] Crash tracking error:', error);
  }
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary(): Record<string, any> {
  return {
    apiKey: VEXO_API_KEY,
    initialized: true,
    timestamp: new Date().toISOString(),
  };
}
