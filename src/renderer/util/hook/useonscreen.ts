import { RefObject, useState } from 'react';
import useMountEffect from './useMountEffect';

export default function useOnScreen(ref: RefObject<Element>) {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = new IntersectionObserver(([entry]) =>
    setIntersecting(entry.isIntersecting)
  );

  useMountEffect(() => {
    if (!ref.current) return () => {};
    observer.observe(ref.current);
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  });

  return isIntersecting;
}
