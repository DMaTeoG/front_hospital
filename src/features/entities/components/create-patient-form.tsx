'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createPatient } from '@/features/entities/api';

const schema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  document: z.string().min(3, 'Documento requerido'),
  birthDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onCreated?: () => void;
};

export const CreatePatientForm = ({ onCreated }: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      document: '',
      birthDate: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => createPatient(values),
    onSuccess: () => {
      toast.success('Paciente registrado');
      form.reset();
      onCreated?.();
    },
    onError: () => toast.error('No se pudo crear el paciente'),
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar paciente</CardTitle>
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
            <Input type="email" placeholder="paciente@hospital.com" {...form.register('email')} />
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
            <Label>Documento</Label>
            <Input placeholder="Identificación" {...form.register('document')} />
            {form.formState.errors.document && (
              <p className="text-xs text-red-500">{form.formState.errors.document.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Fecha de nacimiento</Label>
            <Input type="date" {...form.register('birthDate')} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando…' : 'Crear paciente'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
