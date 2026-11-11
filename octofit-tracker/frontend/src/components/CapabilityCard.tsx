import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: string;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, endpoint, dataKey, emptyMessage, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    getJson<Record<string, T[]>>(endpoint).then((response) => {
      const data = response[dataKey];
      if (!Array.isArray(data)) throw new Error(`Invalid ${dataKey} response`);
      if (active) setItems(data);
    }).catch(() => {
      if (active) setHasError(true);
    });

    return () => {
      active = false;
    };
  }, [dataKey, endpoint]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {items === null && !hasError && <p role="status">Loading {title.toLowerCase()}...</p>}
    {hasError && <p role="alert">Unable to load {title.toLowerCase()}.</p>}
    {items?.length === 0 && <p>{emptyMessage}</p>}
    {items && items.length > 0 && <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
