import { useEffect, useState } from 'react';

export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let actif = true;
    setLoading(true);
    setError(null);
    fn()
      .then((d) => actif && setData(d))
      .catch((e) => actif && setError(e))
      .finally(() => actif && setLoading(false));
    return () => { actif = false; };
  }, deps); 

  return { data, error, loading };
}