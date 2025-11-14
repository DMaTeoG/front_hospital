'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';

const schema = z.object({
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  document: z.string().min(4, 'Documento requerido'),
  birthDate: z.string().optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
});

type FormValues = z.infer<typeof schema>;

export const RegisterForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      document: '',
      birthDate: '',
      gender: 'O',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      await api.post('/auth/register', {
        user: {
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
        },
        document: values.document,
        birth_date: values.birthDate || null,
        gender: values.gender,
        active: true,
      });
    },
    onSuccess: () => {
      toast.success('Registro exitoso, ahora puedes iniciar sesión');
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'No se pudo completar el registro';
      toast.error(message);
    },
    onSettled: () => setSubmitting(false),
  });

  const onSubmit = (values: FormValues) => {
    setSubmitting(true);
    mutation.mutate(values);
  };

  return (
    <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <Label>Nombre</Label>
          <Input {...form.register('firstName')} />
          {form.formState.errors.firstName && (
            <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <Label>Apellido</Label>
          <Input {...form.register('lastName')} />
          {form.formState.errors.lastName && (
            <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label>Correo</Label>
        <Input type="email" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label>Contraseña</Label>
        <Input type="password" {...form.register('password')} />
        {form.formState.errors.password && (
          <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label>Documento</Label>
        <Input {...form.register('document')} />
        {form.formState.errors.document && (
          <p className="text-xs text-red-500">{form.formState.errors.document.message}</p>
        )}
      </div>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <Label>Fecha de nacimiento</Label>
          <Input type="date" {...form.register('birthDate')} />
        </div>
        <div className="flex-1 space-y-1">
          <Label>Género</Label>
          <Select {...form.register('gender')}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Registrando…' : 'Crear cuenta'}
      </Button>
    </form>
  );
};
