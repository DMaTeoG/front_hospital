'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MedicalRecord } from '@/features/records/api';
import { updateMedicalRecord } from '@/features/records/api';

const schema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  symptoms: z.string().optional(),
  vitals: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  record: MedicalRecord;
  onClose: () => void;
};

export const RecordDetailPanel = ({ record, onClose }: Props) => {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: record.date,
      symptoms: record.symptoms ?? '',
      vitals: record.vitals ?? '',
      diagnosis: record.diagnosis ?? '',
      prescription: record.prescription ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      date: record.date,
      symptoms: record.symptoms ?? '',
      vitals: record.vitals ?? '',
      diagnosis: record.diagnosis ?? '',
      prescription: record.prescription ?? '',
    });
  }, [record, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!record.patientId || !record.doctorId) {
        throw new Error('El registro no tiene paciente o doctor asociado.');
      }
      await updateMedicalRecord(record.id, {
        patientId: record.patientId,
        doctorId: record.doctorId,
        appointmentId: record.appointmentId,
        date: values.date,
        symptoms: values.symptoms,
        vitals: values.vitals,
        diagnosis: values.diagnosis,
        prescription: values.prescription,
      });
    },
    onSuccess: () => {
      toast.success('Historia actualizada');
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      onClose();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo actualizar la historia',
      );
    },
  });

  const disableForm = mutation.isPending || !record.patientId || !record.doctorId;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Historia clinica</p>
            <h2 className="text-2xl font-semibold">Registro #{record.id}</h2>
            <p className="text-sm text-muted-foreground">
              Paciente: {record.patientName ?? 'Sin paciente'}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        {!record.patientId || !record.doctorId ? (
          <p className="mt-4 text-sm text-red-500">
            No es posible editar este registro porque falta el paciente o el doctor asociado.
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
                <Input
                  placeholder="Diagnostico"
                  disabled={disableForm}
                  {...form.register('diagnosis')}
                />
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
                {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
