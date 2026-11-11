import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const { items, isLoading, hasError } = useApiData<Entry>(getJson, '/api/leaderboard', 'leaderboard');

  return <CapabilityCard
    title="Leaderboard"
    description="Compare team point totals."
    emptyMessage="No leaderboard rankings yet."
    items={items}
    isLoading={isLoading}
    hasError={hasError}
    renderItem={(entry) => `${entry.rank}. ${entry.teamName} - ${entry.totalPoints} points`}
  />;
}
