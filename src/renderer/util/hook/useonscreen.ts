import { RefObject, useEffect, useState } from 'react';

export default function useOnScreen(
  scrollContainer: RefObject<HTMLDivElement | null>,
  elementToObserve: HTMLDivElement | null
) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!elementToObserve) return () => {};
    if (!scrollContainer.current) return () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        root: scrollContainer.current,
        threshold: 0.5,
      }
    );

    observer.observe(elementToObserve);
    return () => {
      observer.disconnect();
    };
  }, [scrollContainer, elementToObserve]);
  return isIntersecting;
}
