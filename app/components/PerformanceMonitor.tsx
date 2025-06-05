"use client";

import { useEffect } from 'react';

// Simple web vital metric type
type WebVitalMetric = {
  name: 'LCP' | 'FID' | 'CLS';
  value: number;
};

interface PerformanceMonitorProps {
  pageName: string;
}

export default function PerformanceMonitor({ pageName }: PerformanceMonitorProps) {
  useEffect(() => {
    // Monitor Core Web Vitals
    const reportWebVitals = (metric: WebVitalMetric) => {
      console.log(`[${pageName}] ${metric.name}:`, metric.value);
      
      // In production, you would send this to your analytics service
      // analytics.track(metric.name, {
      //   value: metric.value,
      //   page: pageName,
      //   timestamp: Date.now()
      // });
    };

    // Monitor page load performance
    const observer = new PerformanceObserver((list: PerformanceObserverEntryList) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          console.log(`[${pageName}] Page Load Metrics:`, {
            domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
            loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
            firstPaint: navigationEntry.responseEnd - navigationEntry.fetchStart,
            ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
          });
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          const lcpEntry = entry as LargestContentfulPaint;
          reportWebVitals({
            name: 'LCP',
            value: lcpEntry.startTime,
          });
        }
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          reportWebVitals({
            name: 'FID',
            value: fidEntry.processingStart - fidEntry.startTime,
          });
        }
      }
    });

    // Observe performance entries
    try {
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'] });
    } catch {
      console.log('Performance Observer not supported');
    }

    // Measure Cumulative Layout Shift (CLS)
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];
    
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) {
          const firstSessionEntry = clsEntries[0];
          const lastSessionEntry = clsEntries[clsEntries.length - 1];
          if (!firstSessionEntry ||
              shift.startTime - lastSessionEntry.startTime < 1000 &&
              shift.startTime - firstSessionEntry.startTime < 5000) {
            clsEntries.push(shift);
            clsValue += shift.value;
          } else {
            clsEntries = [shift];
            clsValue = shift.value;
          }
        }
      }
      reportWebVitals({ name: 'CLS', value: clsValue });
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      console.log('Layout Shift Observer not supported');
    }

    return () => {
      observer.disconnect();
      clsObserver.disconnect();
    };
  }, [pageName]);

  // This component doesn't render anything visible
  return null;
}
