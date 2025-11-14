'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Appointment } from '@/types/appointments';
import {
  createMedicalRecord,
  fetchAppointmentRecord,
  updateMedicalRecord,
} from '@/features/records/api';

const schema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  symptoms: z.string().optional(),
  vitals: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  appointment: Appointment;
  onClose: () => void;
  onSaved?: () => void;
};

export const AppointmentRecordPanel = ({ appointment, onClose, onSaved }: Props) => {
  const queryClient = useQueryClient();
  const patientId = appointment.patientProfileId;
  const doctorId = appointment.doctorProfileId;

  const { data: record, isFetching, isLoading } = useQuery({
    queryKey: ['appointment-record', appointment.id],
    queryFn: () => fetchAppointmentRecord(appointment.id),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: appointment.date,
      symptoms: '',
      vitals: '',
      diagnosis: '',
      prescription: '',
    },
  });

  useEffect(() => {
    form.reset({
      date: record?.date ?? appointment.date,
      symptoms: record?.symptoms ?? '',
      vitals: record?.vitals ?? '',
      diagnosis: record?.diagnosis ?? '',
      prescription: record?.prescription ?? '',
    });
  }, [record, appointment.id, appointment.date, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!patientId || !doctorId) {
        throw new Error('La cita no tiene paciente o medico asociado.');
      }
      const payload = {
        doctorId,
        patientId,
        appointmentId: appointment.id,
        date: values.date,
        symptoms: values.symptoms,
        vitals: values.vitals,
        diagnosis: values.diagnosis,
        prescription: values.prescription,
      };
      if (record?.id) {
        await updateMedicalRecord(record.id, payload);
      } else {
        await createMedicalRecord(payload);
      }
    },
    onSuccess: () => {
      toast.success('Historia clinica guardada');
      queryClient.invalidateQueries({ queryKey: ['appointment-record', appointment.id] });
      onSaved?.();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar la historia clinica',
      );
    },
  });

  const disableForm = mutation.isPending || isLoading || isFetching || !patientId || !doctorId;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Historia clinica</p>
            <h2 className="text-2xl font-semibold">Cita #{appointment.id}</h2>
            <p className="text-sm text-muted-foreground">
              {appointment.date} - {appointment.startTime ?? '--:--'}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="mt-4 grid gap-4 rounded-lg border border-border p-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Paciente</p>
            <p className="font-medium">{appointment.patient?.name ?? 'Sin paciente'}</p>
            <p className="text-xs text-muted-foreground">
              {appointment.patient?.email ?? 'Sin correo'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Medico</p>
            <p className="font-medium">{appointment.doctor?.name ?? 'Sin medico'}</p>
            <p className="text-xs text-muted-foreground">
              {appointment.doctor?.specialty ?? 'Sin especialidad'}
            </p>
          </div>
        </div>

        {!patientId || !doctorId ? (
          <p className="mt-4 text-sm text-red-500">
            No es posible gestionar la historia porque la cita no tiene paciente o medico
            asignado.
          </p>
        ) : (
          <form
            className="mt-6 grid gap-4"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <div className="grid gap-1 md:max-w-xs">
              <Label>Fecha</Label>
              <Input type="date" disabled={disableForm} {...form.register('date')} />
              {form.formState.errors.date && (
                <p className="text-xs text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>
            <div className="grid gap-1">
              <Label>Sintomas</Label>
              <textarea
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Describa los sintomas"
                disabled={disableForm}
                {...form.register('symptoms')}
              />
            </div>
            <div className="grid gap-1 md:grid-cols-2">
              <div className="grid gap-1">
                <Label>Signos vitales</Label>
                <Input
                  placeholder="Ej. 120/80, 36.5C"
                  disabled={disableForm}
                  {...form.register('vitals')}
                />
              </div>
              <div className="grid gap-1">
                <Label>Diagnostico</Label>
                <Input placeholder="Diagnostico" disabled={disableForm} {...form.register('diagnosis')} />
              </div>
            </div>
            <div className="grid gap-1">
              <Label>Prescripcion</Label>
              <textarea
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Medicacion o recomendaciones"
                disabled={disableForm}
                {...form.register('prescription')}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={disableForm}>
                {mutation.isPending ? 'Guardando...' : record ? 'Actualizar historia' : 'Crear historia'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
