import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';

type Suggestion = { title: string; reason: string };

export default function Workouts() {
  const endpoint = `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`;
  const { items, isLoading, hasError } = useApiData<Suggestion>(getJson, endpoint, 'suggestions');

  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    emptyMessage="No workout suggestions available."
    items={items}
    isLoading={isLoading}
    hasError={hasError}
    renderItem={(suggestion) => `${suggestion.title}: ${suggestion.reason}`}
  />;
}
