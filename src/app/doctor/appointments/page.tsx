'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import Protected from '@/components/auth/Protected';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  cancelAppointment,
  confirmAppointment,
  fetchAppointments,
} from '@/features/appointments/api';
import { fetchCurrentDoctor } from '@/features/entities/api';
import { AppointmentRecordPanel } from '@/features/records/components/appointment-record-panel';
import type { Appointment } from '@/types/appointments';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'default',
};

export default function DoctorAppointmentsPage() {
  return (
    <Protected roles={['DOCTOR']}>
      <AppShell>
        <DoctorAppointments />
      </AppShell>
    </Protected>
  );
}

const DoctorAppointments = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [recordAppointment, setRecordAppointment] = useState<Appointment | null>(null);

  const { data: doctor, isLoading: loadingDoctor } = useQuery({
    queryKey: ['current-doctor-profile'],
    queryFn: fetchCurrentDoctor,
  });

  const filters = useMemo(
    () => ({
      page,
      pageSize,
      doctorId: doctor ? String(doctor.id) : undefined,
    }),
    [page, pageSize, doctor],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-appointments', filters],
    queryFn: () => fetchAppointments({ page, pageSize, doctorId: filters.doctorId }),
    enabled: Boolean(filters.doctorId),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => confirmAppointment(id),
    onSuccess: () => {
      toast.success('Cita confirmada');
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
    onError: () => toast.error('No se pudo confirmar la cita'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => {
      toast.success('Cita cancelada');
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
    onError: () => toast.error('No se pudo cancelar la cita'),
  });

  const renderActions = (appointment: Appointment) => {
    const canManageRecord = Boolean(
      appointment.patientProfileId && appointment.doctorProfileId,
    );
    const recordButton = (
      <Button
        key="record"
        variant="secondary"
        size="sm"
        disabled={!canManageRecord}
        title={
          canManageRecord ? undefined : 'La cita debe tener paciente y medico para registrar historia'
        }
        onClick={() => setRecordAppointment(appointment)}
      >
        Historia clinica
      </Button>
    );

    if (appointment.status === 'PENDING') {
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => confirmMutation.mutate(appointment.id)}
          >
            Aceptar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cancelMutation.mutate(appointment.id)}
          >
            Rechazar
          </Button>
          {recordButton}
        </div>
      );
    }

    return <div className="flex flex-wrap gap-2">{recordButton}</div>;
  };

  if (loadingDoctor) {
    return <p className="text-sm text-muted-foreground">Cargando perfil…</p>;
  }

  if (!doctor) {
    return <p className="text-sm text-muted-foreground">No se encontró perfil de médico.</p>;
  }

  const totalPages = data?.meta ? Math.ceil(data.meta.total / pageSize) : 1;

  return (
    <>
      <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mis citas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>ID</TH>
                  <TH>Paciente</TH>
                  <TH>Fecha</TH>
                  <TH>Estado</TH>
                  <TH>Acciones</TH>
                </TR>
              </THead>
              <TBody>
                {isLoading && (
                  <TR>
                    <TD colSpan={5} className="text-center text-sm text-muted-foreground">
                      Cargando…
                    </TD>
                  </TR>
                )}
                {!isLoading &&
                  data?.items?.map((appointment) => (
                    <TR key={appointment.id}>
                      <TD>{appointment.id}</TD>
                      <TD>
                        <div className="font-medium">{appointment.patient?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.patient?.email}
                        </div>
                      </TD>
                      <TD>
                        <div>{appointment.date}</div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.startTime}
                        </div>
                      </TD>
                      <TD>
                        <Badge variant={statusVariant[appointment.status] ?? 'default'}>
                          {appointment.status}
                        </Badge>
                      </TD>
                      <TD>{renderActions(appointment)}</TD>
                    </TR>
                  ))}
                {!isLoading && !data?.items?.length && (
                  <TR>
                    <TD colSpan={5} className="text-center text-sm text-muted-foreground">
                      No hay citas registradas
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
          <footer className="mt-4 flex items-center justify-between text-sm">
            <span>
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Siguiente
              </Button>
            </div>
          </footer>
        </CardContent>
      </Card>
      </section>
      {recordAppointment && (
        <AppointmentRecordPanel
          appointment={recordAppointment}
          onClose={() => setRecordAppointment(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
          }}
        />
      )}
    </>
  );
};
