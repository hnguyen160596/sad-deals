import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Track generic events
export const trackEvent = (...args: any[]) => {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', ...args);
    }
    console.log('[Analytics] Event tracked', ...args);
  } catch (e) {
    // Silently fail
  }
};

// Track click events
export const trackClick = (component: string, action: string) => {
  try {
    // Legacy analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click', {
        event_category: component,
        event_label: action
      });
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click', {
        component: component,
        action: action
      });
    }

    console.log(`Tracked click: ${component} - ${action}`);
  } catch (error) {
    console.error('Error tracking click:', error);
  }
};

// Track form submissions
export const trackFormSubmit = (...args: any[]) => {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'form_submit', ...args);
    }
    console.log('[Analytics] Form submission tracked', ...args);
  } catch (e) {
    // Silently fail
  }
};

// Track search events
export const trackSearch = (...args: any[]) => {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search', ...args);
    }
    console.log('[Analytics] Search tracked', ...args);
  } catch (e) {
    // Silently fail
  }
};

// Track ecommerce events
export const trackEcommerce = {
  viewProduct: (...args: any[]) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'view_item', ...args);
      }
      console.log('[Analytics] Product view tracked', ...args);
    } catch (e) {
      // Silently fail
    }
  },
  addToCart: (...args: any[]) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'add_to_cart', ...args);
      }
      console.log('[Analytics] Add to cart tracked', ...args);
    } catch (e) {
      // Silently fail
    }
  },
  initiateCheckout: (...args: any[]) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'begin_checkout', ...args);
      }
      console.log('[Analytics] Checkout initiated', ...args);
    } catch (e) {
      // Silently fail
    }
  },
  purchase: (...args: any[]) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', ...args);
      }
      console.log('[Analytics] Purchase tracked', ...args);
    } catch (e) {
      // Silently fail
    }
  }
};

// Track page views
export const trackPageView = (pageTitle: string, pagePath: string) => {
  try {
    // Legacy analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.GOOGLE_ANALYTICS_ID, {
        page_title: pageTitle,
        page_path: pagePath
      });
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath
      });
    }

    console.log(`Tracked page view: ${pageTitle} - ${pagePath}`);
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track conversion events
export const trackConversion = (action: string, value: number = 0, currency: string = 'USD') => {
  try {
    // Legacy analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: process.env.GOOGLE_CONVERSION_ID,
        event_category: 'Conversion',
        event_label: action,
        value: value,
        currency: currency
      });
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        action: action,
        value: value,
        currency: currency
      });
    }

    console.log(`Tracked conversion: ${action} - ${value} ${currency}`);
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
};

// Initialize Google Analytics
const initGoogleAnalytics = () => {
  if (typeof window === 'undefined') return;

  // Create script elements for Google Analytics
  const createGoogleAnalyticsScript = () => {
    // Create the Google Analytics tag
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID || 'G-EXAMPLE123'}`;

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${process.env.GOOGLE_ANALYTICS_ID || 'G-EXAMPLE123'}', {
        send_page_view: false
      });
    `;

    // Add scripts to the document
    document.head.appendChild(script1);
    document.head.appendChild(script2);

    console.log('Google Analytics initialized');
  };

  // Initialize if not already done
  if (!(window as any).gtag) {
    createGoogleAnalyticsScript();
  }
};

// Main Analytics component
const Analytics: React.FC = () => {
  const location = useLocation();

  // Initialize analytics on mount
  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  // Track page views when location changes
  useEffect(() => {
    const pageTitle = document.title;
    const pagePath = location.pathname + location.search;

    trackPageView(pageTitle, pagePath);
  }, [location]);

  return null; // This component doesn't render anything
};

export default Analytics;
