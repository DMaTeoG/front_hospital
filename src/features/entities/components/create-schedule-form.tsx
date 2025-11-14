'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createSchedule, fetchDoctorsList } from '@/features/entities/api';
import { useAuth } from '@/store/auth';

const schema = z.object({
  doctorId: z.string().optional(),
  dayOfWeek: z.string().min(1, 'Selecciona un dia'),
  startTime: z.string().min(1, 'Define hora de inicio'),
  endTime: z.string().min(1, 'Define hora de cierre'),
  intervalMinutes: z.string().min(1, 'Intervalo requerido'),
});

type FormValues = z.infer<typeof schema>;

const days = [
  { value: '0', label: 'Lunes' },
  { value: '1', label: 'Martes' },
  { value: '2', label: 'Miercoles' },
  { value: '3', label: 'Jueves' },
  { value: '4', label: 'Viernes' },
  { value: '5', label: 'Sabado' },
  { value: '6', label: 'Domingo' },
];

type Props = {
  onCreated?: () => void;
};

export const CreateScheduleForm = ({ onCreated }: Props) => {
  const role = useAuth((state) => state.user?.role);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      doctorId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      intervalMinutes: '30',
    },
  });

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['schedule-doctors'],
    queryFn: fetchDoctorsList,
    enabled: role === 'ADMIN',
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (role === 'ADMIN' && !values.doctorId) {
        throw new Error('Selecciona un medico');
      }
      const minutes = Number(values.intervalMinutes);
      if (!Number.isFinite(minutes) || minutes <= 0) {
        throw new Error('Intervalo invalido');
      }
      const doctorId = role === 'ADMIN' ? values.doctorId : undefined;
      return createSchedule({
        doctorId,
        dayOfWeek: Number(values.dayOfWeek),
        startTime: values.startTime,
        endTime: values.endTime,
        intervalMinutes: minutes,
      });
    },
    onSuccess: () => {
      toast.success('Horario creado');
      form.reset({
        doctorId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        intervalMinutes: '30',
      });
      onCreated?.();
    },
    onError: () => toast.error('No se pudo crear el horario'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar horario</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          {role === 'ADMIN' && (
            <div className="space-y-1 md:col-span-2">
              <Label>Medico</Label>
              <Select disabled={isLoading} {...form.register('doctorId')}>
                <option value="">Selecciona un medico</option>
                {doctors?.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialtyName ? `- ${doctor.specialtyName}` : ''}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>Dia</Label>
            <Select {...form.register('dayOfWeek')}>
              <option value="">Selecciona un dia</option>
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
              {mutation.isPending ? 'Guardando...' : 'Crear horario'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
