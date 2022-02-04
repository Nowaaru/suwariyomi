import { EffectCallback, useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
// eslint-disable-next-line react-hooks/exhaustive-deps
export default (fun: EffectCallback) => useEffect(fun, []);
