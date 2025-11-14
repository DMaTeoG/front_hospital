'use client';

import { EntityPage } from '@/components/entities/entity-page';
import { CreateDoctorForm } from '@/features/entities/components/create-doctor-form';

export default function DoctorsPage() {
  return (
    <EntityPage
      resource="doctors"
      title="Medicos"
      description="Administra especialidades, agenda y credenciales de medicos."
      renderCreateForm={(refetch) => <CreateDoctorForm onCreated={refetch} />}
    />
  );
}
