import { useEffect, useCallback } from 'react';

export const usePerformanceOptimization = () => {
  // Preload critical resources
  const preloadResources = useCallback(() => {
    const criticalRoutes = ['/dashboard', '/marketplace', '/measurements'];
    
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }, []);

  // Optimize images
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
    return () => imageObserver.disconnect();
  }, []);

  // Monitor Core Web Vitals
  const monitorWebVitals = useCallback(() => {
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);

  useEffect(() => {
    preloadResources();
    const cleanup = optimizeImages();
    monitorWebVitals();
    
    return cleanup;
  }, [preloadResources, optimizeImages, monitorWebVitals]);

  return {
    preloadResources,
    optimizeImages,
    monitorWebVitals
  };
};