// Enhanced Platform Analytics
export const analytics = {
  // Track user interactions
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...properties
    };

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Store locally for offline analysis
    const events = JSON.parse(localStorage.getItem('platform_events') || '[]');
    events.push(eventData);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('platform_events', JSON.stringify(events));
  },

  // Track page views
  trackPageView: (pageName: string) => {
    analytics.trackEvent('page_view', {
      page_name: pageName,
      page_location: window.location.href,
      page_title: document.title
    });
  },

  // Track user engagement
  trackEngagement: (action: string, element?: string) => {
    analytics.trackEvent('user_engagement', {
      action,
      element,
      engagement_time: Date.now()
    });
  },

  // Track performance metrics
  trackPerformance: (metric: string, value: number, unit: string = 'ms') => {
    analytics.trackEvent('performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit
    });
  },

  // Track performance metric (alias for compatibility)
  trackPerformanceMetric: (metric: string, value: number, unit: string = 'ms') => {
    analytics.trackPerformance(metric, value, unit);
  },

  // Track errors
  trackError: (error: Error, context?: Record<string, any>) => {
    analytics.trackEvent('platform_error', {
      error_message: error.message,
      error_stack: error.stack,
      error_context: context
    });
  },

  // Get analytics summary
  getSummary: () => {
    const events = JSON.parse(localStorage.getItem('platform_events') || '[]');
    const summary = {
      totalEvents: events.length,
      pageViews: events.filter(e => e.event === 'page_view').length,
      errors: events.filter(e => e.event === 'platform_error').length,
      engagements: events.filter(e => e.event === 'user_engagement').length,
      lastActivity: events[events.length - 1]?.timestamp
    };
    
    return summary;
  }
};

// Export individual functions for direct import
export const { trackEvent, trackPageView, trackEngagement, trackPerformance, trackPerformanceMetric, trackError, getSummary } = analytics;

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && !window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', 'GA_MEASUREMENT_ID');
  }
};