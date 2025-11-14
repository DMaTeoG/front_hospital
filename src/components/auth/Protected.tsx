'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/store/auth';
import type { Role } from '@/types/users';

type ProtectedProps = {
  children: React.ReactNode;
  roles?: Role[];
  redirectToLogin?: boolean;
};

export default function Protected({
  children,
  roles,
  redirectToLogin = true,
}: ProtectedProps) {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const me = useAuth((state) => state.me);
  const initialized = useAuth((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      me();
    }
  }, [initialized, me]);

  useEffect(() => {
    if (!user && initialized && redirectToLogin) {
      router.replace('/login');
    }
  }, [initialized, redirectToLogin, router, user]);

  if (!initialized) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    return <div className="p-6 text-sm text-red-500">No autorizado.</div>;
  }

  return <>{children}</>;
}
