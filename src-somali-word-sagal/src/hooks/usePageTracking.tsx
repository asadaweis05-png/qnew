
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (command: string, action: string, params: object) => void;
    dataLayer?: any[];
  }
}

export const usePageTracking = () => {
  const location = useLocation();
  const [isDebug] = useState(() => {
    // Check for URL parameter or localStorage setting for debug mode
    return new URLSearchParams(window.location.search).has('analytics_debug') || 
           localStorage.getItem('analytics_debug') === 'true';
  });
  
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      // Track page view
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
        page_location: window.location.href,
        debug_mode: isDebug
      });
      
      if (isDebug) {
        console.log('Analytics debug: Page view sent', {
          path: location.pathname + location.search,
          title: document.title,
          url: window.location.href
        });
        
        // Check if dataLayer exists and has data
        if (window.dataLayer && window.dataLayer.length) {
          console.log('Analytics debug: dataLayer exists with', window.dataLayer.length, 'items');
        } else {
          console.warn('Analytics debug: dataLayer is empty or undefined');
        }
      }
    } else if (isDebug) {
      console.error('Analytics debug: gtag is not defined. Analytics may be blocked by an extension or failed to load.');
    }
  }, [location, isDebug]);
};
