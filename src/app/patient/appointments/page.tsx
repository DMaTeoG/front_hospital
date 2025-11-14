'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import Protected from '@/components/auth/Protected';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  cancelAppointment,
  confirmAppointment,
  fetchPatientAppointments,
} from '@/features/appointments/api';
import type { Appointment } from '@/types/appointments';

export default function PatientAppointmentsPage() {
  return (
    <Protected roles={['PATIENT']}>
      <AppShell>
        <PatientAppointments />
      </AppShell>
    </Protected>
  );
}

const PatientAppointments = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: () =>
      fetchPatientAppointments({
        page: 1,
        pageSize: 20,
      }),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => confirmAppointment(id),
    onSuccess: () => {
      toast.success('Cita confirmada');
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => {
      toast.success('Cita cancelada');
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
  });

  const renderActions = (appointment: Appointment) => {
    if (appointment.status === 'PENDING') {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => confirmMutation.mutate(appointment.id)}
          >
            Confirmar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cancelMutation.mutate(appointment.id)}
          >
            Cancelar
          </Button>
        </div>
      );
    }
    return <span className="text-xs text-muted-foreground">Sin acciones</span>;
  };

  return (
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
                  <TH>Doctor</TH>
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
                        <div className="font-medium">{appointment.doctor?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.doctor?.specialty}
                        </div>
                      </TD>
                      <TD>
                        <div>{appointment.date}</div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.startTime}
                        </div>
                      </TD>
                      <TD className="uppercase text-xs text-muted-foreground">
                        {appointment.status}
                      </TD>
                      <TD>{renderActions(appointment)}</TD>
                    </TR>
                  ))}
                {!isLoading && !data?.items?.length && (
                  <TR>
                    <TD colSpan={5} className="text-center text-sm text-muted-foreground">
                      No tienes citas programadas
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
