import type { ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  emptyMessage: string;
  items: T[] | null;
  isLoading: boolean;
  hasError: boolean;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, emptyMessage, items, isLoading, hasError, renderItem }: Props<T>) {
  return <section className="card h-100" aria-label={title}><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {isLoading && <p role="status">Loading {title.toLowerCase()}...</p>}
    {hasError && <p role="alert">Unable to load {title.toLowerCase()}.</p>}
    {items?.length === 0 && <p>{emptyMessage}</p>}
    {items && items.length > 0 && <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
