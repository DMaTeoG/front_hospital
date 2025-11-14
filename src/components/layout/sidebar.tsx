'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { allowedRoutesForRole } from '@/lib/rbac';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/cn';

export const Sidebar = () => {
  const pathname = usePathname();
  const user = useAuth((state) => state.user);
  const routes = allowedRoutesForRole(user?.role);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs uppercase text-muted-foreground">Hospital</p>
        <p className="text-lg font-semibold">Gestión</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={cn(
              'block rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith(route.path)
                ? 'bg-blue-600 text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>
      {user && (
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{user.name}</p>
          <p>{user.email}</p>
          <p className="uppercase tracking-wide">{user.role}</p>
        </div>
      )}
    </aside>
  );
};
