/**
 * Sistema de telemetría para monitorear performance y errores
 * Compatible con Google Analytics, Vercel Analytics, o custom endpoint
 * 
 * Web Vitals monitoreados:
 * - LCP (Largest Contentful Paint): <2.5s = bueno
 * - FID (First Input Delay): <100ms = bueno
 * - CLS (Cumulative Layout Shift): <0.1 = bueno
 * - FCP (First Contentful Paint): <1.8s = bueno
 * - TTFB (Time to First Byte): <600ms = bueno
 */

// Configuración de telemetría
const TELEMETRY_CONFIG = {
  enabled: true, // Cambiar a false en desarrollo si no quieres logs
  endpoint: null, // URL de endpoint custom (opcional)
  useConsole: true, // Log en consola (útil para debugging)
  sampleRate: 1.0 // 1.0 = 100% de usuarios (reducir en producción si es necesario)
};

/**
 * Envía evento de telemetría
 */
const sendTelemetryEvent = (eventName, eventData) => {
  if (!TELEMETRY_CONFIG.enabled) return;
  
  // Sample rate (ej: 0.1 = 10% de usuarios)
  if (Math.random() > TELEMETRY_CONFIG.sampleRate) return;

  const payload = {
    timestamp: new Date().toISOString(),
    eventName,
    ...eventData,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Console logging (desarrollo)
  if (TELEMETRY_CONFIG.useConsole) {
    console.log(`[Telemetry] ${eventName}`, payload);
  }

  // Enviar a endpoint custom
  if (TELEMETRY_CONFIG.endpoint) {
    fetch(TELEMETRY_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {}); // Silenciar errores
  }

  // Enviar a Google Analytics (si está disponible)
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }

  // Enviar a Vercel Analytics (si está disponible)
  if (window.va) {
    window.va('track', eventName, eventData);
  }
};

/**
 * Monitorea Web Vitals usando PerformanceObserver
 */
export const initWebVitalsTracking = () => {
  if (!TELEMETRY_CONFIG.enabled) return;

  // LCP - Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      sendTelemetryEvent('web_vital_lcp', {
        metric: 'LCP',
        value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
        rating: lastEntry.renderTime < 2500 ? 'good' : lastEntry.renderTime < 4000 ? 'needs-improvement' : 'poor',
        element: lastEntry.element?.tagName || 'unknown'
      });
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('[Telemetry] LCP observer not supported');
  }

  // FID - First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        sendTelemetryEvent('web_vital_fid', {
          metric: 'FID',
          value: Math.round(entry.processingStart - entry.startTime),
          rating: entry.processingStart - entry.startTime < 100 ? 'good' : entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor',
          eventType: entry.name
        });
      });
    });
    
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('[Telemetry] FID observer not supported');
  }

  // CLS - Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });
    
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Enviar CLS cuando el usuario sale de la página
    window.addEventListener('pagehide', () => {
      sendTelemetryEvent('web_vital_cls', {
        metric: 'CLS',
        value: Math.round(clsValue * 1000) / 1000,
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
      });
    }, { once: true });
  } catch (e) {
    console.warn('[Telemetry] CLS observer not supported');
  }

  // FCP - First Contentful Paint
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        sendTelemetryEvent('web_vital_fcp', {
          metric: 'FCP',
          value: Math.round(entry.startTime),
          rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor'
        });
      });
    });
    
    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.warn('[Telemetry] FCP observer not supported');
  }

  // TTFB - Time to First Byte
  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      
      sendTelemetryEvent('web_vital_ttfb', {
        metric: 'TTFB',
        value: Math.round(ttfb),
        rating: ttfb < 600 ? 'good' : ttfb < 1500 ? 'needs-improvement' : 'poor'
      });
    }
  } catch (e) {
    console.warn('[Telemetry] TTFB not available');
  }

  console.log('[Telemetry] ✅ Web Vitals tracking initialized');
};

/**
 * Trackea errores de video
 */
export const trackVideoError = (videoSrc, error, context = {}) => {
  sendTelemetryEvent('video_error', {
    videoSrc,
    errorCode: error.code || 'unknown',
    errorMessage: error.message || 'unknown',
    ...context
  });
};

/**
 * Trackea eventos de video (play, pause, end)
 */
export const trackVideoEvent = (eventType, videoSrc, currentTime = 0) => {
  sendTelemetryEvent('video_event', {
    eventType,
    videoSrc,
    currentTime: Math.round(currentTime)
  });
};

/**
 * Trackea performance de carga de página
 */
export const trackPageLoadPerformance = () => {
  if (!TELEMETRY_CONFIG.enabled) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      if (perfData) {
        sendTelemetryEvent('page_load', {
          loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
          domInteractive: Math.round(perfData.domInteractive - perfData.fetchStart),
          transferSize: perfData.transferSize || 0
        });
      }
    }, 0);
  });
};

/**
 * Trackea errores globales de JavaScript
 */
export const initErrorTracking = () => {
  if (!TELEMETRY_CONFIG.enabled) return;

  window.addEventListener('error', (event) => {
    sendTelemetryEvent('javascript_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack || 'no stack'
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    sendTelemetryEvent('promise_rejection', {
      reason: event.reason?.message || String(event.reason)
    });
  });

  console.log('[Telemetry] ✅ Error tracking initialized');
};

/**
 * Configurar telemetría (llamar desde main.jsx)
 */
export const configureTelemetry = (config = {}) => {
  Object.assign(TELEMETRY_CONFIG, config);
};

/**
 * Inicializar todo el sistema de telemetría
 */
export const initTelemetry = () => {
  initWebVitalsTracking();
  trackPageLoadPerformance();
  initErrorTracking();
  
  console.log('[Telemetry] 📊 Sistema de telemetría inicializado');
};

export default {
  initTelemetry,
  initWebVitalsTracking,
  trackVideoError,
  trackVideoEvent,
  trackPageLoadPerformance,
  initErrorTracking,
  configureTelemetry
};
