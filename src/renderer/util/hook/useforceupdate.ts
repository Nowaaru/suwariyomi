import { useState } from 'react';

export default function useForceUpdate() {
  const [, setState] = useState(0);
  return () => setState((s) => s + 1);
}
