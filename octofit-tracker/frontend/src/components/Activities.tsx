import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const { items, isLoading, hasError } = useApiData<Activity>(getJson, '/api/activities', 'activities');

  return <CapabilityCard
    title="Activities"
    description="Track student activity minutes and points."
    emptyMessage="No activities yet."
    items={items}
    isLoading={isLoading}
    hasError={hasError}
    renderItem={(activity) => `${activity.type} - ${activity.minutes} minutes - ${activity.points} points`}
  />;
}
