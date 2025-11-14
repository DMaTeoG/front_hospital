'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  fetchDoctorsList,
  fetchPatientsList,
  fetchCurrentDoctor,
} from '@/features/entities/api';
import { createMedicalRecord } from '@/features/records/api';
import { useAuth } from '@/store/auth';

const schema = z.object({
  patientId: z.string().min(1, 'Selecciona un paciente'),
  doctorId: z.string().optional(),
  appointmentId: z.string().optional(),
  date: z.string().min(1, 'Selecciona una fecha'),
  symptoms: z.string().optional(),
  vitals: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onCreated?: () => void;
};

export const CreateRecordForm = ({ onCreated }: Props) => {
  const userRole = useAuth((state) => state.user?.role);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      appointmentId: '',
      date: new Date().toISOString().slice(0, 10),
      symptoms: '',
      vitals: '',
      diagnosis: '',
      prescription: '',
    },
  });

  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: fetchPatientsList,
  });

  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: fetchDoctorsList,
  });

  const { data: currentDoctor } = useQuery({
    queryKey: ['current-doctor-record'],
    queryFn: fetchCurrentDoctor,
    enabled: userRole === 'DOCTOR',
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const doctorId =
        userRole === 'DOCTOR'
          ? currentDoctor?.id
          : values.doctorId
            ? Number(values.doctorId)
            : undefined;
      if (!doctorId) {
        throw new Error('Selecciona un doctor válido');
      }
      return createMedicalRecord({
        doctorId,
        patientId: Number(values.patientId),
        appointmentId: values.appointmentId ? Number(values.appointmentId) : undefined,
        date: values.date,
        symptoms: values.symptoms,
        vitals: values.vitals,
        diagnosis: values.diagnosis,
        prescription: values.prescription,
      });
    },
    onSuccess: () => {
      toast.success('Historia registrada');
      form.reset({
        patientId: '',
        doctorId: '',
        appointmentId: '',
        date: new Date().toISOString().slice(0, 10),
        symptoms: '',
        vitals: '',
        diagnosis: '',
        prescription: '',
      });
      onCreated?.();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo crear la historia clínica',
      );
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva historia clínica</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
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
          {userRole === 'ADMIN' && (
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
            <Label>ID de cita (opcional)</Label>
            <Input placeholder="123" {...form.register('appointmentId')} />
          </div>
          <div className="space-y-1">
            <Label>Fecha</Label>
            <Input type="date" {...form.register('date')} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Síntomas</Label>
            <Input placeholder="Descripción de síntomas" {...form.register('symptoms')} />
          </div>
          <div className="space-y-1">
            <Label>Signos vitales</Label>
            <Input placeholder="Ej. 120/80, 36.5°C" {...form.register('vitals')} />
          </div>
          <div className="space-y-1">
            <Label>Diagnóstico</Label>
            <Input placeholder="Diagnóstico" {...form.register('diagnosis')} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Prescripción</Label>
            <Input placeholder="Indica medicamentos o indicaciones" {...form.register('prescription')} />
          </div>
          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={mutation.isPending || loadingPatients || (userRole === 'ADMIN' && loadingDoctors)}
            >
              {mutation.isPending ? 'Guardando…' : 'Guardar historia'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
