import { useState, useEffect, RefObject } from 'react';

// Interface for scroll position
export interface ScrollPosition {
  x: number;
  y: number;
}

// Hook to track scroll position of window or specific element
export const useScrollPosition = (elementRef?: RefObject<HTMLElement>) => {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const element = elementRef?.current || window;
    
    const handleScroll = () => {
      const position = {
        x: elementRef ? (elementRef.current?.scrollLeft || 0) : window.scrollX,
        y: elementRef ? (elementRef.current?.scrollTop || 0) : window.scrollY
      };
      
      setScrollPosition(position);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // Call once to initialize position
    handleScroll();
    
    return () => element.removeEventListener('scroll', handleScroll);
  }, [elementRef]);

  return scrollPosition;
}; 