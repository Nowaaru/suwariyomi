import React from 'react';
import { useLocation } from 'react-router-dom';

// https://v5.reactrouter.com/web/example/query-parameters
const useQuery = () => {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
};

export default useQuery;
