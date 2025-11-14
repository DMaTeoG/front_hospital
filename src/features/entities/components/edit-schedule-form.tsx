'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  fetchSchedulesDetailed,
  fetchDoctorsList,
  fetchCurrentDoctor,
  updateSchedule,
} from '@/features/entities/api';
import { useAuth } from '@/store/auth';

const schema = z.object({
  scheduleId: z.string().min(1, 'Selecciona un horario'),
  doctorId: z.string().optional(),
  dayOfWeek: z.string().min(1, 'Selecciona un día'),
  startTime: z.string().min(1, 'Define hora de inicio'),
  endTime: z.string().min(1, 'Define hora de cierre'),
  intervalMinutes: z.string().min(1, 'Intervalo requerido'),
});

const days = [
  { value: '0', label: 'Lunes' },
  { value: '1', label: 'Martes' },
  { value: '2', label: 'Miércoles' },
  { value: '3', label: 'Jueves' },
  { value: '4', label: 'Viernes' },
  { value: '5', label: 'Sábado' },
  { value: '6', label: 'Domingo' },
];

type Props = {
  onUpdated?: () => void;
};

export const EditScheduleForm = ({ onUpdated }: Props) => {
  const role = useAuth((state) => state.user?.role);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduleId: '',
      doctorId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      intervalMinutes: '30',
    },
  });

  const { data: currentDoctor } = useQuery({
    queryKey: ['edit-schedule-current-doctor'],
    queryFn: fetchCurrentDoctor,
    enabled: role === 'DOCTOR',
  });

  const doctorIdFilter = role === 'DOCTOR' ? String(currentDoctor?.id ?? '') : undefined;

  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['schedules-detailed', doctorIdFilter],
    queryFn: () => fetchSchedulesDetailed({ doctorId: doctorIdFilter }),
    enabled: role === 'ADMIN' ? true : Boolean(currentDoctor?.id),
  });

  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['schedule-edit-doctors'],
    queryFn: fetchDoctorsList,
    enabled: role === 'ADMIN',
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const minutes = Number(values.intervalMinutes);
      if (!Number.isFinite(minutes) || minutes <= 0) {
        throw new Error('Intervalo inválido');
      }
      const doctorId = role === 'ADMIN' ? values.doctorId : undefined;
      await updateSchedule(Number(values.scheduleId), {
        doctorId,
        dayOfWeek: Number(values.dayOfWeek),
        startTime: values.startTime,
        endTime: values.endTime,
        intervalMinutes: minutes,
      });
    },
    onSuccess: () => {
      toast.success('Horario actualizado');
      onUpdated?.();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo actualizar el horario',
      );
    },
  });

  const selectedScheduleId = useWatch({
    control: form.control,
    name: 'scheduleId',
  });

  useEffect(() => {
    if (!selectedScheduleId && schedules?.length) {
      form.setValue('scheduleId', String(schedules[0].id));
      return;
    }
    const selected = schedules?.find(
      (schedule) => String(schedule.id) === selectedScheduleId,
    );
    if (selected) {
      form.setValue('doctorId', String(selected.doctorId));
      form.setValue('dayOfWeek', String(selected.dayOfWeek));
      form.setValue('startTime', selected.startTime);
      form.setValue('endTime', selected.endTime);
      form.setValue('intervalMinutes', String(selected.intervalMinutes));
    }
  }, [schedules, selectedScheduleId, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar horario</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="space-y-1 md:col-span-2">
            <Label>Horario</Label>
            <Select disabled={loadingSchedules} {...form.register('scheduleId')}>
              <option value="">Selecciona un horario</option>
              {schedules?.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.doctorName} · {days[schedule.dayOfWeek]?.label ?? ''} ·{' '}
                  {schedule.startTime} - {schedule.endTime}
                </option>
              ))}
            </Select>
            {form.formState.errors.scheduleId && (
              <p className="text-xs text-red-500">{form.formState.errors.scheduleId.message}</p>
            )}
          </div>

          {role === 'ADMIN' && (
            <div className="space-y-1">
              <Label>Médico</Label>
              <Select disabled={loadingDoctors} {...form.register('doctorId')}>
                <option value="">Selecciona un médico</option>
                {doctors?.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialtyName ? `- ${doctor.specialtyName}` : ''}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label>Día</Label>
            <Select {...form.register('dayOfWeek')}>
              <option value="">Selecciona un día</option>
              {days.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </Select>
            {form.formState.errors.dayOfWeek && (
              <p className="text-xs text-red-500">{form.formState.errors.dayOfWeek.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Hora inicio</Label>
            <Input type="time" {...form.register('startTime')} />
            {form.formState.errors.startTime && (
              <p className="text-xs text-red-500">{form.formState.errors.startTime.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Hora fin</Label>
            <Input type="time" {...form.register('endTime')} />
            {form.formState.errors.endTime && (
              <p className="text-xs text-red-500">{form.formState.errors.endTime.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Intervalo (minutos)</Label>
            <Input type="number" min={5} step={5} {...form.register('intervalMinutes')} />
            {form.formState.errors.intervalMinutes && (
              <p className="text-xs text-red-500">
                {form.formState.errors.intervalMinutes.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Actualizando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
