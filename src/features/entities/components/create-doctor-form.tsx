'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createDoctor, fetchSpecialties } from '@/features/entities/api';

const schema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  specialtyId: z.string().min(1, 'Selecciona una especialidad'),
  licenseNumber: z.string().min(3, 'Licencia requerida'),
  bio: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onCreated?: () => void;
};

export const CreateDoctorForm = ({ onCreated }: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      specialtyId: '',
      licenseNumber: '',
      bio: '',
    },
  });

  const { data: specialties, isLoading: loadingSpecialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: fetchSpecialties,
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => createDoctor(values),
    onSuccess: () => {
      toast.success('Médico registrado');
      form.reset();
      onCreated?.();
    },
    onError: () => toast.error('No se pudo crear el médico'),
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar médico</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input placeholder="Nombre" {...form.register('firstName')} />
            {form.formState.errors.firstName && (
              <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Apellido</Label>
            <Input placeholder="Apellido" {...form.register('lastName')} />
            {form.formState.errors.lastName && (
              <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Correo</Label>
            <Input type="email" placeholder="medico@hospital.com" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Contraseña</Label>
            <Input type="password" placeholder="********" {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Especialidad</Label>
            <Select disabled={loadingSpecialties} {...form.register('specialtyId')}>
              <option value="">Selecciona una especialidad</option>
              {specialties?.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </Select>
            {form.formState.errors.specialtyId && (
              <p className="text-xs text-red-500">{form.formState.errors.specialtyId.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Número de licencia</Label>
            <Input placeholder="LIC-001" {...form.register('licenseNumber')} />
            {form.formState.errors.licenseNumber && (
              <p className="text-xs text-red-500">{form.formState.errors.licenseNumber.message}</p>
            )}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Bio</Label>
            <Input placeholder="Especialista en..." {...form.register('bio')} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando…' : 'Crear médico'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
