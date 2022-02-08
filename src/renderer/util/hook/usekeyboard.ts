import { useEffect, useState } from 'react';

const useKeyboard = (callback: (event: KeyboardEvent) => void, deps: any[]) => {
  useEffect(() => {
    window.addEventListener('keydown', callback);
    return () => {
      window.removeEventListener('keydown', callback);
    };
    // Disable rule because of spreading deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);
};
