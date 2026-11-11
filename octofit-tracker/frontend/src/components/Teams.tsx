import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  const { items, isLoading, hasError } = useApiData<Team>(getJson, '/api/teams', 'teams');

  return <CapabilityCard
    title="Teams"
    description="Manage teams and members."
    emptyMessage="No teams yet."
    items={items}
    isLoading={isLoading}
    hasError={hasError}
    renderItem={(team) => `${team.name} (${team.members.length} members)`}
  />;
}
