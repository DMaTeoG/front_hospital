'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'sonner';
import type { EventApi, EventDropArg, EventInput } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';

import Protected from '@/components/auth/Protected';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAppointments, rescheduleAppointment } from '@/features/appointments/api';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/store/auth';
import { fetchDoctorsList, fetchCurrentDoctor } from '@/features/entities/api';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), {
  ssr: false,
});

export default function DoctorSchedulePage() {
  return (
    <Protected roles={['ADMIN', 'DOCTOR']}>
      <AppShell>
        <ScheduleContent />
      </AppShell>
    </Protected>
  );
}

const ScheduleContent = () => {
  const [viewRange, setViewRange] = useState<{ from: string; to: string }>(() => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    };
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const queryClient = useQueryClient();
  const role = useAuth((state) => state.user?.role);

  const { data: currentDoctor } = useQuery({
    queryKey: ['doctor-profile-schedule'],
    queryFn: fetchCurrentDoctor,
    enabled: role === 'DOCTOR',
  });

  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['schedule-doctors-list'],
    queryFn: fetchDoctorsList,
    enabled: role === 'ADMIN',
  });

  const effectiveDoctorId =
    role === 'DOCTOR' ? (currentDoctor?.id ? String(currentDoctor.id) : '') : selectedDoctorId;

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-schedule', effectiveDoctorId, viewRange.from, viewRange.to],
    queryFn: () =>
      fetchAppointments({
        page: 1,
        pageSize: 200,
        doctorId: effectiveDoctorId,
        from: viewRange.from,
        to: viewRange.to,
        state: 'ALL',
      }),
    enabled: Boolean(effectiveDoctorId),
  });

  const calendarEvents: EventInput[] = useMemo(
    () =>
      (data?.items ?? []).map((appointment) => ({
        id: String(appointment.id),
        title: appointment.patient?.name ?? 'Sin paciente',
        start: `${appointment.date}T${appointment.startTime}`,
        end: appointment.endTime ? `${appointment.date}T${appointment.endTime}` : undefined,
        extendedProps: {
          status: appointment.status,
          reason: appointment.reason,
          doctor: appointment.doctor?.name,
        },
      })),
    [data?.items],
  );

  const mutation = useMutation({
    mutationFn: rescheduleAppointment,
    onSuccess: () => {
      toast.success('Cita reprogramada');
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] });
    },
    onError: () => toast.error('No se pudo reprogramar la cita'),
  });

  const persistChange = async (event: EventApi | null) => {
    if (!event) return;
    await mutation.mutateAsync({
      id: event.id,
      start: event.start?.toISOString() ?? '',
      end: event.end?.toISOString() ?? '',
    });
  };

  const handleDrop = async (eventInfo: EventDropArg) => {
    await persistChange(eventInfo.event);
  };

  const handleResize = async (eventInfo: EventResizeDoneArg) => {
    await persistChange(eventInfo.event);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agenda médica</h1>
          <p className="text-sm text-muted-foreground">
            Arrastra y suelta para reprogramar o extiende para ajustar la duración.
          </p>
        </div>
        {role === 'ADMIN' && (
          <div className="w-full max-w-xs space-y-1">
            <label className="text-xs uppercase text-muted-foreground">Doctor</label>
            <Select
              disabled={loadingDoctors}
              value={selectedDoctorId}
              onChange={(event) => setSelectedDoctorId(event.target.value)}
            >
              <option value="">Selecciona un doctor</option>
              {doctors?.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} {doctor.specialtyName ? `- ${doctor.specialtyName}` : ''}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
      {effectiveDoctorId ? (
        <Card>
          <CardHeader>
            <CardTitle>Vista semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="fullcalendar-wrapper">
              <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                events={calendarEvents}
                editable
                selectable
                eventDrop={handleDrop}
                eventResize={handleResize}
                datesSet={(arg) => {
                  setViewRange({
                    from: arg.startStr.slice(0, 10),
                    to: arg.endStr.slice(0, 10),
                  });
                }}
                locale="es"
                height="auto"
                firstDay={1}
                nowIndicator
              />
              {isLoading && (
                <p className="mt-2 text-center text-sm text-muted-foreground">Cargando agenda…</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Selecciona un doctor para visualizar su agenda.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
};
