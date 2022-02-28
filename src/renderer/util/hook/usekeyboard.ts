import { useEffect } from 'react';

const useKeyboard = (
  variant: 'up' | 'down' = 'up',
  callback: (event: KeyboardEvent) => void,
  deps: any[]
) => {
  useEffect(() => {
    window.addEventListener(`key${variant}`, callback);
    return () => {
      window.removeEventListener(`key${variant}`, callback);
    };
    // Disable rule because of spreading deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);
};

export default useKeyboard;
