'use client';

import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth';

export const Topbar = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const logout = useAuth((state) => state.logout);
  const user = useAuth((state) => state.user);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold">
          {t('welcome')}, {user?.name ?? 'Visitante'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.role ? `Rol: ${user.role}` : 'Sin rol'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={toggleTheme}>
          {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        </Button>
        <Button variant="secondary" onClick={() => logout()}>
          {t('logout')}
        </Button>
      </div>
    </header>
  );
};
