import { useEffect, useState } from 'react';

type JsonGetter = (path: string) => Promise<unknown>;

export function useApiData<T>(getJson: JsonGetter, endpoint: string, dataKey: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    getJson(endpoint).then((response) => {
      if (typeof response !== 'object' || response === null) {
        throw new Error(`Invalid ${dataKey} response`);
      }
      const data = (response as Record<string, unknown>)[dataKey];
      if (!Array.isArray(data)) throw new Error(`Invalid ${dataKey} response`);
      if (active) setItems(data as T[]);
    }).catch(() => {
      if (active) setHasError(true);
    });

    return () => {
      active = false;
    };
  }, [dataKey, endpoint, getJson]);

  return { items, hasError, isLoading: items === null && !hasError };
}
