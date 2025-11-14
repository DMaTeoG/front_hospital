'use client';

import { EntityPage } from '@/components/entities/entity-page';
import { CreatePatientForm } from '@/features/entities/components/create-patient-form';

export default function PatientsPage() {
  return (
    <EntityPage
      resource="patients"
      title="Pacientes"
      description="Gestiona pacientes registrados, historial y contacto."
      renderCreateForm={(refetch) => <CreatePatientForm onCreated={refetch} />}
    />
  );
}
