'use client';

import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-muted/20 text-foreground">
    <Sidebar />
    <div className="flex flex-1 flex-col">
      <Topbar />
      <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
    </div>
  </div>
);
