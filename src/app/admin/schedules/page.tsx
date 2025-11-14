'use client';

import { useQueryClient } from '@tanstack/react-query';

import Protected from '@/components/auth/Protected';
import { AppShell } from '@/components/layout/app-shell';
import { EntityPage } from '@/components/entities/entity-page';
import { CreateScheduleForm } from '@/features/entities/components/create-schedule-form';
import { EditScheduleForm } from '@/features/entities/components/edit-schedule-form';

export default function SchedulesPage() {
  return (
    <Protected roles={['ADMIN', 'DOCTOR']}>
      <AppShell>
        <SchedulesContent />
      </AppShell>
    </Protected>
  );
}

const SchedulesContent = () => {
  const queryClient = useQueryClient();
  const refreshSchedules = () => {
    queryClient.invalidateQueries({ queryKey: ['schedules'] }).catch(() => {});
    queryClient.invalidateQueries({ queryKey: ['schedules-detailed'] }).catch(() => {});
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <CreateScheduleForm onCreated={refreshSchedules} />
        <EditScheduleForm onUpdated={refreshSchedules} />
      </div>
      <EntityPage
        resource="schedules"
        title="Horarios"
        description="Consulta y ajusta los bloques disponibles para cada servicio."
        roles={['ADMIN', 'DOCTOR']}
        standalone={false}
      />
    </section>
  );
};
