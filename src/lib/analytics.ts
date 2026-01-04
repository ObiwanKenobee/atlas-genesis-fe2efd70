// Google Analytics 4 setup for Atlas Genesis platform
// This module handles GA initialization and provides utilities for tracking

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: unknown[];
  }
}

// GA4 Measurement ID - should be set via environment variable
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Security and rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_EVENTS_PER_WINDOW = 100;
const MAX_EVENT_VALUE = 1000000; // Maximum allowed event value
const MAX_STRING_LENGTH = 100; // Maximum string length for parameters

// Rate limiting state
let eventCount = 0;
let windowStartTime = Date.now();

// Input sanitization utilities
const sanitizeString = (str: string, maxLength: number = MAX_STRING_LENGTH): string => {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLength).replace(/[<>'"&]/g, '');
};

const sanitizeNumber = (num: number, maxValue: number = MAX_EVENT_VALUE): number => {
  if (typeof num !== 'number' || isNaN(num)) return 0;
  return Math.max(0, Math.min(maxValue, num));
};

const isValidEventName = (name: string): boolean => {
  return typeof name === 'string' && name.length > 0 && name.length <= 50 && /^[a-zA-Z0-9_]+$/.test(name);
};

// Rate limiting check
const checkRateLimit = (): boolean => {
  const now = Date.now();

  if (now - windowStartTime > RATE_LIMIT_WINDOW) {
    eventCount = 0;
    windowStartTime = now;
  }

  if (eventCount >= MAX_EVENTS_PER_WINDOW) {
    console.warn('[Analytics] Rate limit exceeded, event dropped');
    return false;
  }

  eventCount++;
  return true;
};

// Initialize Google Analytics
export const initGA = (): void => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('[Analytics] GA_MEASUREMENT_ID not configured. Analytics disabled.');
    return;
  }

  if (typeof window === 'undefined') {
    return; // SSR safety
  }

  // Load gtag script if not already loaded
  if (!window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: unknown[]) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
  }

  // Configure GA4
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true,
    // Enhanced measurement settings
    allow_google_signals: true,
    allow_ad_personalization_signals: true,
    // Custom settings for performance monitoring
    custom_map: {
      dimension1: 'page_load_time',
      dimension2: 'first_contentful_paint',
      dimension3: 'largest_contentful_paint',
      dimension4: 'cumulative_layout_shift',
      dimension5: 'interaction_to_next_paint',
      dimension6: 'time_to_first_byte',
    },
  });

  console.log('[Analytics] Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
};

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters: Record<string, unknown> = {}
): void => {
  if (!window.gtag || !GA_MEASUREMENT_ID) {
    return;
  }

  // Security checks
  if (!checkRateLimit()) {
    return;
  }

  if (!isValidEventName(eventName)) {
    console.warn('[Analytics] Invalid event name:', eventName);
    return;
  }

  try {
    // Sanitize parameters
    const sanitizedParams: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parameters)) {
      const sanitizedKey = sanitizeString(key, 50);
      if (typeof value === 'string') {
        sanitizedParams[sanitizedKey] = sanitizeString(value);
      } else if (typeof value === 'number') {
        sanitizedParams[sanitizedKey] = sanitizeNumber(value);
      } else if (typeof value === 'boolean') {
        sanitizedParams[sanitizedKey] = value;
      }
      // Skip other types for security
    }

    window.gtag('event', eventName, {
      ...sanitizedParams,
      timestamp: Date.now(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event tracked:', eventName, sanitizedParams);
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (!window.gtag || !GA_MEASUREMENT_ID) {
    return;
  }

  try {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page view tracked:', pagePath);
    }
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
  }
};

// Track performance metrics
export const trackPerformanceMetric = (
  metricName: string,
  value: number,
  rating?: 'good' | 'needs-improvement' | 'poor'
): void => {
  const sanitizedMetricName = sanitizeString(metricName, 30);
  const sanitizedValue = sanitizeNumber(value, 100000); // Performance metrics shouldn't exceed 100 seconds

  trackEvent('web_vitals', {
    event_category: 'Web Vitals',
    event_label: sanitizedMetricName,
    value: Math.round(sanitizedValue),
    custom_map: {
      metric_value: sanitizedValue,
      metric_rating: rating,
    },
  });
};

// Track user engagement
export const trackEngagement = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  trackEvent('engagement', {
    event_category: category,
    event_label: label,
    value: value,
    engagement_action: action,
  });
};

// Track errors
export const trackError = (
  error: Error,
  context?: string,
  userId?: string
): void => {
  trackEvent('exception', {
    description: error.message,
    fatal: false,
    error_context: context,
    user_id: userId,
    stack: error.stack?.substring(0, 150), // Limit stack trace length
  });
};

// Check if analytics is enabled
export const isAnalyticsEnabled = (): boolean => {
  return !!GA_MEASUREMENT_ID && typeof window !== 'undefined' && !!window.gtag;
};

// Privacy and consent management
export const updateConsent = (consent: {
  analytics_storage?: 'granted' | 'denied';
  ad_storage?: 'granted' | 'denied';
  functionality_storage?: 'granted' | 'denied';
  personalization_storage?: 'granted' | 'denied';
  security_storage?: 'granted' | 'denied';
}): void => {
  if (!window.gtag || !GA_MEASUREMENT_ID) {
    return;
  }

  window.gtag('consent', 'update', consent);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Consent updated:', consent);
  }
};

// Set user properties
export const setUserProperties = (properties: Record<string, unknown>): void => {
  if (!window.gtag || !GA_MEASUREMENT_ID) {
    return;
  }

  window.gtag('set', 'user_properties', properties);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] User properties set:', properties);
  }
};