'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import Protected from '@/components/auth/Protected';
import { AppShell } from '@/components/layout/app-shell';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import {
  fetchAppointments,
  confirmAppointment,
  cancelAppointment,
} from '@/features/appointments/api';
import { RequestAppointmentForm } from '@/features/appointments/components/request-appointment-form';
import { AppointmentRecordPanel } from '@/features/records/components/appointment-record-panel';
import { api } from '@/lib/api';
import type { Appointment, AppointmentStatus } from '@/types/appointments';

const filterSchema = z.object({
  q: z.string().optional(),
  state: z.enum(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  doctorId: z.string().optional(),
  specialtyId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'default',
};

const statusLabel: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
};

export default function AdminAppointmentsPage() {
  return (
    <Protected roles={['ADMIN']}>
      <AppShell>
        <AppointmentsSection />
      </AppShell>
    </Protected>
  );
}

const AppointmentsSection = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const [recordAppointment, setRecordAppointment] = useState<Appointment | null>(null);

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      q: '',
      state: 'ALL',
    },
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(
    form.getValues(),
  );

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', page, appliedFilters],
    queryFn: () =>
      fetchAppointments({
        page,
        pageSize,
        ...appliedFilters,
      }),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => confirmAppointment(id),
    onSuccess: () => {
      toast.success('Cita confirmada');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: () => toast.error('No se pudo confirmar la cita'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => {
      toast.success('Cita cancelada');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: () => toast.error('No se pudo cancelar la cita'),
  });

  const totalPages = useMemo(() => {
    if (!data?.meta) return 1;
    return Math.ceil(data.meta.total / pageSize);
  }, [data, pageSize]);

  const onExport = async (type: 'pdf' | 'xlsx') => {
    setExporting(true);
    try {
      const { data } = await api.get(`/export/appointments.${type}`, {
        responseType: 'blob',
      });
      const blob = new Blob([data], {
        type:
          type === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'pdf' ? 'citas.pdf' : 'citas.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('No se pudo exportar las citas');
    } finally {
      setExporting(false);
    }
  };

  const handleFiltersSubmit = (values: FilterValues) => {
    setAppliedFilters(values);
    setPage(1);
  };

  const handleResetFilters = () => {
    form.reset({
      q: '',
      state: 'ALL',
      doctorId: '',
      specialtyId: '',
      from: '',
      to: '',
    });
    setAppliedFilters(form.getValues());
    setPage(1);
  };

  const renderActions = (appointment: Appointment) => {
    const canManageRecord = Boolean(
      appointment.patientProfileId && appointment.doctorProfileId,
    );

    const recordButton = (
      <Button
        key="record"
        variant="secondary"
        className="text-xs"
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
            className="text-xs"
            onClick={() => confirmMutation.mutate(appointment.id)}
          >
            Confirmar
          </Button>
          <Button
            variant="ghost"
            className="text-xs text-red-500"
            onClick={() => cancelMutation.mutate(appointment.id)}
          >
            Cancelar
          </Button>
          {recordButton}
        </div>
      );
    }

    return <div className="flex flex-wrap gap-2">{recordButton}</div>;
  };

  return (
    <>
      <section className="space-y-6">
      <RequestAppointmentForm
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }}
      />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Citas</h2>
          <p className="text-sm text-muted-foreground">
            Filtra y exporta la agenda global.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onExport('pdf')} disabled={exporting}>
            {exporting ? 'Generando…' : 'Exportar PDF'}
          </Button>
          <Button onClick={() => onExport('xlsx')} disabled={exporting}>
            {exporting ? 'Generando…' : 'Exportar Excel'}
          </Button>
        </div>
      </header>

      <form
        className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2 lg:grid-cols-4"
        onSubmit={form.handleSubmit(handleFiltersSubmit)}
      >
        <div className="space-y-1">
          <Label>Buscar</Label>
          <Input placeholder="Paciente o doctor" {...form.register('q')} />
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select {...form.register('state')}>
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="COMPLETED">Completada</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Doctor</Label>
          <Input placeholder="ID de doctor" {...form.register('doctorId')} />
        </div>
        <div className="space-y-1">
          <Label>Especialidad</Label>
          <Input placeholder="ID de especialidad" {...form.register('specialtyId')} />
        </div>
        <div className="space-y-1">
          <Label>Desde</Label>
          <Input type="date" {...form.register('from')} />
        </div>
        <div className="space-y-1">
          <Label>Hasta</Label>
          <Input type="date" {...form.register('to')} />
        </div>
        <div className="space-y-2 md:col-span-2 lg:col-span-4">
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Aplicar filtros</Button>
            <Button type="button" variant="outline" onClick={handleResetFilters}>
              Limpiar
            </Button>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>ID</TH>
                <TH>Paciente</TH>
                <TH>Doctor</TH>
                <TH>Fecha</TH>
                <TH>Estado</TH>
                <TH>Acciones</TH>
              </TR>
            </THead>
            <TBody>
              {isLoading && (
                <TR>
                  <TD colSpan={6} className="text-center text-sm text-muted-foreground">
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
                    <TD>
                      <Badge variant={statusVariant[appointment.status]}>
                        {statusLabel[appointment.status]}
                      </Badge>
                    </TD>
                    <TD>{renderActions(appointment)}</TD>
                  </TR>
                ))}
              {!isLoading && !data?.items?.length && (
                <TR>
                  <TD colSpan={6} className="text-center text-sm text-muted-foreground">
                    Sin resultados
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </div>
        <footer className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Siguiente
            </Button>
          </div>
        </footer>
      </div>
      </section>
      {recordAppointment && (
        <AppointmentRecordPanel
          appointment={recordAppointment}
          onClose={() => setRecordAppointment(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
          }}
        />
      )}
    </>
  );
};
