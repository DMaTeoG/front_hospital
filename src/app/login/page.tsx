'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/auth';
import { RegisterForm } from '@/features/auth/register-form';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((state) => state.login);
  const loading = useAuth((state) => state.loading);
  const user = useAuth((state) => state.user);
  const [showRegister, setShowRegister] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [router, user]);

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      toast.success('Inicio de sesión correcto');
      router.replace('/dashboard');
    } catch (error: unknown) {
      const detail = isAxiosError(error)
        ? error.response?.data?.detail
        : (error as Error).message;
      toast.error(detail ?? 'Credenciales inválidas o servidor no disponible');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-10 text-center space-y-3">
          <h1 className="text-2xl font-bold">Gestión Hospitalaria</h1>
          <p className="text-sm text-muted-foreground">
            Accede con tu correo institucional o regístrate como paciente.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant={!showRegister ? 'primary' : 'outline'}
              onClick={() => setShowRegister(false)}
            >
              Iniciar sesión
            </Button>
            <Button
              variant={showRegister ? 'primary' : 'outline'}
              onClick={() => setShowRegister(true)}
            >
              Crear cuenta
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          {!showRegister ? (
            <form className="w-full max-w-md space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="medico@hospital.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Ingresando…' : 'Ingresar'}
              </Button>
            </form>
          ) : (
            <div className="w-full max-w-md">
              <RegisterForm onSuccess={() => setShowRegister(false)} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
