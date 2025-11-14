'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  AvailabilitySlot,
  createAppointment,
  fetchDoctorAvailabilitySlots,
} from '@/features/appointments/api';
import {
  fetchDoctorsList,
  fetchPatientsList,
} from '@/features/entities/api';
import { useAuth } from '@/store/auth';

const schema = z.object({
  patientId: z.string().min(1, 'Selecciona un paciente'),
  doctorId: z.string().min(1, 'Selecciona un doctor'),
  date: z.string().min(1, 'Selecciona una fecha'),
  slot: z.string().min(1, 'Selecciona un horario'),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onCreated?: () => void;
};

export const RequestAppointmentForm = ({ onCreated }: Props) => {
  const role = useAuth((state) => state.user?.role);
  const queryClient = useQueryClient();
  const isAdmin = role === 'ADMIN';
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      date: '',
      slot: '',
      reason: '',
    },
  });

  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ['appointment-patients'],
    queryFn: fetchPatientsList,
    enabled: isAdmin,
  });

  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['appointment-doctors'],
    queryFn: fetchDoctorsList,
    enabled: isAdmin,
  });

  const doctorId = form.watch('doctorId');
  const appointmentDate = form.watch('date');

  const selectedDoctor = useMemo(
    () => doctors?.find((doc) => String(doc.id) === doctorId),
    [doctors, doctorId],
  );

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchSlots = async () => {
      if (!doctorId || !appointmentDate) {
        setSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const data = await fetchDoctorAvailabilitySlots({
          doctorId,
          date: appointmentDate,
        });
        if (!cancelled) {
          setSlots(data);
        }
      } catch {
        if (!cancelled) {
          toast.error('No se pudo cargar la disponibilidad');
          setSlots([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    };
    void fetchSlots();
    return () => {
      cancelled = true;
    };
  }, [doctorId, appointmentDate]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!selectedDoctor?.specialtyId) {
        throw new Error('El doctor no tiene una especialidad configurada.');
      }
      const [startTime, endTime] = values.slot.split('|');
      return createAppointment({
        patientId: Number(values.patientId),
        doctorId: Number(values.doctorId),
        specialtyId: selectedDoctor.specialtyId,
        date: values.date,
        startTime,
        endTime,
        reason: values.reason,
      });
    },
    onSuccess: () => {
      toast.success('Cita creada');
      form.reset();
      setSlots([]);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onCreated?.();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'No se pudo crear la cita';
      toast.error(message);
    },
  });

  const handleSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva cita</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-1">
            <Label>Paciente</Label>
            <Select disabled={loadingPatients} {...form.register('patientId')}>
              <option value="">Selecciona un paciente</option>
              {patients?.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} {patient.email ? `- ${patient.email}` : ''}
                </option>
              ))}
            </Select>
            {form.formState.errors.patientId && (
              <p className="text-xs text-red-500">{form.formState.errors.patientId.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Doctor</Label>
            <Select
              disabled={loadingDoctors}
              {...form.register('doctorId', {
                onChange: () => form.setValue('slot', ''),
              })}
            >
              <option value="">Selecciona un doctor</option>
              {doctors?.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} {doctor.specialtyName ? `- ${doctor.specialtyName}` : ''}
                </option>
              ))}
            </Select>
            {form.formState.errors.doctorId && (
              <p className="text-xs text-red-500">{form.formState.errors.doctorId.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Fecha</Label>
            <Input
              type="date"
              {...form.register('date', {
                onChange: () => form.setValue('slot', ''),
              })}
            />
            {form.formState.errors.date && (
              <p className="text-xs text-red-500">{form.formState.errors.date.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Horario disponible</Label>
            <Select disabled={loadingSlots} {...form.register('slot')}>
              <option value="">
                {loadingSlots ? 'Cargando horarios…' : 'Selecciona un horario'}
              </option>
              {slots.map((slot) => (
                <option
                  key={`${slot.start_time}-${slot.end_time}`}
                  value={`${slot.start_time}|${slot.end_time}`}
                >
                  {slot.start_time} - {slot.end_time}
                </option>
              ))}
            </Select>
            {form.formState.errors.slot && (
              <p className="text-xs text-red-500">{form.formState.errors.slot.message}</p>
            )}
            {!loadingSlots && doctorId && appointmentDate && slots.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay horarios disponibles para esta fecha. Intenta otro día.
              </p>
            )}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Motivo (opcional)</Label>
            <Input placeholder="Describe el motivo de la cita" {...form.register('reason')} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={mutation.isPending || loadingDoctors || loadingPatients}>
              {mutation.isPending ? 'Creando…' : 'Crear cita'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
