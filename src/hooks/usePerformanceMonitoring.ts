import { useState, useEffect } from 'react';

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Mock performance monitoring
    console.log('Performance monitoring initialized');
  }, []);
};

export const useSEO = (data: any) => {
  return {
    title: 'Atlas Sanctum - Regenerative Carbon Credits',
    description: 'Leading platform for verified regenerative carbon credits and ecosystem restoration',
    ...data
  };
};