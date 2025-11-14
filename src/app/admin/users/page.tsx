import { EntityPage } from '@/components/entities/entity-page';

export default function UsersPage() {
  return (
    <EntityPage
      resource="users"
      title="Usuarios"
      description="Crea y asigna roles a todo el personal administrativo."
    />
  );
}
