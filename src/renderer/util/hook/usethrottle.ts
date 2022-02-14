import { useCallback, useRef } from 'react';

const useThrottle = (fn: (...args: any[]) => void, ms: number) => {
  const savedFn = useCallback(fn, [fn]);
  const lastRan = useRef(0);

  const run = (...args: any[]) => {
    lastRan.current = Date.now();
    return savedFn(...args);
  };

  const throttled = (...args: any[]) => {
    if (Date.now() - lastRan.current >= ms) {
      run(...args);
    }
  };

  return throttled;
};

export default useThrottle;
