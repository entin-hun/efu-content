/**
 * useScrollReveal Hook
 * 
 * Intersection Observer alapú scroll reveal animáció.
 * Elemek fade-in animációt kapnak, amikor a viewport-ba kerülnek.
 * 
 * Használat:
 *   const { ref, isVisible } = useScrollReveal();
 *   <div ref={ref} className={isVisible ? 'visible' : ''}>...</div>
 * 
 * Vagy a reveal CSS osztállyal:
 *   const { ref } = useScrollReveal();
 *   <div ref={ref} className="reveal">...</div>
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * useScrollRevealList Hook
 * 
 * Több elem staggered animációjához.
 * Minden gyermek elem késleltetve jelenik meg.
 * 
 * Használat:
 *   const { parentRef, childRefs } = useScrollRevealList(4);
 *   <div ref={parentRef}>
 *     {items.map((item, i) => (
 *       <div key={i} ref={childRefs[i]} className="reveal">...</div>
 *     ))}
 *   </div>
 */
export function useScrollRevealList(
  count: number,
  options: UseScrollRevealOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;

  const parentRef = useRef<HTMLDivElement>(null);
  const childRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    childRefs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set(prev).add(index));
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setVisibleItems((prev) => {
              const next = new Set(prev);
              next.delete(index);
              return next;
            });
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [count, threshold, rootMargin, triggerOnce]);

  return {
    parentRef,
    childRefs,
    visibleItems,
    isVisible: (index: number) => visibleItems.has(index),
  };
}
